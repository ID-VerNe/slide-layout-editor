import React, { useRef, useState, useLayoutEffect, useEffect, useMemo } from 'react';

interface AutoFitHeadlineProps {
  text: string;
  maxSize: number;
  lineHeight: number;
  fontFamily: string;
  className?: string;
  maxLines: number;
  minSize?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  style?: React.CSSProperties; 
  children?: React.ReactNode; 
}

import { LRUCache } from '../utils/lruCache';
import { calculateFontSizeWithWorker, resetFontCalculatorWorker } from '../workers/fontCalculatorManager';

// 缓存计算结果
const fontCache = new LRUCache<string, number>(500);

const setCache = (key: string, val: number) => {
  fontCache.set(key, val);
};

const getCacheKey = (text: string, maxSize: number, fontFamily: string, maxLines: number, minSize: number, containerWidth?: number) => {
  // 容器宽度按 20px 分桶以复用近似视口计算
  const widthBucket = containerWidth ? Math.round(containerWidth / 20) * 20 : 0;
  return `${text}-${maxSize}-${fontFamily}-${maxLines}-${minSize}-w${widthBucket}`;
};

/**
 * 字体大小自适应标题组件
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
  const ref = useRef<HTMLHeadingElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    if (ref.current) {
      const width = ref.current.offsetWidth;
      if (width > 0 && Math.abs(width - containerWidth) > 10) {
        setContainerWidth(width);
      }
    }
  }, [text, containerWidth]);

  const cacheKey = useMemo(() => 
    getCacheKey(text, maxSize, fontFamily, maxLines, minSize, containerWidth),
    [text, maxSize, fontFamily, maxLines, minSize, containerWidth]
  );

  const cachedFontSize = useMemo(() => fontCache.get(cacheKey), [cacheKey]);

  const [fontSize, setFontSize] = useState(cachedFontSize || maxSize);
  const [range, setRange] = useState({ min: minSize, max: maxSize });
  const [isCalculating, setIsCalculating] = useState(!cachedFontSize);
  const [retryCount, setRetryCount] = useState(0); 

  // 1. 关键属性改变时优先尝试预计算
  useLayoutEffect(() => {
    if (cachedFontSize) {
      setFontSize(cachedFontSize);
      setIsCalculating(false);
      return;
    }

    let isCancelled = false;
    const currentWidth = ref.current?.offsetWidth || 800;

    calculateFontSizeWithWorker({
      text,
      maxSize,
      lineHeight,
      maxLines,
      minSize,
      containerWidth: currentWidth,
    }).then((estimatedSize) => {
      if (isCancelled) return;
      setFontSize(estimatedSize);
      setRange({ min: minSize, max: estimatedSize + 2 });
      setIsCalculating(true);
    }).catch(() => {
      if (isCancelled) return;
      setIsCalculating(true);
      setRetryCount(0);
      setRange({ min: minSize, max: maxSize });
      setFontSize(maxSize);
    });

    return () => {
      isCancelled = true;
    };
  }, [cacheKey, cachedFontSize, maxSize, minSize, lineHeight, maxLines, text]);

  // 2. 递归缩放算法
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isCalculating) return;

    if (retryCount > 12) { 
      setIsCalculating(false);
      return;
    }

    const frameId = requestAnimationFrame(() => {
      const maxHeight = Math.floor(fontSize * lineHeight * maxLines) + 2;
      const isOverflowing = el.scrollHeight > maxHeight;

      if (isOverflowing) {
        const newMax = fontSize - 1;
        if (newMax <= range.min) {
          // 已经收敛到最小可用字号时回退到下限并结束
          setFontSize(range.min);
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
    });

    return () => cancelAnimationFrame(frameId);
  }, [fontSize, isCalculating, range, retryCount, lineHeight, maxLines, text]);

  // 缓存计算结果
  useEffect(() => {
    if (!isCalculating && !cachedFontSize) {
      setCache(cacheKey, fontSize);
    }
  }, [isCalculating, fontSize, cacheKey, cachedFontSize]);

  // 3. 字体加载保障
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (cachedFontSize) return;
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      }).catch(() => {
        // Font loading failed — recalculate with default sizing
        if (cachedFontSize) return;
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      });
    }
  }, [fontFamily, maxSize, cachedFontSize]);

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
        opacity: isCalculating && !cachedFontSize ? 0.95 : 1,
        transition: 'opacity 0.15s ease-out'
      }}
    >
      {children || text}
    </Tag>
  );
};

export const resetAutoFitCache = () => {
  fontCache.clear();
  resetFontCalculatorWorker();
};

export default AutoFitHeadline;