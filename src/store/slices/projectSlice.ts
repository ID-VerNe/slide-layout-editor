import type { StateCreator } from 'zustand';
import type { PageData, AspectRatioType, ProjectData } from '../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { TEMPLATES, getTemplateById } from '../../templates/registry';
import { GLOBAL_FIELDS } from '../../constants/fields';
import { logger } from '../../utils/logger';
import { deepEqual } from '../../utils/comparison';
import { createDefaultPage } from '../../utils/templateDefaults';
import type { ProjectState } from '../useStore';
import {
  commitUncommittedBaseline,
  captureUncommittedBaseline,
  takeUncommittedBaseline,
  buildSnapshot,
  isEqualSnapshot,
  discardUncommittedBaseline,
  captureReorderBaseline,
  takeReorderBaseline,
  type HistorySnapshot,
} from './historySlice';
import { loadProjectPipeline, clearFontBinaryCache } from '../projectLoader';

/** 根据模板 ID 从注册表获取正确的宽高比,回退到 16:9 */
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = TEMPLATES.find(t => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const deepClone = <T>(obj: T): T => structuredClone(obj);

// loadProject 请求 ID,用于取消过时的异步加载
let loadRequestId = 0;

export interface ProjectSlice {
  pages: PageData[];
  projectTitle: string;
  currentPageIndex: number;
  isLoaded: boolean;
  activeProjectId: string | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  createProject: (title: string, templateId?: string) => string;
  loadProject: (idOrData: string | (Partial<ProjectData> & Record<string, unknown>), templateId?: string | null, filePath?: string | null) => Promise<void>;
  setPages: (pages: PageData[]) => void;
  setProjectTitle: (title: string) => void;
  setCurrentPageIndex: (index: number) => void;
  setCurrentFilePath: (path: string | null) => void;
  markAsSaved: () => void;
  updatePage: (updatedPage: PageData, silent?: boolean) => void;
  updatePages: (updates: Partial<PageData>[], silent?: boolean) => void;
  addPage: (ratio: AspectRatioType, layoutId: string) => void;
  removePage: (id: string) => void;
  reorderPages: (newPages: PageData[], isCommit?: boolean) => void;
}

export const createProjectSlice: StateCreator<ProjectState, [], [], ProjectSlice> = (set, get) => ({
  pages: [],
  projectTitle: '',
  currentPageIndex: 0,
  isLoaded: false,
  activeProjectId: null,
  currentFilePath: null,
  hasUnsavedChanges: false,

  createProject: (title, templateId) => {
    discardUncommittedBaseline();
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

  loadProject: async (idOrData, templateId, filePath) => {
    discardUncommittedBaseline();
    // 切工程前清空字体二进制缓存,避免跨工程串味
    clearFontBinaryCache();
    const reqId = ++loadRequestId;
    const projectId = typeof idOrData === 'string'
      ? idOrData
      : (idOrData.id || crypto.randomUUID());
    const targetPath = typeof idOrData === 'string'
      ? (filePath || null)
      : (filePath || idOrData.filePath || null);

    set({ isLoaded: false, activeProjectId: projectId, currentFilePath: targetPath, hasUnsavedChanges: false });

    try {
      const result = await loadProjectPipeline(idOrData, filePath ?? null, projectId, () => reqId !== loadRequestId);
      if (reqId !== loadRequestId) return;

      if (result) {
        set({
          pages: result.pages,
          projectTitle: result.projectTitle,
          theme: result.theme,
          designSystem: result.designSystem,
          customFonts: result.customFonts,
          imageQuality: result.imageQuality,
          minimalCounter: result.minimalCounter,
          counterStyle: result.counterStyle,
          printSettings: result.printSettings,
          currentFilePath: result.currentFilePath,
          currentPageIndex: 0,
          isLoaded: true,
          past: [],
          future: []
        });
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

  setProjectTitle: (projectTitle) => {
    if (projectTitle === get().projectTitle) return;
    commitUncommittedBaseline(get());
    get().pushHistory();
    set({ projectTitle, hasUnsavedChanges: true });
  },

  setCurrentPageIndex: (index) => {
    // 切页前结算正在进行的静默输入基准,避免旧页基准污染新页历史栈
    commitUncommittedBaseline(get());
    set({ currentPageIndex: index });
  },

  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),
  markAsSaved: () => set({ hasUnsavedChanges: false }),

  // @lat: [[store#GLOBAL_FIELDS Sync]]
  updatePage: (updatedPage, silent) => {
    logger.action('Store', 'UpdatePage', { pageId: updatedPage.id, layoutId: updatedPage.layoutId });
    const { pages } = get();
    const original = pages.find(p => p.id === updatedPage.id);

    if (silent) {
      captureUncommittedBaseline(get());
    } else {
      const baseline = takeUncommittedBaseline();
      if (baseline) {
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

    // 预先计算需要同步的全局字段变更,避免在每页迭代中重复遍历 GLOBAL_FIELDS
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

    // 仅在有全局同步字段变更时执行二次映射,使用预计算对象避免重复 GLOBAL_FIELDS 遍历
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
      captureUncommittedBaseline(get());
    } else {
      const baseline = takeUncommittedBaseline();
      if (baseline) {
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
    const templateConfig = getTemplateById(layoutId);
    const defaultPage = createDefaultPage(ratio, layoutId, templateConfig);
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
      // 拖拽中:首次进入时锁定拖拽前基准,仅做视觉更新
      captureReorderBaseline(get());
      set({ pages: newPages, hasUnsavedChanges: true });
      return;
    }

    // 落手:对比拖拽前基准与最终结果,实质变更才压栈一次
    const baseline = takeReorderBaseline();
    const before = get().pages;
    if (deepEqual(before, newPages) && !baseline) return;

    if (baseline) {
      const finalSnapshot: HistorySnapshot = { ...buildSnapshot(get()), pages: deepClone(newPages) };
      if (!isEqualSnapshot(baseline, finalSnapshot)) {
        get().pushHistory(baseline);
      }
    } else {
      // 无拖拽基准(外部程序化调用,走 isCommit=true 默认路径)
      commitUncommittedBaseline(get());
      get().pushHistory();
    }

    set({ pages: newPages, hasUnsavedChanges: true });
  },
});
