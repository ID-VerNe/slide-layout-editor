import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { useModularStyle, resolveDockingStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';
import { Text } from './Text';
import { getPageField } from '../../../../utils/pageField';

interface ZineTextAtomProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  /** 未提供 text/fieldKey 时回退到的页面字段名 */
  defaultFallbackKey?: 'title' | 'paragraph';
  /** 文本族,决定排版 Token 解析分支 */
  variant: 'display' | 'body' | 'caption';
  /** 默认颜色 Token 名,解析失败时原样透传 */
  defaultColorToken?: string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  /** 语义标签,如 h1 / div */
  as?: React.ElementType;
  /** className 前缀,承载 zine-display / zine-body / zine-caption 等语义类 */
  baseClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 首字下沉,仅 ZineBody 启用 */
  dropCap?: boolean;
  /** 显式子节点,仅 ZineDisplay 启用,存在时放宽空内容守卫 */
  children?: React.ReactNode;
  /** 由 componentRenderer 注入,本组件直连消费不再订 store */
  designSystem: DesignSystem;
  theme: ProjectTheme;
  /** 仅为契合 componentRenderer 统一传参约定,本组件不消费 */
  typography?: TypographySettings;
  [key: string]: unknown;
}

/**
 * 文本原子基类,统一数据连接、模块化样式与对齐解析
 * 三类文本原子的 6 步骤在此单一真源,差异点全部参数化
 */
export const ZineTextAtom: React.FC<ZineTextAtomProps> = ({
  page,
  fieldKey,
  text,
  defaultFallbackKey,
  variant,
  defaultColorToken = 'primary',
  orientation = 'horizontal',
  as: Component = 'div',
  baseClassName = '',
  className = '',
  style: customStyle,
  dropCap = false,
  children,
  designSystem: ds,
  theme,
  // typography 仅为契合注册表统一传参约定,本组件不消费
  typography: _typography,
  ...otherProps
}) => {
  // 1. 统一提取数据连接与可见性状态
  const fieldFallback = fieldKey ? getPageField<string>(page, fieldKey, '') : undefined;
  const defaultFallback = text || fieldFallback || (defaultFallbackKey ? getPageField<string>(page, defaultFallbackKey, '') : undefined);
  const { content, overrides, isVisible } = useDataConnector<string>(fieldKey, page, defaultFallback);

  const { style, className: resolvedClassName } = useModularStyle({
    designSystem: ds,
    theme,
    page,
    fieldKey,
    props: {
      color: (ds?.tokens?.colors as Record<string, string> | undefined)?.[defaultColorToken] || defaultColorToken,
      ...otherProps
    },
    variant,
    orientation: orientation as 'horizontal' | 'vertical-stack' | 'vertical-rotate',
    customStyle,
    className
  });

  // 2. 可见性与内容检查:有子节点时放宽空内容守卫
  if (!isVisible || (!content && !children)) return null;

  // 3. 统一解析 9 点对齐与布局适应
  const finalStyle = resolveDockingStyle(style, overrides);

  // 4. 首字下沉排版分支:独立浮动放大首字母,仅字符串内容生效
  if (dropCap && typeof content === 'string' && content.length > 0) {
    const accentColor = ds?.tokens?.colors?.accent || '#264376';
    return (
      <Component
        className={`${baseClassName} whitespace-pre-line relative overflow-hidden ${resolvedClassName}`}
        style={finalStyle}
      >
        <span
          className="float-left font-black select-none mr-4 leading-none"
          style={{ fontSize: '4rem', marginTop: '0.2rem', color: accentColor }}
        >
          {content.charAt(0)}
        </span>
        <Text content={content.slice(1)} sanitize={true} />
      </Component>
    );
  }

  return (
    <Text
      as={Component}
      content={content}
      className={`${baseClassName} whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    >
      {children}
    </Text>
  );
};
