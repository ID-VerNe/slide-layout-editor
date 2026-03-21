import { AspectRatioType } from '../../constants/layout';

export type NodeType = 'Container' | 'Component' | 'Conditional' | 'Text';

export interface BaseNode {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface ContainerNode extends BaseNode {
  type: 'Container';
  layout: 'flex' | 'grid' | 'absolute';
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps;
  children: TemplateNode[];
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
  componentType: string;                 // e.g., "SlideHeadline", "SlideImage"
  bind?: string;                         // e.g., "page.title"
  props?: Record<string, any>;           // 传递给组件的静态 props
  visibleWhen?: string;                  // e.g., "page.visibility.logo"
}

export interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: string;                     // e.g., "page.layoutVariant === 'top'"
  then: TemplateNode;
  else?: TemplateNode;
}

export type TemplateNode = ContainerNode | ComponentNode | ConditionalNode;

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
