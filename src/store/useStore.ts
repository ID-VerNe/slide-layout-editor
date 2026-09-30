import { create } from 'zustand';
import { createProjectSlice, type ProjectSlice } from './slices/projectSlice';
import { createStyleSlice, type StyleSlice } from './slices/styleSlice';
import { createHistorySlice, type HistorySlice, isEqualSnapshot, type HistorySnapshot } from './slices/historySlice';

export type ProjectState = ProjectSlice & StyleSlice & HistorySlice;
export { isEqualSnapshot, type HistorySnapshot };

// @lat: [[store#Project State]]
export const useStore = create<ProjectState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createStyleSlice(...a),
  ...createHistorySlice(...a),
}));

// 暴露 store 引用以支持端到端自动化测试与控制台调试
if (typeof window !== 'undefined') {
  (window as Window & { __SLIDEGRID_STORE__?: typeof useStore }).__SLIDEGRID_STORE__ = useStore;
}
