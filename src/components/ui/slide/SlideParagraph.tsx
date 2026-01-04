import React from 'react';
import { PageData } from '../../../types';

interface SlideParagraphProps {
  page: PageData;
  className?: string;
  color?: string;
  size?: string;
  dropCap?: boolean; 
  style?: React.CSSProperties;
}

/**
 * SlideParagraph - 长文段落原子组件
 * 极致对齐版：实现首字下沉(A)顶部对齐第一行，底部对齐第二行基准线。
 */
export const SlideParagraph: React.FC<SlideParagraphProps> = ({ 
  page, 
  className = "",
  color,
  size,
  dropCap = false,
  style = {}
}) => {
  const text = page.paragraph;
  if (!text) return null;

  const overrides = page.styleOverrides?.paragraph || {};
  const fontSize = overrides.fontSize ? `${overrides.fontSize}px` : (size || '1rem');
  const lineHeight = overrides.lineHeight || 1.8;
  const textColor = overrides.color || color || '#4b5563';

  const currentFont = style.fontFamily || overrides.fontFamily || page.bodyFont || "Lora";

  return (
    <div 
      className={`whitespace-pre-line text-justify ${className}`}
      style={{ 
        fontFamily: currentFont,
        fontSize,
        lineHeight,
        color: textColor,
        ...style
      }}
    >
      {dropCap && text.length > 0 ? (
        <div className="relative" style={{ fontFamily: currentFont }}>
          {/* 
            首字下沉物理补正：
            1. text-[4.2rem]：在 14px 正文下，此高度约等于两行高度。
            2. leading-[0.8]：收紧字符盒子。
            3. mt-[0.45rem]：精确下移，使首字母顶边与正文顶边对齐。
            4. mb-[-0.2rem]：底部微调，让其坐落在第二行基准线上。
          */}
          <span 
            className="float-left font-medium text-slate-900 select-none mr-4"
            style={{ 
              fontFamily: currentFont,
              fontSize: '4.2rem',
              lineHeight: '0.8',
              marginTop: '0.45rem',
              marginBottom: '-0.2rem'
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