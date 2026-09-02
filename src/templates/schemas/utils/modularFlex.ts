import { ContainerNode, TemplateNode } from '../types';

export interface ModularFlexOptions {
  modular: {
    colStart: number;
    colSpan: number;
    rowStart: number;
    rowSpan: number;
    align?: 'start' | 'end' | 'center' | 'stretch';
    justify?: 'start' | 'end' | 'center' | 'stretch';
  };
  flex: {
    direction?: 'row' | 'column';
    align?: 'start' | 'end' | 'center' | 'stretch';
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
    gap?: string;
    wrap?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
  children: TemplateNode[];
}

/**
 * createModularFlexContainer - 嵌套 Flex 外框占位工具链
 * 核心架构规范：网格定外框 (WHERE)，Flex排内部 (HOW)。
 * 强制将外框定死在 24 格网格指定范围内，内部子元素根据 Flex 规则自适应浮动排布。
 */
export function createModularFlexContainer(options: ModularFlexOptions): ContainerNode {
  return {
    type: 'Container',
    layout: 'flex',
    modular: options.modular,
    layoutProps: {
      direction: options.flex.direction || 'row',
      align: options.flex.align || 'center',
      justify: options.flex.justify || 'start',
      gap: options.flex.gap || 'spacing.sm',
      wrap: options.flex.wrap ?? false,
    },
    className: `w-full h-full overflow-hidden ${options.className || ''}`.trim(),
    style: options.style,
    children: options.children,
  };
}
