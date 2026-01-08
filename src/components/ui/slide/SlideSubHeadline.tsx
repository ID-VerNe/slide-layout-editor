import React from 'react';
import DOMPurify from 'dompurify';
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
  
  // XSS 消毒
  const sanitizedText = DOMPurify.sanitize(page.subtitle || '', { ALLOWED_TAGS: [] });

  const getFontFamily = () => {
    // 1. 显式的样式覆盖
    if (overrides.fontFamily) return overrides.fontFamily;
    
    // 2. 模板注入的覆盖
    const fieldFont = typography?.fieldOverrides?.['subtitle'];
    if (fieldFont) return fieldFont;

    // 3. 页面/主题配置 (副标题通常使用 Body 字体)
    const latin = page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
    const cjk = page.bodyFontZH || theme?.typography?.bodyFontZH || "'Noto Serif SC', serif";
    
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
      {sanitizedText}
    </p>
  );
};
