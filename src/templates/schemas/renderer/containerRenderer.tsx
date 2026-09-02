import React from 'react';
import { ContainerNode, TemplateNode } from '../types';
import { DesignSystem, TypographySettings } from '../../../types';
import { EvaluationContext } from '../expressionEvaluator';
import { ZIndexResolverFn } from '../zIndexResolver';
import { resolveBaseProps } from './basePropsResolver';
import { resolveTokenValue } from './tokenResolver';

export function mapAlign(align?: string) {
  switch (align) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    default: return align || 'stretch';
  }
}

export function mapJustify(justify?: string) {
  switch (justify) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    case 'between': return 'space-between';
    case 'around': return 'space-around';
    case 'evenly': return 'space-evenly';
    default: return justify || 'flex-start';
  }
}

interface RenderContainerProps {
  node: ContainerNode;
  context: EvaluationContext;
  ds: DesignSystem;
  typography?: TypographySettings;
  resolveZIndex?: ZIndexResolverFn;
  renderChild: (child: TemplateNode, index: number) => React.ReactNode;
}

/** Renders Container nodes across Flex, Grid, Modular, and Absolute layouts */
export function renderContainer({
  node,
  context,
  ds,
  resolveZIndex,
  renderChild,
}: RenderContainerProps): React.ReactElement {
  const { layout = 'flex', layoutProps, children } = node;
  const { className, style: baseStyle } = resolveBaseProps(node, context, ds, resolveZIndex);

  let layoutStyle: React.CSSProperties = { ...baseStyle };

  if (layout === 'flex') {
    const props = (layoutProps as any) || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'flex',
      flexDirection: props.direction || 'row',
      alignItems: mapAlign(props.align),
      justifyContent: mapJustify(props.justify),
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
      flexWrap: props.wrap === 'wrap-reverse' ? 'wrap-reverse' : (props.wrap ? 'wrap' : 'nowrap'),
      // 若作为 24 格外框，默认充满格子分配的区域
      width: layoutStyle.width || (node.modular ? '100%' : undefined),
      height: layoutStyle.height || (node.modular ? '100%' : undefined),
    };
  } else if (layout === 'absolute') {
    const props = (layoutProps as any) || {};
    layoutStyle = {
      ...layoutStyle,
      position: 'absolute',
      top: props.top,
      left: props.left,
      right: props.right,
      bottom: props.bottom,
      inset: props.inset,
      zIndex: props.zIndex,
    };
  } else if (layout === 'grid') {
    const props = (layoutProps as any) || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'grid',
      gridTemplateColumns: typeof props.columns === 'number' ? `repeat(${props.columns}, minmax(0, 1fr))` : props.columns,
      gridTemplateRows: typeof props.rows === 'number' ? `repeat(${props.rows}, minmax(0, 1fr))` : props.rows,
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
    };
  } else if (layout === 'modular') {
    const props = (layoutProps as any) || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'grid',
      gridTemplateColumns: `repeat(${props.columns || 24}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${props.rows || 24}, minmax(0, 1fr))`,
      gap: resolveTokenValue(props.gap || 'spacing.none', ds),
    };
  }

  return (
    <div className={className} style={layoutStyle}>
      {children.map((child, index) => renderChild(child, index))}
    </div>
  );
}
