import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ImageConfig } from '../../../../types';
import { calculateCoverBounds, resolveSafePanOffset } from '../../../../utils/imageGeometry';

export type { ImageConfig };

interface ImageProps {
  url?: string;
  srcSet?: string;
  variants?: any;
  lqip?: string;
  config?: ImageConfig;
  isLoading?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  onLoad?: () => void;
}

/**
 * Image Atomic Component - 纯展示性图片组件
 */
export const Image: React.FC<ImageProps> = ({
  url,
  srcSet,
  variants,
  lqip,
  config = { scale: 1, x: 0, y: 0 },
  isLoading = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
  imgClassName = "",
  style,
  aspectRatio,
  onLoad
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLqip, setShowLqip] = useState(true);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lqipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const scheduleHideLqip = useCallback(() => {
    if (lqipTimerRef.current) clearTimeout(lqipTimerRef.current);
    lqipTimerRef.current = setTimeout(() => setShowLqip(false), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (lqipTimerRef.current) clearTimeout(lqipTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    setShowLqip(true);
    if (lqipTimerRef.current) clearTimeout(lqipTimerRef.current);
  }, [url]);

  // 测量容器尺寸用于亚像素级平移边界计算
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  // 检查缓存图片是否已经加载完成
  useEffect(() => {
    if (imgRef && imgRef.complete && imgRef.naturalWidth > 0) {
      setIsLoaded(true);
      scheduleHideLqip();
      onLoad?.();
    }
  }, [imgRef, onLoad, scheduleHideLqip]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.complete) {
      setIsLoaded(true);
      scheduleHideLqip();
      onLoad?.();
    }
  }, [onLoad, scheduleHideLqip]);

  const { 
    objectFit: styleObjectFit, 
    objectPosition: styleObjectPosition, 
    overflow: styleOverflow,
    ...remainingStyle 
  } = (style || {}) as any;

  const isContain = styleObjectFit === 'contain';

  // 1. 缩放与平移变换安全计算 (接入 imageGeometry 纯数学模型)
  const { shiftX, shiftY, safeScale, isPixelUnit } = useMemo(() => {
    if (isContain) {
      const minScale = 0.05;
      const s = Math.max(minScale, config.scale !== undefined ? config.scale : 1);
      return {
        shiftX: (config.x || 0) * 0.5,
        shiftY: (config.y || 0) * 0.5,
        safeScale: s,
        isPixelUnit: false,
      };
    }

    const scale = Math.max(1, config.scale !== undefined ? config.scale : 1);
    const cW = containerSize.width;
    const cH = containerSize.height;
    const nW = imgRef?.naturalWidth || 0;
    const nH = imgRef?.naturalHeight || 0;

    if (cW > 0 && cH > 0 && nW > 0 && nH > 0) {
      const bounds = calculateCoverBounds(cW, cH, nW, nH, scale);
      const offset = resolveSafePanOffset(config.x || 0, config.y || 0, bounds);
      return {
        shiftX: offset.shiftX,
        shiftY: offset.shiftY,
        safeScale: scale,
        isPixelUnit: true,
      };
    }

    return {
      shiftX: 0,
      shiftY: 0,
      safeScale: scale,
      isPixelUnit: true,
    };
  }, [isContain, config.scale, config.x, config.y, containerSize.width, containerSize.height, imgRef?.naturalWidth, imgRef?.naturalHeight]);

  const containerStyle = useMemo(() => ({
    overflow: styleOverflow || (isContain ? 'visible' : 'hidden'),
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio,
    ...remainingStyle
  }), [aspectRatio, remainingStyle, styleOverflow, isContain]);

  const imageStyle = useMemo(() => ({
    transform: isPixelUnit
      ? `translate(${shiftX}px, ${shiftY}px) scale(${safeScale})`
      : `translate(${shiftX}%, ${shiftY}%) scale(${safeScale})`,
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    objectFit: styleObjectFit || 'cover',
    objectPosition: styleObjectPosition || 'center center'
  }), [isPixelUnit, shiftX, shiftY, safeScale, styleObjectFit, styleObjectPosition]);

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {/* LQIP Placeholder */}
      {lqip && showLqip && (
        <img
          src={lqip}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ ...imageStyle, filter: 'blur(10px)' }}
          alt=""
        />
      )}
      
      {url && (
        <picture className="w-full h-full block">
          {variants?.webp && (
            <source srcSet={variants.webp.srcSet} type="image/webp" sizes={sizes} />
          )}
          {variants?.avif && (
            <source srcSet={variants.avif.srcSet} type="image/avif" sizes={sizes} />
          )}
          <img 
            ref={setImgRef}
            src={url} 
            srcSet={srcSet}
            sizes={sizes}
            crossOrigin={url?.startsWith('http') ? 'anonymous' : undefined}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`transition-all duration-300 ease-out ${imgClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            onLoad={handleLoad}
            onError={() => setIsLoaded(true)}
          />
        </picture>
      )}
      
      {/* Loading state */}
      {isLoading && !lqip && (
        <div className="absolute inset-0 bg-zine-accent/5 animate-pulse flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-2 border-zine-accent/20 border-t-zine-accent animate-spin" />
        </div>
      )}
    </div>
  );
};
