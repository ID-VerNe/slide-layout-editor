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
 * AutoFitHeadline
 * 稳定版：修复因观察自身导致的死循环，解决空心字消失/淡化问题。
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
  const [parentVersion, setParentVersion] = useState(0); // 仅观察父容器
  const ref = useRef<HTMLHeadingElement>(null);

  // 1. 只有在关键属性改变时才重置计算
  useLayoutEffect(() => {
    setIsCalculating(true);
    setRetryCount(0);
    setRange({ min: minSize, max: maxSize });
    setFontSize(maxSize);
  }, [text, maxSize, fontFamily, maxLines, minSize, parentVersion]);

  // 2. 递归缩放算法
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isCalculating) return;

    // 增加高度余量，防止浮点误差
    const maxHeight = Math.floor(fontSize * lineHeight * maxLines) + 4;
    const isOverflowing = el.scrollHeight > maxHeight;

    if (retryCount > 15) { 
      setIsCalculating(false);
      return;
    }

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

  // 3. 核心修复：观察父容器而非自身，防止死循环
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setParentVersion(v => v + 1));
    }
    
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      // 只有父容器宽度变化才重置
      setParentVersion(v => v + 1);
    });
    
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

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
        ...style, // 外部传入的 style (包含描边) 必须放在后面以防被覆盖
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        // 计算中给极低不透明度，计算完立即恢复
        opacity: isCalculating ? 0.01 : 1,
        transition: 'opacity 0.2s ease-out'
      }}
    >
      {children || text}
    </Tag>
  );
};

export default AutoFitHeadline;