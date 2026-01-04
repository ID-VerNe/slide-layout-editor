import { useState, useEffect, useCallback } from 'react';
import { PageData, CustomFont, ProjectData } from '../types';
import { getProject, saveProject } from '../utils/db';
import { toPng } from 'html-to-image';
import { useUI } from '../context/UIContext';
import { getTemplateById } from '../templates/registry';

const DEFAULT_PAGES: PageData[] = [
  {
    id: 'slide-1',
    type: 'slide',
    layoutId: 'modern-feature',
    aspectRatio: '16:9',
    title: 'Modern Presentation',
    subtitle: 'High Impact Visuals',
    bullets: [],
    image: '',
    backgroundColor: '#ffffff',
    counterStyle: 'number'
  }
];

const GLOBAL_FIELDS: Array<keyof PageData> = [
  'counterStyle',
  'backgroundPattern',
  'footer',
  'titleFont',
  'bodyFont',
  'logo',
  'logoSize',
  'agenda',
  'minimalCounter' // 新增：全局同步极简页码状态
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
  const { alert: uiAlert, confirm } = useUI();
  const [pages, setPages] = useState<PageData[]>(DEFAULT_PAGES);
  const [projectTitle, setProjectTitle] = useState<string>(''); 
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [imageQuality, setImageQuality] = useState<number>(0.95); 
  const [minimalCounter, setMinimalCounter] = useState<boolean>(false); // 新增：全局状态
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
          setProjectTitle(savedData.title || '');
          setCustomFonts(savedData.customFonts || []);
          setImageQuality(savedData.imageQuality ?? 0.95);
          setMinimalCounter(savedData.minimalCounter ?? false); // 加载全局极简状态
          
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
  const saveToDB = useCallback(async (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail: boolean = true) => {
    if (!projectId || !isLoaded) return;

    let thumbnail = null;
    if (forceThumbnail && previewRef.current) {
      try {
        const pageEl = previewRef.current.querySelector('.magazine-page') as HTMLElement;
        if (pageEl) {
          thumbnail = await toPng(pageEl, {
            pixelRatio: 0.15,
            quality: 0.4,
            filter: (node) => {
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

    const finalTitle = projectTitle.trim() || pages[0]?.title || 'Untitled Presentation';

    const projectState: ProjectData = {
      version: "2.0",
      title: finalTitle,
      pages,
      customFonts,
      imageQuality,
      minimalCounter, // 保存全局状态
    };
    
    await saveProject(projectId, projectState);

    const indexSaved = localStorage.getItem('magazine_recent_projects');
    let index = indexSaved ? JSON.parse(indexSaved) : [];
    
    const existingIdx = index.findIndex((p: any) => p.id === projectId);
    const projectSummary: any = {
      id: projectId,
      title: finalTitle,
      date: new Date().toLocaleDateString(),
      type: pages[currentPageIndex]?.layoutId || 'slide',
    };

    if (thumbnail) projectSummary.thumbnail = thumbnail;
    else if (existingIdx > -1 && index[existingIdx].thumbnail) {
      projectSummary.thumbnail = index[existingIdx].thumbnail;
    }

    if (existingIdx > -1) {
      index[existingIdx] = projectSummary;
    } else {
      index.unshift(projectSummary);
    }
    
    localStorage.setItem('magazine_recent_projects', JSON.stringify(index.slice(0, 24)));
  }, [pages, customFonts, projectId, isLoaded, projectTitle, currentPageIndex, imageQuality, minimalCounter]);

  const updatePage = useCallback((updatedPage: PageData) => {
    setPages(prev => {
      const originalPage = prev.find(p => p.id === updatedPage.id);
      if (!originalPage) return prev;

      const layoutChanged = updatedPage.layoutId !== originalPage.layoutId;

      const changedGlobalFields: Partial<PageData> = {};
      GLOBAL_FIELDS.forEach(field => {
        // @ts-ignore
        if (updatedPage[field] !== originalPage[field]) {
          // @ts-ignore
          changedGlobalFields[field] = updatedPage[field];
          
          // 如果是极简页码状态变更，同步到主状态
          if (field === 'minimalCounter') {
            setMinimalCounter(updatedPage.minimalCounter ?? false);
          }
        }
      });

      return prev.map(page => {
        if (page.id === updatedPage.id) {
          if (!layoutChanged) return updatedPage;

          const template = getTemplateById(updatedPage.layoutId);
          const allowedFields = template.fields;

          const cleanedPage: any = {
            id: page.id,
            type: page.type,
            layoutId: updatedPage.layoutId,
            aspectRatio: updatedPage.aspectRatio || '16:9',
            title: updatedPage.title,
            subtitle: updatedPage.subtitle,
            logo: updatedPage.logo,
            logoSize: updatedPage.logoSize,
            image: updatedPage.image,
            imageConfig: updatedPage.imageConfig,
            backgroundColor: updatedPage.backgroundColor,
            titleFont: updatedPage.titleFont,
            bodyFont: updatedPage.bodyFont,
            backgroundPattern: updatedPage.backgroundPattern,
            footer: updatedPage.footer,
            pageNumber: updatedPage.pageNumber,
            minimalCounter: updatedPage.minimalCounter,
            pageNumberText: updatedPage.pageNumberText,
            counterStyle: updatedPage.counterStyle,
            styleOverrides: updatedPage.styleOverrides,
            visibility: updatedPage.visibility
          };

          if (allowedFields.includes('actionText')) cleanedPage.actionText = (updatedPage as any).actionText;
          if (allowedFields.includes('imageLabel')) cleanedPage.imageLabel = (updatedPage as any).imageLabel;
          if (allowedFields.includes('imageSubLabel')) cleanedPage.imageSubLabel = (updatedPage as any).imageSubLabel;
          if (allowedFields.includes('features')) cleanedPage.features = (updatedPage as any).features;
          if (allowedFields.includes('metrics')) cleanedPage.metrics = (updatedPage as any).metrics;
          if (allowedFields.includes('gallery')) cleanedPage.gallery = (updatedPage as any).gallery;
          if (allowedFields.includes('bullets')) cleanedPage.bullets = (updatedPage as any).bullets;
          if (allowedFields.includes('variant')) cleanedPage.layoutVariant = updatedPage.layoutVariant;

          return cleanedPage as PageData;
        }
        
        if (Object.keys(changedGlobalFields).length > 0) {
          return { ...page, ...changedGlobalFields };
        }

        return page;
      });
    });
  }, []);

  const addPage = (ratio: AspectRatioType = '16:9', layoutId: string = 'modern-feature') => {
    const firstPage = pages[0];
    const existingTOC = pages.find(p => p.layoutId === 'table-of-contents');

    const newPage: PageData = {
      id: `slide-${Date.now()}`,
      type: 'slide',
      layoutId: layoutId as any,
      aspectRatio: ratio,
      title: 'New Slide',
      bullets: ['Point 1', 'Point 2'],
      backgroundColor: '#ffffff',
      backgroundPattern: firstPage?.backgroundPattern || 'none',
      counterStyle: firstPage?.counterStyle || 'number',
      minimalCounter: minimalCounter, // 继承全局设置
      footer: firstPage?.footer || '',
      titleFont: firstPage?.titleFont,
      bodyFont: firstPage?.bodyFont,
      agenda: existingTOC?.agenda || [],
      activeIndex: existingTOC?.activeIndex ?? 0,
      visibility: {
        logo: true
      }
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (id: string) => {
    if (pages.length <= 1) {
      uiAlert("Cannot Delete", "You must have at least one slide.");
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
        setProjectTitle('');
        setMinimalCounter(false);
        setCurrentPageIndex(0);
      }
    );
  };

  /**
   * 导出项目文件 (.slgrid)
   */
  const handleExportProject = () => {
    const finalTitle = projectTitle.trim() || pages[0]?.title || 'Untitled';
    const project: ProjectData = {
      version: "2.0",
      title: finalTitle,
      pages,
      customFonts,
      imageQuality,
      minimalCounter,
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalTitle}.slgrid`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File is empty");

        const project: ProjectData = JSON.parse(content);
        
        if (!project.pages || !Array.isArray(project.pages)) {
          throw new Error("Invalid project: 'pages' is missing");
        }

        project.customFonts?.forEach(font => {
          if (font.dataUrl) registerFontInDOM(font.family, font.dataUrl);
        });
        
        setCustomFonts(project.customFonts || []);
        setPages(project.pages);
        setProjectTitle(project.title || '');
        setImageQuality(project.imageQuality ?? 0.95);
        setMinimalCounter(project.minimalCounter ?? false);
        setCurrentPageIndex(0);
        
        uiAlert("Import Success", "Project loaded successfully.");
      } catch (err: any) {
        console.error("FATAL IMPORT ERROR:", err);
        window.alert("Import Failed: " + err.message);
      }
    };
    reader.onerror = () => window.alert("File reading failed.");
    reader.readAsText(file);
  };

  return {
    pages,
    projectTitle,
    setProjectTitle,
    imageQuality,
    setImageQuality,
    minimalCounter,
    setMinimalCounter,
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