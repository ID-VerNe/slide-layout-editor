import React from 'react';
import DOMPurify from 'dompurify';
import { PageData, TypographySettings } from '../../../types';
import AutoFitHeadline from '../../AutoFitHeadline';
import { useStore } from '../../../store/useStore';

interface SlideHeadlineProps {
  page: PageData;
  typography?: TypographySettings; 
  maxSize?: number;
  minSize?: number;
  maxLines?: number;
  className?: string;
  weight?: string | number;
  italic?: boolean;
  color?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * SlideHeadline - 高优先级颜色感应版
 */
export const SlideHeadline: React.FC<SlideHeadlineProps> = ({ 
  page, 
  typography,
  maxSize = 84, 
  minSize = 40, 
  maxLines = 4,
  className = "",
  weight,
  italic,
  color,
  style,
  children
}) => {
  const theme = useStore((state) => state.theme);
  
  const isVisible = page.visibility?.title !== false;
  if (!isVisible || !page.title) return null;

  // 1. 获取样式覆盖数据
  const overrides = page.styleOverrides?.title || {};
  
  const sanitizedText = DOMPurify.sanitize(page.title, { ALLOWED_TAGS: [] });
  
  const getFontFamily = () => {
    if (overrides.fontFamily) return overrides.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['title'];
    if (fieldFont) return fieldFont;
    const latin = page.titleFont || theme?.typography?.headingFont || "'Playfair Display', serif";
    return `${latin}`;
  };

  /**
   * 核心修复：优先级重排
   * 1. overrides.color (编辑器里刚加的颜色)
   * 2. color (模板代码里传进来的 props)
   * 3. theme.colors.primary (全局品牌主色)
   */
  const finalColor = overrides.color || color || theme?.colors?.primary || '#0F172A';

  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 900,
    fontStyle: italic ? 'italic' : 'normal',
    color: finalColor,
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
    ...style,
    fontFamily: getFontFamily()
  };

  return (
    <AutoFitHeadline
      text={sanitizedText}
      maxSize={overrides.fontSize || maxSize}
      minSize={overrides.fontSize || minSize}
      lineHeight={1.05}
      maxLines={maxLines}
      fontFamily={getFontFamily()}
      className={`tracking-tighter uppercase ${className}`}
      style={combinedStyle}
    >
      {children}
    </AutoFitHeadline>
  );
};
