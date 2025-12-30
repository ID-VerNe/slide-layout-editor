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
}

export const SlideHeadline: React.FC<SlideHeadlineProps> = ({ 
  page, 
  maxSize = 84, 
  minSize = 40, 
  maxLines = 4,
  className = "",
  weight,
  italic,
  color,
  style
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
    textWrap: 'balance', // 智能平衡每行字数
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
      fontFamily={page.titleFont || 'Inter'}
      className={`tracking-tighter uppercase ${className}`}
      style={combinedStyle}
    />
  );
};
