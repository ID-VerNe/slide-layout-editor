import React from 'react';
import { PageData } from '../../../types';

interface SlideBlockLabelProps {
  page: PageData;
  className?: string;
  bg?: string;
  color?: string;
  radius?: string;
  border?: string;
  style?: React.CSSProperties;
}

export const SlideBlockLabel: React.FC<SlideBlockLabelProps> = ({ 
  page, 
  className = "",
  bg,
  color,
  radius,
  border,
  style
}) => {
  const isVisible = page.visibility?.actionText !== false;
  if (!isVisible || !page.actionText) return null;

  const customFontSize = page.styleOverrides?.actionText?.fontSize;

  const combinedStyle: React.CSSProperties = {
    backgroundColor: bg || '#0F172A', // 默认深蓝色背景
    color: color || '#ffffff',       // 强制白色文字
    borderRadius: radius || '0.5rem',
    border: border || '1px solid rgba(255,255,255,0.1)',
    fontSize: customFontSize ? `${customFontSize}px` : undefined,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    ...style
  };

  return (
    <div 
      className={`px-4 py-2 font-black text-[13px] uppercase tracking-[0.2em] shadow-lg inline-block text-white ${className}`}
      style={combinedStyle}
    >
      {page.actionText}
    </div>
  );
};