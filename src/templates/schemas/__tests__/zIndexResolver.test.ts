import { describe, it, expect } from 'vitest';
import { resolveZIndex } from '../zIndexResolver';
import { TemplateNode } from '../types';

describe('Z-Index Resolver', () => {
  describe('基础声明解析', () => {
    it('应解析 page.top 为最高层级', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'a', zIndex: 'page.top', children: [] },
        { type: 'Container', id: 'b', children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.a).toBeGreaterThan(result.b || 0);
    });

    it('应解析 bottom 为最低层级', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'a', zIndex: 'bottom', children: [] },
        { type: 'Container', id: 'b', children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.a).toBeLessThan(result.b || 10);
    });
    
  });

  describe('相对引用解析', () => {
    it('应解析 nodeId.top 引用', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'base', children: [] },
        { type: 'Container', id: 'above', zIndex: 'base.top', children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.above).toBeGreaterThan(result.base || 0);
    });
  });
});
