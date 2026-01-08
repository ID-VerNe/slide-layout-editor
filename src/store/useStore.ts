import { create } from 'zustand';
import { produce } from 'immer';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont, ProjectSaveData } from '../types';
import { DEFAULT_THEME, DEFAULT_PRINT_SETTINGS } from '../constants/theme';

const getDefaultPage = (ratio: AspectRatioType, layoutId: string): PageData => ({
  id: `slide-${Date.now()}`, 
  type: 'slide', 
  layoutId: layoutId, 
  aspectRatio: ratio, 
  title: 'New Slide', 
  subtitle: 'Created with SlideGrid Studio', 
  backgroundColor: DEFAULT_THEME.colors.background, 
  accentColor: DEFAULT_THEME.colors.accent, 
  titleFont: DEFAULT_THEME.typography.headingFont, 
  bodyFont: DEFAULT_THEME.typography.bodyFont, 
  titleFontZH: DEFAULT_THEME.typography.headingFontZH, 
  bodyFontZH: DEFAULT_THEME.typography.bodyFontZH, 
  counterStyle: 'number', 
  visibility: { logo: true }
});

interface HistoryState {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
}

interface ProjectState {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  currentPageIndex: number;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  printSettings: PrintSettings;
  isLoaded: boolean;
  activeProjectId: string | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  past: HistoryState[];
  future: HistoryState[];

  loadProject: (id: string, templateId?: string | null) => Promise<void>;
  initProject: (id: string, data: ProjectSaveData) => void;
  setPages: (pages: PageData[]) => void;
  setProjectTitle: (title: string) => void;
  setTheme: (themeUpdate: Partial<ProjectTheme>, applyToAll?: boolean) => void;
  setPrintSettings: (settings: PrintSettings) => void;
  setImageQuality: (quality: number) => void;
  setMinimalCounter: (minimal: boolean) => void;
  setCustomFonts: (fonts: CustomFont[]) => void;
  setCurrentPageIndex: (index: number) => void;
  setCurrentFilePath: (path: string | null) => void;
  markAsSaved: () => void;
  updatePage: (updatedPage: PageData, silent?: boolean) => void;
  addPage: (ratio: AspectRatioType, layoutId: string) => void;
  removePage: (id: string) => void;
  reorderPages: (newPages: PageData[]) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useStore = create<ProjectState>((set, get) => ({
  pages: [], projectTitle: '', theme: DEFAULT_THEME, currentPageIndex: 0, customFonts: [], imageQuality: 0.95, minimalCounter: false, printSettings: DEFAULT_PRINT_SETTINGS, isLoaded: false, activeProjectId: null, 
  currentFilePath: null, hasUnsavedChanges: false,
  past: [], future: [],

  loadProject: async (id, templateId) => {
    // 防止重复加载
    if (get().activeProjectId === id && get().isLoaded) return;
    
    set({ activeProjectId: id, isLoaded: false, pages: [] });
    
    try {
      const { getProject } = await import('../utils/db');
      const savedData = await getProject(id);
      
      if (get().activeProjectId !== id) return;
      
      if (savedData) {
        const fullPages = savedData.pages || [];
        const initialPages = fullPages.length > 0 ? [fullPages[0]] : [];
        
        set({
          pages: initialPages, 
          projectTitle: savedData.title || '', 
          currentFilePath: savedData.filePath || null,
          theme: savedData.theme || DEFAULT_THEME, 
          customFonts: savedData.customFonts || [], 
          imageQuality: savedData.imageQuality ?? 0.95, 
          minimalCounter: savedData.minimalCounter ?? false, 
          printSettings: savedData.printSettings || DEFAULT_PRINT_SETTINGS, 
          currentPageIndex: 0, 
          isLoaded: true,
          past: [],
          future: [],
          hasUnsavedChanges: false
        });

        if (fullPages.length > 1) {
          setTimeout(() => {
            if (get().activeProjectId === id) {
              set({ pages: fullPages });
            }
          }, 500);
        }
      } else {
        set({
          pages: [{ ...getDefaultPage(templateId?.includes('2:3') ? '2:3' : '16:9', templateId || 'modern-feature'), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }], 
          projectTitle: '', theme: DEFAULT_THEME, customFonts: [], imageQuality: 0.95, minimalCounter: false, printSettings: DEFAULT_PRINT_SETTINGS, currentPageIndex: 0, isLoaded: true, past: [], future: [], hasUnsavedChanges: false
        });
      }
    } catch (error) {
      console.error(`[Store] Load failed:`, error);
    }
  },

  initProject: (id, data) => {
    set({
      activeProjectId: id,
      pages: data.pages,
      projectTitle: data.title,
      customFonts: data.customFonts,
      theme: data.theme,
      minimalCounter: data.minimalCounter,
      imageQuality: data.imageQuality,
      printSettings: data.printSettings,
      currentFilePath: data.filePath || null,
      isLoaded: true,
      past: [],
      future: [],
      hasUnsavedChanges: false
    });
  },

  pushHistory: () => {
    const { pages, projectTitle, theme, isLoaded } = get();
    if (!isLoaded || pages.length === 0) return;
    
    set((state) => ({
      past: [...state.past, { pages, projectTitle, theme }].slice(-20),
      future: [],
      hasUnsavedChanges: true 
    }));
  },

  setPages: (pages) => set({ pages, hasUnsavedChanges: true }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  setProjectTitle: (projectTitle) => set({ projectTitle, hasUnsavedChanges: true }),
  setPrintSettings: (printSettings) => set({ printSettings, hasUnsavedChanges: true }),
  setImageQuality: (imageQuality) => set({ imageQuality, hasUnsavedChanges: true }),
  setMinimalCounter: (minimalCounter) => set({ minimalCounter, hasUnsavedChanges: true }),
  setCustomFonts: (customFonts) => set({ customFonts, hasUnsavedChanges: true }),
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  updatePage: (updatedPage, silent = false) => {
    if (!silent) get().pushHistory();
    
    set(produce((state: ProjectState) => {
      const idx = state.pages.findIndex(p => p.id === updatedPage.id);
      if (idx === -1) return;

      const original = state.pages[idx];
      const GLOBAL_FIELDS: Array<keyof PageData> = ['counterStyle', 'backgroundPattern', 'footer', 'titleFont', 'bodyFont', 'titleFontZH', 'bodyFontZH', 'logo', 'logoSize', 'counterColor'];
      
      let hasGlobalChange = false;
      GLOBAL_FIELDS.forEach(f => { if ((updatedPage as any)[f] !== (original as any)[f]) hasGlobalChange = true; });

      state.pages[idx] = updatedPage;
      state.hasUnsavedChanges = true;

      if (hasGlobalChange) {
        state.pages.forEach(p => {
          GLOBAL_FIELDS.forEach(f => { (p as any)[f] = (updatedPage as any)[f]; });
        });
      }
    }));
  },

  addPage: (ratio, layoutId) => {
    get().pushHistory();
    const { theme } = get();
    const newPage = { ...getDefaultPage(ratio, layoutId), backgroundColor: theme.colors.background, accentColor: theme.colors.accent };
    set(produce((state: ProjectState) => {
      state.pages.push(newPage);
      state.currentPageIndex = state.pages.length - 1;
      state.hasUnsavedChanges = true;
    }));
  },

  removePage: (id) => {
    const { currentPageIndex } = get();
    get().pushHistory();
    
    set(produce((state: ProjectState) => {
      const newPages = state.pages.filter(p => p.id !== id);
      state.pages = newPages;
      state.currentPageIndex = Math.max(0, Math.min(currentPageIndex, newPages.length - 1));
      state.hasUnsavedChanges = true;
    }));
  },

  reorderPages: (newPages) => { 
    get().pushHistory(); 
    set({ pages: newPages, hasUnsavedChanges: true }); 
  },

  setTheme: (update, applyToAll = false) => {
    get().pushHistory();
    set(produce((state: ProjectState) => {
      state.theme = { 
        ...state.theme, 
        ...update, 
        colors: { ...state.theme.colors, ...(update.colors || {}) }, 
        typography: { ...state.theme.typography, ...(update.typography || {}) } 
      };
      state.hasUnsavedChanges = true;

      if (applyToAll) {
        state.pages.forEach(p => {
          p.backgroundColor = state.theme.colors.background;
          p.accentColor = state.theme.colors.accent;
          p.titleFont = state.theme.typography.headingFont;
          p.bodyFont = state.theme.typography.bodyFont;
          p.titleFontZH = state.theme.typography.headingFontZH;
          p.bodyFontZH = state.theme.typography.bodyFontZH;
        });
      }
    }));
  },

  undo: () => {
    const { past, future, pages, projectTitle, theme, currentPageIndex } = get();
    if (past.length === 0) return;
    
    const prev = past[past.length - 1];
    set({ 
      pages: prev.pages, 
      projectTitle: prev.projectTitle, 
      theme: prev.theme, 
      past: past.slice(0, -1), 
      future: [{ pages, projectTitle, theme }, ...future], 
      currentPageIndex: Math.min(currentPageIndex, prev.pages.length - 1), 
      hasUnsavedChanges: true 
    });
  },

  redo: () => {
    const { past, future, pages, projectTitle, theme, currentPageIndex } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    set({ 
      pages: next.pages, 
      projectTitle: next.projectTitle, 
      theme: next.theme, 
      past: [...past, { pages, projectTitle, theme }], 
      future: future.slice(1), 
      currentPageIndex: Math.min(currentPageIndex, next.pages.length - 1), 
      hasUnsavedChanges: true 
    });
  }
}));

export const useTemporalStore = (selector: any) => useStore(selector);
