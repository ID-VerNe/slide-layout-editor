import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';

interface SlideParagraphProps {
  page: PageData;
  typography?: TypographySettings; 
  className?: string;
  color?: string;
  size?: string;
  dropCap?: boolean; 
  style?: React.CSSProperties;
}

/**
 * SlideParagraph - 主题感应版
 */
export const SlideParagraph: React.FC<SlideParagraphProps> = ({ 
  page, 
  typography,
  className = "",
  color,
  size,
  dropCap = false,
  style = {}
}) => {
  const theme = useStore((state) => state.theme);
  
  const text = page.paragraph;
  if (!text) return null;

  const overrides = page.styleOverrides?.paragraph || {};
  const fontSize = overrides.fontSize ? `${overrides.fontSize}px` : (size || '1.15rem');
  const lineHeight = overrides.lineHeight || 1.8;
  
  // 默认使用 Primary 文本色 (通常是接近黑色的深灰)
  const textColor = overrides.color || color || theme?.colors?.primary || '#4b5563';

  const getFontFamily = () => {
    const fieldFont = typography?.fieldOverrides?.['paragraph'];
    if (fieldFont) return fieldFont;
    const latin = typography?.defaultLatin || theme?.typography?.bodyFont || "'Crimson Pro', serif";
    const cjk = typography?.defaultCJK || "'Noto Serif SC', serif";
    return `${latin}, ${cjk}`;
  };

  const currentFont = getFontFamily();

  return (
    <div 
      className={`whitespace-pre-line text-justify ${className}`}
      style={{ 
        ...style,
        fontFamily: currentFont,
        fontSize,
        lineHeight,
        color: textColor
      }}
    >
      {dropCap && text.length > 0 ? (
        <div className="relative" style={{ fontFamily: currentFont }}>
          <span 
            className="float-left font-medium select-none mr-4"
            style={{ 
              fontFamily: currentFont,
              fontSize: '4.2rem',
              lineHeight: '0.8',
              marginTop: '0.45rem',
              marginBottom: '-0.2rem',
              color: textColor // 首字也跟随主题色
            }} 
          >
            {text.charAt(0)}
          </span>
          <span className="inline" style={{ fontFamily: currentFont }}>
            {text.slice(1)}
          </span>
        </div>
      ) : (
        <span style={{ fontFamily: currentFont }}>{text}</span>
      )}
    </div>
  );
};