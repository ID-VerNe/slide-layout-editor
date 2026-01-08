import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, DEFAULT_THEME } from './useStore';

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
    const updatedPage1 = { ...page1, title: 'New Title', counterStyle: 'roman' as const };
    
    // 更新第一页，其中 counterStyle 是全局字段
    updatePage(updatedPage1);
    
    const state = useStore.getState();
    expect(state.pages[0].title).toBe('New Title');
    // 检查全局同步：第二页的 counterStyle 也应该变成了 roman
    expect(state.pages[1].counterStyle).toBe('roman');
  });

  it('应该能正确执行撤销和重做', () => {
    const { addPage, undo, redo, setProjectTitle } = useStore.getState();
    
    setProjectTitle('Initial Title');
    addPage('16:9', 'modern-feature');
    
    expect(useStore.getState().pages).toHaveLength(1);
    
    undo();
    expect(useStore.getState().pages).toHaveLength(0);
    expect(useStore.getState().projectTitle).toBe('Initial Title');
    
    redo();
    expect(useStore.getState().pages).toHaveLength(1);
  });
});
