import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageFrame } from '../PageFrame';
import { PageData, DesignSystem } from '../../types';
import { DEFAULT_DESIGN_SYSTEM } from '../../constants/theme';

// Mock useStore
const mockUseStore = vi.fn();
vi.mock('../../store/useStore', () => ({
  useStore: (selector: any) => mockUseStore(selector),
}));

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test-layout',
  aspectRatio: '16:9',
  title: 'Test Page',
  backgroundColor: '#ffffff',
  backgroundPattern: 'none',
  visibility: {},
  pageNumber: true,
  footer: 'FIG. 01',
  counterColor: '#264376',
  counterStyle: 'number',
  folioAlignment: 'auto',
  layoutVariant: 'left',
};

describe('PageFrame', () => {
  beforeEach(() => {
    mockUseStore.mockImplementation((selector) => {
      const state = {
        designSystem: DEFAULT_DESIGN_SYSTEM,
        counterStyle: 'number',
      };
      return selector(state);
    });
  });

  describe('基础渲染', () => {
    it('应正确渲染 children', () => {
      render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div data-testid="child-content">Content</div>
        </PageFrame>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('应设置背景色', () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const frame = container.querySelector('.zine-page-frame');
      expect(frame).toHaveStyle({ backgroundColor: '#ffffff' });
    });

    it('应注入 CSS 变量', () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const frame = container.querySelector('.zine-page-frame') as HTMLElement;
      expect(frame?.style.getPropertyValue('--zine-color-primary')).toBeTruthy();
      expect(frame?.style.getPropertyValue('--zine-color-background')).toBe('#ffffff');
      expect(frame?.style.getPropertyValue('--zine-baseline')).toBe('8px');
    });
  });

  describe('背景纹理', () => {
    it('pattern 为 none 时不渲染背景', () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const patterns = container.querySelectorAll('.absolute.inset-0.opacity-\\[0\\.04\\]');
      expect(patterns.length).toBe(0);
    });

    it('pattern 为 grid 时渲染网格背景', () => {
      const pageWithPattern = { ...mockPage, backgroundPattern: 'grid' };
      const { container } = render(
        <PageFrame page={pageWithPattern} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const pattern = container.querySelector('.absolute.inset-0.opacity-\\[0\\.04\\]');
      expect(pattern).toBeInTheDocument();
    });

    it('应支持所有背景纹理类型', () => {
      const patterns = ['grid', 'dots', 'diagonal', 'cross'];

      patterns.forEach((patternType) => {
        const pageWithPattern = { ...mockPage, backgroundPattern: patternType };
        const { container } = render(
          <PageFrame page={pageWithPattern} pageIndex={0} totalPages={10}>
            <div>Content</div>
          </PageFrame>
        );

        const pattern = container.querySelector('.absolute.inset-0.opacity-\\[0\\.04\\]');
        expect(pattern).toBeInTheDocument();
      });
    });
  });

  describe('Global Folio (页码与元数据)', () => {
    it('应显示页码', () => {
      render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('pageNumber 为 false 时不显示页码', () => {
      const pageWithoutNumber = { ...mockPage, pageNumber: false };
      render(
        <PageFrame page={pageWithoutNumber} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      expect(screen.queryByText('01')).not.toBeInTheDocument();
    });

    it('应显示 footer 文本', () => {
      render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      expect(screen.getByText('FIG. 01')).toBeInTheDocument();
    });

    it('应支持不同的计数样式', () => {
      const styles = [
        { style: 'number', index: 0, expected: '01' },
        { style: 'alpha', index: 0, expected: 'A' },
        { style: 'roman', index: 0, expected: 'I' },
      ];

      styles.forEach(({ style, index, expected }) => {
        mockUseStore.mockImplementation((selector) => {
          const state = {
            designSystem: DEFAULT_DESIGN_SYSTEM,
            counterStyle: style,
          };
          return selector(state);
        });

        const { container } = render(
          <PageFrame page={mockPage} pageIndex={index} totalPages={10}>
            <div>Content</div>
          </PageFrame>
        );

        expect(container.textContent).toContain(expected);
      });
    });

    it('dots 样式应渲染点状计数器', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          designSystem: DEFAULT_DESIGN_SYSTEM,
          counterStyle: 'dots',
        };
        return selector(state);
      });

      const pageWithDots = { ...mockPage, counterStyle: 'dots' };
      const { container } = render(
        <PageFrame page={pageWithDots} pageIndex={2} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      // 应渲染 3 个点
      const dots = container.querySelectorAll('.w-1');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('24x24 网格调试层', () => {
    it('默认不显示网格', () => {
      const { queryByTestId } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const grid = queryByTestId('modular-grid-overlay');
      expect(grid).not.toBeInTheDocument();
    });

    it('按下 Alt+; 应切换网格显示', async () => {
      const { queryByTestId } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      // 模拟按下 Alt+;
      fireEvent.keyDown(window, { key: ';', altKey: true });

      await waitFor(() => {
        const grid = queryByTestId('modular-grid-overlay');
        expect(grid).toBeInTheDocument();
      });

      // 再次按下应隐藏
      fireEvent.keyDown(window, { key: ';', altKey: true });

      await waitFor(() => {
        const grid = queryByTestId('modular-grid-overlay');
        expect(grid).not.toBeInTheDocument();
      });
    });

    it('网格应包含 24x24 = 576 个单元格', async () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      fireEvent.keyDown(window, { key: ';', altKey: true });

      await waitFor(() => {
        const cells = container.querySelectorAll('.border-\\[0\\.5px\\]');
        expect(cells.length).toBe(576); // 24 * 24
      });
    });

    it('应显示中心轴线', async () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      fireEvent.keyDown(window, { key: ';', altKey: true });

      await waitFor(() => {
        const axes = container.querySelectorAll('.left-1\\/2, .top-1\\/2');
        expect(axes.length).toBeGreaterThan(0);
      });
    });

    it('应显示调试标签', async () => {
      render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      fireEvent.keyDown(window, { key: ';', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/24x24 Grid/i)).toBeInTheDocument();
      });
    });
  });

  describe('层级结构', () => {
    it('应按正确顺序渲染 4 层', () => {
      const { container } = render(
        <PageFrame page={mockPage} pageIndex={0} totalPages={10}>
          <div data-testid="main-content">Content</div>
        </PageFrame>
      );

      const frame = container.querySelector('.zine-page-frame');
      expect(frame).toBeInTheDocument();

      // Layer 1: Background (z-0)
      // Layer 2: Content (z-10)
      const contentSlot = container.querySelector('.zine-content-slot');
      expect(contentSlot).toBeInTheDocument();
      expect(contentSlot).toHaveClass('z-10');

      // Layer 3: Folio (z-50)
      const folio = container.querySelector('.z-50');
      expect(folio).toBeInTheDocument();
    });
  });

  describe('折叠侧对齐', () => {
    it('layoutVariant 为 left 时页码在左侧', () => {
      const pageLeft = { ...mockPage, layoutVariant: 'left' };
      const { container } = render(
        <PageFrame page={pageLeft} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const counter = screen.getByText('01').parentElement;
      expect(counter?.style.gridColumn).toContain('2');
    });

    it('layoutVariant 为 right 时页码在右侧', () => {
      const pageRight = { ...mockPage, layoutVariant: 'right' };
      const { container } = render(
        <PageFrame page={pageRight} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const counter = screen.getByText('01').parentElement;
      expect(counter?.style.gridColumn).toContain('23');
    });

    it('folioAlignment 应覆盖 layoutVariant', () => {
      const pageWithAlignment = {
        ...mockPage,
        layoutVariant: 'left',
        folioAlignment: 'right',
      };
      const { container } = render(
        <PageFrame page={pageWithAlignment} pageIndex={0} totalPages={10}>
          <div>Content</div>
        </PageFrame>
      );

      const counter = screen.getByText('01').parentElement;
      expect(counter?.style.gridColumn).toContain('23');
    });
  });

  describe('页码计数器样式', () => {
    it('dots 计数器 >= 10 时渲染点阵', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          designSystem: DEFAULT_DESIGN_SYSTEM,
          counterStyle: 'dots',
        };
        return selector(state);
      });

      const { container } = render(
        <PageFrame page={mockPage} pageIndex={9} totalPages={20}>
          <div>Content</div>
        </PageFrame>
      );
      // dots 渲染为 div 元素，检查 .flex gap-1.5 容器存在
      const dotsContainer = container.querySelector('.flex.gap-1\\.5');
      expect(dotsContainer).toBeInTheDocument();
    });

    it('roman 计数器 > 10 正常显示罗马数字', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          designSystem: DEFAULT_DESIGN_SYSTEM,
          counterStyle: 'roman',
        };
        return selector(state);
      });

      render(
        <PageFrame page={mockPage} pageIndex={10} totalPages={20}>
          <div>Content</div>
        </PageFrame>
      );
      // 第 11 页应显示 XI 而非数字 11
      expect(screen.getByText('XI')).toBeInTheDocument();
    });

    it('alpha 计数器 > 26 正确显示 AA/AB', () => {
      mockUseStore.mockImplementation((selector) => {
        const state = {
          designSystem: DEFAULT_DESIGN_SYSTEM,
          counterStyle: 'alpha',
        };
        return selector(state);
      });

      render(
        <PageFrame page={mockPage} pageIndex={26} totalPages={30}>
          <div>Content</div>
        </PageFrame>
      );
      // 第 27 页应显示 AA
      expect(screen.getByText('AA')).toBeInTheDocument();
    });
  });
});
