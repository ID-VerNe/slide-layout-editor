import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { JsonTemplateRenderer } from '../JsonTemplateRenderer';
import { TemplateSchema } from '../../templates/schemas/types';
import { PageData, ProjectTheme } from '../../types';
import { DEFAULT_THEME } from '../../constants/theme';

// Mock dependencies
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const mockState = {
      designSystem: {
        tokens: {
          colors: { primary: '#000', secondary: '#666', accent: '#264376', background: '#fff', surface: '#f0f0f0' },
          spacing: { none: '0px', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', gutter: '24px' },
          typography: {
            scales: { display: '64pt', h1: '48pt', h2: '32pt', body: '10pt', caption: '7pt' },
            body: { fontSize: '10pt', lineHeight: '1.6', fontWeight: '400', letterSpacing: '0', fontStyle: 'italic' },
            caption: { fontSize: '7pt', lineHeight: '1.8', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' },
            display: { fontSize: '48pt', lineHeight: '1.1', fontWeight: '400', letterSpacing: '0.2em', textTransform: 'uppercase' },
          },
        },
        presets: {
          layout: { 'safe-area': { px: 'spacing.gutter', py: 'spacing.gutter' }, 'full-bleed': { p: 'spacing.none' } },
          effects: { 'glass-card': { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' } },
        },
      },
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test-template',
  aspectRatio: '16:9',
  title: 'Integration Test Title',
  subtitle: 'Integration Test Subtitle',
  backgroundColor: '#ffffff',
  visibility: {},
};

const mockTheme: ProjectTheme = DEFAULT_THEME;

describe('JsonTemplateRenderer 集成测试', () => {
  describe('完整 Schema 渲染', () => {
    it('应正确渲染完整的模板 Schema', () => {
      const schema: TemplateSchema = {
        id: 'integration-test-template',
        name: 'Integration Test Template',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          layoutProps: { columns: 24, rows: 24 },
          children: [
            {
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
              modular: { colStart: 2, colSpan: 20, rowStart: 8, rowSpan: 4 },
            },
            {
              type: 'Component',
              componentType: 'ZineBody',
              bind: 'page.subtitle',
              modular: { colStart: 2, colSpan: 20, rowStart: 12, rowSpan: 2 },
            },
          ],
        },
      };

      const { container } = render(
        <JsonTemplateRenderer schema={schema} page={mockPage} theme={mockTheme} />
      );

      expect(container).toBeTruthy();
    });

    it('应处理嵌套容器结构', () => {
      const schema: TemplateSchema = {
        id: 'nested-test',
        name: 'Nested Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Container',
              children: [
                {
                  type: 'Container',
                  children: [
                    {
                      type: 'Component',
                      componentType: 'ZineDisplay',
                      bind: 'page.title',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      expect(() => {
        render(<JsonTemplateRenderer schema={schema} page={mockPage} theme={mockTheme} />);
      }).not.toThrow();
    });
  });

  describe('条件渲染集成', () => {
    it('应根据 page 数据条件渲染', () => {
      const schema: TemplateSchema = {
        id: 'conditional-test',
        name: 'Conditional Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Conditional',
              condition: 'page.title',
              then: { type: 'Text', content: 'Has Title' },
              else: { type: 'Text', content: 'No Title' },
            },
          ],
        },
      };

      const { container } = render(
        <JsonTemplateRenderer schema={schema} page={mockPage} theme={mockTheme} />
      );

      expect(container.textContent).toContain('Has Title');
    });
  });

  describe('模块化布局集成', () => {
    it('应正确应用 24x24 模块化坐标', () => {
      const schema: TemplateSchema = {
        id: 'modular-test',
        name: 'Modular Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 24 },
          children: [
            {
              type: 'Container',
              modular: { colStart: 2, colSpan: 22, rowStart: 2, rowSpan: 22 },
              children: [],
            },
          ],
        },
      };

      const { container } = render(
        <JsonTemplateRenderer schema={schema} page={mockPage} theme={mockTheme} />
      );

      const innerContainer = container.querySelector('[style*="grid"]');
      expect(innerContainer).toBeTruthy();
    });
  });

  describe('样式预设集成', () => {
    it('应正确应用 presetKey', () => {
      const schema: TemplateSchema = {
        id: 'preset-test',
        name: 'Preset Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          presetKey: 'safe-area',
          children: [],
        },
      };

      const { container } = render(
        <JsonTemplateRenderer schema={schema} page={mockPage} theme={mockTheme} />
      );

      const rootContainer = container.firstChild as HTMLElement;
      expect(rootContainer.style.paddingLeft).toBeTruthy();
      expect(rootContainer.style.paddingRight).toBeTruthy();
    });
  });

  describe('错误边界集成', () => {
    it('应捕获渲染错误', () => {
      const invalidSchema: any = {
        id: 'invalid',
        name: 'Invalid',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'InvalidType',
          children: [],
        },
      };

      expect(() => {
        render(<JsonTemplateRenderer schema={invalidSchema} page={mockPage} theme={mockTheme} />);
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应高效渲染大型模板', () => {
      const largeSchema: TemplateSchema = {
        id: 'large-test',
        name: 'Large Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: Array.from({ length: 50 }, (_, i) => ({
            type: 'Component' as const,
            componentType: 'ZineBody',
            bind: 'page.title',
            id: `item-${i}`,
          })),
        },
      };

      const startTime = performance.now();
      render(<JsonTemplateRenderer schema={largeSchema} page={mockPage} theme={mockTheme} />);
      const endTime = performance.now();

      // 渲染应在合理时间内完成 (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
