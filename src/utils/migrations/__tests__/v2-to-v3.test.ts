import { describe, it, expect } from 'vitest';
import { migrateToV3 } from '../v2-to-v3';

describe('Data Migration V2→V3', () => {
  describe('基础迁移', () => {
    it('应保留 V3 格式的数据不变', () => {
      const v3Data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide' as const,
            layoutId: 'modern-feature',
            aspectRatio: '16:9' as const,
            title: 'Test',
            backgroundColor: '#ffffff',
            visibility: {},
          },
        ],
        projectTitle: 'Test Project',
        theme: {
          colors: { primary: '#000', secondary: '#666', accent: '#264376', background: '#fff', surface: '#f0f0f0' },
          typography: { headingFont: 'serif', bodyFont: 'sans-serif' },
        },
      };

      const result = migrateToV3(v3Data);
      expect(result.pages).toEqual(v3Data.pages);
      expect(result.projectTitle).toBe(v3Data.projectTitle);
    });

    it('应迁移 V2 数据到 V3', () => {
      const v2Data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layout: 'TwoColumnLayout', // V2 字段
            aspectRatio: '16:9',
            title: 'Old Title',
            backgroundColor: '#ffffff',
          },
        ],
        projectTitle: 'Old Project',
      };

      const result = migrateToV3(v2Data);
      expect(result.pages[0]).toHaveProperty('layoutId');
      expect(result.pages[0].layoutId).toBeDefined();
    });
  });

  describe('字段重命名', () => {
    it('应将 desc 迁移为 description', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide' as const,
            layoutId: 'platform-hero',
            aspectRatio: '16:9' as const,
            title: 'Test',
            features: [
              { id: '1', title: 'Feature 1', desc: 'Old description field' },
            ],
          },
        ],
      };

      const result = migrateToV3(data);
      const feature = result.pages[0].features?.[0];
      expect(feature).toHaveProperty('description');
      expect(feature?.description).toBe('Old description field');
      expect(feature).not.toHaveProperty('desc');
    });

    it('应将 quote 迁移为 content (testimonials)', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide' as const,
            layoutId: 'testimonial-card',
            aspectRatio: '16:9' as const,
            title: 'Test',
            testimonials: [
              { id: '1', quote: 'Old quote', author: 'John', name: 'John Doe' },
            ],
          },
        ],
      };

      const result = migrateToV3(data);
      const testimonial = result.pages[0].testimonials?.[0];
      expect(testimonial).toHaveProperty('content');
      expect(testimonial?.content).toBe('Old quote');
      expect(testimonial).not.toHaveProperty('quote');
    });

    it('应将 name 合并到 author (testimonials)', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide' as const,
            layoutId: 'testimonial-card',
            aspectRatio: '16:9' as const,
            title: 'Test',
            testimonials: [
              { id: '1', content: 'Great!', author: 'John', name: 'John Doe' },
            ],
          },
        ],
      };

      const result = migrateToV3(data);
      const testimonial = result.pages[0].testimonials?.[0];
      expect(testimonial?.author).toBe('John Doe');
      expect(testimonial).not.toHaveProperty('name');
    });
  });

  describe('布局 ID 映射', () => {
    it('应将旧的 layout 字段映射到 layoutId', () => {
      const layoutMappings: Record<string, string> = {
        'TwoColumnLayout': 'modern-feature',
        'GalleryLayout': 'floating-gallery',
        'HeroLayout': 'typography-hero',
      };

      Object.entries(layoutMappings).forEach(([oldLayout, expectedLayoutId]) => {
        const data = {
          pages: [
            {
              id: 'page-1',
              type: 'slide',
              layout: oldLayout,
              aspectRatio: '16:9',
              title: 'Test',
            },
          ],
        };

        const result = migrateToV3(data);
        expect(result.pages[0].layoutId).toBe(expectedLayoutId);
      });
    });

    it('应为未知 layout 使用默认值', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layout: 'UnknownLayout',
            aspectRatio: '16:9',
            title: 'Test',
          },
        ],
      };

      const result = migrateToV3(data);
      expect(result.pages[0].layoutId).toBeDefined();
      expect(typeof result.pages[0].layoutId).toBe('string');
    });
  });

  describe('数据清理', () => {
    it('应移除废弃字段', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layoutId: 'modern-feature',
            aspectRatio: '16:9',
            title: 'Test',
            layout: 'OldLayout', // 废弃字段
            desc: 'Old desc', // 废弃字段
          },
        ],
      };

      const result = migrateToV3(data);
      expect(result.pages[0]).not.toHaveProperty('layout');
      expect(result.pages[0]).not.toHaveProperty('desc');
    });

    it('应清理嵌套对象中的废弃字段', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layoutId: 'platform-hero',
            aspectRatio: '16:9',
            title: 'Test',
            features: [
              {
                id: '1',
                title: 'Feature',
                desc: 'Old',
                description: 'New', // 同时存在新旧字段
              },
            ],
          },
        ],
      };

      const result = migrateToV3(data);
      const feature = result.pages[0].features?.[0];
      expect(feature).toHaveProperty('description', 'New');
      expect(feature).not.toHaveProperty('desc');
    });
  });

  describe('theme 结构迁移', () => {
    it('应确保 theme 包含所有必需字段', () => {
      const data = {
        pages: [],
        projectTitle: 'Test',
        theme: {
          colors: { primary: '#000' }, // 不完整的 colors
        },
      };

      const result = migrateToV3(data);
      expect(result.theme!.colors).toHaveProperty('primary');
      expect(result.theme!.colors).toHaveProperty('secondary');
      expect(result.theme!.colors).toHaveProperty('accent');
      expect(result.theme!.colors).toHaveProperty('background');
      expect(result.theme!.colors).toHaveProperty('surface');
    });

    it('应补充缺失的 typography 字段', () => {
      const data = {
        pages: [],
        projectTitle: 'Test',
        theme: {
          colors: { primary: '#000', secondary: '#666', accent: '#264376', background: '#fff', surface: '#f0f0f0' },
        },
      };

      const result = migrateToV3(data);
      expect(result.theme!.typography).toHaveProperty('headingFont');
      expect(result.theme!.typography).toHaveProperty('bodyFont');
    });
  });

  describe('数组数据迁移', () => {
    it('应迁移所有 pages 中的数据', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layoutId: 'platform-hero',
            aspectRatio: '16:9',
            title: 'Page 1',
            features: [
              { id: '1', title: 'F1', desc: 'Desc 1' },
              { id: '2', title: 'F2', desc: 'Desc 2' },
            ],
          },
          {
            id: 'page-2',
            type: 'slide',
            layoutId: 'testimonial-card',
            aspectRatio: '16:9',
            title: 'Page 2',
            testimonials: [
              { id: '1', quote: 'Q1', author: 'A1' },
              { id: '2', quote: 'Q2', author: 'A2' },
            ],
          },
        ],
      };

      const result = migrateToV3(data);

      // 检查第一页的 features
      expect(result.pages[0].features?.length).toBe(2);
      expect(result.pages[0].features?.[0]).toHaveProperty('description', 'Desc 1');
      expect(result.pages[0].features?.[1]).toHaveProperty('description', 'Desc 2');

      // 检查第二页的 testimonials
      expect(result.pages[1].testimonials?.length).toBe(2);
      expect(result.pages[1].testimonials?.[0]).toHaveProperty('content', 'Q1');
      expect(result.pages[1].testimonials?.[1]).toHaveProperty('content', 'Q2');
    });
  });

  describe('边界情况', () => {
    it('应处理空 pages 数组', () => {
      const data = {
        pages: [],
        projectTitle: 'Empty Project',
      };

      const result = migrateToV3(data);
      expect(result.pages).toEqual([]);
    });

    it('应处理 null/undefined 值', () => {
      const data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layoutId: 'modern-feature',
            aspectRatio: '16:9',
            title: 'Test',
            features: null,
            testimonials: undefined,
          },
        ],
      };

      expect(() => migrateToV3(data)).not.toThrow();
    });

    it('应处理缺失的可选字段', () => {
      const minimalData = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layoutId: 'modern-feature',
            aspectRatio: '16:9',
            title: 'Minimal',
          },
        ],
      };

      const result = migrateToV3(minimalData);
      expect(result.pages[0].title).toBe('Minimal');
    });
  });

  describe('向后兼容性', () => {
    it('迁移后的数据应能被正常读取', () => {
      const v2Data = {
        pages: [
          {
            id: 'page-1',
            type: 'slide',
            layout: 'TwoColumnLayout',
            aspectRatio: '16:9',
            title: 'Test',
            features: [
              { id: '1', title: 'F1', desc: 'Old description' },
            ],
          },
        ],
        projectTitle: 'Migration Test',
      };

      const migrated = migrateToV3(v2Data);

      // 验证迁移后的数据结构完整
      expect(migrated.pages[0]).toHaveProperty('layoutId');
      expect(migrated.pages[0].features?.[0]).toHaveProperty('description');
      expect(migrated.projectTitle).toBe('Migration Test');
    });
  });

  describe('边界情况', () => {
    it('null 输入返回 null', () => {
      expect(migrateToV3(null as any)).toBeNull();
    });

    it('undefined 输入返回 undefined', () => {
      expect(migrateToV3(undefined as any)).toBeUndefined();
    });

    it('迁移后 version 设置为 3.0.0', () => {
      const data = {
        pages: [{ id: 'p-1', type: 'slide', layoutId: 'modern-feature', aspectRatio: '16:9', title: 'Test', backgroundColor: '#fff', visibility: {} }],
        projectTitle: 'V',
      };
      const result = migrateToV3(data);
      expect(result.version).toBe('3.0.0');
    });

    it('缺少 designSystem 时注入默认值', () => {
      const data = {
        pages: [{ id: 'p-1', type: 'slide', layoutId: 'modern-feature', aspectRatio: '16:9', title: 'T', backgroundColor: '#fff', visibility: {} }],
        projectTitle: 'No DS',
      };
      const result = migrateToV3(data);
      expect(result.designSystem).toBeDefined();
      expect(result.designSystem!.tokens).toBeDefined();
    });

    it('已有 designSystem 时保留原值', () => {
      const customDS = { tokens: { colors: { primary: '#custom' } } };
      const data = {
        pages: [{ id: 'p-1', type: 'slide', layoutId: 'modern-feature', aspectRatio: '16:9', title: 'T', backgroundColor: '#fff', visibility: {} }],
        projectTitle: 'Has DS',
        designSystem: customDS,
      };
      const result = migrateToV3(data);
      expect(result.designSystem).toEqual(customDS);
    });
  });
});
