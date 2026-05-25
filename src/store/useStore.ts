import { create } from 'zustand';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont, CounterStyle, DesignSystem } from '../types';
import { getProject } from '../utils/db';
import { nativeFs } from '../utils/native-fs';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { TEMPLATES } from '../templates/registry';

/** 根据模板 ID 从注册表获取正确的宽高比，回退到 16:9 */
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = (TEMPLATES as any[]).find((t: any) => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const getDefaultPage = (ratio: AspectRatioType, layoutId: string): PageData => ({
  id: `slide-${crypto.randomUUID()}`,
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
  designSystem: DesignSystem;
  currentPageIndex: number;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  isLoaded: boolean;
  activeProjectId: string | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  past: any[];
  future: any[];

  createProject: (title: string, templateId?: string) => string;
  loadProject: (idOrData: string | any, templateId?: string | null, filePath?: string | null) => Promise<void>;
  setPages: (pages: PageData[]) => void;
  setProjectTitle: (title: string) => void;
  setTheme: (themeUpdate: Partial<ProjectTheme>, applyToAll?: boolean) => void;
  setDesignSystem: (ds: DesignSystem) => void;
  setPrintSettings: (settings: PrintSettings) => void;
  setImageQuality: (imageQuality: number) => void;
  setMinimalCounter: (minimal: boolean) => void;
  setCounterStyle: (style: CounterStyle) => void;
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

const deepClone = <T>(obj: T): T => structuredClone(obj);

export const useStore = create<ProjectState>((set, get) => ({
  pages: [], 
  projectTitle: '', 
  theme: DEFAULT_THEME, 
  designSystem: DEFAULT_DESIGN_SYSTEM, 
  currentPageIndex: 0, 
  customFonts: [], 
  imageQuality: 0.95, 
  minimalCounter: false, 
  counterStyle: 'number', 
  printSettings: DEFAULT_PRINT_SETTINGS, 
  isLoaded: false, 
  activeProjectId: null, 
  currentFilePath: null, 
  hasUnsavedChanges: false, 
  past: [], 
  future: [],

  createProject: (title, templateId) => {
    const id = crypto.randomUUID();
    set({
      activeProjectId: id,
      projectTitle: title,
      pages: [{ ...getDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature'), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }],
      theme: DEFAULT_THEME,
      designSystem: DEFAULT_DESIGN_SYSTEM,
      currentPageIndex: 0,
      isLoaded: true,
      currentFilePath: null,
      hasUnsavedChanges: true,
      past: [],
      future: []
    });
    return id;
  },

  loadProject: async (idOrData, templateId, filePath) => {
    let projectData: any = null;
    let projectId: string | null = null;

    if (typeof idOrData === 'string') {
      projectId = idOrData;
      set({ isLoaded: false, activeProjectId: projectId, currentFilePath: filePath || null, hasUnsavedChanges: false });
      projectData = await getProject(projectId);
    } else {
      projectData = idOrData;
      projectId = projectData.id || crypto.randomUUID();
      const targetPath = filePath || projectData.filePath || null;
      set({ isLoaded: false, activeProjectId: projectId, currentFilePath: targetPath, hasUnsavedChanges: false });
    }

    if (projectData) {
      // 执行 V3 迁移
      const migratedData = migrateToV3(projectData);

      if (nativeFs.isElectron()) {
        const title = migratedData.title || migratedData.projectTitle || 'Untitled Project';
        console.log('[Store] Syncing project context to Electron:', projectId, title);
        nativeFs.setCurrentProject(projectId!, title);
      }

      set((state) => ({
        pages: migratedData.pages || [], 
        projectTitle: migratedData.title || migratedData.projectTitle || '', 
        theme: migratedData.theme || DEFAULT_THEME, 
        designSystem: migratedData.designSystem || DEFAULT_DESIGN_SYSTEM, 
        customFonts: migratedData.customFonts || [], 
        imageQuality: migratedData.imageQuality ?? 0.95, 
        minimalCounter: migratedData.minimalCounter ?? false, 
        counterStyle: migratedData.counterStyle || (migratedData.pages?.[0]?.counterStyle) || 'number',
        printSettings: migratedData.printSettings || DEFAULT_PRINT_SETTINGS, 
        currentFilePath: filePath || migratedData.filePath || state.currentFilePath,
        currentPageIndex: 0, 
        isLoaded: true, 
        past: [], 
        future: []
      }));
    } else {
      set({
        pages: [getDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature')], 
        projectTitle: '', 
        theme: DEFAULT_THEME, 
        designSystem: DEFAULT_DESIGN_SYSTEM, 
        customFonts: [], 
        imageQuality: 0.95, 
        minimalCounter: false, 
        counterStyle: 'number',
        printSettings: DEFAULT_PRINT_SETTINGS, 
        currentPageIndex: 0, 
        isLoaded: true, 
        past: [], 
        future: []
      });
    }
  },

  pushHistory: () => {
    const { pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts, currentPageIndex } = get();
    if (pages.length === 0) return;
    set((state) => ({
      past: [...state.past, {
        pages: deepClone(pages),
        projectTitle,
        theme: deepClone(theme),
        designSystem: deepClone(designSystem),
        printSettings: deepClone(printSettings),
        minimalCounter,
        counterStyle,
        imageQuality,
        customFonts: deepClone(customFonts),
        currentPageIndex,
      }].slice(-50),
      future: [],
      hasUnsavedChanges: true
    }));
  },

  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  setProjectTitle: (projectTitle) => set({ projectTitle, hasUnsavedChanges: true }),
  setPrintSettings: (printSettings) => set({ printSettings, hasUnsavedChanges: true }),
  setImageQuality: (imageQuality) => set({ imageQuality, hasUnsavedChanges: true }),
  setMinimalCounter: (minimalCounter) => set({ minimalCounter, hasUnsavedChanges: true }),
  setCounterStyle: (counterStyle) => {
    get().pushHistory();
    const { pages } = get();
    const updatedPages = pages.map(p => ({ ...p, counterStyle }));
    set({ counterStyle, pages: updatedPages, hasUnsavedChanges: true });
  },
  setCustomFonts: (customFonts) => set({ customFonts, hasUnsavedChanges: true }),
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  updatePage: (updatedPage, silent) => {
    if (!silent) get().pushHistory();
    const { pages } = get();
    const original = pages.find(p => p.id === updatedPage.id);
    // 全局同步字段：去掉 counterStyle（统一由 setCounterStyle 管理）
    const GLOBAL_FIELDS: Array<keyof PageData> = ['backgroundPattern', 'footer', 'titleFont', 'bodyFont', 'logo', 'logoSize', 'counterColor'];
    let hasGlobalChange = false;
    if (original) GLOBAL_FIELDS.forEach(f => { if (updatedPage[f] !== (original as any)[f]) hasGlobalChange = true; });
    let nextPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p);
    if (hasGlobalChange) {
      nextPages = nextPages.map(p => { 
        const u: any = {}; 
        GLOBAL_FIELDS.forEach(f => { u[f] = (updatedPage as any)[f]; }); 
        return { ...p, ...u }; 
      });
    }
    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  addPage: (ratio, layoutId) => {
    get().pushHistory();
    const { pages, theme, counterStyle } = get();
    const defaultPage = getDefaultPage(ratio, layoutId);
    // 继承当前全局样式到新页面
    const newPage: PageData = {
      ...defaultPage,
      backgroundColor: theme.colors.background,
      accentColor: theme.colors.accent,
      titleFont: theme.typography.headingFont,
      bodyFont: theme.typography.bodyFont,
      counterStyle,
    };
    set({ pages: [...pages, newPage], currentPageIndex: pages.length, hasUnsavedChanges: true });
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

  setDesignSystem: (designSystem) => {
    get().pushHistory();
    set({ designSystem, hasUnsavedChanges: true });
  },

  undo: () => {
    const { past, future, pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    // 构建完整的当前快照（用于 redo），包含 currentPageIndex
    const currentSnapshot = {
      pages: deepClone(pages), projectTitle, theme: deepClone(theme), designSystem: deepClone(designSystem),
      printSettings: deepClone(printSettings), minimalCounter, counterStyle, imageQuality, customFonts: deepClone(customFonts),
      currentPageIndex: get().currentPageIndex,
    };
    const restoredIndex = prev.currentPageIndex !== undefined ? Math.min(prev.currentPageIndex, prev.pages.length - 1) : 0;
    set({ 
      pages: prev.pages, projectTitle: prev.projectTitle, 
      theme: prev.theme, designSystem: prev.designSystem,
      printSettings: prev.printSettings || DEFAULT_PRINT_SETTINGS,
      minimalCounter: prev.minimalCounter ?? false,
      counterStyle: prev.counterStyle || 'number',
      imageQuality: prev.imageQuality ?? 0.95,
      customFonts: prev.customFonts || [],
      past: past.slice(0, -1), 
      future: [currentSnapshot, ...future], 
      currentPageIndex: restoredIndex, 
      hasUnsavedChanges: true 
    });
  },

  redo: () => {
    const { past, future, pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts } = get();
    if (future.length === 0) return;
    const next = future[0];
    const currentSnapshot = {
      pages: deepClone(pages), projectTitle, theme: deepClone(theme), designSystem: deepClone(designSystem),
      printSettings: deepClone(printSettings), minimalCounter, counterStyle, imageQuality, customFonts: deepClone(customFonts),
      currentPageIndex: get().currentPageIndex,
    };
    const restoredIndex = next.currentPageIndex !== undefined ? Math.min(next.currentPageIndex, next.pages.length - 1) : 0;
    set({ 
      pages: next.pages, projectTitle: next.projectTitle, 
      theme: next.theme, designSystem: next.designSystem,
      printSettings: next.printSettings || DEFAULT_PRINT_SETTINGS,
      minimalCounter: next.minimalCounter ?? false,
      counterStyle: next.counterStyle || 'number',
      imageQuality: next.imageQuality ?? 0.95,
      customFonts: next.customFonts || [],
      past: [...past, currentSnapshot], 
      future: future.slice(1), 
      currentPageIndex: restoredIndex, 
      hasUnsavedChanges: true 
    });
  }
}));

