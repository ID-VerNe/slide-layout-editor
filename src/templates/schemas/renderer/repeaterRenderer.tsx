import React from 'react';
import { RepeaterNode, TemplateNode } from '../types';
import { DesignSystem, TypographySettings } from '../../../types';
import { evaluator, EvaluationContext } from '../expressionEvaluator';
import { ZIndexResolverFn } from '../zIndexResolver';
import { resolveBaseProps } from './basePropsResolver';
import { resolveTokenValue } from './tokenResolver';
import { mapAlign, mapJustify } from './containerRenderer';

interface RenderRepeaterProps {
  node: RepeaterNode;
  context: EvaluationContext;
  ds: DesignSystem;
  typography?: TypographySettings;
  resolveZIndex?: ZIndexResolverFn;
  renderTemplate: (templateNode: TemplateNode, itemContext: EvaluationContext, key: any) => React.ReactNode;
}

/** Renders Repeater nodes by iterating over bound collection and injecting context */
export function renderRepeater({
  node,
  context,
  ds,
  resolveZIndex,
  renderTemplate,
}: RenderRepeaterProps): React.ReactElement | null {
  const items = evaluator.evaluate(node.bind, context);
  const { className, style: baseStyle } = resolveBaseProps(node, context, ds, resolveZIndex);
  const itemVar = node.itemVariable || 'item';

  if (!Array.isArray(items)) {
    console.warn(`[Repeater] Bind "${node.bind}" did not return an array, got:`, typeof items);
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  // 1. 处理布局属性
  let finalStyle: React.CSSProperties = { ...baseStyle };
  const { layout, layoutProps } = node;

  if (layout === 'flex') {
    const props = (layoutProps as any) || {};
    finalStyle = {
      ...finalStyle,
      display: 'flex',
      flexDirection: props.direction || 'row',
      alignItems: mapAlign(props.align),
      justifyContent: mapJustify(props.justify),
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
      flexWrap: props.wrap === 'wrap-reverse' ? 'wrap-reverse' : (props.wrap ? 'wrap' : 'nowrap'),
    };
  } else if (layout === 'grid') {
    const props = (layoutProps as any) || {};
    finalStyle = {
      ...finalStyle,
      display: 'grid',
      gridTemplateColumns: typeof props.columns === 'number' ? `repeat(${props.columns}, 1fr)` : props.columns,
      gridTemplateRows: typeof props.rows === 'number' ? `repeat(${props.rows}, 1fr)` : props.rows,
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
      gridTemplateAreas: props.areas?.map((a: string) => `"${a}"`).join(' '),
    };
  }

  // 2. 渲染项
  const renderedItems = items.map((item, index) => {
    const itemContext = { ...context, $parent: context, [itemVar]: item, index };
    return renderTemplate(node.template, itemContext, item?.id ?? index);
  });

  // 3. 透明模式检查：如果既没有样式也没有布局，则返回 Fragment
  const isTransparent = !className && Object.keys(finalStyle).length === 0 && !layout;

  if (isTransparent) {
    return <React.Fragment>{renderedItems}</React.Fragment>;
  }

  return (
    <div className={className} style={finalStyle}>
      {renderedItems}
    </div>
  );
}
