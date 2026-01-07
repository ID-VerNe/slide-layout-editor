import React from 'react';
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
  
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['title'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || theme?.typography?.headingFont || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
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
      text={page.title}
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