import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';
import { useDataConnector } from './hooks/useDataConnector';
import { useModularStyle } from './hooks/useModularStyle';
import { Text } from './atoms/Text';

interface SlideSubHeadlineProps {
  page: PageData;
  typography?: TypographySettings; 
  size?: string;
  color?: string;
  className?: string;
  italic?: boolean;
  style?: React.CSSProperties;
}

/**
 * SlideSubHeadline - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const SlideSubHeadline: React.FC<SlideSubHeadlineProps> = ({ 
  page, 
  typography,
  size, 
  color, 
  className = "",
  italic,
  style: customStyle 
}) => {
  const theme = useStore((state) => state.theme);
  
  // 1. 数据连接
  const { content, overrides, isVisible } = useDataConnector('subtitle', page);
  
  // 2. 样式解析
  const { style, className: resolvedClassName } = useModularStyle({
    fieldKey: 'subtitle',
    overrides,
    props: { color, italic },
    variant: 'caption', // 使用 Caption 作为基础 Variant，或自定义
    customStyle,
    className
  });

  if (!isVisible || !content) return null;

  const getFontFamily = () => {
    if (style.fontFamily) return style.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['subtitle'];
    if (fieldFont) return fieldFont;
    return page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
  };

  const finalStyle: React.CSSProperties = {
    ...style,
    fontSize: style.fontSize || size || '1.25rem',
    fontFamily: getFontFamily(),
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
  };

  return (
    <Text
      as="p"
      content={content}
      className={`font-medium tracking-wide whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    />
  );
};
