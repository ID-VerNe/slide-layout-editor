import React from 'react';
import { PageData } from '../../../types';
import AutoFitHeadline from '../../AutoFitHeadline';

interface SlideHeadlineProps {
  page: PageData;
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
 * SlideHeadline - 主标题原子组件
 * 最终加固版：全方位支持 styleOverrides (字号、颜色、字体)。
 */
export const SlideHeadline: React.FC<SlideHeadlineProps> = ({ 
  page, 
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

  // 1. 从 styleOverrides 提取用户自定义属性
  const overrides = page.styleOverrides?.title || {};
  const customFontSize = overrides.fontSize;
  const customColor = overrides.color;
  const customFont = overrides.fontFamily;

  // 2. 构造最终样式
  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 900,
    fontStyle: italic ? 'italic' : 'normal',
    color: customColor || color || 'inherit',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
    hyphens: 'none',
    ...style
  };

  return (
    <AutoFitHeadline
      text={page.title}
      maxSize={customFontSize || maxSize}
      minSize={customFontSize || minSize}
      lineHeight={1.05}
      maxLines={maxLines}
      // 核心修复：优先读取 styleOverrides 中的字体
      fontFamily={customFont || page.titleFont || "'Inter', sans-serif"}
      className={`tracking-tighter uppercase ${className}`}
      style={combinedStyle}
    >
      {children}
    </AutoFitHeadline>
  );
};