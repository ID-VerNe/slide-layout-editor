import { create } from 'zustand';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont } from '../types';
import { getProject } from '../utils/db';

export const DEFAULT_THEME: ProjectTheme = {
  colors: { primary: '#0F172A', secondary: '#64748B', accent: '#264376', background: '#ffffff', surface: '#F1F3F5' },
  typography: { headingFont: "'Playfair Display', serif", bodyFont: "'Playfair Display', serif" }
};

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  enabled: false, widthMm: 100, heightMm: 145, gutterMm: 10,
  showGutterShadow: true, showTrimShadow: true, showContentFrame: true,
  configs: {
    landscape: { bindingSide: 'bottom', trimSide: 'right' },
    portrait: { bindingSide: 'left', trimSide: 'bottom' },
    square: { bindingSide: 'left', trimSide: 'bottom' },
    resume: { bindingSide: 'left', trimSide: 'bottom' }
  }
};

const getDefaultPage = (ratio: AspectRatioType, layoutId: string): PageData => ({
  id: `slide-${Date.now()}`,
  // 核心修复：根据布局 ID 设定页面类型
  type: layoutId === 'freeform' ? 'freeform' : 'slide',
  layoutId: layoutId as any,
  aspectRatio: ratio,
  title: 'New Slide',
  subtitle: 'Created with SlideGrid Studio',
  backgroundColor: DEFAULT_THEME.colors.background,
  accentColor: DEFAULT_THEME.colors.accent,
  titleFont: DEFAULT_THEME.typography.headingFont,
  bodyFont: DEFAULT_THEME.typography.bodyFont,
  counterStyle: 'number',
  visibility: { logo: true },
  freeformItems: [],
  freeformConfig: { gridSize: 20, snapToGrid: true, showGridOverlay: false, showAlignmentGuides: true }
});

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
  past: any[];
  future: any[];

  loadProject: (id: string, templateId?: string | null) => Promise<void>;
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
  updatePage: (updatedPage: PageData) => void;
  addPage: (ratio: AspectRatioType, layoutId: string) => void;
  removePage: (id: string) => void;
  reorderPages: (newPages: PageData[]) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useStore = create<ProjectState>((set, get) => ({
  pages: [], projectTitle: '', theme: DEFAULT_THEME, currentPageIndex: 0, customFonts: [], imageQuality: 0.95, minimalCounter: false, printSettings: DEFAULT_PRINT_SETTINGS, isLoaded: false, activeProjectId: null, currentFilePath: null, hasUnsavedChanges: false, past: [], future: [],

  loadProject: async (id, templateId) => {
    if (get().activeProjectId === id && get().isLoaded) return;
    set({ isLoaded: false, activeProjectId: id, currentFilePath: null, hasUnsavedChanges: false });
    const savedData = await getProject(id);
    if (get().activeProjectId !== id) return;
    if (savedData) {
      set({
        pages: savedData.pages || [], projectTitle: savedData.title || '', theme: savedData.theme || DEFAULT_THEME, customFonts: savedData.customFonts || [], imageQuality: savedData.imageQuality ?? 0.95, minimalCounter: savedData.minimalCounter ?? false, printSettings: savedData.printSettings || DEFAULT_PRINT_SETTINGS, currentPageIndex: 0, isLoaded: true, past: [], future: []
      });
    } else {
      set({
        pages: [getDefaultPage(templateId?.includes('2:3') ? '2:3' : '16:9', templateId || 'modern-feature')], projectTitle: '', theme: DEFAULT_THEME, customFonts: [], imageQuality: 0.95, minimalCounter: false, printSettings: DEFAULT_PRINT_SETTINGS, currentPageIndex: 0, isLoaded: true, past: [], future: []
      });
    }
  },

  pushHistory: () => {
    const { pages, projectTitle, theme } = get();
    if (pages.length === 0) return;
    set((state) => ({
      past: [...state.past, { pages: deepClone(pages), projectTitle, theme: deepClone(theme) }].slice(-50),
      future: [],
      hasUnsavedChanges: true
    }));
  },

  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  setProjectTitle: (projectTitle) => set({ projectTitle, hasUnsavedChanges: true }),
  setPrintSettings: (printSettings) => set({ printSettings, hasUnsavedChanges: true }),
  setImageQuality: (imageQuality) => set({ imageQuality, hasUnsavedChanges: true }),
  setMinimalCounter: (minimalCounter) => set({ minimalCounter, hasUnsavedChanges: true }),
  setCustomFonts: (customFonts) => set({ customFonts, hasUnsavedChanges: true }),
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  updatePage: (updatedPage) => {
    get().pushHistory();
    const { pages } = get();
    const original = pages.find(p => p.id === updatedPage.id);
    const GLOBAL_FIELDS: Array<keyof PageData> = ['counterStyle', 'backgroundPattern', 'footer', 'titleFont', 'bodyFont', 'logo', 'logoSize', 'counterColor'];
    let hasGlobalChange = false;
    if (original) GLOBAL_FIELDS.forEach(f => { if (updatedPage[f] !== (original as any)[f]) hasGlobalChange = true; });
    let nextPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p);
    if (hasGlobalChange) nextPages = nextPages.map(p => { const u: any = {}; GLOBAL_FIELDS.forEach(f => { u[f] = (updatedPage as any)[f]; }); return { ...p, ...u }; });
    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  addPage: (ratio, layoutId) => {
    get().pushHistory();
    const { pages } = get();
    set({ pages: [...pages, getDefaultPage(ratio, layoutId)], currentPageIndex: pages.length, hasUnsavedChanges: true });
  },

  removePage: (id) => {
    const { pages, currentPageIndex } = get();
    if (pages.length <= 1) return;
    get().pushHistory();
    const newPages = pages.filter(p => p.id !== id);
    let nextIdx = currentPageIndex;
    if (nextIdx >= newPages.length) nextIdx = Math.max(0, newPages.length - 1);
    set({ pages: newPages, currentPageIndex: nextIdx, hasUnsavedChanges: true });
  },

  setPages: (pages) => set({ pages }),
  reorderPages: (newPages) => { get().pushHistory(); set({ pages: newPages, hasUnsavedChanges: true }); },

  setTheme: (update, applyToAll = false) => {
    get().pushHistory();
    set((state) => {
      const newTheme = { ...state.theme, ...update, colors: { ...state.theme.colors, ...(update.colors || {}) }, typography: { ...state.theme.typography, ...(update.typography || {}) } };
      if (!applyToAll) return { theme: newTheme, hasUnsavedChanges: true };
      const updatedPages = state.pages.map(p => ({ ...p, backgroundColor: newTheme.colors.background, accentColor: newTheme.colors.accent, titleFont: newTheme.typography.headingFont, bodyFont: newTheme.typography.bodyFont }));
      return { theme: newTheme, pages: updatedPages, hasUnsavedChanges: true };
    });
  },

  undo: () => {
    const { past, future, pages, projectTitle, theme, currentPageIndex } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({ pages: prev.pages, projectTitle: prev.projectTitle, theme: prev.theme, past: past.slice(0, -1), future: [{ pages: deepClone(pages), projectTitle, theme: deepClone(theme) }, ...future], currentPageIndex: Math.min(currentPageIndex, prev.pages.length - 1), hasUnsavedChanges: true });
  },

  redo: () => {
    const { past, future, pages, projectTitle, theme, currentPageIndex } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({ pages: next.pages, projectTitle: next.projectTitle, theme: next.theme, past: [...past, { pages: deepClone(pages), projectTitle, theme: deepClone(theme) }], future: future.slice(1), currentPageIndex: Math.min(currentPageIndex, next.pages.length - 1), hasUnsavedChanges: true });
  }
}));