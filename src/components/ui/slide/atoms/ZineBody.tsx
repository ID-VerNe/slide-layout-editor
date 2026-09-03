import React from 'react';
import { DesignSystem, PageData, ProjectTheme, TypographySettings } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle, resolveDockingStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';
import { Text } from './Text';

interface ZineBodyProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
  dropCap?: boolean;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  typography?: TypographySettings;
  [key: string]: any;
}

/**
 * ZineBody - 正文族原子组件
 * 严格遵循 24 格物理隔离与 Token 解析，接入 useDataConnector 与首字下沉保护
 */
export const ZineBody: React.FC<ZineBodyProps> = ({
  page,
  fieldKey, 
  text,
  color = 'primary',
  className = '',
  style: customStyle,
  dropCap = false,
  designSystem: propsDs,
  theme: propsTheme,
  typography: propsTypography,
  ...otherProps
}) => {
  const storeDs = useStore(s => s.designSystem);
  const ds = propsDs || storeDs;

  // 1. 统一提取数据连接与可见性状态
  const defaultFallback = text || (fieldKey ? (page as any)[fieldKey] : page.paragraph);
  const { content, overrides, isVisible } = useDataConnector(fieldKey, page, defaultFallback);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { 
      color: (ds.tokens.colors as any)?.[color as string] || color,
      ...otherProps
    },
    variant: 'body',
    customStyle,
    className
  });

  // 2. 可见性与内容检查
  if (!isVisible || !content) return null;

  // 3. 统一解析 9 点对齐与布局适应
  const finalStyle = resolveDockingStyle(style, overrides);

  if (dropCap) {
    const accentColor = ds.tokens.colors.accent || '#264376';
    return (
      <div className={`zine-body whitespace-pre-line relative overflow-hidden ${resolvedClassName}`} style={finalStyle}>
        <span
          className="float-left font-black select-none mr-4 leading-none"
          style={{
            fontSize: '4rem',
            marginTop: '0.2rem',
            color: accentColor
          }}
        >
          {content.charAt(0)}
        </span>
        <Text content={content.slice(1)} sanitize={true} />
      </div>
    );
  }

  return (
    <Text
      content={content}
      className={`zine-body whitespace-pre-line ${resolvedClassName}`}
      style={finalStyle}
    />
  );
};

export default ZineBody;
