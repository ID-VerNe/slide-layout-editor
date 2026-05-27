import { TemplateNode, ZIndexDeclaration } from './types';

/**
 * ZIndex 解析器函数签名
 * 输入 zIndex 声明（或 undefined），返回具体的 zIndex 数值
 */
export type ZIndexResolverFn = (declaration?: ZIndexDeclaration) => number;

/** 页面内容默认层级 */
const PAGE_TOP = 10;
/** 最底层 */
const BOTTOM = 0;

/**
 * 创建 ZIndex 解析器
 *
 * 遍历模板树，收集所有带 id 的节点及其 zIndex 声明，
 * 支持以下声明方式并解析为具体数值：
 *   - undefined / 'page.top' → PAGE_TOP (10)
 *   - 'bottom'              → BOTTOM (0)
 *   - '<id>.top'            → 引用节点 zIndex + 1
 *   - '<id>.bottom'         → 引用节点 zIndex - 1
 *
 * 边界处理：
 *   - 循环引用：warn + 回退到 PAGE_TOP
 *   - 引用不存在的 id：warn + 回退到 PAGE_TOP
 *   - 结果缓存：避免重复计算
 */
export function createZIndexResolver(root: TemplateNode): ZIndexResolverFn {
  // 步骤 1：遍历树，收集所有带 id 的节点及其 zIndex 声明
  const idMap = new Map<string, ZIndexDeclaration | undefined>();

  function walk(node: TemplateNode): void {
    if (node.id) {
      idMap.set(node.id, (node as any).zIndex);
    }
    if (node.type === 'Container') {
      node.children.forEach(walk);
    } else if (node.type === 'Conditional') {
      walk(node.then);
      if (node.else) walk(node.else);
    } else if (node.type === 'Repeater') {
      walk(node.template);
    }
  }

  walk(root);

  // 步骤 2：解析函数（带记忆化和循环检测）
  const cache = new Map<string, number>();
  const resolving = new Set<string>();

  function resolve(declaration?: ZIndexDeclaration): number {
    const key = declaration ?? '__default__';
    if (cache.has(key)) return cache.get(key)!;

    if (!declaration || declaration === 'page.top') {
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }
    if (declaration === 'bottom') {
      cache.set(key, BOTTOM);
      return BOTTOM;
    }

    // 解析引用: "SomeId.top" | "SomeId.bottom"
    const lastDot = declaration.lastIndexOf('.');
    const refId = declaration.slice(0, lastDot);
    const direction = declaration.slice(lastDot + 1); // 'top' | 'bottom'

    if (resolving.has(refId)) {
      console.warn(`[ZIndex] 检测到循环引用: ${[...resolving].join(' → ')} → ${refId}，回退到 page.top`);
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }
    if (!idMap.has(refId)) {
      console.warn(`[ZIndex] 引用了不存在的 id: "${refId}"，回退到 page.top`);
      cache.set(key, PAGE_TOP);
      return PAGE_TOP;
    }

    resolving.add(refId);
    const refValue = resolve(idMap.get(refId));
    resolving.delete(refId);

    const value = direction === 'top' ? refValue + 1 : refValue - 1;
    cache.set(key, value);
    return value;
  }

  return resolve;
}