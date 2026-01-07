import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';

interface SlideSubHeadlineProps {
  page: PageData;
  typography?: TypographySettings; 
  size?: string;
  color?: string;
  className?: string;
  italic?: boolean;
  style?: React.CSSProperties;
}

/**
 * SlideSubHeadline - 主题感应版
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
  const theme = useStore((state) => state.theme);
  
  const isVisible = page.visibility?.subtitle !== false;
  if (!isVisible || !page.subtitle) return null;

  const overrides = page.styleOverrides?.subtitle || {};
  
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['subtitle'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || theme?.typography?.bodyFont || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  // 默认使用 Secondary 色
  const finalColor = overrides.color || color || theme?.colors?.secondary || '#64748B';

  const combinedStyle: React.CSSProperties = {
    fontSize: overrides.fontSize ? `${overrides.fontSize}px` : (size || '1.25rem'),
    color: finalColor,
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
