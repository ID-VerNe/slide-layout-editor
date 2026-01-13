import React from 'react';
import { FreeformItem } from '../../../types/freeform.types';
import { PageData } from '../../../types';
import { useStore } from '../../../store/useStore';

export const TextBlock: React.FC<{ item: FreeformItem; page?: PageData }> = ({ item, page }) => {
  const { typography, content } = item;
  const theme = useStore((state) => state.theme);
  
  // 字体解析逻辑
  const getFontFamily = () => {
    // 1. 组件自身的 override
    if (typography?.fontFamily) return typography.fontFamily;

    // 2. Page 级设置
    const latin = page?.bodyFont || theme?.typography?.bodyFont || "'Inter', sans-serif";
    const cjk = page?.bodyFontZH || theme?.typography?.bodyFontZH || "'Noto Sans SC', sans-serif";
    
    return `${latin}, ${cjk}`;
  };

  const fontFamily = getFontFamily();
  
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontSize: typography?.fontSize || 16,
        fontFamily: fontFamily,
        fontWeight: typography?.fontWeight || 'normal',
        fontStyle: typography?.fontStyle || 'normal',
        color: typography?.color || 'black',
        textAlign: typography?.textAlign || 'left',
        lineHeight: typography?.lineHeight || 1.5,
        letterSpacing: typography?.letterSpacing ? `${typography.letterSpacing}px` : 'normal',
        textTransform: typography?.textTransform || 'none',
        overflow: 'hidden',
        padding: 4,
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        hyphens: 'auto',
      }}
    >
      {content?.text || 'Text Block'}
    </div>
  );
};