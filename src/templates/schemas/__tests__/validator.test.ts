import { describe, it, expect } from 'vitest';
import { validateTemplateSchema } from '../validator';
import { TemplateSchema } from '../types';

describe('Schema Validator', () => {
  describe('基础结构验证', () => {
    it('应验证合法的 Schema', () => {
      const validSchema: TemplateSchema = {
        id: 'test-schema',
        name: 'Test Schema',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'flex',
          children: [],
        },
      };

      const result = validateTemplateSchema(validSchema);
      expect(result.success).toBe(true);
    });

    it('应拒绝缺少必需字段的 Schema', () => {
      const invalidSchema: any = {
        id: 'test-schema',
        // 缺少 name
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [],
        },
      };

      const result = validateTemplateSchema(invalidSchema);
      expect(result.success).toBe(false);
    });

    it('应拒绝无效的 supportedRatios', () => {
      const invalidSchema: any = {
        id: 'test-schema',
        name: 'Test',
        category: 'test',
        supportedRatios: [], // 空数组
        root: {
          type: 'Container',
          children: [],
        },
      };

      const result = validateTemplateSchema(invalidSchema);
      expect(result.success).toBe(false);
    });
  });

  describe('节点类型验证', () => {
    it('应验证 Container 节点', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'flex',
          layoutProps: {
            direction: 'row',
            gap: 16,
          },
          children: [],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应验证 Component 节点', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Component',
              componentType: 'ZineDisplay',
              bind: 'page.title',
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应拒绝 Component 节点缺少 componentType', () => {
      const schema: any = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Component',
              // 缺少 componentType
              bind: 'page.title',
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(false);
    });

    it('应验证 Conditional 节点', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Conditional',
              condition: 'page.title',
              then: { type: 'Text', content: 'Has Title' },
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应验证 Repeater 节点', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Repeater',
              bind: 'page.items',
              template: { type: 'Text', content: 'Item' },
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应验证 Text 节点', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Text',
              content: 'Hello World',
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });
  });

  describe('24x24 模块化坐标验证', () => {
    it('应验证合法的 modular 坐标', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          modular: {
            colStart: 2,
            colSpan: 20,
            rowStart: 2,
            rowSpan: 20,
          },
          children: [],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应拒绝超出范围的 colStart', () => {
      const schema: any = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          modular: {
            colStart: 25, // 超出 1-24
            colSpan: 10,
            rowStart: 1,
            rowSpan: 10,
          },
          children: [],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(false);
    });

    it('应拒绝超出范围的 colSpan', () => {
      const schema: any = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          modular: {
            colStart: 1,
            colSpan: 25, // 超出最大值
            rowStart: 1,
            rowSpan: 10,
          },
          children: [],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(false);
    });

    it('应验证合法的 align 和 justify', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          layout: 'modular',
          modular: {
            colStart: 1,
            colSpan: 24,
            rowStart: 1,
            rowSpan: 24,
            align: 'center',
            justify: 'center',
          },
          children: [],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });
  });

  describe('嵌套节点验证', () => {
    it('应递归验证嵌套 children', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
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
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });

    it('应检测嵌套节点中的错误', () => {
      const schema: any = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [
            {
              type: 'Container',
              children: [
                {
                  type: 'Component',
                  // 缺少 componentType
                  bind: 'page.title',
                },
              ],
            },
          ],
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(false);
    });
  });

  describe('版本验证', () => {
    it('应验证合法的 meta.version', () => {
      const schema: TemplateSchema = {
        id: 'test',
        name: 'Test',
        category: 'test',
        supportedRatios: ['16:9'],
        root: {
          type: 'Container',
          children: [],
        },
        meta: {
          version: '1.0.0',
          author: 'Test Author',
        },
      };

      const result = validateTemplateSchema(schema);
      expect(result.success).toBe(true);
    });
  });
});
