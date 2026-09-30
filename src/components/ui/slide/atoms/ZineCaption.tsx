import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineCaptionProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  designSystem: DesignSystem;
  theme: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: unknown;
}

/** 说明/副标题族原子:默认 secondary 色,无回退字段 */
export const ZineCaption: React.FC<ZineCaptionProps> = ({ color = 'secondary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="caption"
    defaultColorToken={color}
    baseClassName="zine-caption"
  />
);

export default ZineCaption;
