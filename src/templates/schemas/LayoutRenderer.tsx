import React, { useMemo } from 'react';
import { TemplateNode } from './types';
import TemplateErrorBoundary from '../../components/ui/TemplateErrorBoundary';
import { evaluator, EvaluationContext } from './expressionEvaluator';
import { ZIndexResolverFn } from './zIndexResolver';
import { PageData, ProjectTheme, TypographySettings, DesignSystem } from '../../types';
import { resolveBaseProps } from './renderer/basePropsResolver';
import { renderContainer } from './renderer/containerRenderer';
import { renderComponent } from './renderer/componentRenderer';
import { renderRepeater } from './renderer/repeaterRenderer';

export interface LayoutRendererProps {
  node: TemplateNode;
  page: PageData;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  typography?: TypographySettings;
  context?: EvaluationContext;
  resolveZIndex?: ZIndexResolverFn;
}

/**
 * LayoutRenderer - 递归渲染 JSON 模板节点总协调器
 * 单一职责：负责 ErrorBoundary 隔离、节点可见性过滤与节点类型调度
 */
// @lat: [[templates-schemas#LayoutRenderer]]
export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  node,
  page,
  theme,
  designSystem,
  typography,
  context: parentContext,
  resolveZIndex
}) => {
  const context: EvaluationContext = useMemo(() => parentContext || { page, theme }, [page, theme, parentContext]);

  return (
    <TemplateErrorBoundary>
      <LayoutRendererInternal
        node={node}
        page={page}
        theme={theme}
        typography={typography}
        context={context}
        ds={designSystem}
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
    // 基础可见性 (所有节点通用 visibleWhen)
    if (node.visibleWhen && !evaluator.evaluate(node.visibleWhen, context)) {
      return { isActuallyVisible: false, conditionMet: false };
    }

    // 条件判断 (仅限 Conditional 节点)
    if (node.type === 'Conditional') {
      return {
        isActuallyVisible: true,
        conditionMet: !!evaluator.evaluate(node.condition, context)
      };
    }

    return { isActuallyVisible: true, conditionMet: true };
  }, [node, context]);

  if (!isActuallyVisible) return null;

  // 2. 根据节点类型调度专门的渲染器模块
  switch (node.type) {
    case 'Container':
      return renderContainer({
        node,
        context,
        ds,
        typography,
        resolveZIndex,
        renderChild: (child, index) => (
          <LayoutRenderer
            key={child.id || index}
            node={child}
            page={context.page}
            theme={context.theme}
            designSystem={ds}
            typography={typography}
            context={context}
            resolveZIndex={resolveZIndex}
          />
        )
      });

    case 'Component':
      return renderComponent({
        node,
        context,
        ds,
        typography,
        resolveZIndex
      });

    case 'Repeater':
      return renderRepeater({
        node,
        context,
        ds,
        typography,
        resolveZIndex,
        renderTemplate: (templateNode, itemContext, key) => (
          <LayoutRenderer
            key={key}
            node={templateNode}
            page={context.page}
            theme={context.theme}
            designSystem={ds}
            typography={typography}
            context={itemContext}
            resolveZIndex={resolveZIndex}
          />
        )
      });

    case 'Text': {
      const content = evaluator.interpolate(node.content, context);
      const { className, style } = resolveBaseProps(node, context, ds, resolveZIndex);
      return <div className={className} style={style}>{content}</div>;
    }

    case 'Conditional': {
      const targetNode = conditionMet ? node.then : node.else;
      return targetNode ? (
        <LayoutRenderer
          node={targetNode}
          page={page}
          theme={theme}
          designSystem={ds}
          typography={typography}
          context={context}
          resolveZIndex={resolveZIndex}
        />
      ) : null;
    }

    default:
      return null;
  }
};
