import { describe, it, expect, vi } from 'vitest';
import { resolveZIndex, createZIndexResolver } from '../zIndexResolver';
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

    it('应解析 nodeId.bottom 引用', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'base', zIndex: 'page.top', children: [] },
        { type: 'Container', id: 'below', zIndex: 'base.bottom', children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.below).toBeLessThan(result.base);
    });
  });

  describe('边界与异常处理', () => {
    it('自引用回退到 page.top', () => {
      const nodes: TemplateNode[] = [{ type: 'Container', id: 'self', zIndex: 'self.top' as any, children: [] }];

      const result = resolveZIndex(nodes);
      // PAGE_TOP = 50
      expect(result.self).toBe(50);
    });

    it('循环引用回退到 page.top', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'a', zIndex: 'b.top' as any, children: [] },
        { type: 'Container', id: 'b', zIndex: 'a.top' as any, children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.a).toBe(50);
      expect(result.b).toBe(50);
    });

    it('引用不存在 id 时回退到 page.top', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'orphan', zIndex: 'missing.top' as any, children: [] },
      ];

      const result = resolveZIndex(nodes);
      expect(result.orphan).toBe(50);
    });

    it('计算结果越界时回退到 page.top', () => {
      const root: TemplateNode = { type: 'Container', id: 'base', zIndex: 'page.top', children: [] };
      const resolver = createZIndexResolver(root);

      // 让 Number.isSafeInteger 返回 false，以触发越界保护分支
      const spy = vi.spyOn(Number, 'isSafeInteger').mockReturnValue(false);
      const value = resolver('base.top');
      spy.mockRestore();

      expect(value).toBe(50);
    });

    it('缓存避免重复计算', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'base', zIndex: 'page.top', children: [] },
        { type: 'Container', id: 'a', zIndex: 'base.top', children: [] },
        { type: 'Container', id: 'b', zIndex: 'base.bottom', children: [] },
      ];

      const resolver = createZIndexResolver({ type: 'Container', children: nodes });
      const first = resolver('base.top');
      const second = resolver('base.top');
      expect(second).toBe(first);
    });
  });

  describe('Conditional 和 Repeater 节点遍历', () => {
    it('Conditional.then 中的节点被收集', () => {
      const root: TemplateNode = {
        type: 'Container',
        children: [{
          type: 'Conditional',
          condition: 'page.variant === "left"',
          then: { type: 'Container', id: 'then-node', zIndex: 'page.top', children: [] },
          else: { type: 'Container', id: 'else-node', zIndex: 'bottom', children: [] },
        }],
      } as any;

      const resolver = createZIndexResolver(root);
      expect(resolver('page.top')).toBeGreaterThanOrEqual(50);
    });

    it('Repeater.template 中的节点被收集', () => {
      const root: TemplateNode = {
        type: 'Container',
        children: [{
          type: 'Repeater',
          bind: 'page.items',
          template: { type: 'Container', id: 'repeated', zIndex: 'bottom', children: [] },
        }],
      } as any;

      const resolver = createZIndexResolver(root);
      expect(resolver('bottom')).toBe(0);
    });
  });

  describe('复杂引用场景', () => {
    it('3+ 节点环回退到 PAGE_TOP', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'A', zIndex: 'B.top', children: [] },
        { type: 'Container', id: 'B', zIndex: 'C.top', children: [] },
        { type: 'Container', id: 'C', zIndex: 'A.top', children: [] },
      ];
      const result = resolveZIndex(nodes);
      expect(result.A).toBe(50);
      expect(result.B).toBe(50);
      expect(result.C).toBe(50);
    });

    it('传递引用 A→B→C 正确解析', () => {
      const nodes: TemplateNode[] = [
        { type: 'Container', id: 'C', zIndex: 'page.top', children: [] },
        { type: 'Container', id: 'B', zIndex: 'C.top', children: [] },
        { type: 'Container', id: 'A', zIndex: 'B.top', children: [] },
      ];
      const result = resolveZIndex(nodes);
      expect(result.C).toBe(50);
      expect(result.B).toBe(51);
      expect(result.A).toBe(52);
    });

    it('resolve(undefined) 返回默认层级 10', () => {
      const root: TemplateNode = { type: 'Container', children: [] };
      const resolver = createZIndexResolver(root);
      expect(resolver(undefined)).toBe(10);
    });
  });
});
