import React, { useMemo } from 'react';
import { TemplateNode, ContainerNode, ComponentNode, ConditionalNode } from './types';
import { getComponent } from './componentRegistry';
import { evaluator, EvaluationContext } from './expressionEvaluator';
import { PageData, ProjectTheme, TypographySettings } from '../../types';

interface LayoutRendererProps {
  node: TemplateNode;
  page: PageData;
  theme: ProjectTheme;
  typography?: TypographySettings;
}

/**
 * LayoutRenderer - 递归渲染 JSON 模板节点
 */
export const LayoutRenderer: React.FC<LayoutRendererProps> = ({ 
  node, 
  page, 
  theme, 
  typography 
}) => {
  const context: EvaluationContext = useMemo(() => ({ page, theme }), [page, theme]);

  // 1. 处理可见性逻辑 (Conditional Node 或 visibleWhen)
  const isVisible = useMemo(() => {
    if (node.type === 'Conditional') {
      return !!evaluator.evaluate(node.condition, context);
    }
    if (node.type === 'Component' && node.visibleWhen) {
      return !!evaluator.evaluate(node.visibleWhen, context);
    }
    return true;
  }, [node, context]);

  if (!isVisible && node.type !== 'Conditional') return null;

  // 2. 根据节点类型选择渲染逻辑
  switch (node.type) {
    case 'Container':
      return renderContainer(node, context, typography);
    case 'Component':
      return renderComponent(node, context, typography);
    case 'Conditional':
      const targetNode = isVisible ? node.then : node.else;
      return targetNode ? (
        <LayoutRenderer 
          node={targetNode} 
          page={page} 
          theme={theme} 
          typography={typography} 
        />
      ) : null;
    default:
      return null;
  }
};

/**
 * 渲染容器节点
 */
function renderContainer(
  node: ContainerNode, 
  context: EvaluationContext, 
  typography?: TypographySettings
): React.ReactElement {
  const { layout, layoutProps, children, className, style } = node;
  
  // 处理动态样式和类名
  const dynamicClassName = evaluator.interpolate(className || '', context);
  const dynamicStyle = evaluator.evaluateObject(style || {}, context);

  let layoutStyle: React.CSSProperties = { ...dynamicStyle };

  // 根据布局类型应用 CSS
  if (layout === 'flex') {
    const props = layoutProps as any || {};
    layoutStyle = {
      ...layoutStyle,
      display: 'flex',
      flexDirection: props.direction || 'row',
      alignItems: mapAlign(props.align),
      justifyContent: mapJustify(props.justify),
      gap: props.gap,
      flexWrap: props.wrap ? 'wrap' : 'nowrap',
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
      gap: props.gap,
    };
  }

  return (
    <div className={dynamicClassName} style={layoutStyle}>
      {children.map((child, index) => (
        <LayoutRenderer 
          key={child.id || index} 
          node={child} 
          page={context.page} 
          theme={context.theme} 
          typography={typography} 
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
  typography?: TypographySettings
): React.ReactElement | null {
  const Component = getComponent(node.componentType);
  if (!Component) {
    console.warn(`Component not found in registry: ${node.componentType}`);
    return null;
  }

  // 计算动态 props
  const staticProps = node.props || {};
  const dynamicProps = evaluator.evaluateObject(staticProps, context);
  
  // 基础 props (page, theme, typography)
  const baseProps = {
    page: context.page,
    theme: context.theme,
    typography,
    className: evaluator.interpolate(node.className || '', context),
    style: evaluator.evaluateObject(node.style || {}, context),
  };

  return <Component {...baseProps} {...dynamicProps} />;
}

// 辅助工具函数
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
