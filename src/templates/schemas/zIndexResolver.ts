import { TemplateNode, ZIndexDeclaration } from './types';

/**
 * ZIndex 解析器函数签名
 * 输入 zIndex 声明（或 undefined），返回具体的 zIndex 数值
 */
export type ZIndexResolverFn = (declaration?: ZIndexDeclaration) => number;

/** 页面内容默认层级 */
const DEFAULT_LAYER = 10;
/** 显式声明的页面顶层 */
const PAGE_TOP = 50;
/** 最底层 */
const BOTTOM = 0;

/**
 * 创建 ZIndex 解析器
 *
 * 遍历模板树，收集所有带 id 的节点及其 zIndex 声明，
 * 支持以下声明方式并解析为具体数值：
 *   - undefined / 'page.top' → PAGE_TOP (50)
 *   - 'bottom'              → BOTTOM (0)
 *   - '<id>.top'            → 引用节点 zIndex + 1
 *   - '<id>.bottom'         → 引用节点 zIndex - 1
 *
 * 边界处理：
 *   - 自引用 / 循环引用：warn + 回退到 PAGE_TOP
 *   - 引用不存在的 id：warn + 回退到 PAGE_TOP
 *   - 结果缓存：避免重复计算
 *   - 数值越界：回退到 PAGE_TOP
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

  function fallback(key: string, reason: string): number {
    console.warn(`[ZIndex] ${reason}，回退到 page.top`);
    cache.set(key, PAGE_TOP);
    return PAGE_TOP;
  }

  // 步骤 3：基于 Tarjan 强连通分量检测循环引用/自引用声明
  const graph = new Map<string, string[]>();
  idMap.forEach((declaration) => {
    if (!declaration || declaration === 'page.top' || declaration === 'bottom') {
      return;
    }
    const lastDot = declaration.lastIndexOf('.');
    const refId = declaration.slice(0, lastDot);
    const refDecl = idMap.get(refId);
    if (refDecl !== undefined && refDecl !== declaration) {
      const edges = graph.get(declaration) ?? [];
      edges.push(refDecl);
      graph.set(declaration, edges);
    }
    if (refDecl === declaration) {
      // 自引用也作为环处理
      const edges = graph.get(declaration) ?? [];
      if (!edges.includes(refDecl)) edges.push(refDecl);
      graph.set(declaration, edges);
    }
  });

  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let nextIndex = 0;
  const cycleDecls = new Set<string>();

  function strongconnect(v: string): void {
    index.set(v, nextIndex);
    lowlink.set(v, nextIndex);
    nextIndex++;
    stack.push(v);
    onStack.add(v);

    for (const w of graph.get(v) ?? []) {
      if (!index.has(w)) {
        strongconnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!));
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);

      if (scc.length > 1 || (graph.get(v)?.includes(v) ?? false)) {
        scc.forEach((d) => cycleDecls.add(d));
      }
    }
  }

  for (const v of graph.keys()) {
    if (!index.has(v)) strongconnect(v);
  }

  function resolve(declaration?: ZIndexDeclaration): number {
    const key = declaration ?? '__default__';
    if (cache.has(key)) return cache.get(key)!;

    // 预处理检测到的环/自引用：直接回退
    if (declaration && cycleDecls.has(declaration)) {
      return fallback(key, `检测到循环引用或自引用: "${declaration}"`);
    }

    if (!declaration) {
      cache.set(key, DEFAULT_LAYER);
      return DEFAULT_LAYER;
    }

    if (declaration === 'page.top') {
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

    if (!idMap.has(refId)) {
      return fallback(key, `引用了不存在的 id: "${refId}"`);
    }

    const refValue = resolve(idMap.get(refId));
    const value = direction === 'top' ? refValue + 1 : refValue - 1;

    if (!Number.isSafeInteger(value)) {
      return fallback(key, `计算结果越界: "${declaration}" => ${value}`);
    }

    cache.set(key, value);
    return value;
  }

  return resolve;
}

/**
 * 简化版 API：直接返回节点 ID 到 zIndex 数值的映射
 * 用于测试和简单场景
 */
export function resolveZIndex(nodes: TemplateNode[]): Record<string, number> {
  const result: Record<string, number> = {};

  // 构建临时根节点
  const root: TemplateNode = {
    type: 'Container',
    children: nodes,
  };

  const resolver = createZIndexResolver(root);

  // 遍历所有节点，解析其 zIndex
  function walk(node: TemplateNode): void {
    if (node.id) {
      result[node.id] = resolver((node as any).zIndex);
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
  return result;
}
