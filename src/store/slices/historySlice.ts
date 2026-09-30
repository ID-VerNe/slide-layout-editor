import type { StateCreator } from 'zustand';
import type { PageData, ProjectTheme, PrintSettings, CustomFont, CounterStyle, DesignSystem } from '../../types';
import { DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { deepEqual } from '../../utils/comparison';
import type { ProjectState } from '../useStore';

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

export const buildSnapshot = (state: ProjectState): HistorySnapshot => ({
  pages: deepClone(state.pages),
  projectTitle: state.projectTitle,
  theme: deepClone(state.theme),
  designSystem: deepClone(state.designSystem),
  printSettings: state.printSettings,
  minimalCounter: state.minimalCounter,
  counterStyle: state.counterStyle,
  imageQuality: state.imageQuality,
  // 快照只存字体元数据,二进制留会话级缓存,避免 undo 栈膨胀
  customFonts: state.customFonts.map(f => ({ name: f.name, family: f.family })),
  currentPageIndex: state.currentPageIndex,
  currentFilePath: state.currentFilePath,
});

/**
 * 比对两份历史快照的实质内容是否完全一致,避免无意义的重复压栈
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
export const cacheFontBinaries = (fonts: CustomFont[] = []) => {
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

/** 清空字体二进制缓存,跨工程加载时防串味 */
export const clearFontBinaryCache = () => {
  fontBinaryMap.clear();
};

/** 提交尚未落盘的历史基准快照 */
export const commitUncommittedBaseline = (currentState: ProjectState) => {
  if (!uncommittedBaseline) return;
  const baseline = uncommittedBaseline;
  uncommittedBaseline = null;
  const currentSnapshot = buildSnapshot(currentState);
  if (!isEqualSnapshot(baseline, currentSnapshot)) {
    currentState.pushHistory(baseline);
  }
};

/** 在静默输入期间锁定起始基准快照 */
export const captureUncommittedBaseline = (state: ProjectState) => {
  if (!uncommittedBaseline) {
    uncommittedBaseline = buildSnapshot(state);
  }
  return uncommittedBaseline;
};

/** 取出并清空静默输入基准,供 updatePage(silent:false) 提交分支使用 */
export const takeUncommittedBaseline = (): HistorySnapshot | null => {
  const baseline = uncommittedBaseline;
  uncommittedBaseline = null;
  return baseline;
};

/** 拖拽落手时取出排序基准,无基准返回 null */
export const takeReorderBaseline = (): HistorySnapshot | null => {
  const baseline = reorderBaseline;
  reorderBaseline = null;
  return baseline;
};

/** 拖拽中首次进入时锁定排序基准 */
export const captureReorderBaseline = (state: ProjectState): HistorySnapshot => {
  if (!reorderBaseline) {
    reorderBaseline = buildSnapshot(state);
  }
  return reorderBaseline;
};

/** loadProject/createProject/redo 等全量状态替换场景:直接丢弃基准 */
export const discardUncommittedBaseline = () => {
  uncommittedBaseline = null;
};

export interface HistorySlice {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  pushHistory: (customSnapshot?: HistorySnapshot) => void;
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: StateCreator<ProjectState, [], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],

  pushHistory: (customSnapshot) => {
    const snapshot = customSnapshot || buildSnapshot(get());
    const { past } = get();

    // 避免无意义重复压栈:若栈顶已是相同快照则直接返回
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

  undo: () => {
    const baseline = takeUncommittedBaseline();
    if (baseline) {
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
    discardUncommittedBaseline();
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
});
