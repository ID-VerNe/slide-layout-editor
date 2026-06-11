import React, { useState, useEffect, useCallback, useMemo } from 'react';

export interface ImageConfig {
  scale: number;
  x: number;
  y: number;
}

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

  // 修复：检查缓存图片是否已经加载完成
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

  const posX = (config.x + 100) / 2;
  const posY = (config.y + 100) / 2;

  const containerStyle = useMemo(() => ({
    overflow: 'hidden',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio,
    ...style
  }), [aspectRatio, style]);

  const imageStyle = useMemo(() => ({
    transform: `scale(${config.scale})`,
    objectPosition: `${posX}% ${posY}%`,
    transformOrigin: `${posX}% ${posY}%`,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  }), [config.scale, posX, posY]);

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
            crossOrigin="anonymous"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`transition-all duration-300 ease-out ${imgClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            onLoad={handleLoad}
          />
        </picture>
      )}
      
      {/* Loading state */}
      {isLoading && !lqip && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
        </div>
      )}
    </div>
  );
};
