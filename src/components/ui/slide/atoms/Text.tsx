import React, { useMemo, useEffect } from 'react';
import DOMPurify from 'dompurify';
import AutoFitHeadline from '../../../AutoFitHeadline';

interface TextProps {
  content?: string;
  variant?: 'display' | 'body' | 'caption';
  autoFit?: boolean;
  maxSize?: number;
  minSize?: number;
  maxLines?: number;
  lineHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  as?: React.ElementType;
  sanitize?: boolean;
}

/**
 * Text Atomic Component - 纯展示性文本基石组件
 * 强制注入 24 格物理隔离安全断词与盒模型约束，绝不撑破网格
 */
export const Text: React.FC<TextProps> = ({
  content,
  autoFit = false,
  maxSize = 84,
  minSize = 12,
  maxLines = 10,
  lineHeight = 1.2,
  className = '',
  style = {} as React.CSSProperties,
  children,
  as: Component = 'div',
  sanitize = true
}) => {
  const textContent = content || (typeof children === 'string' ? children : '');

  const sanitizedContent = useMemo(() => {
    if (!sanitize || !textContent) return undefined;
    return DOMPurify.sanitize(textContent, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'span'],
      ALLOWED_ATTR: ['style', 'class']
    });
  }, [textContent, sanitize]);

  useEffect(() => {
    if (!sanitize && textContent) {
      console.warn('[Text] Rendering with sanitize=false — potential XSS risk');
    }
  }, [sanitize, textContent]);

  // 物理封闭与智能排版安全样式
  const computedStyle: React.CSSProperties = useMemo(() => {
    const isRotated = style.transform?.includes('rotate');
    const defaultWrap = isRotated ? 'nowrap' : (textContent.includes('\n') ? 'unset' : 'balance');

    return {
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      boxSizing: 'border-box',
      textWrap: (style as any).textWrap || defaultWrap,
      ...style,
    };
  }, [style, textContent]);

  if (autoFit && !children) {
    return (
      <AutoFitHeadline
        text={textContent}
        maxSize={maxSize}
        minSize={minSize}
        lineHeight={lineHeight}
        maxLines={maxLines}
        fontFamily={computedStyle.fontFamily}
        className={className}
        style={computedStyle}
      />
    );
  }

  return (
    <Component 
      className={className} 
      style={computedStyle}
      dangerouslySetInnerHTML={sanitize ? { __html: sanitizedContent } : undefined}
    >
      {!sanitize ? children || textContent : undefined}
    </Component>
  );
};
