import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { useStore } from '../store/useStore';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import * as dbModule from '../utils/db';
import { nativeFs } from '../utils/native-fs';
import { act } from '@testing-library/react';

// Mock persistence utilities to keep store tests fast and deterministic
vi.mock('../utils/db', async () => {
  const actual = await vi.importActual<typeof import('../utils/db')>('../utils/db');
  return {
    ...actual,
    getProject: vi.fn(),
  };
});

vi.mock('../utils/native-fs', async () => {
  const actual = await vi.importActual<typeof import('../utils/native-fs')>('../utils/native-fs');
  return {
    nativeFs: {
      ...actual.nativeFs,
      isElectron: vi.fn(() => false),
      setCurrentProject: vi.fn(),
    },
  };
});

const mockPageBase = {
  type: 'slide' as const,
  layoutId: 'modern-feature' as const,
  aspectRatio: '16:9' as const,
  title: 'Test Slide',
  subtitle: 'Test Subtitle',
  backgroundColor: DEFAULT_THEME.colors.background,
  visibility: {},
  freeformItems: [],
  freeformConfig: { gridSize: 20, snapToGrid: true, showGridOverlay: false, showAlignmentGuides: true },
};

const makePage = (id: string, overrides: Partial<import('../types').PageData> = {}) => ({
  ...mockPageBase,
  id,
  ...overrides,
});

const mockProject = (id: string): import('../types').ProjectData => ({
  version: '3',
  id,
  title: 'Mock Project',
  pages: [makePage('page-1'), makePage('page-2')],
  customFonts: [],
});

describe('useStore', () => {
  beforeEach(async () => {
    useStore.setState({
      pages: [],
      projectTitle: '',
      theme: DEFAULT_THEME,
      designSystem: DEFAULT_DESIGN_SYSTEM,
      printSettings: DEFAULT_PRINT_SETTINGS,
      past: [],
      future: [],
      isLoaded: true,
      activeProjectId: null,
      currentFilePath: null,
      hasUnsavedChanges: false,
      customFonts: [],
      imageQuality: 0.95,
      minimalCounter: false,
      counterStyle: 'number',
    });
    vi.clearAllMocks();
    (nativeFs.isElectron as MockedFunction<typeof nativeFs.isElectron>).mockReturnValue(false);
  });

  describe('基础状态变更', () => {
    it('应该能正确添加新页面', () => {
      const { addPage } = useStore.getState();
      addPage('16:9', 'modern-feature');

      const state = useStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.pages[0].layoutId).toBe('modern-feature');
      expect(state.pages[0].aspectRatio).toBe('16:9');
    });

    it('添加页面继承当前全局主题', () => {
      useStore.setState({
        theme: { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, background: '#000000' } },
        counterStyle: 'roman',
      });

      useStore.getState().addPage('16:9', 'modern-feature');
      const page = useStore.getState().pages[0];

      expect(page.backgroundColor).toBe('#000000');
      expect(page.counterStyle).toBe('roman');
    });
  });

  describe('updatePage 全局字段同步', () => {
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

    it(' silent 更新不写入历史', () => {
      const { addPage, updatePage } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const page = useStore.getState().pages[0];
      const pastBefore = useStore.getState().past.length;

      act(() => updatePage({ ...page, title: 'Silent' }, true));

      expect(useStore.getState().past).toHaveLength(pastBefore);
      expect(useStore.getState().pages[0].title).toBe('Silent');
    });
  });

  describe('setCounterStyle / setTheme 全局应用', () => {
    it('setCounterStyle 应同步到所有页面', () => {
      const { addPage, setCounterStyle } = useStore.getState();
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');

      setCounterStyle('alpha');

      const state = useStore.getState();
      expect(state.counterStyle).toBe('alpha');
      expect(state.pages.every(p => p.counterStyle === 'alpha')).toBe(true);
    });

    it('setTheme 默认只更新主题，不传播到页面', () => {
      const { addPage, setTheme } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const originalPageColor = useStore.getState().pages[0].backgroundColor;

      setTheme({ colors: { background: '#123456' } });

      expect(useStore.getState().theme.colors.background).toBe('#123456');
      expect(useStore.getState().pages[0].backgroundColor).toBe(originalPageColor);
    });

    it('setTheme({ applyToAll: true }) 应传播到所有页面', () => {
      const { addPage, setTheme } = useStore.getState();
      addPage('16:9', 'modern-feature');

      setTheme({ colors: { background: '#abcdef' }, typography: { headingFont: ' serif' } }, true);

      const state = useStore.getState();
      expect(state.pages[0].backgroundColor).toBe('#abcdef');
      expect(state.pages[0].titleFont).toContain('serif');
      expect(state.pages[0].bodyFont).toBeDefined();
    });
  });

  describe('removePage 边界', () => {
    it('删除页面后调整当前索引', () => {
      const { addPage, removePage, setCurrentPageIndex } = useStore.getState();
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');
      setCurrentPageIndex(1);

      removePage(useStore.getState().pages[1].id);

      const state = useStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.currentPageIndex).toBe(0);
    });

    it('无法删除最后一个页面', () => {
      const { addPage, removePage } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const onlyId = useStore.getState().pages[0].id;

      removePage(onlyId);

      expect(useStore.getState().pages).toHaveLength(1);
    });
  });

  describe('pushHistory 大小保护', () => {
    it('快照超过 5MB 时不写入历史', () => {
      const { addPage, pushHistory } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const pastBefore = useStore.getState().past.length;
      // 构造一个超大 pages 数组使 JSON.stringify > 5MB
      const huge = 'x'.repeat(6 * 1024 * 1024);
      useStore.setState({
        pages: [{ ...useStore.getState().pages[0], title: huge }],
      });

      pushHistory();

      expect(useStore.getState().past).toHaveLength(pastBefore);
    });

    it('历史只保留最近 50 条', () => {
      const { pushHistory } = useStore.getState();
      for (let i = 0; i < 55; i++) {
        useStore.setState({ projectTitle: `title-${i}` });
        pushHistory();
      }

      expect(useStore.getState().past).toHaveLength(50);
    });

    it('JSON.stringify 抛异常时不写入历史', () => {
      const { addPage, pushHistory } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const pastBefore = useStore.getState().past.length;

      // structuredClone 支持 BigInt，但 JSON.stringify 会抛出
      useStore.setState({
        pages: [{ ...useStore.getState().pages[0], styleOverrides: { poisoned: BigInt(123) } as any }],
      });

      expect(() => pushHistory()).not.toThrow();
      expect(useStore.getState().past).toHaveLength(pastBefore);
    });
  });

  describe('undo / redo 边界', () => {
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

    it('空历史时 undo 不改变状态', () => {
      const { undo } = useStore.getState();
      undo();
      expect(useStore.getState().pages).toHaveLength(0);
    });

    it('空 future 时 redo 不改变状态', () => {
      const { redo, addPage } = useStore.getState();
      addPage('16:9', 'modern-feature');
      redo();
      expect(useStore.getState().pages).toHaveLength(1);
    });

    it('undo 后 currentPageIndex 不超过页面范围', () => {
      const { addPage, removePage, undo } = useStore.getState();
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');
      useStore.setState({ currentPageIndex: 1 });

      // 先删除一页，再undo，恢复两页时索引应合法
      removePage(useStore.getState().pages[0].id);
      undo();

      expect(useStore.getState().pages).toHaveLength(2);
      expect(useStore.getState().currentPageIndex).toBeLessThanOrEqual(1);
    });
  });

  describe('loadProject', () => {
    it('通过 id 加载项目', async () => {
      const project = mockProject('proj-1');
      (dbModule.getProject as MockedFunction<typeof dbModule.getProject>).mockResolvedValue(project);

      const { loadProject } = useStore.getState();
      await act(() => loadProject('proj-1'));

      const state = useStore.getState();
      expect(state.activeProjectId).toBe('proj-1');
      expect(state.pages).toHaveLength(2);
      expect(state.isLoaded).toBe(true);
    });

    it('项目不存在时使用模板兜底', async () => {
      (dbModule.getProject as MockedFunction<typeof dbModule.getProject>).mockResolvedValue(null);

      const { loadProject } = useStore.getState();
      await act(() => loadProject('missing', 'modern-feature'));

      const state = useStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.pages[0].layoutId).toBe('modern-feature');
      expect(state.isLoaded).toBe(true);
    });

    it('过时的异步响应被丢弃', async () => {
      const slowProject = mockProject('slow');
      const fastProject = mockProject('fast');

      (dbModule.getProject as MockedFunction<typeof dbModule.getProject>)
        .mockImplementation(async (id) => {
          if (id === 'slow') {
            await new Promise((r) => setTimeout(r, 50));
            return slowProject;
          }
          return fastProject;
        });

      const { loadProject } = useStore.getState();
      const slow = loadProject('slow');
      const fast = loadProject('fast');
      await act(async () => {
        await Promise.all([slow, fast]);
      });

      const state = useStore.getState();
      expect(state.activeProjectId).toBe('fast');
      expect(state.projectTitle).toBe('Mock Project');
    });

    it('加载失败时清空项目状态', async () => {
      (dbModule.getProject as MockedFunction<typeof dbModule.getProject>).mockRejectedValue(new Error('db error'));

      const { loadProject } = useStore.getState();
      await act(() => loadProject('bad'));

      const state = useStore.getState();
      expect(state.isLoaded).toBe(true);
      expect(state.activeProjectId).toBeNull();
      expect(state.pages).toHaveLength(0);
    });

    it('Electron 环境同步项目上下文', async () => {
      (nativeFs.isElectron as MockedFunction<typeof nativeFs.isElectron>).mockReturnValue(true);
      const project = mockProject('electron-proj');
      (dbModule.getProject as MockedFunction<typeof dbModule.getProject>).mockResolvedValue(project);

      const { loadProject } = useStore.getState();
      await act(() => loadProject('electron-proj'));

      expect(nativeFs.setCurrentProject).toHaveBeenCalledWith('electron-proj', 'Mock Project');
    });
  });

  describe('项目元数据', () => {
    it('setProjectTitle 标记未保存', () => {
      const { setProjectTitle } = useStore.getState();
      setProjectTitle('New Title');

      expect(useStore.getState().projectTitle).toBe('New Title');
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('markAsSaved 清除未保存标记', () => {
      const { setProjectTitle, markAsSaved } = useStore.getState();
      setProjectTitle('X');
      markAsSaved();

      expect(useStore.getState().hasUnsavedChanges).toBe(false);
    });
  });

  describe('createProject', () => {
    it('创建项目并初始化状态', () => {
      const { createProject } = useStore.getState();
      const id = createProject('My Project', 'modern-feature');

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      const state = useStore.getState();
      expect(state.activeProjectId).toBe(id);
      expect(state.projectTitle).toBe('My Project');
      expect(state.pages.length).toBeGreaterThanOrEqual(1);
      expect(state.currentPageIndex).toBe(0);
      expect(state.isLoaded).toBe(true);
      expect(state.currentFilePath).toBeNull();
      expect(state.hasUnsavedChanges).toBe(true);
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });

    it('不指定 templateId 时使用 modern-feature 兜底', () => {
      const { createProject } = useStore.getState();
      const id = createProject('Fallback');
      expect(useStore.getState().activeProjectId).toBe(id);
      expect(useStore.getState().pages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('loadProject 对象输入', () => {
    it('直接传入项目数据对象加载', async () => {
      const data = {
        id: 'obj-proj',
        title: 'Object Project',
        filePath: '/test/path.slgrid',
        pages: [makePage('obj-p1'), makePage('obj-p2')],
      };

      const { loadProject } = useStore.getState();
      await act(() => loadProject(data));

      const state = useStore.getState();
      expect(state.activeProjectId).toBe('obj-proj');
      expect(state.projectTitle).toBe('Object Project');
      expect(state.currentFilePath).toBe('/test/path.slgrid');
      expect(state.pages).toHaveLength(2);
      expect(state.isLoaded).toBe(true);
    });

    it('对象无 id 时生成随机 id', async () => {
      const data = { title: 'No ID', pages: [makePage('p1')] };

      const { loadProject } = useStore.getState();
      await act(() => loadProject(data));

      expect(useStore.getState().activeProjectId).toBeTruthy();
      expect(useStore.getState().activeProjectId).not.toBe('No ID');
    });
  });

  describe('简单 Setter Actions', () => {
    it('setPages 替换整个页面数组', () => {
      const { addPage, setPages } = useStore.getState();
      addPage('16:9', 'modern-feature');
      expect(useStore.getState().pages).toHaveLength(1);

      const newPages = [makePage('new-1'), makePage('new-2')];
      setPages(newPages);
      expect(useStore.getState().pages).toHaveLength(2);
      expect(useStore.getState().pages[0].id).toBe('new-1');
    });

    it('reorderPages 重排序并标记未保存', () => {
      const { setPages, reorderPages } = useStore.getState();
      setPages([makePage('a'), makePage('b'), makePage('c')]);

      const reordered = [makePage('c'), makePage('a'), makePage('b')];
      reorderPages(reordered);

      const state = useStore.getState();
      expect(state.pages[0].id).toBe('c');
      expect(state.pages[1].id).toBe('a');
      expect(state.hasUnsavedChanges).toBe(true);
    });

    it('setDesignSystem 更新设计令牌并写入历史', () => {
      const { setDesignSystem } = useStore.getState();
      const pastBefore = useStore.getState().past.length;
      const newDS = { ...DEFAULT_DESIGN_SYSTEM, tokens: { ...DEFAULT_DESIGN_SYSTEM.tokens, colors: { ...DEFAULT_DESIGN_SYSTEM.tokens.colors, primary: '#ff0000' } } };
      setDesignSystem(newDS);

      expect(useStore.getState().designSystem.tokens.colors.primary).toBe('#ff0000');
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
      expect(useStore.getState().past.length).toBe(pastBefore + 1);
    });

    it('setPrintSettings 更新并标记未保存', () => {
      const { setPrintSettings } = useStore.getState();
      const newSettings = { ...DEFAULT_PRINT_SETTINGS, widthMm: 300 };
      setPrintSettings(newSettings);

      expect(useStore.getState().printSettings.widthMm).toBe(300);
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('setImageQuality 更新值', () => {
      const { setImageQuality } = useStore.getState();
      setImageQuality(0.5);
      expect(useStore.getState().imageQuality).toBe(0.5);
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('setMinimalCounter 切换极简页码模式', () => {
      const { setMinimalCounter } = useStore.getState();
      setMinimalCounter(true);
      expect(useStore.getState().minimalCounter).toBe(true);
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('setCustomFonts 更新自定义字体列表', () => {
      const { setCustomFonts } = useStore.getState();
      const fonts = [{ name: 'MyFont', family: 'MyFont', url: 'https://example.com/font.woff2' }];
      setCustomFonts(fonts);

      expect(useStore.getState().customFonts).toEqual(fonts);
      expect(useStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('setCurrentPageIndex 切换当前编辑页', () => {
      const { setCurrentPageIndex } = useStore.getState();
      setCurrentPageIndex(3);
      expect(useStore.getState().currentPageIndex).toBe(3);
    });

    it('setCurrentFilePath 不标记未保存', () => {
      const { setCurrentFilePath } = useStore.getState();
      setCurrentFilePath('/path/to/project.slgrid');

      expect(useStore.getState().currentFilePath).toBe('/path/to/project.slgrid');
      expect(useStore.getState().hasUnsavedChanges).toBe(false);
    });

    it('setCurrentFilePath 传 null 清空路径', () => {
      const { setCurrentFilePath } = useStore.getState();
      setCurrentFilePath('/some/path');
      setCurrentFilePath(null);
      expect(useStore.getState().currentFilePath).toBeNull();
    });
  });

  describe('updatePage 非全局字段', () => {
    it('修改非全局字段不触发跨页同步', () => {
      const { addPage, updatePage } = useStore.getState();
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');

      const page1 = useStore.getState().pages[0];
      updatePage({ ...page1, title: 'Only Page 1' });

      const state = useStore.getState();
      expect(state.pages[0].title).toBe('Only Page 1');
      expect(state.pages[1].title).not.toBe('Only Page 1');
    });

    it('更新不存在的 page id 不崩溃', () => {
      const { addPage, updatePage } = useStore.getState();
      addPage('16:9', 'modern-feature');
      const pagesBefore = useStore.getState().pages.length;

      updatePage(makePage('nonexistent-id', { title: 'Ghost' }));

      expect(useStore.getState().pages).toHaveLength(pagesBefore);
    });
  });

  describe('removePage 索引调整', () => {
    it('删除中间页面时索引不变', () => {
      const { addPage, removePage, setCurrentPageIndex } = useStore.getState();
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');
      addPage('16:9', 'modern-feature');
      setCurrentPageIndex(0);

      const thirdId = useStore.getState().pages[2].id;
      removePage(thirdId);

      expect(useStore.getState().pages).toHaveLength(2);
      expect(useStore.getState().currentPageIndex).toBe(0);
    });
  });

  describe('undo/redo 缺失字段回退', () => {
    it('undo 恢复缺少新字段的旧快照时使用默认值', () => {
      const { undo } = useStore.getState();
      // 手动推入一个缺少 printSettings / minimalCounter 等字段的旧快照
      const incompleteSnapshot = {
        pages: [makePage('old-page')],
        projectTitle: 'Old',
        theme: DEFAULT_THEME,
        designSystem: DEFAULT_DESIGN_SYSTEM,
        // 故意不包含 printSettings, minimalCounter, counterStyle, imageQuality, customFonts, currentFilePath
      };
      useStore.setState({ past: [incompleteSnapshot as any], future: [] });

      undo();

      const state = useStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.printSettings).toBeDefined();
      expect(state.minimalCounter).toBe(false);
      expect(state.counterStyle).toBe('number');
      expect(state.imageQuality).toBe(0.95);
      expect(state.customFonts).toEqual([]);
    });

    it('redo 恢复缺少新字段的快照时使用默认值', () => {
      const { redo } = useStore.getState();
      useStore.setState({
        pages: [makePage('current')],
        future: [{
          pages: [makePage('future-page')],
          projectTitle: 'Future',
          theme: DEFAULT_THEME,
          designSystem: DEFAULT_DESIGN_SYSTEM,
        }],
      });

      redo();

      const state = useStore.getState();
      expect(state.pages).toHaveLength(1);
      expect(state.printSettings).toBeDefined();
      expect(state.minimalCounter).toBe(false);
    });
  });
});
