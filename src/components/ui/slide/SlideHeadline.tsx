import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';
import { useDataConnector } from './hooks/useDataConnector';
import { useModularStyle } from './hooks/useModularStyle';
import { Text } from './atoms/Text';

interface SlideHeadlineProps {
  page: PageData;
  typography?: TypographySettings; 
  maxSize?: number;
  minSize?: number;
  maxLines?: number;
  className?: string;
  weight?: string | number;
  italic?: boolean;
  color?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * SlideHeadline - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const SlideHeadline: React.FC<SlideHeadlineProps> = ({ 
  page, 
  typography,
  maxSize = 84, 
  minSize = 40, 
  maxLines = 4,
  className = "",
  weight,
  italic,
  color,
  style: customStyle,
  children
}) => {
  const theme = useStore((state) => state.theme);
  
  // 1. 数据连接
  const { content, overrides, isVisible } = useDataConnector('title', page);
  
  // 2. 样式解析
  const { style, className: resolvedClassName } = useModularStyle({
    fieldKey: 'title',
    overrides,
    props: { weight, italic, color },
    variant: 'display',
    customStyle,
    className
  });

  if (!isVisible || !content) return null;

  // 字体解析 (保持原有逻辑，但利用 theme)
  const getFontFamily = () => {
    if (style.fontFamily) return style.fontFamily;
    const fieldFont = typography?.fieldOverrides?.['title'];
    if (fieldFont) return fieldFont;
    return page.titleFont || theme?.typography?.headingFont || "'Playfair Display', serif";
  };

  const finalStyle: React.CSSProperties = {
    ...style,
    fontFamily: getFontFamily(),
    fontWeight: style.fontWeight || 900,
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    textWrap: 'balance',
  };

  return (
    <Text
      as="h1"
      content={content}
      autoFit={true}
      maxSize={overrides.fontSize || maxSize}
      minSize={overrides.fontSize || minSize}
      lineHeight={1.05}
      maxLines={maxLines}
      className={`tracking-tighter uppercase ${resolvedClassName}`}
      style={finalStyle}
    >
      {children}
    </Text>
  );
};
