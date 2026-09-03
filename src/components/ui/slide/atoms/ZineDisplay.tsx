import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle, resolveDockingStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';
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
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/**
 * ZineDisplay - 标题族原子组件
 * 严格遵从 24 格网格物理隔离与 Token 解析，接入 useDataConnector
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
  designSystem: propsDs,
  theme: propsTheme,
  typography: propsTypography,
  ...otherProps
}) => {
  const storeDs = useStore(s => s.designSystem);
  const ds = propsDs || storeDs;

  // 1. 统一提取数据连接与可见性状态
  const defaultFallback = text || (fieldKey ? (page as any)[fieldKey] : page.title);
  const { content, overrides, isVisible } = useDataConnector(fieldKey, page, defaultFallback);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { 
      color: (ds.tokens.colors as any)?.[color as string] || color,
      ...otherProps
    },
    variant: 'display',
    orientation: orientation as any,
    customStyle,
    className
  });

  // 2. 可见性与内容检查
  if (!isVisible || (!content && !children)) return null;

  // 3. 统一解析 9 点对齐与布局适应
  const finalStyle = resolveDockingStyle(style, overrides);

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
