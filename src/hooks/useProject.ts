import { useState, useEffect, useCallback } from 'react';
import { PageData, CustomFont, ProjectData, AspectRatioType, PrintSettings, TypographySettings } from '../types';
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

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  enabled: false,
  widthMm: 100,
  heightMm: 145,
  gutterMm: 10,
  showGutterShadow: true,
  showTrimShadow: true,
  showContentFrame: true,
  configs: {
    landscape: { bindingSide: 'bottom', trimSide: 'right' },
    portrait: { bindingSide: 'left', trimSide: 'bottom' },
    square: { bindingSide: 'left', trimSide: 'bottom' }
  }
};

const DEFAULT_TYPOGRAPHY: TypographySettings = {
  defaultLatin: "'Playfair Display', serif",
  defaultCJK: "'Noto Serif SC', serif",
  fieldOverrides: {}
};

const GLOBAL_FIELDS: Array<keyof PageData> = [
  'counterStyle',
  'backgroundPattern',
  'footer',
  'logo',
  'logoSize',
  'agenda',
  'minimalCounter',
  'counterColor' 
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
  const [minimalCounter, setMinimalCounter] = useState<boolean>(false); 
  const [counterColor, setCounterColor] = useState<string>('#64748b'); 
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [typography, setTypography] = useState<TypographySettings>(DEFAULT_TYPOGRAPHY);
  
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
          setMinimalCounter(savedData.minimalCounter ?? false);
          setCounterColor(savedData.counterColor ?? '#64748b'); 
          setTypography(savedData.typography || DEFAULT_TYPOGRAPHY);
          
          const loadedPrintSettings = savedData.printSettings || DEFAULT_PRINT_SETTINGS;
          if (!loadedPrintSettings.configs) loadedPrintSettings.configs = DEFAULT_PRINT_SETTINGS.configs;
          if (loadedPrintSettings.showGutterShadow === undefined) loadedPrintSettings.showGutterShadow = true;
          if (loadedPrintSettings.showTrimShadow === undefined) loadedPrintSettings.showTrimShadow = true;
          if (loadedPrintSettings.showContentFrame === undefined) loadedPrintSettings.showContentFrame = true;
          setPrintSettings(loadedPrintSettings);
          
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
      minimalCounter,
      counterColor,
      printSettings,
      typography
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
  }, [pages, customFonts, projectId, isLoaded, projectTitle, currentPageIndex, imageQuality, minimalCounter, counterColor, printSettings, typography]);

  const updatePage = useCallback((updatedPage: PageData) => {
    setPages(prev => {
      const originalPage = prev.find(p => p.id === updatedPage.id);
      if (!originalPage) return prev;

      const changedGlobalFields: Partial<PageData> = {};
      GLOBAL_FIELDS.forEach(field => {
        // @ts-ignore
        if (updatedPage[field] !== originalPage[field]) {
          // @ts-ignore
          changedGlobalFields[field] = updatedPage[field];
          if (field === 'minimalCounter') setMinimalCounter(updatedPage.minimalCounter ?? false);
          if (field === 'counterColor') setCounterColor(updatedPage.counterColor || '#64748b');
        }
      });

      return prev.map(page => {
        if (page.id === updatedPage.id) return updatedPage;
        if (Object.keys(changedGlobalFields).length > 0) return { ...page, ...changedGlobalFields };
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
      minimalCounter: minimalCounter, 
      counterColor: counterColor,
      footer: firstPage?.footer || '',
      agenda: existingTOC?.agenda || [],
      activeIndex: existingTOC?.activeIndex ?? 0,
      visibility: { logo: true }
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (id: string) => {
    if (pages.length <= 1) return;
    confirm("Delete Slide", "Are you sure?", () => {
        const idx = pages.findIndex(p => p.id === id);
        setPages(prev => prev.filter(p => p.id !== id));
        if (currentPageIndex >= idx && currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
    });
  };

  const handleClearAll = () => {
    confirm("Reset Project", "Are you sure?", () => {
        setPages(DEFAULT_PAGES);
        setProjectTitle('');
        setMinimalCounter(false);
        setTypography(DEFAULT_TYPOGRAPHY);
        setCurrentPageIndex(0);
    });
  };

  const reorderPages = (newPages: PageData[]) => {
    const currentPageId = pages[currentPageIndex]?.id;
    setPages(newPages);
    if (currentPageId) {
      const newIndex = newPages.findIndex(p => p.id === currentPageId);
      if (newIndex !== -1) setCurrentPageIndex(newIndex);
    }
  };

  const handleExportProject = () => {
    const project: ProjectData = { version: "2.0", title: projectTitle || 'Untitled', pages, customFonts, imageQuality, minimalCounter, counterColor, printSettings, typography };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title}.slgrid`;
    link.click();
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project: ProjectData = JSON.parse(e.target?.result as string);
        project.customFonts?.forEach(f => f.dataUrl && registerFontInDOM(f.family, f.dataUrl));
        setCustomFonts(project.customFonts || []);
        setPages(project.pages);
        setTypography(project.typography || DEFAULT_TYPOGRAPHY);
        setProjectTitle(project.title || '');
        setIsLoaded(true);
      } catch (err) {}
    };
    reader.readAsText(file);
  };

  return {
    pages, projectTitle, setProjectTitle, imageQuality, setImageQuality,
    minimalCounter, setMinimalCounter, counterColor, setCounterColor,
    printSettings, setPrintSettings, typography, setTypography,
    currentPageIndex, setCurrentPageIndex, currentPage: pages[currentPageIndex],
    customFonts, setCustomFonts, isLoaded, updatePage, addPage, removePage,
    reorderPages, handleClearAll, handleExportProject, handleImportProject, saveToDB
  };
}
