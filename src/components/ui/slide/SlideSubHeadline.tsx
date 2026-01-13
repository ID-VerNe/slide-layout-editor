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
 * SlideSubHeadline - 高优先级颜色感应版
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

  // 1. 获取覆盖数据
  const overrides = page.styleOverrides?.subtitle || {};
  
  const sanitizedText = DOMPurify.sanitize(page.subtitle || '', { 
    ALLOWED_TAGS: ['br', 'b', 'i', 'strong', 'em'],
    ALLOWED_ATTR: [] 
  });

  const getFontFamily = () => {
    if (overrides.fontFamily) return overrides.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['subtitle'];
    if (fieldFont) return fieldFont;
    const latin = page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
    return `${latin}`;
  };

  /**
   * 核心修复：优先级重排
   * 1. overrides.color (编辑器自定义)
   * 2. color (模板传入)
   * 3. theme.colors.secondary (全局辅色)
   */
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
      dangerouslySetInnerHTML={{ __html: sanitizedText }}
    />
  );
};