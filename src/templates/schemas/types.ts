import { AspectRatioType } from '../../constants/layout';

export type NodeType = 'Container' | 'Component' | 'Conditional' | 'Text' | 'Repeater';

// --- Z-Index 层叠声明系统 ---
export type ZIndexKeyword = 'page.top' | 'bottom';
export type ZIndexReference = `${string}.top` | `${string}.bottom`;
export type ZIndexDeclaration = ZIndexKeyword | ZIndexReference;

export interface BaseNode {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  
  // --- 24x24 Modular Grid Positioning ---
  modular?: {
    colStart?: number; // 1-24
    colSpan?: number;  // 1-24
    rowStart?: number; // 1-24
    rowSpan?: number;  // 1-24
    align?: 'start' | 'center' | 'end' | 'stretch';   // 垂直对齐 (align-self)
    justify?: 'start' | 'center' | 'end' | 'stretch'; // 水平对齐 (justify-self)
  };
  
  presetKey?: string;  // 引用 DesignSystem 中的预设样式 (e.g., "safe-area", "glass-card")
  visibleWhen?: string; // e.g., "page.visibility.logo"
  zIndex?: ZIndexDeclaration; // 层叠声明，默认 = 'page.top'
}

export interface ContainerNode extends BaseNode {
  type: 'Container';
  layout?: 'flex' | 'grid' | 'absolute' | 'modular'; // 新增 modular 布局类型
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps | ModularLayoutProps;
  children: TemplateNode[];
}

export interface RepeaterNode extends BaseNode {
  type: 'Repeater';
  bind: string;      // e.g., "page.agenda"
  itemVariable?: string; // e.g., "item", "section"
  template: TemplateNode;
}

export interface ModularLayoutProps {
  gap?: string | number; // 基于 8px 的倍数或预设
  columns?: number;      // 默认为 24
  rows?: number;         // 默认为 24
}

export interface FlexLayoutProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number | string;
  wrap?: boolean;
}

export interface GridLayoutProps {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  areas?: string[];
}

export interface AbsoluteLayoutProps {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  inset?: number | string;
  zIndex?: number;
}

export interface ComponentNode extends BaseNode {
  type: 'Component';
  componentType: string;                 // e.g., "ZineDisplay", "ZineMedia"
  bind?: string;                         // e.g., "page.title"
  fieldKey?: string;                     // 显式绑定 PageData 中的字段键 (用于 styleOverrides)
  props?: Record<string, any>;           // 传递给组件的静态 props
}

export interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: string;                     // e.g., "page.layoutVariant === 'top'"
  then: TemplateNode;
  else?: TemplateNode;
}

export interface TextNode extends BaseNode {
  type: 'Text';
  content: string; // 支持表达式 e.g. "Page {index + 1}"
}

export type TemplateNode = ContainerNode | ComponentNode | ConditionalNode | RepeaterNode | TextNode;

export interface TemplateSchema {
  id: string;
  name: string;
  category: string;
  supportedRatios: AspectRatioType[];
  root: TemplateNode;
  defaults?: Record<string, any>;
  meta?: {
    version: string;
    author?: string;
  };
}
