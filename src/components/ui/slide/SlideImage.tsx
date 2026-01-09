import React, { useState, useEffect } from 'react';
import { PageData } from '../../../types';
import { useAssetUrl } from '../../../hooks/useAssetUrl';
import { useResponsiveImage } from '../../../hooks/useResponsiveImage';
import { generateLQIP } from '../../../utils/lqip';

interface ImageConfig {
  scale: number;
  x: number;
  y: number;
}

interface SlideImageProps {
  page: PageData;
  src?: string;
  config?: ImageConfig;
  className?: string;
  imgClassName?: string;
  rounded?: string;
  border?: string;
  shadow?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}

/**
 * SlideImage 优化版
 * 核心升级：支持响应式图片、渐进式加载 (LQIP) 和加载优先级。
 */
export const SlideImage: React.FC<SlideImageProps> = ({ 
  page, 
  src: overrideSrc,
  config: overrideConfig,
  className = "", 
  imgClassName = "",
  rounded,
  border,
  shadow,
  backgroundColor,
  style,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw"
}) => {
  const isVisible = page.visibility?.image !== false;
  const rawSrc = overrideSrc || page.image || `${import.meta.env.BASE_URL}/example_pic/example_pic_1.png`;
  
  const { url, isLoading: isAssetLoading } = useAssetUrl(rawSrc);
  const { srcSet, variants } = useResponsiveImage(rawSrc, { priority, sizes });
  
  const [lqip, setLqip] = useState<string | undefined>(undefined);
  const [showLqip, setShowLqip] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (url && !priority && !isLoaded) {
      generateLQIP(url).then(setLqip).catch(console.error);
    }
  }, [url, priority, isLoaded]);

  if (!isVisible) return null;

  const config = overrideConfig || page.imageConfig || { scale: 1, x: 0, y: 0 };
  const posX = (config.x + 100) / 2;
  const posY = (config.y + 100) / 2;

  const containerStyle: React.CSSProperties = {
    borderRadius: rounded || '0.125rem',
    border: border || 'none',
    boxShadow: shadow || 'none',
    overflow: 'hidden',
    backgroundColor: backgroundColor || '#000000', 
    ...style
  };

  const imageStyle: React.CSSProperties = {
    transform: `scale(${config.scale})`,
    objectPosition: `${posX}% ${posY}%`,
    transformOrigin: `${posX}% ${posY}%`
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={containerStyle}>
      {/* LQIP 占位图 */}
      {lqip && showLqip && (
        <img
          src={lqip}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ ...imageStyle, filter: 'blur(10px)' }}
          alt="Loading Placeholder"
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
            src={url} 
            srcSet={srcSet}
            sizes={sizes}
            crossOrigin="anonymous"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-300 ease-out ${imgClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            onLoad={(e) => {
                if (e.currentTarget.complete) {
                  setIsLoaded(true);
                  setTimeout(() => setShowLqip(false), 300);
                }
            }}
          />
        </picture>
      )}
      
      {/* 基础 Loading 动画（仅在没有 LQIP 且加载中时显示） */}
      {isAssetLoading && !lqip && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-2 border-[#264376]/20 border-t-[#264376] animate-spin" />
        </div>
      )}
    </div>
  );
};
