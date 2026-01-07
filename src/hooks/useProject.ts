import { useCallback, useEffect } from 'react';
import { CustomFont, PrintSettings, PageData, AspectRatioType } from '../types';
import { saveProject, getAsset, saveAsset } from '../utils/db';
import { toPng } from 'html-to-image';
import { useUI } from '../context/UIContext';
import { useStore, DEFAULT_THEME } from '../store/useStore';

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
  const minimalCounter = useStore(s => s.minimalCounter); // 全局状态
  const customFonts = useStore(s => s.customFonts);

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
  const setMinimalCounter = useStore(s => s.setMinimalCounter); // 全局 Action
  const setCustomFonts = useStore(s => s.setCustomFonts);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);

  useEffect(() => {
    if (projectId) loadProject(projectId, templateId);
  }, [projectId]);

  const saveToDB = useCallback(async (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail: boolean = true) => {
    if (!projectId || !isLoaded || activeProjectId !== projectId || pages.length === 0) return;
    
    let thumbnail = null;
    if (forceThumbnail && previewRef.current) {
      try {
        const pageEl = previewRef.current.querySelector('.magazine-page') as HTMLElement;
        if (pageEl) {
          thumbnail = await toPng(pageEl, { 
            pixelRatio: 0.1, quality: 0.2, skipFonts: true,
            filter: (node) => {
              if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                const href = (node as HTMLLinkElement).href;
                return href.includes(window.location.origin) || href.startsWith('data:');
              }
              if (node.tagName === 'STYLE' && node.textContent?.includes('fonts.googleapis.com')) return false;
              return true;
            }
          });
        }
      } catch (e) {}
    }

    await saveProject(projectId, { 
      version: "3.0", title: projectTitle, pages, customFonts, imageQuality, printSettings, theme, minimalCounter 
    });

    const indexSaved = localStorage.getItem('magazine_recent_projects');
    let index = indexSaved ? JSON.parse(indexSaved) : [];
    const existingIdx = index.findIndex((p: any) => p.id === projectId);
    const summary: any = { id: projectId, title: projectTitle || (pages[0]?.title), date: new Date().toLocaleDateString(), type: pages[0]?.layoutId, aspectRatio: pages[0]?.aspectRatio };
    if (thumbnail) summary.thumbnail = thumbnail;
    if (existingIdx > -1) index[existingIdx] = summary; else index.unshift(summary);
    localStorage.setItem('magazine_recent_projects', JSON.stringify(index.slice(0, 24)));
  }, [pages, projectId, isLoaded, activeProjectId, projectTitle, theme, customFonts, imageQuality, printSettings, minimalCounter]);

  const handleClearAll = () => { confirm("Reset Project", "Clear all?", () => useStore.getState().loadProject(projectId!, null)); };

  const handleExportProject = async () => {
    const assetIds = new Set<string>();
    pages.forEach(p => {
      if (p.image?.startsWith('asset://')) assetIds.add(p.image);
      if (p.logo?.startsWith('asset://')) assetIds.add(p.logo);
      p.gallery?.forEach(g => { if (g.url?.startsWith('asset://')) assetIds.add(g.url); });
      p.bentoItems?.forEach(b => { if (b.image?.startsWith('asset://')) assetIds.add(b.image); });
    });
    const assetsBundle: Record<string, string> = {};
    for (const id of assetIds) { const data = await getAsset(id); if (data) assetsBundle[id] = data; }
    const blob = new Blob([JSON.stringify({ version: "3.0", title: projectTitle, pages, theme, minimalCounter, assets: assetsBundle }, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${projectTitle || 'Project'}.slgrid`; link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const project = JSON.parse(event.target?.result as string);
        if (project.assets) { for (const [id, dataUrl] of Object.entries(project.assets)) { await saveAsset(dataUrl as string); } }
        useStore.getState().initProject(projectId!, project);
      } catch (err) { window.alert("Import Failed"); }
    };
    reader.readAsText(file);
  };

  return {
    pages, projectTitle, setProjectTitle, theme, setTheme,
    currentPageIndex, setCurrentPageIndex,
    currentPage: pages[currentPageIndex], isLoaded, 
    updatePage, addPage, removePage, reorderPages,
    handleClearAll, handleExportProject, handleImportProject, saveToDB,
    undo, redo, canUndo: past.length > 0, canRedo: future.length > 0,
    printSettings, setPrintSettings, imageQuality, setImageQuality, 
    minimalCounter, setMinimalCounter, customFonts, setCustomFonts
  };
}
