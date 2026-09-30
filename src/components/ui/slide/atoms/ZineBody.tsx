import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { ZineTextAtom } from './ZineTextAtom';

interface ZineBodyProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
  dropCap?: boolean;
  designSystem: DesignSystem;
  theme: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: unknown;
}

/** 正文族原子:默认回退 page.paragraph,支持首字下沉 */
export const ZineBody: React.FC<ZineBodyProps> = ({ color = 'primary', ...props }) => (
  <ZineTextAtom
    {...props}
    variant="body"
    defaultColorToken={color}
    defaultFallbackKey="paragraph"
    baseClassName="zine-body"
  />
);

export default ZineBody;
