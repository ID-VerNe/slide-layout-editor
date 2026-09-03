import React from 'react';
import { BaseNode } from '../types';
import { DesignSystem } from '../../../types';
import { evaluator, EvaluationContext } from '../expressionEvaluator';
import { ZIndexResolverFn } from '../zIndexResolver';
import { ALLOWED_CSS_PROPERTIES, filterZineClassName } from './styleWhitelist';
import { resolveTokenValue } from './tokenResolver';

export interface ResolvedBaseProps {
  className: string;
  style: React.CSSProperties;
}

/** Resolves base node classes, styles, 24-grid spatial isolation, presets, and zIndex */
export function resolveBaseProps(
  node: BaseNode,
  context: EvaluationContext,
  ds: DesignSystem,
  resolveZIndex?: ZIndexResolverFn
): ResolvedBaseProps {
  let dynamicClassName = evaluator.interpolate(node.className || '', context);
  const dynamicStyle = evaluator.evaluateObject(node.style || {}, context);

  let finalStyle: React.CSSProperties = { ...dynamicStyle };

  // 1. 处理 24x24 模块化网格定位与绝对物理边界隔离
  if (node.modular) {
    const { colStart, colSpan, rowStart, rowSpan, align, justify } = node.modular;
    if (colStart !== undefined) finalStyle.gridColumnStart = colStart;
    if (colSpan !== undefined) finalStyle.gridColumnEnd = `span ${colSpan}`;
    if (rowStart !== undefined) finalStyle.gridRowStart = rowStart;
    if (rowSpan !== undefined) finalStyle.gridRowEnd = `span ${rowSpan}`;

    // 物理隔离核心约束：严格定死网格区域，防止内容撑开单元格或侵入外部
    finalStyle.minWidth = 0;
    finalStyle.minHeight = 0;
    finalStyle.maxWidth = '100%';
    finalStyle.maxHeight = '100%';
    finalStyle.boxSizing = 'border-box';

    // 9宫格对齐逻辑 (Self Alignment)
    if (align) finalStyle.alignSelf = align;
    if (justify) finalStyle.justifySelf = justify;
  }

  // 2. 处理 PresetKey (从 DesignSystem 注入)
  let presetStyle: React.CSSProperties = {};
  if (node.presetKey) {
    const layoutPreset = ds.presets.layout[node.presetKey];
    const effectsPreset = ds.presets.effects[node.presetKey];

    if (layoutPreset) {
      if (layoutPreset.px) {
        presetStyle.paddingLeft = resolveTokenValue(layoutPreset.px, ds);
        presetStyle.paddingRight = resolveTokenValue(layoutPreset.px, ds);
      }
      if (layoutPreset.py) {
        presetStyle.paddingTop = resolveTokenValue(layoutPreset.py, ds);
        presetStyle.paddingBottom = resolveTokenValue(layoutPreset.py, ds);
      }
      if (layoutPreset.p) presetStyle.padding = resolveTokenValue(layoutPreset.p, ds);
    }

    if (effectsPreset) {
      presetStyle = { ...presetStyle, ...effectsPreset };
    }
  }

  // 3. Zine Mode 审美约束 (强制白名单过滤)
  // 核心规则：以 presetStyle 为基底，节点自定义 finalStyle 具有更高优先级进行覆盖
  const filteredStyle: any = {};
  ALLOWED_CSS_PROPERTIES.forEach(p => {
    if ((presetStyle as any)[p] !== undefined) filteredStyle[p] = (presetStyle as any)[p];
    if ((finalStyle as any)[p] !== undefined) filteredStyle[p] = (finalStyle as any)[p];
  });

  finalStyle = filteredStyle;

  // 4. ClassName 过滤剔除
  dynamicClassName = filterZineClassName(dynamicClassName);

  // 5. 处理 Z-Index 声明 (全局分层系统)
  if (resolveZIndex) {
    const declaredZIndex = (node as any).zIndex;
    finalStyle.zIndex = resolveZIndex(declaredZIndex);
  }

  return {
    className: dynamicClassName,
    style: finalStyle
  };
}
