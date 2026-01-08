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
  style?: React.CSSProperties; 
  children?: React.ReactNode; 
}

/**
 * AutoFitHeadline - 极致稳定版
 * 核心设计：移除自动 ResizeObserver，改用基于关键属性变化的单次计算流。
 */
const AutoFitHeadline: React.FC<AutoFitHeadlineProps> = ({ 
  text, 
  maxSize, 
  lineHeight, 
  fontFamily, 
  className, 
  maxLines, 
  minSize = 8,
  as: Tag = 'h1',
  style = {},
  children
}) => {
  const [fontSize, setFontSize] = useState(maxSize);
  const [range, setRange] = useState({ min: minSize, max: maxSize });
  const [isCalculating, setIsCalculating] = useState(true);
  const [retryCount, setRetryCount] = useState(0); 
  const ref = useRef<HTMLHeadingElement>(null);

  // 1. 只有在关键属性改变时才重置计算
  useLayoutEffect(() => {
    setIsCalculating(true);
    setRetryCount(0);
    setRange({ min: minSize, max: maxSize });
    setFontSize(maxSize);
  }, [text, maxSize, fontFamily, maxLines, minSize]);

  // 2. 递归缩放算法 (纯同步/微任务模式，防止渲染抖动)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isCalculating) return;

    // 严格限制重试次数，防止 OOM
    if (retryCount > 12) { 
      setIsCalculating(false);
      return;
    }

    const maxHeight = Math.floor(fontSize * lineHeight * maxLines) + 2;
    const isOverflowing = el.scrollHeight > maxHeight;

    if (isOverflowing) {
      const newMax = fontSize - 1;
      if (newMax <= range.min) {
        setIsCalculating(false);
      } else {
        const nextSize = Math.floor((range.min + newMax) / 2);
        setRange(prev => ({ ...prev, max: newMax }));
        setFontSize(nextSize);
        setRetryCount(prev => prev + 1);
      }
    } else {
      const newMin = fontSize + 1;
      if (newMin > range.max) {
        setIsCalculating(false);
      } else {
        const nextSize = Math.ceil((newMin + range.max) / 2);
        if (nextSize === fontSize) {
          setIsCalculating(false);
          return;
        }
        setRange(prev => ({ ...prev, min: newMin }));
        setFontSize(nextSize);
        setRetryCount(prev => prev + 1);
      }
    }
  }, [fontSize, isCalculating, range, retryCount, lineHeight, maxLines, text]);

  // 3. 字体加载保障
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      });
    }
  }, [fontFamily]);

  return (
    <Tag 
      ref={ref}
      className={className}
      style={{
        display: 'block',
        overflowWrap: 'break-word',
        wordBreak: 'break-all',
        whiteSpace: 'pre-line',
        textWrap: text.includes('\n') ? 'unset' : 'balance',
        ...style,
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        opacity: isCalculating ? 0.01 : 1, // 计算中渐隐，计算完显示
        transition: 'opacity 0.15s ease-out'
      }}
    >
      {children || text}
    </Tag>
  );
};

export default AutoFitHeadline;
