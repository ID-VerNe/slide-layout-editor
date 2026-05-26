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

  const finalStyle: React.CSSProperties = {
    // 默认占据 100%（针对多行文本，对齐更多作用于块本身）
    width: style.width || (style.justifySelf ? undefined : '100%'),
    ...style,
  };

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
