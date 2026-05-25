import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';
import { useDataConnector } from './hooks/useDataConnector';
import { useModularStyle } from './hooks/useModularStyle';
import { Text } from './atoms/Text';

interface SlideParagraphProps {
  page: PageData;
  typography?: TypographySettings;
  size?: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLines?: number;
}

/**
 * SlideParagraph - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const SlideParagraph: React.FC<SlideParagraphProps> = ({ 
  page, 
  typography,
  size, 
  color, 
  className = "",
  style: customStyle,
  maxLines = 100
}) => {
  const theme = useStore((state) => state.theme);

  // 1. 数据连接
  const { content, overrides, isVisible } = useDataConnector('paragraph', page);
  
  // 2. 样式解析
  const { style, className: resolvedClassName } = useModularStyle({
    fieldKey: 'paragraph',
    overrides,
    props: { color },
    variant: 'body',
    customStyle,
    className
  });

  if (!isVisible || !content) return null;

  const getFontFamily = () => {
    if (style.fontFamily) return style.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['paragraph'];
    if (fieldFont) return fieldFont;
    return page.bodyFont || theme?.typography?.bodyFont || "'Playfair Display', serif";
  };

  const finalStyle: React.CSSProperties = {
    ...style,
    fontSize: style.fontSize || size || '1rem',
    fontFamily: getFontFamily(),
    lineHeight: style.lineHeight || 1.6,
    textAlign: style.textAlign || 'justify',
  };

  return (
    <Text
      as="div"
      content={content}
      maxLines={maxLines}
      className={`whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    />
  );
};
