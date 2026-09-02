import React from 'react';
import { ComponentNode } from '../types';
import { DesignSystem, TypographySettings } from '../../../types';
import { evaluator, EvaluationContext } from '../expressionEvaluator';
import { ZIndexResolverFn } from '../zIndexResolver';
import { getComponent } from '../componentRegistry';
import { resolveBaseProps } from './basePropsResolver';
import { filterZineClassName } from './styleWhitelist';

interface RenderComponentProps {
  node: ComponentNode;
  context: EvaluationContext;
  ds: DesignSystem;
  typography?: TypographySettings;
  resolveZIndex?: ZIndexResolverFn;
}

/** Renders Component nodes by resolving registry components and binding props */
export function renderComponent({
  node,
  context,
  ds,
  typography,
  resolveZIndex,
}: RenderComponentProps): React.ReactElement | null {
  const Component = getComponent(node.componentType);
  if (!Component) {
    console.warn(`Component not found in registry: ${node.componentType}`);
    return null;
  }

  const staticProps = node.props || {};
  const dynamicProps = evaluator.evaluateObject(staticProps, context);

  // 1. 合并 node.style 与 props.style，统一经过白名单过滤
  const mergedStyle: React.CSSProperties = {
    ...(node.style || {}),
    ...((dynamicProps.style || {}) as React.CSSProperties),
  };

  // 2. 优先使用显式指定的 fieldKey，否则尝试从 bind 字段推断
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

  // 3. 解析基础属性（含 24 格物理隔离样式与 zIndex）
  const { className: baseClassName, style } = resolveBaseProps(
    { ...node, style: mergedStyle },
    context,
    ds,
    resolveZIndex
  );

  // 4. 对动态 props 中的 className 也执行 Zine 过滤
  const dynamicClassName = filterZineClassName((dynamicProps.className as string) || '');
  const finalClassName = [baseClassName, dynamicClassName].filter(Boolean).join(' ');

  // 5. 已在 mergedStyle 中消费，从 remainingProps 中移除 style/className，避免重复
  const { style: _unusedStyle, className: _unusedClassName, ...remainingProps } = dynamicProps;

  const baseProps: any = {
    page: context.page,
    theme: context.theme,
    designSystem: ds,
    typography,
    className: finalClassName,
    bind: node.bind,
  };

  if (inferredFieldKey) {
    baseProps.fieldKey = inferredFieldKey;
  }

  return <Component {...baseProps} {...remainingProps} style={style} />;
}
