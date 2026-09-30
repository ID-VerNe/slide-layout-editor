import type { StateCreator } from 'zustand';
import type { ProjectTheme, DesignSystem, CustomFont, CounterStyle, PrintSettings } from '../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { deepEqual } from '../../utils/comparison';
import type { ProjectState } from '../useStore';
import { commitUncommittedBaseline, cacheFontBinaries } from './historySlice';

export interface StyleSlice {
  theme: ProjectTheme;
  designSystem: DesignSystem;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  setTheme: (themeUpdate: { colors?: Partial<ProjectTheme['colors']>; typography?: Partial<ProjectTheme['typography']> } & Omit<Partial<ProjectTheme>, 'colors' | 'typography'>, applyToAll?: boolean) => void;
  setDesignSystem: (ds: DesignSystem) => void;
  setPrintSettings: (settings: PrintSettings) => void;
  setImageQuality: (imageQuality: number) => void;
  setMinimalCounter: (minimal: boolean) => void;
  setCounterStyle: (style: CounterStyle) => void;
  setCustomFonts: (fonts: CustomFont[]) => void;
}

export const createStyleSlice: StateCreator<ProjectState, [], [], StyleSlice> = (set, get) => ({
  theme: DEFAULT_THEME,
  designSystem: DEFAULT_DESIGN_SYSTEM,
  customFonts: [],
  imageQuality: 0.95,
  minimalCounter: false,
  counterStyle: 'number',
  printSettings: DEFAULT_PRINT_SETTINGS,

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

  // 只写 state 并登记字体二进制缓存;DOM 注册由 useProject 的 useEffect 订阅 customFonts 承担
  setCustomFonts: (customFonts) => {
    cacheFontBinaries(customFonts);
    set({ customFonts, hasUnsavedChanges: true });
  }
});
