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
 * 修复版：深度支持 styleOverrides (字号、颜色)，确保编辑器控件生效。
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
  const customFontSize = page.styleOverrides?.title?.fontSize;
  const customColor = page.styleOverrides?.title?.color;

  // 2. 构造最终样式
  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 900,
    fontStyle: italic ? 'italic' : 'normal',
    // 优先级：编辑器选择的颜色 > 组件传入的颜色参数 > 继承色
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
      // 如果编辑器设置了字号，则锁定为该字号，否则使用 AutoFit 自动缩放范围
      maxSize={customFontSize || maxSize}
      minSize={customFontSize || minSize}
      lineHeight={1.05}
      maxLines={maxLines}
      fontFamily={page.titleFont || 'Inter'}
      className={`tracking-tighter uppercase ${className}`}
      style={combinedStyle}
    >
      {children}
    </AutoFitHeadline>
  );
};
