import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ImageConfig } from '../../../../types';

import { logger } from '../../../../utils/logger';

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

  useEffect(() => {
    setIsLoaded(false);
    setShowLqip(true);
  }, [url]);

  // 检查缓存图片是否已经加载完成
  useEffect(() => {
    if (imgRef && imgRef.complete && imgRef.naturalWidth > 0) {
      setIsLoaded(true);
      setTimeout(() => setShowLqip(false), 300);
      onLoad?.();
    }
  }, [imgRef, onLoad]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.complete) {
      setIsLoaded(true);
      setTimeout(() => setShowLqip(false), 300);
      onLoad?.();
    }
  }, [onLoad]);

  const { 
    objectFit: styleObjectFit, 
    objectPosition: styleObjectPosition, 
    overflow: styleOverflow,
    ...remainingStyle 
  } = (style || {}) as any;

  const isContain = styleObjectFit === 'contain';

  // 1. 缩放范围安全控制：
  // 包含模式（如签名、Logo等独立资产）允许缩小至 0.05
  // 裁切模式（Cover 满幅照片）最小保持 1（避免露出画框白边）
  const minScale = isContain ? 0.05 : 1;
  const safeScale = Math.max(minScale, config.scale !== undefined ? config.scale : 1);

  // 2. 平移变换：以中心为基准进行平滑 translate 平移
  const translateX = (config.x || 0) * 0.5;
  const translateY = (config.y || 0) * 0.5;

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
    transform: `translate(${translateX}%, ${translateY}%) scale(${safeScale})`,
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    objectFit: styleObjectFit || 'cover',
    objectPosition: styleObjectPosition || 'center center'
  }), [translateX, translateY, safeScale, styleObjectFit, styleObjectPosition]);

  return (
    <div className={className} style={containerStyle}>
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
