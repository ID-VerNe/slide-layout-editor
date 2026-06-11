import React from 'react';
import { DesignSystem, PageData } from '../../../../types';
import { useStore } from '../../../../store/useStore';
import { useModularStyle } from '../hooks/useModularStyle';
import { Text } from './Text';

interface ZineBodyProps {
  page: PageData;
  fieldKey?: string; 
  text?: string;
  color?: keyof DesignSystem['tokens']['colors'] | string;
  className?: string;
  style?: React.CSSProperties;
  dropCap?: boolean;
  [key: string]: any;
}

/**
 * ZineBody - 已重构：使用 Atomic Text 组件与 Modular Hooks
 */
export const ZineBody: React.FC<ZineBodyProps> = ({
  page,
  fieldKey, 
  text,
  color = 'primary',
  className = '',
  style: customStyle,
  dropCap = false,
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
    variant: 'body',
    customStyle,
    className
  });

  // 1. 可见性检查
  const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
  if (!isVisible) return null;

  const content = text || (fieldKey ? (page as any)[fieldKey] : page.paragraph);
  if (!content) return null;

  // 检查是否有用户手动设置的 Grid 对齐（通过 styleOverrides）
  const hasManualAlignment = fieldKey && page.styleOverrides?.[fieldKey] && 
    (page.styleOverrides[fieldKey].alignSelf !== undefined || 
     page.styleOverrides[fieldKey].justifySelf !== undefined);

  // 修复：父容器是 Flexbox(column) 时，对齐属性的映射
  // Flexbox(column): alignSelf=水平, justifySelf不生效
  // 9-Point UI 语义: alignSelf=垂直, justifySelf=水平
  // 解决方案：交换它们
  const finalStyle: React.CSSProperties = { ...style };
  
  if (hasManualAlignment && fieldKey) {
    const overrides = page.styleOverrides[fieldKey];
    // 交换：用户的 justifySelf（水平意图）→ 实际的 alignSelf（Flexbox 交叉轴=水平）
    //      用户的 alignSelf（垂直意图）→ 通过 margin 实现
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
    
    // 移除从 style 继承的错误 alignSelf/justifySelf
    delete finalStyle.justifySelf;
  }
  
  finalStyle.width = style.width || (hasManualAlignment ? undefined : '100%');

  if (dropCap) {
    return (
      <div className={`zine-body whitespace-pre-line ${resolvedClassName}`} style={finalStyle}>
        <div className="relative">
          <span
            className="float-left font-black select-none mr-4"
            style={{
              fontSize: '4.2rem',
              lineHeight: '0.8',
              marginTop: '0.45rem',
              color: ds.tokens.colors.accent
            }}
          >
            {content.charAt(0)}
          </span>
          <Text content={content.slice(1)} sanitize={true} />
        </div>
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
