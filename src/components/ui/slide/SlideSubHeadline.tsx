import React from 'react';
import { PageData, TypographySettings } from '../../../types';

interface SlideSubHeadlineProps {
  page: PageData;
  typography?: TypographySettings; // 传入全局配置
  size?: string;
  color?: string;
  className?: string;
  italic?: boolean;
  style?: React.CSSProperties;
}

/**
 * SlideSubHeadline - 全局字体感应版
 */
export const SlideSubHeadline: React.FC<SlideSubHeadlineProps> = ({ 
  page, 
  typography,
  size, 
  color, 
  className = "",
  italic,
  style 
}) => {
  const isVisible = page.visibility?.subtitle !== false;
  if (!isVisible || !page.subtitle) return null;

  const overrides = page.styleOverrides?.subtitle || {};
  
  // 计算字体链
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['subtitle'];
    if (fieldFont) return fieldFont;

    const latin = typography?.defaultLatin || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const combinedStyle: React.CSSProperties = {
    fontSize: overrides.fontSize ? `${overrides.fontSize}px` : (size || '1.25rem'),
    color: overrides.color || color || 'inherit',
    fontStyle: italic ? 'italic' : 'normal',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
    ...style,
    fontFamily: getFontFamily()
  };

  return (
    <p 
      className={`font-medium tracking-wide whitespace-pre-line ${className}`}
      style={combinedStyle}
    >
      {page.subtitle}
    </p>
  );
};