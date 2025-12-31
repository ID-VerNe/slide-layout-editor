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
  const [range, setRange] = useState({ min: minSize, max: maxSize });
  const [debouncedText, setDebouncedText] = useState(text);
  const [isCalculating, setIsCalculating] = useState(true);
  const [retryCount, setRetryCount] = useState(0); 
  const [version, setVersion] = useState(0);
  const ref = useRef<HTMLHeadingElement>(null);

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);

  useLayoutEffect(() => {
    setIsCalculating(true);
    setRetryCount(0);
    setRange({ min: minSize, max: maxSize });
    setFontSize(maxSize);
  }, [debouncedText, maxSize, fontFamily, maxLines, style.fontWeight, style.fontStyle, minSize]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isCalculating) return;

    const maxHeight = fontSize * lineHeight * maxLines;
    const isOverflowing = el.scrollHeight > maxHeight + 2;

    if (retryCount > 20) { // 二分法通常 7-10 次即可完成，20 次足够安全
      setIsCalculating(false);
      return;
    }

    if (isOverflowing) {
      // 溢出，缩小范围
      const newMax = fontSize - 1;
      if (newMax < range.min) {
        setIsCalculating(false);
      } else {
        const nextSize = Math.floor((range.min + newMax) / 2);
        setRange(prev => ({ ...prev, max: newMax }));
        setFontSize(nextSize);
        setRetryCount(prev => prev + 1);
      }
    } else {
      // 不溢出，尝试增大以寻找边界
      const newMin = fontSize + 1;
      if (newMin > range.max) {
        setIsCalculating(false);
      } else {
        const nextSize = Math.ceil((newMin + range.max) / 2);
        setRange(prev => ({ ...prev, min: newMin }));
        setFontSize(nextSize);
        setRetryCount(prev => prev + 1);
      }
    }
  }, [debouncedText, fontSize, isCalculating, range, retryCount, lineHeight, maxLines]);

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