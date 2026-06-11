import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { DEFAULT_THEME } from '../constants/theme';

describe('useStore', () => {
  beforeEach(() => {
    // 每次测试前重置状态
    useStore.setState({
      pages: [],
      projectTitle: '',
      theme: DEFAULT_THEME,
      past: [],
      future: [],
      isLoaded: true
    });
  });

  it('应该能正确添加新页面', () => {
    const { addPage } = useStore.getState();
    addPage('16:9', 'modern-feature');
    
    const state = useStore.getState();
    expect(state.pages).toHaveLength(1);
    expect(state.pages[0].layoutId).toBe('modern-feature');
    expect(state.pages[0].aspectRatio).toBe('16:9');
  });

  it('使用 Immer 应该能正确更新页面并同步全局字段', () => {
    const { addPage, updatePage } = useStore.getState();
    addPage('16:9', 'modern-feature'); // Page 1
    addPage('16:9', 'modern-feature'); // Page 2
    
    const page1 = useStore.getState().pages[0];
    const updatedPage1 = { ...page1, title: 'New Title', footer: 'GLOBAL FOOTER' };
    
    // 更新第一页，其中 footer 是全局字段
    updatePage(updatedPage1);
    
    const state = useStore.getState();
    expect(state.pages[0].title).toBe('New Title');
    // 检查全局同步：第二页的 footer 也应该变成了 'GLOBAL FOOTER'
    expect(state.pages[1].footer).toBe('GLOBAL FOOTER');
  });

  it('应该能正确执行撤销和重做', () => {
    const { addPage, undo, redo } = useStore.getState();
    
    // 初始状态：没有页面
    expect(useStore.getState().pages).toHaveLength(0);
    
    // 添加第一页（会触发 pushHistory）
    addPage('16:9', 'modern-feature');
    expect(useStore.getState().pages).toHaveLength(1);
    
    // 撤销：应该回到没有页面的状态
    undo();
    expect(useStore.getState().pages).toHaveLength(0);
    
    // 重做：应该恢复到有一页的状态
    redo();
    expect(useStore.getState().pages).toHaveLength(1);
  });
});
