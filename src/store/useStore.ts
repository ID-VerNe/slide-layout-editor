import { create } from 'zustand';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont, CounterStyle, DesignSystem, ProjectData } from '../types';
import { getProject } from '../utils/storage/projectDb';
import { nativeFs } from '../utils/native-fs';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { GLOBAL_FIELDS } from '../constants/fields';
import { TEMPLATES, getTemplateById } from '../templates/registry';
import { logger } from '../utils/logger';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';
import { deepEqual } from '../utils/comparison';
import { validateProject } from '../utils/validation/projectSchema';
import { createDefaultPage } from '../utils/templateDefaults';

/** 根据模板 ID 从注册表获取正确的宽高比，回退到 16:9 */
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = TEMPLATES.find(t => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const deepClone = <T>(obj: T): T => structuredClone(obj);

export interface HistorySnapshot {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  printSettings?: PrintSettings;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;
  imageQuality?: number;
  customFonts?: CustomFont[];
  currentPageIndex?: number;
  currentFilePath?: string | null;
}

const buildSnapshot = (state: ProjectState): HistorySnapshot => ({
  pages: deepClone(state.pages),
  projectTitle: state.projectTitle,
  theme: deepClone(state.theme),
  designSystem: deepClone(state.designSystem),
  printSettings: deepClone(state.printSettings),
  minimalCounter: state.minimalCounter,
  counterStyle: state.counterStyle,
  imageQuality: state.imageQuality,
  customFonts: state.customFonts.map(f => ({ name: f.name, family: f.family })),
  currentPageIndex: state.currentPageIndex,
  currentFilePath: state.currentFilePath,
});

/**
 * 比对两份历史快照的实质内容是否完全一致，避免无意义的重复压栈
 */
export const isEqualSnapshot = (a?: HistorySnapshot | null, b?: HistorySnapshot | null): boolean => {
  if (!a || !b) return a === b;
  if (a === b) return true;

  if (
    a.projectTitle !== b.projectTitle ||
    a.minimalCounter !== b.minimalCounter ||
    a.counterStyle !== b.counterStyle ||
    a.imageQuality !== b.imageQuality ||
    a.currentFilePath !== b.currentFilePath
  ) {
    return false;
  }

  if (a.pages.length !== b.pages.length) return false;

  if (!deepEqual(a.theme, b.theme)) return false;
  if (!deepEqual(a.designSystem, b.designSystem)) return false;
  if (!deepEqual(a.printSettings, b.printSettings)) return false;
  if (!deepEqual(a.customFonts, b.customFonts)) return false;
  if (!deepEqual(a.pages, b.pages)) return false;

  return true;
};

/** 防抖输入期间尚未提交的历史基准快照 */
let uncommittedBaseline: HistorySnapshot | null = null;

/** 拖拽期间尚未提交的排序基准快照 */
let reorderBaseline: HistorySnapshot | null = null;

// 字体二进制的会话级缓存:family -> dataUrl
// 快照只存元数据,恢复时用此映射 rehydrate,避免裸元数据覆写 state.customFonts
const fontBinaryMap = new Map<string, string>();

/** 将字体列表中的二进制登记进会话缓存 */
const cacheFontBinaries = (fonts: CustomFont[] = []) => {
  for (const f of fonts) {
    if (f.family && f.dataUrl) {
      fontBinaryMap.set(f.family, f.dataUrl);
    }
  }
};

/** 用会话缓存补全快照字体的二进制,缺二进制的条目直接丢弃 */
const rehydrateFonts = (metadata: CustomFont[] = []): CustomFont[] => {
  const result: CustomFont[] = [];
  for (const m of metadata) {
    if (!m.family) continue;
    const dataUrl = fontBinaryMap.get(m.family);
    // 防御:缺二进制不写入 state,避免自动保存洗库
    if (!dataUrl) continue;
    result.push({ name: m.name, family: m.family, dataUrl });
  }
  return result;
};

/**
 * 提交尚未落盘的历史基准快照
 */
const commitUncommittedBaseline = (currentState: ProjectState) => {
  if (!uncommittedBaseline) return;
  const baseline = uncommittedBaseline;
  uncommittedBaseline = null;
  const currentSnapshot = buildSnapshot(currentState);
  if (!isEqualSnapshot(baseline, currentSnapshot)) {
    currentState.pushHistory(baseline);
  }
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
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  createProject: (title: string, templateId?: string) => string;
  loadProject: (idOrData: string | (Partial<ProjectData> & Record<string, unknown>), templateId?: string | null, filePath?: string | null) => Promise<void>;
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
  reorderPages: (newPages: PageData[], isCommit?: boolean) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (customSnapshot?: HistorySnapshot) => void;
}

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
    uncommittedBaseline = null;
    const id = crypto.randomUUID();
    const templateConfig = getTemplateById(templateId || 'modern-feature');
    set({
      activeProjectId: id,
      projectTitle: title,
      pages: [{ ...createDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }],
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
    uncommittedBaseline = null;
    // 切工程前清空字体二进制缓存,避免跨工程串味
    fontBinaryMap.clear();
    const reqId = ++loadRequestId;

    try {
      let projectData: ProjectData | null = null;
      let projectId: string | null = null;

      if (typeof idOrData === 'string') {
        projectId = idOrData;
        set({ isLoaded: false, activeProjectId: projectId, currentFilePath: filePath || null, hasUnsavedChanges: false });
        projectData = (await getProject(projectId)) as ProjectData | null;
      } else {
        projectData = idOrData as ProjectData;
        projectId = projectData.id || crypto.randomUUID();
        const targetPath = filePath || projectData.filePath || null;
        set({ isLoaded: false, activeProjectId: projectId, currentFilePath: targetPath, hasUnsavedChanges: false });
      }

      // 过时的请求直接丢弃，避免快速切换项目时旧数据覆盖新状态
      if (reqId !== loadRequestId) return;

      if (projectData) {
        // 执行 V3 迁移
        const migratedData = migrateToV3(projectData);

        // 迁移后做结构校验:失败不阻断,回退迁移数据并留痕
        const parsed = validateProject(migratedData);
        if (!parsed.success) {
          logger.warn(
            'Project validation failed, falling back to migrated data',
            parsed.error.issues
          );
        }
        const validatedPages = parsed.success ? parsed.data.pages : migratedData.pages;
        const safePages: PageData[] = Array.isArray(validatedPages) ? validatedPages as PageData[] : [];

        if (nativeFs.isElectron()) {
          const title = migratedData.title || migratedData.projectTitle || 'Untitled Project';
          nativeFs.setCurrentProject(projectId!, title);
        }

        set((state) => ({
          pages: safePages,
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

        // 登记字体二进制进会话缓存,供 undo/redo rehydrate
        cacheFontBinaries(migratedData.customFonts || []);

        // 自动将工程中的自定义字体注册载入 document.fonts
        if (migratedData.customFonts && migratedData.customFonts.length > 0) {
          loadCustomFontsIntoDOM(migratedData.customFonts);
        }
      } else {
        const templateConfig = getTemplateById(templateId || 'modern-feature');
        set({
          pages: [createDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig)],
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
  pushHistory: (customSnapshot) => {
    const snapshot = customSnapshot || buildSnapshot(get());
    const { past } = get();

    // 避免无意义重复压栈：若栈顶已是相同快照则直接返回
    if (past.length > 0 && isEqualSnapshot(past[past.length - 1], snapshot)) {
      return;
    }

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

  setCurrentPageIndex: (index) => {
    // 切页前结算正在进行的静默输入基准,避免旧页基准污染新页历史栈
    commitUncommittedBaseline(get());
    set({ currentPageIndex: index });
  },
  setProjectTitle: (projectTitle) => {
    if (projectTitle === get().projectTitle) return;
    commitUncommittedBaseline(get());
    get().pushHistory();
    set({ projectTitle, hasUnsavedChanges: true });
  },
  setPrintSettings: (printSettings) => set({ printSettings, hasUnsavedChanges: true }),
  setImageQuality: (imageQuality) => set({ imageQuality, hasUnsavedChanges: true }),
  setMinimalCounter: (minimalCounter) => set({ minimalCounter, hasUnsavedChanges: true }),
  setCounterStyle: (counterStyle) => {
    if (get().counterStyle === counterStyle) return;
    commitUncommittedBaseline(get());
    get().pushHistory();
    const { pages } = get();
    const updatedPages = pages.map(p => ({ ...p, counterStyle }));
    set({ counterStyle, pages: updatedPages, hasUnsavedChanges: true });
  },
  setCustomFonts: (customFonts) => {
    cacheFontBinaries(customFonts);
    loadCustomFontsIntoDOM(customFonts);
    set({ customFonts, hasUnsavedChanges: true });
  },
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  // @lat: [[store#GLOBAL_FIELDS Sync]]
  updatePage: (updatedPage, silent) => {
    logger.action('Store', 'UpdatePage', { pageId: updatedPage.id, layoutId: updatedPage.layoutId });
    const { pages } = get();
    const original = pages.find(p => p.id === updatedPage.id);

    if (silent) {
      // 连续静默输入时锁定起始基准快照
      if (!uncommittedBaseline) {
        uncommittedBaseline = buildSnapshot(get());
      }
    } else {
      if (uncommittedBaseline) {
        const baseline = uncommittedBaseline;
        uncommittedBaseline = null;
        const tempPages = pages.map(p => (p.id === updatedPage.id ? updatedPage : p));
        const projectedSnapshot: HistorySnapshot = {
          ...buildSnapshot(get()),
          pages: tempPages,
        };
        // 仅在输入结果与编辑前基准不同时压栈
        if (!isEqualSnapshot(baseline, projectedSnapshot)) {
          get().pushHistory(baseline);
        }
      } else {
        // 无变化直接跳过更新
        if (original && deepEqual(original, updatedPage)) {
          return;
        }
        get().pushHistory();
      }
    }

    // 预先计算需要同步的全局字段变更，避免在每页迭代中重复遍历 GLOBAL_FIELDS
    const globalUpdates: Record<string, unknown> = {};
    if (original) {
      GLOBAL_FIELDS.forEach(f => {
        const val = updatedPage[f];
        if (val !== undefined && val !== original[f]) {
          globalUpdates[f] = val;
        }
      });
    }

    let nextPages: PageData[] = pages.map(p => (p.id === updatedPage.id ? updatedPage : p));

    // 仅在有全局同步字段变更时执行二次映射，并使用预计算对象避免重复 GLOBAL_FIELDS 遍历
    const globalKeys = Object.keys(globalUpdates) as Array<keyof PageData>;
    if (globalKeys.length > 0) {
      nextPages = nextPages.map(p => (p.id === updatedPage.id ? p : { ...p, ...globalUpdates }));
    }

    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  updatePages: (updates, silent) => {
    logger.action('Store', 'UpdatePages', { count: updates.length });
    const { pages } = get();

    if (silent) {
      if (!uncommittedBaseline) {
        uncommittedBaseline = buildSnapshot(get());
      }
    } else {
      if (uncommittedBaseline) {
        const baseline = uncommittedBaseline;
        uncommittedBaseline = null;
        const tempPages = pages.map(page => {
          const update = updates.find(u => 'id' in u && u.id === page.id);
          return update ? { ...page, ...update } : page;
        });
        const projectedSnapshot: HistorySnapshot = {
          ...buildSnapshot(get()),
          pages: tempPages,
        };
        if (!isEqualSnapshot(baseline, projectedSnapshot)) {
          get().pushHistory(baseline);
        }
      } else {
        const nextPages = pages.map(page => {
          const update = updates.find(u => 'id' in u && u.id === page.id);
          return update ? { ...page, ...update } : page;
        });
        if (deepEqual(pages, nextPages)) {
          return;
        }
        get().pushHistory();
      }
    }

    const nextPages = pages.map(page => {
      const update = updates.find(u => 'id' in u && u.id === page.id);
      return update ? { ...page, ...update } : page;
    });
    set({ pages: nextPages, hasUnsavedChanges: true });
  },

  addPage: (ratio, layoutId) => {
    logger.action('Store', 'AddPage', { ratio, layoutId });
    commitUncommittedBaseline(get());
    get().pushHistory();
    const { pages, theme, counterStyle } = get();
    // 新增页同样走模板默认值合并，修复此前 templateConfig 漏传导致模板 defaultData 不生效
    const templateConfig = getTemplateById(layoutId);
    const defaultPage = createDefaultPage(ratio, layoutId, templateConfig);
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
    commitUncommittedBaseline(get());
    get().pushHistory();
    const newPages = pages.filter(p => p.id !== id);
    let nextIdx = currentPageIndex;
    if (nextIdx >= newPages.length) nextIdx = Math.max(0, newPages.length - 1);
    set({ pages: newPages, currentPageIndex: nextIdx, hasUnsavedChanges: true });
  },

  setPages: (pages) => {
    // 外部整体替换页数组前结算基准,避免替换后旧基准与新页面错位
    commitUncommittedBaseline(get());
    set({ pages });
  },
  reorderPages: (newPages, isCommit = true) => {
    logger.action('Store', 'ReorderPages', { count: newPages.length, isCommit });

    if (!isCommit) {
      // 拖拽中：首次进入时锁定拖拽前基准，仅做视觉更新
      if (!reorderBaseline) {
        reorderBaseline = buildSnapshot(get());
      }
      set({ pages: newPages, hasUnsavedChanges: true });
      return;
    }

    // 落手：对比拖拽前基准与最终结果，实质变更才压栈一次
    const baseline = reorderBaseline;
    reorderBaseline = null;
    const before = get().pages;
    if (deepEqual(before, newPages) && !baseline) return;

    if (baseline) {
      const finalSnapshot: HistorySnapshot = { ...buildSnapshot(get()), pages: deepClone(newPages) };
      if (!isEqualSnapshot(baseline, finalSnapshot)) {
        get().pushHistory(baseline);
      }
    } else {
      // 无拖拽基准（外部程序化调用，走 isCommit=true 默认路径）
      commitUncommittedBaseline(get());
      get().pushHistory();
    }

    set({ pages: newPages, hasUnsavedChanges: true });
  },

  setTheme: (update, applyToAll = false) => {
    commitUncommittedBaseline(get());
    const currentState = get();
    const newTheme = {
      ...currentState.theme,
      ...update,
      colors: { ...currentState.theme.colors, ...(update.colors || {}) },
      typography: { ...currentState.theme.typography, ...(update.typography || {}) }
    };
    if (!applyToAll && deepEqual(currentState.theme, newTheme)) {
      return;
    }
    get().pushHistory();
    set((state) => {
      if (!applyToAll) return { theme: newTheme, hasUnsavedChanges: true };
      const updatedPages = state.pages.map(p => ({
        ...p,
        backgroundColor: newTheme.colors.background,
        accentColor: newTheme.colors.accent,
        titleFont: newTheme.typography.headingFont,
        bodyFont: newTheme.typography.bodyFont
      }));
      return { theme: newTheme, pages: updatedPages, hasUnsavedChanges: true };
    });
  },

  setDesignSystem: (designSystem) => {
    if (deepEqual(get().designSystem, designSystem)) return;
    commitUncommittedBaseline(get());
    get().pushHistory();
    set({ designSystem, hasUnsavedChanges: true });
  },

  undo: () => {
    if (uncommittedBaseline) {
      const baseline = uncommittedBaseline;
      uncommittedBaseline = null;
      const currentSnapshot = buildSnapshot(get());
      if (!isEqualSnapshot(baseline, currentSnapshot)) {
        const restoredIndex = baseline.currentPageIndex !== undefined ? Math.min(baseline.currentPageIndex, baseline.pages.length - 1) : 0;
        set({
          pages: deepClone(baseline.pages),
          projectTitle: baseline.projectTitle,
          theme: deepClone(baseline.theme),
          designSystem: deepClone(baseline.designSystem),
          printSettings: baseline.printSettings ? deepClone(baseline.printSettings) : DEFAULT_PRINT_SETTINGS,
          minimalCounter: baseline.minimalCounter ?? false,
          counterStyle: baseline.counterStyle || 'number',
          imageQuality: baseline.imageQuality ?? 0.95,
          customFonts: rehydrateFonts(baseline.customFonts || []),
          currentFilePath: baseline.currentFilePath !== undefined ? baseline.currentFilePath : get().currentFilePath,
          future: [currentSnapshot, ...get().future],
          currentPageIndex: restoredIndex,
          hasUnsavedChanges: true
        });
        return;
      }
    }

    const { past, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    const currentSnapshot = buildSnapshot(get());
    const restoredIndex = prev.currentPageIndex !== undefined ? Math.min(prev.currentPageIndex, prev.pages.length - 1) : 0;
    set({
      pages: deepClone(prev.pages),
      projectTitle: prev.projectTitle,
      theme: deepClone(prev.theme),
      designSystem: deepClone(prev.designSystem),
      printSettings: prev.printSettings ? deepClone(prev.printSettings) : DEFAULT_PRINT_SETTINGS,
      minimalCounter: prev.minimalCounter ?? false,
      counterStyle: prev.counterStyle || 'number',
      imageQuality: prev.imageQuality ?? 0.95,
      customFonts: rehydrateFonts(prev.customFonts || []),
      currentFilePath: prev.currentFilePath !== undefined ? prev.currentFilePath : get().currentFilePath,
      past: past.slice(0, -1),
      future: [currentSnapshot, ...future],
      currentPageIndex: restoredIndex,
      hasUnsavedChanges: true
    });
  },

  redo: () => {
    uncommittedBaseline = null;
    const { past, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const currentSnapshot = buildSnapshot(get());
    const restoredIndex = next.currentPageIndex !== undefined ? Math.min(next.currentPageIndex, next.pages.length - 1) : 0;
    set({
      pages: deepClone(next.pages),
      projectTitle: next.projectTitle,
      theme: deepClone(next.theme),
      designSystem: deepClone(next.designSystem),
      printSettings: next.printSettings ? deepClone(next.printSettings) : DEFAULT_PRINT_SETTINGS,
      minimalCounter: next.minimalCounter ?? false,
      counterStyle: next.counterStyle || 'number',
      imageQuality: next.imageQuality ?? 0.95,
      customFonts: rehydrateFonts(next.customFonts || []),
      currentFilePath: next.currentFilePath !== undefined ? next.currentFilePath : get().currentFilePath,
      past: [...past, currentSnapshot],
      future: future.slice(1),
      currentPageIndex: restoredIndex,
      hasUnsavedChanges: true
    });
  }
}));

// 暴露 store 引用以支持端到端自动化测试与控制台调试
if (typeof window !== 'undefined') {
  (window as Window & { __SLIDEGRID_STORE__?: typeof useStore }).__SLIDEGRID_STORE__ = useStore;
}

