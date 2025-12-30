import { useState, useEffect, useCallback } from 'react';
import { PageData, CustomFont, ProjectData } from '../types';
import { getProject, saveProject } from '../utils/db';
import { toPng } from 'html-to-image';
import { useUI } from '../context/UIContext';

const DEFAULT_PAGES: PageData[] = [
  {
    id: 'slide-1',
    type: 'slide',
    layoutId: 'modern-feature',
    title: 'Modern Presentation',
    subtitle: 'High Impact Visuals',
    bullets: [],
    image: '',
    backgroundColor: '#ffffff',
    counterStyle: 'number'
  }
];

export const registerFontInDOM = (family: string, dataUrl: string) => {
  if (document.getElementById(`style-${family}`)) return;
  const style = document.createElement('style');
  style.id = `style-${family}`;
  style.innerHTML = `
    @font-face {
      font-family: '${family}';
      src: url('${dataUrl}');
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
};

export function useProject(projectId: string | undefined, templateId: string | null) {
  const { alert, confirm } = useUI();
  const [pages, setPages] = useState<PageData[]>(DEFAULT_PAGES);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [enforceA4, setEnforceA4] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Initial Load
  useEffect(() => {
    async function loadData() {
      if (projectId) {
        const savedData = await getProject(projectId);
        if (savedData) {
          setPages(savedData.pages || DEFAULT_PAGES);
          setCustomFonts(savedData.customFonts || []);
          
          savedData.customFonts?.forEach((font: CustomFont) => {
            if (font.dataUrl) registerFontInDOM(font.family, font.dataUrl);
          });
        } else if (templateId) {
          const newPages = [{
            ...DEFAULT_PAGES[0],
            id: `slide-${Date.now()}`,
            layoutId: (templateId as any) || 'modern-feature'
          }];
          setPages(newPages);
        }
        setIsLoaded(true);
      }
    }
    loadData();
  }, [projectId, templateId]);

  // Persist to DB
  const saveToDB = useCallback(async (previewRef: React.RefObject<HTMLDivElement | null>) => {
    if (!projectId || !isLoaded) return;

    let thumbnail = null;
    if (previewRef.current) {
      try {
        const pageEl = previewRef.current.querySelector('.magazine-page') as HTMLElement;
        if (pageEl) {
          thumbnail = await toPng(pageEl, {
            pixelRatio: 0.15,
            quality: 0.4,
            filter: (node) => {
              // 过滤掉可能导致跨域安全错误的远程样式表
              if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                const href = (node as HTMLLinkElement).href;
                return href.includes(window.location.origin) || href.startsWith('data:');
              }
              return true;
            }
          });
        }
      } catch (e) {
        console.error("Thumb failed", e);
      }
    }

    const projectState: ProjectData = {
      version: "2.0",
      title: pages[0]?.title || 'Untitled Presentation',
      pages,
      customFonts,
    };
    
    await saveProject(projectId, projectState);

    const indexSaved = localStorage.getItem('magazine_recent_projects');
    let index = indexSaved ? JSON.parse(indexSaved) : [];
    
    const existingIdx = index.findIndex((p: any) => p.id === projectId);
    const projectSummary = {
      id: projectId,
      title: projectState.title,
      date: new Date().toLocaleDateString(),
      type: 'slide',
      thumbnail
    };

    if (existingIdx > -1) {
      index[existingIdx] = projectSummary;
    } else {
      index.unshift(projectSummary);
    }
    
    localStorage.setItem('magazine_recent_projects', JSON.stringify(index.slice(0, 12)));
  }, [pages, customFonts, projectId, isLoaded]);

  const updatePage = (updatedPage: PageData) => {
    setPages(prev => {
      const originalPage = prev.find(p => p.id === updatedPage.id);
      if (!originalPage) return prev;

      const globalFields: Array<keyof PageData> = [
        'counterStyle',
        'backgroundColor',
        'backgroundPattern',
        'footer',
        'titleFont',
        'bodyFont',
        'logo',
        'logoSize',
        'agenda'      // 目录内容全局同步
      ];

      const changedGlobalFields = globalFields.filter(field => originalPage[field] !== updatedPage[field]);

      if (changedGlobalFields.length > 0) {
        return prev.map(page => {
          const newPage = { ...page };
          if (page.id === updatedPage.id) {
            Object.assign(newPage, updatedPage);
          }
          changedGlobalFields.forEach(field => {
            // @ts-ignore
            newPage[field] = updatedPage[field];
          });
          return newPage;
        });
      }

      return prev.map(p => p.id === updatedPage.id ? updatedPage : p);
    });
  };

  const addPage = () => {
    const firstPage = pages[0];
    const defaultLayoutId = 'modern-feature';
    
    // 查找已有的目录数据以实现自动同步
    const existingTOC = pages.find(p => p.layoutId === 'table-of-contents');

    const newPage: PageData = {
      id: `slide-${Date.now()}`,
      type: 'slide',
      layoutId: defaultLayoutId,
      title: 'New Slide',
      bullets: ['Point 1', 'Point 2'],
      backgroundColor: firstPage.backgroundColor || '#ffffff',
      backgroundPattern: firstPage.backgroundPattern || 'none',
      counterStyle: firstPage.counterStyle || 'number',
      footer: firstPage.footer || '',
      titleFont: firstPage.titleFont,
      bodyFont: firstPage.bodyFont,
      // 核心：新建页面时自动继承已有的目录内容
      agenda: existingTOC?.agenda || [],
      activeIndex: existingTOC?.activeIndex ?? 0,
      visibility: {
        logo: defaultLayoutId === 'component-mosaic' ? false : true
      }
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (id: string) => {
    if (pages.length <= 1) {
      alert("Cannot Delete", "You must have at least one slide.");
      return;
    }
    
    confirm(
      "Delete Slide",
      "Are you sure you want to delete this slide?",
      () => {
        const idx = pages.findIndex(p => p.id === id);
        setPages(prev => prev.filter(p => p.id !== id));
        if (currentPageIndex >= idx && currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
      }
    );
  };

  const handleClearAll = () => {
    confirm(
      "Reset Project",
      "Are you sure you want to clear all slides?",
      () => {
        setPages(DEFAULT_PAGES);
        setCurrentPageIndex(0);
      }
    );
  };

  const handleExportProject = () => {
    const project: ProjectData = {
      version: "2.0",
      title: pages[0]?.title || 'Untitled',
      pages,
      customFonts
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presentation-${new Date().toISOString().slice(0, 10)}.wdzmaga`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project: ProjectData = JSON.parse(event.target?.result as string);
        
        project.customFonts.forEach(font => {
          if (font.dataUrl) {
            registerFontInDOM(font.family, font.dataUrl);
          }
        });
        
        setCustomFonts(project.customFonts || []);
        setPages(project.pages || DEFAULT_PAGES);
        setCurrentPageIndex(0);
        
        alert("Import Success", "Project loaded.");
      } catch (err) {
        console.error("Import failed:", err);
        alert("Import Error", "Failed to import project.");
      }
    };
    reader.readAsText(file);
  };

  return {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    currentPage: pages[currentPageIndex],
    customFonts,
    setCustomFonts,
    enforceA4,
    setEnforceA4,
    isLoaded,
    updatePage,
    addPage,
    removePage,
    handleClearAll,
    handleExportProject,
    handleImportProject,
    saveToDB
  };
}
