import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { Text } from './Text';

interface ZineDisplayProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * ZineDisplay - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const ZineDisplay: React.FC<ZineDisplayProps> = ({
  page,
  fieldKey,
  text,
  color = 'primary',
  orientation = 'horizontal',
  className = '',
  style: customStyle,
  children,
  ...otherProps
}) => {
  const theme = useStore(s => s.theme);
  const ds = useStore(s => s.designSystem);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { 
      color: ds.tokens.colors[color as string] || color,
      ...otherProps
    },
    variant: 'display',
    orientation: orientation as any,
    customStyle,
    className
  });

  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const content = text || (fieldKey ? (page as any)[fieldKey] : page.title);
  if (!content && !children) return null;

  const finalStyle: React.CSSProperties = {
    // 如果没有明确对齐方式，则默认占据 100%（兼容旧模板）
    width: style.width || (style.justifySelf ? undefined : '100%'),
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
