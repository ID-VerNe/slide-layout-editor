import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineDisplayProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  designSystem: DesignSystem;
  theme: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: unknown;
}

/** 标题族原子:语义 h1,默认回退 page.title */
export const ZineDisplay: React.FC<ZineDisplayProps> = ({ color = 'primary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="display"
    defaultColorToken={color}
    defaultFallbackKey="title"
    as="h1"
    baseClassName="zine-display tracking-tighter"
  />
);

export default ZineDisplay;
