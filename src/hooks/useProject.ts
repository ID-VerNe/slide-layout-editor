import { useCallback, useEffect, useRef } from 'react';
import { CustomFont, PrintSettings } from '../types';
import { saveProject } from '../utils/db';
import { useUI } from '../context/UIContext';
import { useStore } from '../store/useStore';
import { nativeFs } from '../utils/native-fs';
import { capturePageThumbnail } from '../utils/thumbnailCapture';
import { updateRecentProjectThumbnail, upsertRecentProject } from '../services/recentProjects';

export function useProject(projectId: string | undefined, templateId: string | null) {
  const { alert: uiAlert, confirm } = useUI();
  
  const pages = useStore(s => s.pages);
  const projectTitle = useStore(s => s.projectTitle);
  const theme = useStore(s => s.theme);
  const currentPageIndex = useStore(s => s.currentPageIndex);
  const isLoaded = useStore(s => s.isLoaded);
  const activeProjectId = useStore(s => s.activeProjectId);
  const past = useStore(s => s.past);
  const future = useStore(s => s.future);
  const printSettings = useStore(s => s.printSettings);
  const imageQuality = useStore(s => s.imageQuality);
  const minimalCounter = useStore(s => s.minimalCounter);
  const counterStyle = useStore(s => s.counterStyle);
  const customFonts = useStore(s => s.customFonts);
  const currentFilePath = useStore(s => s.currentFilePath);
  const designSystem = useStore(s => s.designSystem);
  const hasUnsavedChanges = useStore(s => s.hasUnsavedChanges);

  const loadProjectSync = useStore(s => s.loadProject);
  const loadProject = useCallback(async (idOrData: any, templateId?: string | null, filePath?: string | null) => {
    await loadProjectSync(idOrData, templateId, filePath);
  }, [loadProjectSync]);

  const updatePage = useStore(s => s.updatePage);
  const addPage = useStore(s => s.addPage);
  const removePage = useStore(s => s.removePage);
  const reorderPages = useStore(s => s.reorderPages);
  const setTheme = useStore(s => s.setTheme);
  const setProjectTitle = useStore(s => s.setProjectTitle);
  const setCurrentPageIndex = useStore(s => s.setCurrentPageIndex);
  const setPrintSettings = useStore(s => s.setPrintSettings);
  const setImageQuality = useStore(s => s.setImageQuality);
  const setMinimalCounter = useStore(s => s.setMinimalCounter);
  const setCounterStyle = useStore(s => s.setCounterStyle);
  const setCustomFonts = useStore(s => s.setCustomFonts);
  const setCurrentFilePath = useStore(s => s.setCurrentFilePath);
  const markAsSaved = useStore(s => s.markAsSaved);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);

  const handleExportProject = useCallback(() => {
    // 触发导出模态框
    window.dispatchEvent(new CustomEvent('show-export-modal'));
  }, []);

  const handleImportProject = useCallback(() => {
    // 触发文件选择器
    window.dispatchEvent(new CustomEvent('trigger-import'));
  }, []);

  const previewRefLocal = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ projectId, isLoaded, pages });
  const lastHashRef = useRef<string>('');
  
  useEffect(() => {
    stateRef.current = { projectId, isLoaded, pages };
  }, [projectId, isLoaded, pages]);

  // 核心功能：每分钟静默生成微型缩略图
  useEffect(() => {
    const generateThumbnail = async () => {
      const { projectId: curId, isLoaded: curLoaded, pages: curPages } = stateRef.current;
      if (!curId || !curLoaded || curPages.length === 0) return;
      
      // 只有当应用处于前台且有预览元素时才执行
      if (document.hidden || !previewRefLocal.current) return;

      try {
        const base64 = await capturePageThumbnail(previewRefLocal.current, curId, {
          pixelRatio: 0.1,
          quality: 0.1,
          skipFonts: true,
          cacheBust: true,
        });

        if (base64) {
          updateRecentProjectThumbnail(curId, base64);
        }
      } catch (e) {
        console.warn('[Thumbnail] Failed to generate or save thumbnail:', e);
      }
    };

    const initialTimer = setTimeout(generateThumbnail, 30000);
    const intervalTimer = setInterval(generateThumbnail, 300000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []); // 仅挂载时执行一次定时器逻辑

  const saveToDB = useCallback(async (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail: boolean = true) => {
    if (!projectId || !isLoaded || activeProjectId !== projectId || pages.length === 0) return;

    // 捕获 Ref 用于缩略图生成
    if (previewRef.current) {
      previewRefLocal.current = previewRef.current;
    }

    let thumbnail: string | null = null;
    if (forceThumbnail && previewRefLocal.current) {
      thumbnail = await capturePageThumbnail(previewRefLocal.current, projectId, {
        pixelRatio: 0.2,
        quality: 0.5,
        skipFonts: true,
      });
    }

    // 保存主数据
    await saveProject(projectId, {
      version: "3.0",
      title: projectTitle,
      pages,
      customFonts,
      imageQuality,
      printSettings,
      theme,
      designSystem,
      minimalCounter,
      counterStyle,
      thumbnail: thumbnail || undefined,
      filePath: currentFilePath || undefined
    });

    // 更新索引元数据
    const summary = {
      id: projectId,
      title: projectTitle || (pages[0]?.title) || 'Untitled',
      date: new Date().toLocaleDateString(),
      type: pages[0]?.layoutId,
      aspectRatio: pages[0]?.aspectRatio,
      thumbnail: thumbnail || null,
    };
    upsertRecentProject(summary);
  }, [pages, projectId, isLoaded, activeProjectId, projectTitle, theme, designSystem, customFonts, imageQuality, printSettings, minimalCounter, counterStyle, currentFilePath]);

  return {
    pages, projectTitle, setProjectTitle, theme, setTheme,
    currentPageIndex, setCurrentPageIndex,
    currentPage: pages[currentPageIndex], isLoaded, 
    updatePage, addPage, removePage, reorderPages, 
    handleExportProject, handleImportProject, loadProject,
    saveToDB, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0,
    printSettings, setPrintSettings, imageQuality, setImageQuality, 
    minimalCounter, setMinimalCounter, counterStyle, setCounterStyle, customFonts, setCustomFonts,
    currentFilePath, setCurrentFilePath, hasUnsavedChanges, markAsSaved
  };
}
