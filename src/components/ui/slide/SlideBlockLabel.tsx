import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';

interface SlideBlockLabelProps {
  page?: PageData;
  typography?: TypographySettings;
  text?: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  noBorder?: boolean;
}

/**
 * SlideBlockLabel - 主题感应版
 */
export const SlideBlockLabel: React.FC<SlideBlockLabelProps> = ({ 
  page, 
  typography,
  text, 
  className = "", 
  color,
  style,
  noBorder = false
}) => {
  const theme = useStore((state) => state.theme);
  
  // 优先显示传入的 text，其次是 page.actionText
  const content = text || page?.actionText;
  const isVisible = page?.visibility?.actionText !== false;

  if (!content || !isVisible) return null;

  const overrides = page?.styleOverrides?.actionText || {};
  
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['actionText'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || theme?.typography?.headingFont || "'Inter', sans-serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  // 默认使用 Accent 色作为装饰性标签
  const finalColor = overrides.color || color || theme?.colors?.accent || '#264376';

  return (
    <div 
      className={`inline-flex items-center justify-center ${noBorder ? '' : 'px-6 py-2 border rounded-full'} transition-colors duration-300 ${className}`}
      style={{ 
        borderColor: noBorder ? 'transparent' : finalColor,
        color: finalColor,
        ...style
      }}
    >
      <span 
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ fontFamily: getFontFamily() }}
      >
        {content}
      </span>
    </div>
  );
};