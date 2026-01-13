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
 * SlideBlockLabel - 核心修复版
 * 1. 动态读取 styleOverrides.[字段].fontSize
 * 2. 智能识别当前使用的字段 ID
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
  
  // 智能识别：如果是从 imageLabel 传进来的 text
  const isImageLabel = text && text === page?.imageLabel;
  const fieldKey = isImageLabel ? 'imageLabel' : 'actionText';

  const content = text || page?.actionText;
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
        borderColor: noBorder ? 'transparent' : `${finalColor}44`, // 默认带透明度的边框
        color: finalColor,
        // 核心修复：应用 styleOverrides 里的字号
        fontSize: overrides.fontSize ? `${overrides.fontSize}px` : undefined,
        ...style
      }}
    >
      <span 
        className="font-black uppercase tracking-widest"
        style={{ 
          fontFamily: getFontFamily(),
          fontSize: 'inherit' // 继承父级定义的 fontSize
        }}
      >
        {content}
      </span>
    </div>
  );
};
