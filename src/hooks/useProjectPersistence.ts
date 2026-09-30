import { useCallback, useEffect, useRef } from 'react';
import { nativeFs } from '../utils/native-fs';
import { saveProject } from '../utils/storage/projectDb';
import { capturePageThumbnail } from '../utils/thumbnailCapture';
import { upsertRecentProject } from '../services/recentProjects';
import { exportProjectAsJson, openProjectFromFilePicker } from '../utils/dom/fileDownload';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';
import {
  PageData, ProjectTheme, PrintSettings, CustomFont, CounterStyle, ProjectData,
} from '../types';

export interface UseProjectPersistenceParams {
  isLoaded: boolean;
  projectId: string | undefined;
  pages: PageData[];
  projectTitle: string;
  fallbackTitle: string;
  theme: ProjectTheme;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  customFonts: CustomFont[];
  imageQuality: number;
  printSettings: PrintSettings;
  currentFilePath: string | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  saveToDB: (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail?: boolean) => Promise<void>;
  loadProject: (idOrData: string | (Partial<ProjectData> & Record<string, unknown>), templateId?: string | null, filePath?: string | null) => Promise<void>;
  markAsSaved: () => void;
  setCurrentFilePath: (path: string | null) => void;
  hasUnsavedChanges: boolean;
}

export interface UseProjectPersistenceResult {
  handleSmartSave: () => Promise<void>;
  handleSaveAs: () => Promise<void>;
  handleNativeOpen: () => Promise<void>;
}

// 工程持久化:自动保存防抖、手动保存、另存为、Native 打开
// 仅消费 useProject 的返回值,不内部调 useProject,避免双重订阅
export function useProjectPersistence(params: UseProjectPersistenceParams): UseProjectPersistenceResult {
  const {
    isLoaded, projectId, pages, projectTitle, fallbackTitle,
    theme, minimalCounter, counterStyle, customFonts, imageQuality,
    printSettings, currentFilePath, previewRef, saveToDB, loadProject,
    markAsSaved, setCurrentFilePath, hasUnsavedChanges,
  } = params;

  // 自动保存:仅在存在未保存变更时启动 3s 防抖定时器
  useEffect(() => {
    if (!isLoaded || !projectId || !hasUnsavedChanges) return;
    const autoSaveTimer = setTimeout(() => {
      saveToDB(previewRef, false).catch((err) => {
        console.warn('[AutoSave] Background save failed:', err);
      });
    }, 3000);
    return () => clearTimeout(autoSaveTimer);
  }, [isLoaded, projectId, hasUnsavedChanges, pages, projectTitle, theme, saveToDB, previewRef]);

  const generateThumb = useCallback(async () => {
    if (!previewRef.current || !projectId) return null;
    return capturePageThumbnail(previewRef.current, projectId, { pixelRatio: 0.2, quality: 0.5 });
  }, [projectId, previewRef]);

  const updateIndex = useCallback((thumb: string | null, path: string | null) => {
    if (!projectId) return;
    upsertRecentProject({
      id: projectId,
      title: projectTitle || fallbackTitle,
      date: new Date().toLocaleDateString(),
      lastModified: Date.now(),
      type: pages[0]?.layoutId,
      aspectRatio: pages[0]?.aspectRatio,
      thumbnail: thumb,
      filePath: path,
    });
  }, [projectId, projectTitle, fallbackTitle, pages]);

  const handleSmartSave = useCallback(async () => {
    if (!isLoaded || !projectId) return;
    try {
      const thumb = await generateThumb();
      const content = {
        id: projectId, version: '3.0', title: projectTitle, pages, theme,
        minimalCounter, counterStyle, customFonts, imageQuality, printSettings,
        thumbnail: thumb || undefined, filePath: currentFilePath || undefined,
      };
      if (nativeFs.isElectron()) {
        const result = await nativeFs.saveProject(content, currentFilePath || undefined, projectTitle || fallbackTitle);
        if (result.success && result.filePath) {
          setCurrentFilePath(result.filePath);
          markAsSaved();
        }
      } else {
        markAsSaved();
      }
      updateIndex(thumb, currentFilePath);
      saveToDB(previewRef, true);
    } catch (e) {
      console.error('[Save] Smart save failed:', e);
    }
  }, [isLoaded, projectId, generateThumb, projectTitle, pages, theme, minimalCounter, counterStyle,
      customFonts, imageQuality, printSettings, currentFilePath, fallbackTitle, markAsSaved,
      setCurrentFilePath, updateIndex, saveToDB, previewRef]);

  // 另存为:不生成新 id。Web 端下载 JSON 备份,Electron 端写新文件路径
  // 两路径均不写 IndexedDB,因此不存在副本覆写原工程的场景
  const handleSaveAs = useCallback(async () => {
    if (!isLoaded || !projectId) return;
    try {
      const thumb = await generateThumb();
      const content = {
        id: projectId, version: '3.0', title: projectTitle, pages, theme,
        minimalCounter, counterStyle, customFonts, imageQuality, printSettings,
        thumbnail: thumb || undefined, filePath: undefined,
      };
      if (nativeFs.isElectron()) {
        const result = await nativeFs.saveProject(content, undefined, `${projectTitle || fallbackTitle}_Copy`);
        if (result.success && result.filePath) {
          setCurrentFilePath(result.filePath);
          markAsSaved();
          updateIndex(thumb, result.filePath);
        }
      } else {
        // Web 模式:下载完整的工程备份 JSON
        exportProjectAsJson(content, `${projectTitle || fallbackTitle}_Backup`);
        markAsSaved();
        updateIndex(thumb, currentFilePath);
      }
    } catch (e) {
      console.error('[Save] Save As failed:', e);
    }
  }, [isLoaded, projectId, generateThumb, projectTitle, pages, theme, minimalCounter,
      counterStyle, customFonts, imageQuality, printSettings, fallbackTitle, markAsSaved,
      setCurrentFilePath, updateIndex, currentFilePath]);

  const handleNativeOpen = useCallback(async () => {
    if (nativeFs.isElectron()) {
      const result = await nativeFs.openProject();
      if (result.success && result.content) {
        try {
          const project = JSON.parse(result.content);
          await loadProject(project, null, result.filePath);
          if (result.filePath) {
            setCurrentFilePath(result.filePath);
            markAsSaved();
          }
        } catch {
          alert('Invalid file');
        }
      }
    } else {
      try {
        const picked = await openProjectFromFilePicker();
        if (picked && picked.project) {
          await loadProject(picked.project, null, null);
          markAsSaved();
        }
      } catch {
        alert('Invalid file format');
      }
    }
  }, [loadProject, markAsSaved, setCurrentFilePath]);

  return { handleSmartSave, handleSaveAs, handleNativeOpen };
}

// 字体 DOM 注册副作用:customFonts 变化即注册到 document.fonts
export function useCustomFontsDom(customFonts: CustomFont[]) {
  useEffect(() => {
    loadCustomFontsIntoDOM(customFonts);
  }, [customFonts]);
}
