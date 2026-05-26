import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { Text } from './Text';

interface ZineCaptionProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'];
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate'; // 新增
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ZineCaption - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const ZineCaption: React.FC<ZineCaptionProps> = ({ 
  page,
  fieldKey, 
  text, 
  color = 'secondary', 
  orientation = 'horizontal', // 新增
  className = '', 
  style: customStyle
}) => {
  const ds = useStore(s => s.designSystem);
  const theme = useStore(s => s.theme);
  
  const { style, className: resolvedClassName } = useModularStyle({
    page, 
    fieldKey, 
    props: { color: ds.tokens.colors[color as string] || color },
    variant: 'caption',
    orientation: orientation as any, // 传入方向
    customStyle,
    className
  });
  
  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const content = text || (fieldKey ? (page as any)[fieldKey] : undefined);
  if (!content) return null;

  const finalStyle: React.CSSProperties = {
    fontFamily: theme.typography.captionFont || "'Inter', sans-serif",
    ...style,
  };

  return (
    <Text
      content={content}
      className={`zine-caption whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    />
  );
};

export default ZineCaption;
