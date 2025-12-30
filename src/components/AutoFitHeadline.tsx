import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

interface AutoFitHeadlineProps {
  text: string;
  maxSize: number;
  lineHeight: number;
  fontFamily: string;
  className: string;
  maxLines: number;
  minSize?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  style?: React.CSSProperties; // 支持样式透传
}

const AutoFitHeadline: React.FC<AutoFitHeadlineProps> = ({ 
  text, 
  maxSize, 
  lineHeight, 
  fontFamily, 
  className, 
  maxLines, 
  minSize = 8,
  as: Tag = 'h1',
  style = {}
}) => {
  const [fontSize, setFontSize] = useState(maxSize);
  const [debouncedText, setDebouncedText] = useState(text);
  const [isCalculating, setIsCalculating] = useState(true);
  const [version, setVersion] = useState(0);
  const ref = useRef<HTMLHeadingElement>(null);

  // 防抖处理：只有停止输入 300ms 后才更新用于计算的文本
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);

  useLayoutEffect(() => {
    setIsCalculating(true);
    setFontSize(maxSize);
  }, [debouncedText, maxSize, fontFamily, maxLines, style.fontWeight, style.fontStyle]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkAndScale = () => {
      const maxHeight = fontSize * lineHeight * maxLines; 
      if (el.scrollHeight > maxHeight + 1 && fontSize > minSize) {
        const ratio = maxHeight / el.scrollHeight;
        if (ratio < 0.95) {
          setFontSize(prev => Math.max(minSize, Math.floor(prev * ratio)));
        } else {
          setFontSize(prev => prev - 1);
        }
      } else {
        setIsCalculating(false);
      }
    };
    checkAndScale();
  }, [debouncedText, fontSize, lineHeight, maxLines, minSize, version]);

  useEffect(() => {
    if (document.fonts) document.fonts.ready.then(() => setVersion(v => v + 1));
    const observer = new ResizeObserver(() => setVersion(v => v + 1));
    if (ref.current) observer.observe(ref.current);
    const timeout = setTimeout(() => setVersion(v => v + 1), 500);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [text]);

  return (
    <Tag 
      ref={ref}
      className={className}
      style={{ 
        ...style,
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        display: 'block',
        overflowWrap: 'break-word',
        wordBreak: 'normal',
        whiteSpace: 'pre-line', // 核心修复：支持手动回车换行
        textWrap: text.includes('\n') ? 'unset' : 'balance', // 如果有手动换行，则不启用智能平衡
        visibility: isCalculating && text ? 'hidden' : 'visible'
      }}
    >
      {text}
    </Tag>
  );
};

export default AutoFitHeadline;