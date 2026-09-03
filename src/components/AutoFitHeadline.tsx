import React, { useRef, useState, useLayoutEffect, useEffect, useMemo } from 'react';

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

import { LRUCache } from '../utils/lruCache';

// 缓存系统 (复用通用 LRUCache)
const fontCache = new LRUCache<string, number>(500);

const setCache = (key: string, val: number) => {
  fontCache.set(key, val);
};

const getCacheKey = (text: string, maxSize: number, fontFamily: string, maxLines: number, minSize: number, containerWidth?: number) => {
  // 容器宽度按 20px 分桶，既能复用相似宽度计算，又能避免横竖屏或缩略图跨视口复用错误
  const widthBucket = containerWidth ? Math.round(containerWidth / 20) * 20 : 0;
  return `${text}-${maxSize}-${fontFamily}-${maxLines}-${minSize}-w${widthBucket}`;
};

/**
 * AutoFitHeadline - 极致稳定性能优化版 (Worker 集成)
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
  const workerRef = useRef<Worker | null>(null);

  // 初始化 Worker
  useEffect(() => {
    // Vite 模式下的 Worker 加载方式
    try {
      workerRef.current = new Worker(new URL('../workers/fontCalculator.ts', import.meta.url), {
        type: 'module'
      });
      workerRef.current.onerror = (e) => {
        console.error('Worker error:', e);
        workerRef.current?.terminate();
        workerRef.current = null;
        // Worker failed — fall back to main-thread calculation
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      };
    } catch (e) {
      console.error('Failed to initialize font calculator worker', e);
      // Worker init failed — fall back to main-thread calculation
      setIsCalculating(true);
      setRetryCount(0);
      setFontSize(maxSize);
    }
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 1. 关键属性改变时，优先尝试 Worker 预计算
  useLayoutEffect(() => {
    if (cachedFontSize) {
      setFontSize(cachedFontSize);
      setIsCalculating(false);
      return;
    }

    if (workerRef.current && ref.current) {
      const containerWidth = ref.current.offsetWidth || 800; // 兜底宽度
      
      workerRef.current.postMessage({
        text,
        maxSize,
        lineHeight,
        maxLines,
        minSize,
        containerWidth
      });

      workerRef.current.onmessage = (e) => {
        setFontSize(e.data.fontSize);
        setRange({ min: minSize, max: e.data.fontSize + 2 }); // 缩小搜索范围
        setIsCalculating(true); // 让 useLayoutEffect 进行最终精确校准
      };
    } else {
      setIsCalculating(true);
      setRetryCount(0);
      setRange({ min: minSize, max: maxSize });
      setFontSize(maxSize);
    }
  }, [cacheKey, cachedFontSize, maxSize, minSize, lineHeight, maxLines, text]);

  // 2. 递归缩放算法 (最终精确校准)
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
          // 已经收敛到最小可用字号，回退到 range.min 后结束
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
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      }).catch(() => {
        // Font loading failed — recalculate with default sizing
        setIsCalculating(true);
        setRetryCount(0);
        setFontSize(maxSize);
      });
    }
  }, [fontFamily, maxSize]);

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

export const resetAutoFitCache = () => fontCache.clear();

export default AutoFitHeadline;