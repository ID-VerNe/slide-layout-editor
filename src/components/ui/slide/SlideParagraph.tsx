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
 * SlideParagraph - 高优先级颜色感应版
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

  const sanitizedText = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'span'],
    ALLOWED_ATTR: ['style', 'class'] 
  });

  const overrides = page.styleOverrides?.paragraph || {};
  const fontSize = overrides.fontSize ? `${overrides.fontSize}px` : (size || '1.15rem');
  const lineHeight = overrides.lineHeight || 1.8;
  
  /**
   * 核心修复：优先级重排
   */
  const textColor = overrides.color || color || theme?.colors?.primary || '#4b5563';

  const getFontFamily = () => {
    if (overrides.fontFamily) return overrides.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['paragraph'];
    if (fieldFont) return fieldFont;
    const latin = page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
    return `${latin}`;
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
              color: textColor 
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
