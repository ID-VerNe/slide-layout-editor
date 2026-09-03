import { create } from 'zustand';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont, CounterStyle, DesignSystem } from '../types';
import { getProject } from '../utils/db';
import { nativeFs } from '../utils/native-fs';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { GLOBAL_FIELDS } from '../constants/fields';
import { TEMPLATES, getTemplateById } from '../templates/registry';
import { logger } from '../utils/logger';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';

/** 根据模板 ID 从注册表获取正确的宽高比，回退到 16:9 */
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = (TEMPLATES as any[]).find((t: any) => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const getDefaultPage = (ratio: AspectRatioType, layoutId: string, templateConfig?: any): PageData => {
  const base: PageData = {
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
  };

  // 合并模板级默认数据
  if (templateConfig?.defaultData) {
    Object.assign(base, templateConfig.defaultData);
  }

  // 合并字段级默认值
  if (templateConfig?.fields) {
    templateConfig.fields.forEach((field: any) => {
      if (field.defaultValue !== undefined && base[field.key as keyof PageData] === undefined) {
        (base as any)[field.key] = field.defaultValue;
      }
    });
  }

  return base;
};

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
  setTheme: (themeUpdate: { colors?: Partial<ProjectTheme['colors']>; typography?: Partial<ProjectTheme['typography']> } & Omit<Partial<ProjectTheme>, 'colors' | 'typography'>, applyToAll?: boolean) => void;
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
  updatePages: (updates: Partial<PageData>[], silent?: boolean) => void;
  addPage: (ratio: AspectRatioType, layoutId: string) => void;
  removePage: (id: string) => void;
  reorderPages: (newPages: PageData[]) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const deepClone = <T>(obj: T): T => structuredClone(obj);

/** loadProject 请求 ID，用于取消过时的异步加载 */
let loadRequestId = 0;

// @lat: [[store#Project State]]
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
    const templateConfig = getTemplateById(templateId || 'modern-feature');
    set({
      activeProjectId: id,
      projectTitle: title,
      pages: [{ ...getDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }],
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

  // @lat: [[store#Project Loading]]
  loadProject: async (idOrData, templateId, filePath) => {
    const reqId = ++loadRequestId;

    try {
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

      // 过时的请求直接丢弃，避免快速切换项目时旧数据覆盖新状态
      if (reqId !== loadRequestId) return;

      if (projectData) {
        // 执行 V3 迁移
        const migratedData = migrateToV3(projectData);

        if (nativeFs.isElectron()) {
          const title = migratedData.title || migratedData.projectTitle || 'Untitled Project';
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

        // 自动将工程中的自定义字体注册载入 document.fonts
        if (migratedData.customFonts && migratedData.customFonts.length > 0) {
          loadCustomFontsIntoDOM(migratedData.customFonts);
        }
      } else {
        const templateConfig = getTemplateById(templateId || 'modern-feature');
        set({
          pages: [getDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig)],
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
    } catch (err) {
      if (reqId !== loadRequestId) return;
      console.error('[Store] Failed to load project:', err);
      set({
        isLoaded: true,
        activeProjectId: null,
        projectTitle: '',
        pages: [],
        theme: DEFAULT_THEME,
        designSystem: DEFAULT_DESIGN_SYSTEM,
        customFonts: [],
        imageQuality: 0.95,
        minimalCounter: false,
        counterStyle: 'number',
        printSettings: DEFAULT_PRINT_SETTINGS,
        currentPageIndex: 0,
        currentFilePath: null,
        hasUnsavedChanges: false,
        past: [],
        future: []
      });
    }
  },

  // @lat: [[store#Undo-Redo]]
  pushHistory: () => {
    const { pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts, currentPageIndex, currentFilePath } = get();

    // 优化：检查快照大小，避免过大的状态占用内存
    const snapshot = {
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
      currentFilePath,
    };

    // 保护：防止过大快照撑爆历史栈 —— 始终执行精确 JSON.stringify 大小校验
    // 不用 pages.length * 2000 等粗略估算——单页可能包含超大字段（6MB+ 字符串、Base64 等）
    const MAX_SNAPSHOT_SIZE = 5 * 1024 * 1024; // 5MB
    try {
      const actualSize = JSON.stringify(snapshot).length;
      if (actualSize > MAX_SNAPSHOT_SIZE) {
        console.warn(`Snapshot too large (${(actualSize / 1024 / 1024).toFixed(2)}MB), skipping history`);
        return;
      }
    } catch (e) {
      console.error('Failed to serialize snapshot for history:', e);
      return;
    }

    set((state) => ({
      past: [...state.past, snapshot].slice(-50),
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
  setCustomFonts: (customFonts) => {
    loadCustomFontsIntoDOM(customFonts);
    set({ customFonts, hasUnsavedChanges: true });
  },
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  // @lat: [[store#GLOBAL_FIELDS Sync]]
  updatePage: (updatedPage, silent) => {
    logger.action('Store', 'UpdatePage', { pageId: updatedPage.id, layoutId: updatedPage.layoutId });
    if (!silent) get().pushHistory();
    const { pages } = get();
    const original = pages.find(p => p.id === updatedPage.id);

    // 优化：预先计算需要同步的全局字段变更，避免在每页迭代中重复遍历 GLOBAL_FIELDS
    const globalUpdates: Partial<PageData> = {};
    if (original) {
      GLOBAL_FIELDS.forEach(f => {
        const val = (updatedPage as any)[f];
        if (val !== undefined && val !== (original as any)[f]) {
          (globalUpdates as any)[f] = val;
        }
      });
    }

    let nextPages: PageData[] = pages.map(p => (p.id === updatedPage.id ? updatedPage : p));

    // 优化：仅在有全局同步字段变更时执行二次映射，并使用预计算对象避免重复 GLOBAL_FIELDS 遍历
    const globalKeys = Object.keys(globalUpdates) as Array<keyof PageData>;
    if (globalKeys.length > 0) {
      nextPages = nextPages.map(p => (p.id === updatedPage.id ? p : { ...p, ...globalUpdates }));
    }

    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  updatePages: (updates, silent) => {
    logger.action('Store', 'UpdatePages', { count: updates.length });
    if (!silent) get().pushHistory();
    const { pages } = get();
    const nextPages = pages.map(page => {
      const update = updates.find(u => 'id' in u && u.id === page.id);
      return update ? { ...page, ...update } : page;
    });
    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  addPage: (ratio, layoutId) => {
    logger.action('Store', 'AddPage', { ratio, layoutId });
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
    logger.action('Store', 'RemovePage', { pageId: id });
    const { pages, currentPageIndex } = get();
    if (pages.length <= 1) {
      console.warn('Cannot remove the last page');
      return;
    }
    get().pushHistory();
    const newPages = pages.filter(p => p.id !== id);
    let nextIdx = currentPageIndex;
    if (nextIdx >= newPages.length) nextIdx = Math.max(0, newPages.length - 1);
    set({ pages: newPages, currentPageIndex: nextIdx, hasUnsavedChanges: true });
  },

  setPages: (pages) => set({ pages }),
  reorderPages: (newPages) => { 
    logger.action('Store', 'ReorderPages', { count: newPages.length });
    get().pushHistory(); 
    set({ pages: newPages, hasUnsavedChanges: true }); 
  },

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
    const { past, future, pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts, currentFilePath } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    // 构建完整的当前快照（用于 redo），包含 currentPageIndex 与 currentFilePath
    const currentSnapshot = {
      pages: deepClone(pages), projectTitle, theme: deepClone(theme), designSystem: deepClone(designSystem),
      printSettings: deepClone(printSettings), minimalCounter, counterStyle, imageQuality, customFonts: deepClone(customFonts),
      currentPageIndex: get().currentPageIndex,
      currentFilePath,
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
      currentFilePath: prev.currentFilePath !== undefined ? prev.currentFilePath : currentFilePath,
      past: past.slice(0, -1),
      future: [currentSnapshot, ...future],
      currentPageIndex: restoredIndex,
      hasUnsavedChanges: true
    });
  },

  redo: () => {
    const { past, future, pages, projectTitle, theme, designSystem, printSettings, minimalCounter, counterStyle, imageQuality, customFonts, currentFilePath } = get();
    if (future.length === 0) return;
    const next = future[0];
    const currentSnapshot = {
      pages: deepClone(pages), projectTitle, theme: deepClone(theme), designSystem: deepClone(designSystem),
      printSettings: deepClone(printSettings), minimalCounter, counterStyle, imageQuality, customFonts: deepClone(customFonts),
      currentPageIndex: get().currentPageIndex,
      currentFilePath,
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
      currentFilePath: next.currentFilePath !== undefined ? next.currentFilePath : currentFilePath,
      past: [...past, currentSnapshot],
      future: future.slice(1),
      currentPageIndex: restoredIndex,
      hasUnsavedChanges: true
    });
  }
}));

// 暴露 store 引用以支持端到端自动化测试与控制台调试
if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_STORE__ = useStore;
}

