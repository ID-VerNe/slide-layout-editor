import React from 'react';
import DOMPurify from 'dompurify';
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

  // XSS 消毒
  const sanitizedText = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'span'],
    ALLOWED_ATTR: ['style', 'class'] 
  });

  const overrides = page.styleOverrides?.paragraph || {};
  const fontSize = overrides.fontSize ? `${overrides.fontSize}px` : (size || '1.15rem');
  const lineHeight = overrides.lineHeight || 1.8;
  
  // 默认使用 Primary 文本色 (通常是接近黑色的深灰)
  const textColor = overrides.color || color || theme?.colors?.primary || '#4b5563';

  const getFontFamily = () => {
    // 1. 显式的样式覆盖
    if (overrides.fontFamily) return overrides.fontFamily;

    const fieldFont = typography?.fieldOverrides?.['paragraph'];
    if (fieldFont) return fieldFont;

    const latin = page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
    const cjk = page.bodyFontZH || theme?.typography?.bodyFontZH || "'Noto Serif SC', serif";
    
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
          <span className="inline" style={{ fontFamily: currentFont }} dangerouslySetInnerHTML={{ __html: sanitizedText.slice(1) }} />
        </div>
      ) : (
        <span style={{ fontFamily: currentFont }} dangerouslySetInnerHTML={{ __html: sanitizedText }} />
      )}
    </div>
  );
};