import React from 'react';
import { PageData } from '../../../types';

interface SlideSubHeadlineProps {
  page: PageData;
  className?: string;
  weight?: string | number;
  italic?: boolean;
  color?: string;
  size?: string;
  style?: React.CSSProperties;
}

/**
 * SlideSubHeadline - 副标题原子组件
 * 恢复为标准版本，去除局部模板特定的字距微调。
 */
export const SlideSubHeadline: React.FC<SlideSubHeadlineProps> = ({ 
  page, 
  className = "",
  weight,
  italic,
  color,
  size,
  style
}) => {
  const isVisible = page.visibility?.subtitle !== false;
  if (!isVisible || !page.subtitle) return null;

  const customFontSize = page.styleOverrides?.subtitle?.fontSize;

  const combinedStyle: React.CSSProperties = {
    fontWeight: weight || 500,
    fontStyle: italic ? 'italic' : 'normal',
    color: color || '#64748b',
    fontSize: customFontSize ? `${customFontSize}px` : (size || '1.25rem'),
    overflowWrap: 'anywhere', 
    wordBreak: 'break-word',
    ...style
  };

  return (
    <p 
      className={`leading-relaxed ${className}`}
      style={{ 
        fontFamily: page.bodyFont || 'Inter, sans-serif',
        ...combinedStyle
      }}
    >
      {page.subtitle}
    </p>
  );
};
