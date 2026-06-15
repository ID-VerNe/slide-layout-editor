import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutRenderer } from '../LayoutRenderer';
import { ContainerNode, ComponentNode, ConditionalNode, TextNode, RepeaterNode } from '../types';
import { PageData, ProjectTheme, DesignSystem } from '../../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM } from '../../../constants/theme';
import { getComponent } from '../componentRegistry';

// Mock useStore
vi.mock('../../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const mockState = {
      designSystem: DEFAULT_DESIGN_SYSTEM,
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Mock componentRegistry
vi.mock('../componentRegistry', () => ({
  getComponent: vi.fn((type: string) => {
    const MockComponent = ({ bind, ...props }: any) => (
      <div data-testid={`component-${type}`} data-bind={bind}>
        Mock {type}
      </div>
    );
    return MockComponent;
  }),
}));

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test-layout',
  aspectRatio: '16:9',
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  backgroundColor: '#ffffff',
  visibility: {},
};

const mockTheme: ProjectTheme = DEFAULT_THEME;

describe('LayoutRenderer', () => {
  describe('Container 节点渲染', () => {
    it('应正确渲染基础 Container', () => {
      const node: ContainerNode = {
        type: 'Container',
        layout: 'flex',
        children: [],
      };

      const { container } = render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element).toHaveStyle({ display: 'flex' });
    });

    it('应支持 24x24 模块化定位', () => {
      const node: ContainerNode = {
        type: 'Container',
        layout: 'modular',
        modular: {
          colStart: 2,
          colSpan: 12,
          rowStart: 3,
          rowSpan: 8,
        },
        children: [],
      };

      const { container } = render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.gridColumnStart).toBe('2');
      expect(element.style.gridColumnEnd).toBe('span 12');
      expect(element.style.gridRowStart).toBe('3');
      expect(element.style.gridRowEnd).toBe('span 8');
    });

    it('应支持九宫格对齐', () => {
      const node: ContainerNode = {
        type: 'Container',
        modular: {
          colStart: 1,
          colSpan: 12,
          align: 'center',
          justify: 'end',
        },
        children: [],
      };

      const { container } = render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.alignSelf).toBe('center');
      expect(element.style.justifySelf).toBe('end');
    });

    it('应正确渲染嵌套 children', () => {
      const node: ContainerNode = {
        type: 'Container',
        children: [
          { type: 'Text', content: 'Child 1' },
          { type: 'Text', content: 'Child 2' },
        ],
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Component 节点渲染', () => {
    it('应正确渲染基础 Component', () => {
      const node: ComponentNode = {
        type: 'Component',
        componentType: 'ZineDisplay',
        bind: 'page.title',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.getByTestId('component-ZineDisplay')).toBeInTheDocument();
    });

    it('应正确传递 bind 属性', () => {
      const node: ComponentNode = {
        type: 'Component',
        componentType: 'ZineBody',
        bind: 'page.subtitle',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      const component = screen.getByTestId('component-ZineBody');
      expect(component.getAttribute('data-bind')).toBe('page.subtitle');
    });
  });

  describe('Text 节点渲染', () => {
    it('应正确渲染静态文本', () => {
      const node: TextNode = {
        type: 'Text',
        content: 'Static Text',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.getByText('Static Text')).toBeInTheDocument();
    });

    it('应支持表达式插值', () => {
      const node: TextNode = {
        type: 'Text',
        content: '{page.title}',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      // 表达式应被求值
      expect(document.body.textContent).toContain('Test Title');
    });
  });

  describe('Conditional 节点渲染', () => {
    it('条件为 true 时应渲染 then 分支', () => {
      const node: ConditionalNode = {
        type: 'Conditional',
        condition: 'page.title',
        then: { type: 'Text', content: 'Then Branch' },
        else: { type: 'Text', content: 'Else Branch' },
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.getByText('Then Branch')).toBeInTheDocument();
      expect(screen.queryByText('Else Branch')).not.toBeInTheDocument();
    });

    it('条件为 false 时应渲染 else 分支', () => {
      const pageWithoutTitle = { ...mockPage, title: '' };
      const node: ConditionalNode = {
        type: 'Conditional',
        condition: 'page.title',
        then: { type: 'Text', content: 'Then Branch' },
        else: { type: 'Text', content: 'Else Branch' },
      };

      render(
        <LayoutRenderer node={node} page={pageWithoutTitle} theme={mockTheme} />
      );

      expect(screen.queryByText('Then Branch')).not.toBeInTheDocument();
      expect(screen.getByText('Else Branch')).toBeInTheDocument();
    });
  });

  describe('Repeater 节点渲染', () => {
    it('应正确循环渲染数组项', () => {
      const pageWithItems = {
        ...mockPage,
        items: ['Item 1', 'Item 2', 'Item 3'],
      };

      const node: RepeaterNode = {
        type: 'Repeater',
        bind: 'page.items',
        template: { type: 'Text', content: '{item}' },
      };

      render(
        <LayoutRenderer node={node} page={pageWithItems} theme={mockTheme} />
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('visibleWhen 可见性控制', () => {
    it('visibleWhen 为 false 时不渲染节点', () => {
      const node: TextNode = {
        type: 'Text',
        content: 'Hidden Text',
        visibleWhen: 'false',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('visibleWhen 为 true 时渲染节点', () => {
      const node: TextNode = {
        type: 'Text',
        content: 'Visible Text',
        visibleWhen: 'true',
      };

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      expect(screen.getByText('Visible Text')).toBeInTheDocument();
    });
  });

  describe('PresetKey 样式预设', () => {
    it('应应用 layout preset', () => {
      const node: ContainerNode = {
        type: 'Container',
        presetKey: 'safe-area',
        children: [],
      };

      const { container } = render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );

      const element = container.firstChild as HTMLElement;
      // safe-area preset 应设置 padding
      expect(element.style.paddingLeft).toBeTruthy();
      expect(element.style.paddingRight).toBeTruthy();
    });
  });

  describe('错误处理', () => {
    it('应被 ErrorBoundary 保护', () => {
      const invalidNode = { type: 'Invalid' } as any;

      // 不应抛出错误
      expect(() => {
        render(
          <LayoutRenderer node={invalidNode} page={mockPage} theme={mockTheme} />
        );
      }).not.toThrow();
    });

    it('组件抛错时显示 ErrorBoundary fallback', () => {
      const throwingComponent = () => {
        throw new Error('render boom');
      };
      const originalImpl = vi.mocked(getComponent).getMockImplementation();
      vi.mocked(getComponent).mockImplementation((type: string) => {
        if (type === 'Boom') return throwingComponent as any;
        const MockComponent = ({ bind, ...props }: any) => (
          <div data-testid={`component-${type}`} data-bind={bind}>Mock {type}</div>
        );
        return MockComponent;
      });

      const node: ComponentNode = {
        type: 'Component',
        componentType: 'Boom',
        bind: 'page.title',
      };

      render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      vi.mocked(getComponent).mockImplementation(originalImpl || (() => null));
    });
  });

  describe('未注册组件兜底', () => {
    it('未知名组件返回 null 且不抛错', () => {
      vi.mocked(getComponent).mockReturnValueOnce(null);
      const node: ComponentNode = {
        type: 'Component',
        componentType: 'UnknownWidget',
        bind: 'page.title',
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('visibleWhen 上下文表达式', () => {
    it('根据页面属性条件隐藏', () => {
      const node: ComponentNode = {
        type: 'Component',
        componentType: 'ZineDisplay',
        bind: 'page.title',
        visibleWhen: 'page.visibility.logo',
      };
      const page = { ...mockPage, visibility: { logo: false } };

      render(<LayoutRenderer node={node} page={page} theme={mockTheme} />);
      expect(screen.queryByTestId('component-ZineDisplay')).not.toBeInTheDocument();
    });
  });

  describe('Repeater 边界', () => {
    it('空数组不渲染', () => {
      const node: RepeaterNode = {
        type: 'Repeater',
        bind: 'page.items',
        template: { type: 'Text', content: '{item}' },
      };
      const page = { ...mockPage, items: [] as string[] };

      render(<LayoutRenderer node={node} page={page} theme={mockTheme} />);
      expect(document.body.textContent?.trim()).toBe('');
    });

    it('绑定值非数组时返回 null 并警告', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const node: RepeaterNode = {
        type: 'Repeater',
        bind: 'page.title',
        template: { type: 'Text', content: '{item}' },
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      expect(container.firstChild).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('did not return an array'), expect.any(String));
      warnSpy.mockRestore();
    });
  });

  describe('Conditional 边界', () => {
    it('条件为 false 且没有 else 时返回 null', () => {
      const node: ConditionalNode = {
        type: 'Conditional',
        condition: 'page.missingValue',
        then: { type: 'Text', content: 'Then' },
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Container 布局变体', () => {
    it('grid 布局生成正确 CSS', () => {
      const node: ContainerNode = {
        type: 'Container',
        layout: 'grid',
        layoutProps: { columns: 3, rows: 2, gap: '10px' } as any,
        children: [],
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      const el = container.firstChild as HTMLElement;
      expect(el.style.display).toBe('grid');
      expect(el.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
      expect(el.style.gridTemplateRows).toBe('repeat(2, minmax(0, 1fr))');
    });
  });

  describe('Zine 样式约束', () => {
    it('样式白名单会移除不允许的属性', () => {
      const node: TextNode = {
        type: 'Text',
        content: 'Text',
        style: { color: '#000', boxShadow: '0 1px 2px' } as any,
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      const el = container.firstChild as HTMLElement;
      expect(el.style.color).toBe('rgb(0, 0, 0)');
      expect(el.style.boxShadow).toBe('');
    });

    it('类名黑名单会剔除阴影/动画类', () => {
      const node: TextNode = {
        type: 'Text',
        content: 'Text',
        className: 'shadow-lg blur-md animate-pulse allowed-class',
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      const el = container.firstChild as HTMLElement;
      expect(el.classList.contains('allowed-class')).toBe(true);
      expect(el.classList.contains('shadow-lg')).toBe(false);
      expect(el.classList.contains('animate-pulse')).toBe(false);
    });
  });

  describe('组件 prop 推断', () => {
    it('媒体组件注入 src', () => {
      const node: ComponentNode = {
        type: 'Component',
        componentType: 'ZineMedia',
        bind: 'page.coverUrl',
      };
      const page = { ...mockPage, coverUrl: 'https://example.com/cover.png' };

      render(<LayoutRenderer node={node} page={page} theme={mockTheme} />);
      const component = screen.getByTestId('component-ZineMedia');
      expect(component.getAttribute('data-bind')).toBe('page.coverUrl');
    });
  });

  describe('布局模式补充', () => {
    it('absolute 布局应用 position:absolute', () => {
      const node: ContainerNode = {
        type: 'Container',
        layout: 'absolute',
        layoutProps: { top: 10, left: '50%' },
        children: [{
          type: 'Text',
          content: 'Floating',
        }],
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.position).toBe('absolute');
      expect(el.style.top).toBe('10px');
    });

    it('flex layoutProps 应应用 direction 和 gap', () => {
      const node: ContainerNode = {
        type: 'Container',
        layout: 'flex',
        layoutProps: { direction: 'column', gap: 16 },
        children: [{
          type: 'Text',
          content: 'Item',
        }],
      };

      const { container } = render(<LayoutRenderer node={node} page={mockPage} theme={mockTheme} />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.flexDirection).toBe('column');
    });

    it('Repeater 空 className/style/layout 时渲染 Fragment', () => {
      const node: RepeaterNode = {
        type: 'Repeater',
        bind: 'page.items',
        template: {
          type: 'Text',
          content: '{item}',
        },
      };
      const page = { ...mockPage, items: ['A', 'B'] } as any;

      render(<LayoutRenderer node={node} page={page} theme={mockTheme} />);
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('Repeater 嵌套时 $parent 上下文可访问', () => {
      const node: RepeaterNode = {
        type: 'Repeater',
        bind: 'page.categories',
        itemVariable: 'category',
        template: {
          type: 'Repeater',
          bind: 'category.items',
          itemVariable: 'product',
          template: {
            type: 'Text',
            content: '{product}',
          },
        },
      };
      const page = {
        ...mockPage,
        categories: [
          { items: ['X', 'Y'] },
          { items: ['Z'] },
        ],
      } as any;

      render(<LayoutRenderer node={node} page={page} theme={mockTheme} />);
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
      expect(screen.getByText('Z')).toBeInTheDocument();
    });
  });
});
