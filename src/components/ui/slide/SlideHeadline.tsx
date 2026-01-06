import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import AutoFitHeadline from '../../AutoFitHeadline';

interface SlideHeadlineProps {
  page: PageData;
  typography?: TypographySettings; // 传入全局字体设置
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
 * SlideHeadline - 全局字体感应版
 * 优先级：
 * 1. 字段专属覆盖 (Fine-grained)
 * 2. 全局默认英文字体 + 全局默认中文字体 (Rough)
 * 3. 系统回退
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
  const isVisible = page.visibility?.title !== false;
  if (!isVisible || !page.title) return null;

  const overrides = page.styleOverrides?.title || {};
  
  // 核心：计算最终字体链
  const getFontFamily = () => {
    // 1. 字段精细调整优先
    const fieldFont = typography?.fieldOverrides?.['title'];
    if (fieldFont) return fieldFont;

    // 2. 粗略调整组合 (Latin + CJK)
    const latin = typography?.defaultLatin || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 900,
    fontStyle: italic ? 'italic' : 'normal',
    color: overrides.color || color || 'inherit',
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
