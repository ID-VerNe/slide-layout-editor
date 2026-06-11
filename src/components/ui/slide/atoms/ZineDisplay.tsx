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

  // 检查是否有用户手动设置的 Grid 对齐（通过 styleOverrides）
  const hasManualAlignment = fieldKey && page.styleOverrides?.[fieldKey] && 
    (page.styleOverrides[fieldKey].alignSelf !== undefined || 
     page.styleOverrides[fieldKey].justifySelf !== undefined);

  // 修复：父容器是 Flexbox(column) 时，需要交换对齐属性
  // Flexbox(column): alignSelf=水平(交叉轴), justifySelf不生效
  // 9-Point UI 语义: alignSelf=垂直, justifySelf=水平
  const finalStyle: React.CSSProperties = { ...style };
  
  if (hasManualAlignment && fieldKey) {
    const overrides = page.styleOverrides[fieldKey];
    finalStyle.alignSelf = overrides.justifySelf;  // 水平位置
    
    // 垂直位置通过 margin 实现
    if (overrides.alignSelf === 'start') {
      finalStyle.marginTop = '0';
      finalStyle.marginBottom = 'auto';
    } else if (overrides.alignSelf === 'end') {
      finalStyle.marginTop = 'auto';
      finalStyle.marginBottom = '0';
    } else if (overrides.alignSelf === 'center') {
      finalStyle.marginTop = 'auto';
      finalStyle.marginBottom = 'auto';
    }
    
    delete finalStyle.justifySelf;
  }
  
  finalStyle.width = style.width || (hasManualAlignment ? undefined : '100%');

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
