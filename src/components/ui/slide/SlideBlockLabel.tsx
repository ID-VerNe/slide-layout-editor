import React from 'react';
import { PageData, TypographySettings } from '../../../types';

interface SlideBlockLabelProps {
  page: PageData;
  typography?: TypographySettings;
  text?: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * SlideBlockLabel - 全局字体感应版
 */
export const SlideBlockLabel: React.FC<SlideBlockLabelProps> = ({ 
  page, 
  typography,
  text, 
  className = "",
  color,
  style 
}) => {
  const labelText = text || page.imageLabel;
  if (!labelText) return null;

  // 计算字体链
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['imageLabel'];
    if (fieldFont) return fieldFont;

    const latin = typography?.defaultLatin || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const combinedStyle: React.CSSProperties = {
    color: color || 'inherit',
    ...style,
    fontFamily: getFontFamily()
  };

  return (
    <div 
      className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 whitespace-pre-line ${className}`}
      style={combinedStyle}
    >
      {labelText}
    </div>
  );
};
