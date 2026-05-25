import React from 'react';
import { PageData, TypographySettings } from '../../../types';
import { useStore } from '../../../store/useStore';
import { useDataConnector } from './hooks/useDataConnector';
import { useModularStyle } from './hooks/useModularStyle';
import { Text } from './atoms/Text';

interface SlideBlockLabelProps {
  page?: PageData;
  typography?: TypographySettings;
  text?: string;
  fieldKey?: 'imageLabel' | 'actionText';
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  noBorder?: boolean;
}

/**
 * SlideBlockLabel - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const SlideBlockLabel: React.FC<SlideBlockLabelProps> = ({ 
  page, 
  typography,
  text, 
  fieldKey: explicitFieldKey,
  className = "", 
  color,
  style: customStyle,
  noBorder = false
}) => {
  const theme = useStore((state) => state.theme);
  
  if (!page) return null;

  // 智能识别或使用显式指定的 Key
  const isImageLabelMatch = text && text === page.imageLabel;
  const fieldKey = explicitFieldKey || (isImageLabelMatch ? 'imageLabel' : 'actionText');

  // 1. 数据连接
  const { content: pageContent, overrides, isVisible } = useDataConnector(fieldKey, page);
  const content = text !== undefined ? text : pageContent;

  // 2. 样式解析
  const { style, className: resolvedClassName } = useModularStyle({
    fieldKey,
    overrides,
    props: { color },
    variant: 'caption',
    customStyle,
    className
  });

  if (!content || !isVisible) return null;

  const getFontFamily = () => {
    if (style.fontFamily) return style.fontFamily;
    const fieldFont = typography?.fieldOverrides?.[fieldKey];
    if (fieldFont) return fieldFont;
    return theme?.typography?.headingFont || "'Inter', sans-serif";
  };

  const finalColor = style.color || theme?.colors?.accent || '#264376';

  return (
    <div 
      className={`inline-flex items-center justify-center ${noBorder ? '' : 'px-6 py-2 border rounded-full'} transition-all duration-300 ${resolvedClassName}`}
      style={{ 
        ...style,
        borderColor: noBorder ? 'transparent' : `${finalColor}44`,
        color: finalColor,
      }}
    >
      <Text
        as="span"
        content={content}
        className="font-black uppercase tracking-widest"
        style={{ 
          fontFamily: getFontFamily(),
          fontSize: style.fontSize || 'inherit'
        }}
      />
    </div>
  );
};
