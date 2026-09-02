import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle, resolveDockingStyle } from '../hooks/useModularStyle';
import { Text } from './Text';

interface ZineCaptionProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * ZineCaption - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const ZineCaption: React.FC<ZineCaptionProps> = ({ 
  page,
  fieldKey, 
  text, 
  color = 'secondary', 
  orientation = 'horizontal',
  className = '', 
  style: customStyle,
  ...otherProps
}) => {
  const ds = useStore(s => s.designSystem);
  
  const { style, className: resolvedClassName } = useModularStyle({
    page, 
    fieldKey, 
    props: { 
      color: ds.tokens.colors[color as string] || color,
      ...otherProps
    },
    variant: 'caption',
    orientation: orientation as any,
    customStyle,
    className
  });
  
  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const content = text || (fieldKey ? (page as any)[fieldKey] : undefined);
  if (!content) return null;

  // 统一解析 9 点对齐与布局适应
  const finalStyle = resolveDockingStyle(style, fieldKey ? page.styleOverrides?.[fieldKey] : undefined);

  return (
    <Text
      content={content}
      className={`zine-caption whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    />
  );
};

export default ZineCaption;
