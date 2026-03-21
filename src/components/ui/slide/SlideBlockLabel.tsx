import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';

interface SlideBlockLabelProps {
  page?: PageData;
  typography?: TypographySettings;
  text?: string;
  fieldKey?: 'imageLabel' | 'actionText'; // 新增：显式指定字段键
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  noBorder?: boolean;
}

/**
 * SlideBlockLabel - 核心增强版
 * 支持显式指定 fieldKey 以准确应用 styleOverrides。
 */
export const SlideBlockLabel: React.FC<SlideBlockLabelProps> = ({ 
  page, 
  typography,
  text, 
  fieldKey: explicitFieldKey,
  className = "", 
  color,
  style,
  noBorder = false
}) => {
  const theme = useStore((state) => state.theme);
  
  // 智能识别或使用显式指定的 Key
  const isImageLabelMatch = text && text === page?.imageLabel;
  const fieldKey = explicitFieldKey || (isImageLabelMatch ? 'imageLabel' : 'actionText');

  const content = text !== undefined ? text : (fieldKey === 'imageLabel' ? page?.imageLabel : page?.actionText);
  const isVisible = page?.visibility?.[fieldKey] !== false;

  if (!content || !isVisible) return null;

  const overrides = page?.styleOverrides?.[fieldKey] || {};
  
  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.[fieldKey];
    if (fieldFont) return fieldFont;
    const latin = theme?.typography?.headingFont || "'Inter', sans-serif";
    return `${latin}`;
  };

  const finalColor = overrides.color || color || theme?.colors?.accent || '#264376';

  return (
    <div 
      className={`inline-flex items-center justify-center ${noBorder ? '' : 'px-6 py-2 border rounded-full'} transition-all duration-300 ${className}`}
      style={{ 
        borderColor: noBorder ? 'transparent' : `${finalColor}44`,
        color: finalColor,
        fontSize: overrides.fontSize ? `${overrides.fontSize}px` : undefined,
        ...style
      }}
    >
      <span 
        className="font-black uppercase tracking-widest"
        style={{ 
          fontFamily: getFontFamily(),
          fontSize: 'inherit'
        }}
      >
        {content}
      </span>
    </div>
  );
};