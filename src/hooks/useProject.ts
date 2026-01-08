import { useCallback, useEffect, useRef } from 'react';
import { CustomFont, PrintSettings } from '../types';
import { saveProject, getAsset, saveAsset } from '../utils/db';
import { toPng } from 'html-to-image';
import { useUI } from '../context/UIContext';
import { useStore } from '../store/useStore';
import { nativeFs } from '../utils/native-fs';

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
  const customFonts = useStore(s => s.customFonts);
  const currentFilePath = useStore(s => s.currentFilePath);
  const hasUnsavedChanges = useStore(s => s.hasUnsavedChanges);

  const loadProject = useStore(s => s.loadProject);
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
  const setCustomFonts = useStore(s => s.setCustomFonts);
  const setCurrentFilePath = useStore(s => s.setCurrentFilePath);
  const markAsSaved = useStore(s => s.markAsSaved);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);

  const previewRefLocal = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ projectId, isLoaded, pages });
  
  useEffect(() => {
    stateRef.current = { projectId, isLoaded, pages };
  }, [projectId, isLoaded, pages]);

  useEffect(() => {
    if (projectId) loadProject(projectId, templateId);
  }, [projectId]);

  // 核心功能：每分钟静默生成微型缩略图
  useEffect(() => {
    const generateThumbnail = async () => {
      const { projectId: curId, isLoaded: curLoaded, pages: curPages } = stateRef.current;
      if (!curId || !curLoaded || curPages.length === 0) return;
      
      // 只有当应用处于前台且有预览元素时才执行
      if (document.hidden || !previewRefLocal.current) return;

      try {
        let base64 = null;
        if (nativeFs.isElectron) {
          // Electron: 极速截图，宽 240px
          const pageEl = previewRefLocal.current.querySelector('.magazine-page');
          if (pageEl) {
            const rect = pageEl.getBoundingClientRect();
            base64 = await (window as any).electronAPI.captureThumbnail(curId, {
              x: rect.x, y: rect.y, width: rect.width, height: rect.height
            });
          }
        } else {
          // Web: 极致低精度截图
          const pageEl = previewRefLocal.current.querySelector('.magazine-page') as HTMLElement;
          if (pageEl) {
            // pixelRatio 0.1，并设置 style 缩放，极大减少 canvas 内存占用
            base64 = await toPng(pageEl, { 
              pixelRatio: 0.1, 
              quality: 0.1, 
              skipFonts: true,
              cacheBust: true
            });
          }
        }

        if (base64) {
          const indexSaved = localStorage.getItem('magazine_recent_projects');
          let index = indexSaved ? JSON.parse(indexSaved) : [];
          const existingIdx = index.findIndex((p: any) => p.id === curId);
          
          if (existingIdx > -1) {
            index[existingIdx].thumbnail = base64;
            localStorage.setItem('magazine_recent_projects', JSON.stringify(index));
          }
        }
      } catch (e) {}
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
    
    // 捕获 Ref 用于定时器
    if (previewRef.current) {
      previewRefLocal.current = previewRef.current;
    }

    // 保存主数据 (不再处理缩略图)
    await saveProject(projectId, { 
      version: "3.0", 
      title: projectTitle, 
      pages, 
      customFonts, 
      imageQuality, 
      printSettings, 
      theme, 
      minimalCounter,
      filePath: currentFilePath || undefined // 保存当前路径
    });

    // 更新索引元数据 (保留原有缩略图)
    const indexSaved = localStorage.getItem('magazine_recent_projects');
    let index = indexSaved ? JSON.parse(indexSaved) : [];
    const existingIdx = index.findIndex((p: any) => p.id === projectId);
    
    const summary: any = { 
      id: projectId, title: projectTitle || (pages[0]?.title), 
      date: new Date().toLocaleDateString(), type: pages[0]?.layoutId, 
      aspectRatio: pages[0]?.aspectRatio,
      // 继承已有缩略图，或者如果是新项目则暂时为空（等待定时器填充）
      thumbnail: existingIdx > -1 ? index[existingIdx].thumbnail : null
    };

    if (existingIdx > -1) index[existingIdx] = { ...index[existingIdx], ...summary };
    else index.unshift(summary);
    
    localStorage.setItem('magazine_recent_projects', JSON.stringify(index.slice(0, 24)));
  }, [pages, projectId, isLoaded, activeProjectId, projectTitle, theme, customFonts, imageQuality, printSettings, minimalCounter]);

  return {
    pages, projectTitle, setProjectTitle, theme, setTheme,
    currentPageIndex, setCurrentPageIndex,
    currentPage: pages[currentPageIndex], isLoaded, 
    updatePage, addPage, removePage, reorderPages,
    saveToDB, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0,
    printSettings, setPrintSettings, imageQuality, setImageQuality, 
    minimalCounter, setMinimalCounter, customFonts, setCustomFonts,
    currentFilePath, setCurrentFilePath, hasUnsavedChanges, markAsSaved
  };
}
