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
 * SlideHeadline - 全局主题与字体感应版
 * 优先级：
 * 1. 字段专属覆盖 (styleOverrides.color)
 * 2. 外部传入 props.color
 * 3. 全局主题 Token (theme.colors.primary)
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
  // 订阅全局主题
  const theme = useStore((state) => state.theme);
  
  const isVisible = page.visibility?.title !== false;
  if (!isVisible || !page.title) return null;

  const overrides = page.styleOverrides?.title || {};
  
  // XSS 消毒
  const sanitizedText = DOMPurify.sanitize(page.title, { ALLOWED_TAGS: [] });
  
  const getFontFamily = () => {
    // 0. 显式的样式覆盖 (EditorPanel 调整)
    if (overrides.fontFamily) return overrides.fontFamily;

    // 1. 如果有字段级别的覆盖（通过 props 传入的 typography），优先使用
    const fieldFont = typography?.fieldOverrides?.['title'];
    if (fieldFont) return fieldFont;

    // 2. 使用 PageData 中的字体定义，它已经同步了全局主题
    const latin = page.titleFont || theme?.typography?.headingFont || "'Playfair Display', serif";
    const cjk = page.titleFontZH || theme?.typography?.headingFontZH || "'Noto Serif SC', serif";
    
    return `${latin}, ${cjk}`;
  };

  // 核心：颜色回退逻辑
  const finalColor = overrides.color || color || theme?.colors?.primary || 'inherit';

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