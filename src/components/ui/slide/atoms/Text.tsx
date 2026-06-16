import React from 'react';
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
 * Text Atomic Component - 纯展示性文本组件
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

  const sanitizedContent = React.useMemo(() => {
    if (!sanitize || !textContent) return undefined;
    return DOMPurify.sanitize(textContent, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'span'],
      ALLOWED_ATTR: ['style', 'class']
    });
  }, [textContent, sanitize]);

  React.useEffect(() => {
    if (!sanitize && textContent) {
      console.warn('[Text] Rendering with sanitize=false — potential XSS risk');
    }
  }, [sanitize, textContent]);

  if (autoFit && !children) {
    return (
      <AutoFitHeadline
        text={textContent}
        maxSize={maxSize}
        minSize={minSize}
        lineHeight={lineHeight}
        maxLines={maxLines}
        fontFamily={style.fontFamily}
        className={className}
        style={{
          ...style,
          textWrap: style.transform?.includes('rotate') ? 'nowrap' : (textContent.includes('\n') ? 'unset' : 'balance')
        }}
      />
    );
  }

  return (
    <Component 
      className={className} 
      style={{
        ...style,
        textWrap: style.transform?.includes('rotate') ? 'nowrap' : (textContent.includes('\n') ? 'unset' : 'balance')
      }}
      dangerouslySetInnerHTML={sanitize ? { __html: sanitizedContent } : undefined}
    >
      {!sanitize ? children || textContent : undefined}
    </Component>
  );
};
