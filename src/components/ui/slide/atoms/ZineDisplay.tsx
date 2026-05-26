import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { Text } from './Text';

interface ZineDisplayProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'];
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate'; // 新增
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * ZineDisplay - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const ZineDisplay: React.FC<ZineDisplayProps> = ({ 
  page,
  fieldKey, 
  text, 
  color = 'primary', 
  orientation = 'horizontal', // 新增
  className = '', 
  style: customStyle,
  children 
}) => {
  const theme = useStore(s => s.theme);
  const ds = useStore(s => s.designSystem);
  
  const { style, className: resolvedClassName } = useModularStyle({
    page, 
    fieldKey, 
    props: { color: ds.tokens.colors[color as string] || color },
    variant: 'display',
    orientation: orientation as any, // 传入方向
    customStyle,
    className
  });

  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const content = text || (fieldKey ? (page as any)[fieldKey] : page.title);
  if (!content && !children) return null;

  const finalStyle: React.CSSProperties = {
    fontFamily: page.titleFont || theme.typography.headingFont,
    ...style,
  };

  return (
    <Text
      as="h1"
      content={content}
      className={`zine-display tracking-tighter whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    >
      {children}
    </Text>
  );
};

export default ZineDisplay;
