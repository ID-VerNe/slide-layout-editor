import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutRenderer } from '../LayoutRenderer';
import { ContainerNode, ComponentNode, ConditionalNode, TextNode, RepeaterNode } from '../types';
import { PageData, ProjectTheme, DesignSystem } from '../../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM } from '../../../constants/theme';

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

      render(
        <LayoutRenderer node={node} page={mockPage} theme={mockTheme} />
      );
      
      expect(document.querySelector('.flex')).toBeInTheDocument();
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
  });
});
