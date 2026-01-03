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
 * SlideHeadline
 * 修复版：完美支持 style 透传，包括 WebkitTextStroke 等高级属性。
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

  const customFontSize = page.styleOverrides?.title?.fontSize;

  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 900,
    fontStyle: italic ? 'italic' : 'normal',
    color: color || 'inherit',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
    hyphens: 'none',
    ...style // 确保外部传入的 style (如空心效果) 优先级最高
  };

  return (
    <AutoFitHeadline
      text={page.title}
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