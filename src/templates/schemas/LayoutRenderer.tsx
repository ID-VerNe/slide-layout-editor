import React, { useMemo } from 'react';
import { TemplateNode, ContainerNode, ComponentNode, BaseNode, RepeaterNode } from './types';
import { getComponent } from './componentRegistry';
import TemplateErrorBoundary from '../../components/ui/TemplateErrorBoundary';
import { evaluator, EvaluationContext } from './expressionEvaluator';
import { ZIndexResolverFn } from './zIndexResolver';
import { PageData, ProjectTheme, TypographySettings, DesignSystem } from '../../types';
import { useStore } from '../../store/useStore';

interface LayoutRendererProps {
  node: TemplateNode;
  page: PageData;
  theme: ProjectTheme;
  typography?: TypographySettings;
  context?: EvaluationContext;
  resolveZIndex?: ZIndexResolverFn; // zIndex 解析器，由 JsonTemplateRenderer 注入
}

/**
 * LayoutRenderer - 递归渲染 JSON 模板节点
 * 强制全局 Zine Mode：支持 24x24 模块化网格与 Design System 审美约束
 */
export const LayoutRenderer: React.FC<LayoutRendererProps> = ({ 
  node, 
  page, 
  theme, 
  typography,
  context: parentContext,
  resolveZIndex
}) => {
  const context: EvaluationContext = useMemo(() => parentContext || { page, theme }, [page, theme, parentContext]);
  const ds = useStore(s => s.designSystem);

  // 包裹 ErrorBoundary 保护渲染过程
  return (
    <TemplateErrorBoundary>
      <LayoutRendererInternal 
        node={node}
        page={page}
        theme={theme}
        typography={typography}
        context={context}
        ds={ds}
        resolveZIndex={resolveZIndex}
      />
    </TemplateErrorBoundary>
  );
};

const LayoutRendererInternal: React.FC<LayoutRendererProps & { ds: DesignSystem }> = ({
  node,
  page,
  theme,
  typography,
  context,
  ds,
  resolveZIndex
}) => {
  // 1. 处理可见性逻辑
  const { isActuallyVisible, conditionMet } = useMemo(() => {
    // A. 基础可见性 (所有节点通用 visibleWhen)
    if (node.visibleWhen && !evaluator.evaluate(node.visibleWhen, context)) {
      return { isActuallyVisible: false, conditionMet: false };
    }
    
    // B. 条件判断 (仅限 Conditional 节点)
    if (node.type === 'Conditional') {
      return { 
        isActuallyVisible: true, 
        conditionMet: !!evaluator.evaluate(node.condition, context) 
      };
    }
    
    return { isActuallyVisible: true, conditionMet: true };
  }, [node, context]);

  if (!isActuallyVisible) return null;

  // 2. 根据节点类型选择渲染逻辑
  switch (node.type) {
    case 'Container':
      return renderContainer(node, context, ds, typography, resolveZIndex);
    case 'Component':
      return renderComponent(node, context, ds, typography, resolveZIndex);
    case 'Repeater':
      return renderRepeater(node, context, ds, typography, resolveZIndex);
    case 'Text':
      const content = evaluator.interpolate(node.content, context);
      const { className, style } = resolveBaseProps(node, context, ds, resolveZIndex);
      return <div className={className} style={style}>{content}</div>;
    case 'Conditional':
      const targetNode = conditionMet ? node.then : node.else;
      return targetNode ? (
        <LayoutRenderer 
          node={targetNode} 
          page={page} 
          theme={theme} 
          typography={typography} 
          context={context}
          resolveZIndex={resolveZIndex}
        />
      ) : null;
    default:
      return null;
  }
};

/**
 * 解析基础节点属性 (Modular Grid, Presets, Styles)
 */
function resolveBaseProps(node: BaseNode, context: EvaluationContext, ds: DesignSystem, resolveZIndex?: ZIndexResolverFn): {
  className: string;
  style: React.CSSProperties;
} {
  let dynamicClassName = evaluator.interpolate(node.className || '', context);
  const dynamicStyle = evaluator.evaluateObject(node.style || {}, context);

  let finalStyle: React.CSSProperties = { ...dynamicStyle };

  // 1. 处理 24x24 模块化定位
  if (node.modular) {
    const { colStart, colSpan, rowStart, rowSpan, align, justify } = node.modular;
    if (colStart !== undefined) finalStyle.gridColumnStart = colStart;
    if (colSpan !== undefined) finalStyle.gridColumnEnd = `span ${colSpan}`;
    if (rowStart !== undefined) finalStyle.gridRowStart = rowStart;
    if (rowSpan !== undefined) finalStyle.gridRowEnd = `span ${rowSpan}`;
    
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

  // 3. Zine Mode 审美约束 (强制执行)
  // A. Style Whitelist: 仅允许几何布局、定位、核心视觉属性
  const ALLOWED_PROPS = [
    'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 
    'alignSelf', 'justifySelf',
    'display', 'flexDirection', 'alignItems', 'justifyContent', 'gap', 'flexWrap',
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'position', 'top', 'left', 'right', 'bottom', 'inset', 'zIndex', 
    'opacity', 'mixBlendMode', 'transform', 'transition', 'transitionDuration',
    'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
    'aspectRatio', 'overflow', 'backgroundColor', 'borderColor', 'borderWidth',
    'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
    'borderStyle', 'textAlign', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
    'letterSpacing', 'textTransform', 'color', 'verticalAlign', 'visibility',
    'fontStyle', 'borderRadius', 'writingMode', 'textOrientation', 'whiteSpace', 'transformOrigin'
  ];
  
  const filteredStyle: any = {};
  ALLOWED_PROPS.forEach(p => { 
    if ((finalStyle as any)[p] !== undefined) filteredStyle[p] = (finalStyle as any)[p]; 
    if ((presetStyle as any)[p] !== undefined) filteredStyle[p] = (presetStyle as any)[p];
  });
  
  finalStyle = filteredStyle;

  // B. ClassName Blacklist: 强制剔除阴影、模糊等“软审美”类名 (保留 rounded 以支持圆角)
  dynamicClassName = filterZineClassName(dynamicClassName);

  // 4. 处理 Z-Index 声明 (全局分层系统)
  if (resolveZIndex) {
    const declaredZIndex = (node as any).zIndex;
    finalStyle.zIndex = resolveZIndex(declaredZIndex);
  }

  return {
    className: dynamicClassName,
    style: { ...presetStyle, ...finalStyle }
  };
}

/**
 * Zine Mode 类名过滤器 - 剔除不符合工业精密感的 Tailwind 类
 */
function filterZineClassName(className: string): string {
  if (!className) return '';
  
  const forbiddenPrefixes = [
    'shadow', 'blur', 'drop-shadow',
    'animate-bounce', 'animate-pulse', 'animate-wiggle'
  ];

  return className
    .split(' ')
    .filter(c => {
      const baseClass = c.replace('!', ''); 
      return !forbiddenPrefixes.some(p => baseClass === p || baseClass.startsWith(`${p}-`));
    })
    .join(' ');
}

/**
 * 解析 Token 引用 (e.g. "spacing.lg" -> "24px")
 */
function resolveTokenValue(val: any, ds: DesignSystem): string {
  if (typeof val === 'string' && val.startsWith('spacing.')) {
    const key = val.split('.')[1] as keyof typeof ds.tokens.spacing;
    return ds.tokens.spacing[key] || '0px'; // 安全默认值，避免无效 CSS
  }
  return val;
}

/**
 * 渲染容器节点
 */
function renderContainer(
  node: ContainerNode, 
  context: EvaluationContext, 
  ds: DesignSystem,
  typography?: TypographySettings,
  resolveZIndex?: ZIndexResolverFn
): React.ReactElement {
  const { layout = 'flex', layoutProps, children } = node;
  const { className, style: baseStyle } = resolveBaseProps(node, context, ds, resolveZIndex);

  let layoutStyle: React.CSSProperties = { ...baseStyle };

  if (layout === 'flex') {
    const props = layoutProps as any || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'flex',
      flexDirection: props.direction || 'row',
      alignItems: mapAlign(props.align),
      justifyContent: mapJustify(props.justify),
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
      flexWrap: props.wrap === 'wrap-reverse' ? 'wrap-reverse' : (props.wrap ? 'wrap' : 'nowrap'),
    };
  } else if (layout === 'absolute') {
    const props = layoutProps as any || {};
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
    const props = layoutProps as any || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'grid',
      gridTemplateColumns: typeof props.columns === 'number' ? `repeat(${props.columns}, minmax(0, 1fr))` : props.columns,
      gridTemplateRows: typeof props.rows === 'number' ? `repeat(${props.rows}, minmax(0, 1fr))` : props.rows,
      gap: resolveTokenValue(props.gap || '', ds) || props.gap,
    };
  } else if (layout === 'modular') {
    const props = layoutProps as any || {};
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
      {children.map((child, index) => (
        <LayoutRenderer 
          key={child.id || index} 
          node={child} 
          page={context.page} 
          theme={context.theme} 
          typography={typography} 
          context={context}
          resolveZIndex={resolveZIndex}
        />
      ))}
    </div>
  );
}

/**
 * 渲染组件节点
 */
function renderComponent(
  node: ComponentNode, 
  context: EvaluationContext, 
  ds: DesignSystem,
  typography?: TypographySettings,
  resolveZIndex?: ZIndexResolverFn
): React.ReactElement | null {
  const Component = getComponent(node.componentType);
  if (!Component) {
    console.warn(`Component not found in registry: ${node.componentType}`);
    return null;
  }

  const { className, style } = resolveBaseProps(node, context, ds, resolveZIndex);
  const staticProps = node.props || {};
  const dynamicProps = evaluator.evaluateObject(staticProps, context);
  
  // 1. 优先使用显式指定的 fieldKey，否则尝试从 bind 字段推断
  let inferredFieldKey: string | undefined = node.fieldKey;
  if (!inferredFieldKey && node.bind) {
    inferredFieldKey = node.bind.startsWith('page.') ? node.bind.replace('page.', '') : undefined;
    
    // 启发式：如果是媒体类组件注入 src，否则注入 text
    const value = evaluator.evaluate(node.bind, context);
    if (node.componentType.toLowerCase().includes('media') || node.componentType.toLowerCase().includes('image')) {
      if (dynamicProps.src === undefined) dynamicProps.src = value;
    } else {
      if (dynamicProps.text === undefined) dynamicProps.text = value;
    }
  }

  const baseProps: any = {
    page: context.page,
    theme: context.theme,
    designSystem: ds,
    typography,
    className,
  };

  if (inferredFieldKey) {
    baseProps.fieldKey = inferredFieldKey;
  }

  // 2. 从 dynamicProps 中移除 style，因为它已经合并到了 baseProps 中
  const { style: _unused, ...remainingProps } = dynamicProps;

  // 3. 计算最终 zIndex（优先级：resolveZIndex > style > dynamicProps.style）
  const baseZIndex = resolveZIndex ? resolveZIndex((node as any).zIndex) : undefined;
  const finalStyle: React.CSSProperties = {
    ...style,
    ...(dynamicProps.style || {}),
    ...(baseZIndex !== undefined ? { zIndex: baseZIndex } : {}),
  };

  return <Component {...baseProps} {...remainingProps} style={finalStyle} />;
}

/**
 * 渲染重复节点 (Repeater)
 */
function renderRepeater(
  node: RepeaterNode,
  context: EvaluationContext,
  ds: DesignSystem,
  typography?: TypographySettings,
  resolveZIndex?: ZIndexResolverFn
): React.ReactElement | null {
  const items = evaluator.evaluate(node.bind, context) || [];
  const { className, style: baseStyle } = resolveBaseProps(node, context, ds, resolveZIndex);
  const itemVar = node.itemVariable || 'item';

  // 空值安全检查
  if (!Array.isArray(items)) {
    console.warn(`[Repeater] Bind "${node.bind}" did not return an array, got:`, typeof items);
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  // 1. 处理布局属性 (类似于 renderContainer)
  let finalStyle: React.CSSProperties = { ...baseStyle };
  const { layout, layoutProps } = node;

  if (layout === 'flex') {
    const props = layoutProps as any || {};
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
    const props = layoutProps as any || {};
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
    const itemContext = { ...context, $parent: context[itemVar], [itemVar]: item, index };
    return (
      <LayoutRenderer 
        key={index}
        node={node.template}
        page={context.page}
        theme={context.theme}
        typography={typography}
        context={itemContext}
        resolveZIndex={resolveZIndex}
      />
    );
  });

  // 3. 透明模式检查：如果既没有样式也没有布局，则返回 Fragment (透明 Repeater)
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

function mapAlign(align?: string) {
  switch (align) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    default: return align || 'stretch';
  }
}

function mapJustify(justify?: string) {
  switch (justify) {
    case 'start': return 'flex-start';
    case 'end': return 'flex-end';
    case 'between': return 'space-between';
    case 'around': return 'space-around';
    case 'evenly': return 'space-evenly';
    default: return justify || 'flex-start';
  }
}
