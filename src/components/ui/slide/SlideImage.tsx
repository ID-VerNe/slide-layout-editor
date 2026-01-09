import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
 * 核心升级：支持响应式图片、渐进式加载 (LQIP)、布局抖动消除和加载优先级。
 */
export const SlideImage: React.FC<SlideImageProps> = React.memo(({ 
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
  
  // 修复路径拼接：避免出现 //example_pic 这种协议相对路径
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const placeholderSrc = `${baseUrl}/example_pic/example_pic_1.png`.startsWith('//') 
    ? `${baseUrl}/example_pic/example_pic_1.png`.substring(1) 
    : `${baseUrl}/example_pic/example_pic_1.png`;
    
  const rawSrc = overrideSrc || page.image || placeholderSrc;
  
  const { url, isLoading: isAssetLoading, dimensions } = useAssetUrl(rawSrc);
  const { srcSet, variants } = useResponsiveImage(rawSrc, { priority, sizes });
  
  // 检查是否是 asset 协议，如果是，由于主进程只保存一种最优格式，我们应跳过 picture 变体尝试
  const isAssetProtocol = rawSrc.startsWith('asset://');
  
  const [lqip, setLqip] = useState<string | undefined>(undefined);
  const [showLqip, setShowLqip] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // 关键修复：当图片源改变时，重置加载状态和占位图状态
  useEffect(() => {
    setIsLoaded(false);
    setShowLqip(true);
  }, [rawSrc]);

  useEffect(() => {
    if (url && !priority && !isLoaded) {
      generateLQIP(url).then(setLqip).catch(console.error);
    }
  }, [url, priority, isLoaded]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.complete) {
      setIsLoaded(true);
      setTimeout(() => setShowLqip(false), 300);
    }
  }, []);

  if (!isVisible) return null;

  const config = overrideConfig || page.imageConfig || { scale: 1, x: 0, y: 0 };
  const posX = (config.x + 100) / 2;
  const posY = (config.y + 100) / 2;

  const containerStyle: React.CSSProperties = useMemo(() => ({
    borderRadius: rounded || '0.125rem',
    border: border || 'none',
    boxShadow: shadow || 'none',
    overflow: 'hidden',
    backgroundColor: backgroundColor || '#000000', 
    contain: 'paint layout style', // 优化渲染性能
    aspectRatio: dimensions.width && dimensions.height 
      ? `${dimensions.width} / ${dimensions.height}` 
      : undefined,
    ...style
  }), [rounded, border, shadow, backgroundColor, dimensions, style]);

  const imageStyle: React.CSSProperties = useMemo(() => ({
    transform: `scale(${config.scale})`,
    objectPosition: `${posX}% ${posY}%`,
    transformOrigin: `${posX}% ${posY}%`
  }), [config.scale, posX, posY]);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={containerStyle}>
      {/* LQIP 占位图 */}
      {lqip && showLqip && (
        <img
          key={`lqip-${rawSrc}`} // 强制重新挂载占位图
          src={lqip}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ ...imageStyle, filter: 'blur(10px)' }}
          alt="Loading Placeholder"
        />
      )}
      
      {url && (
        <picture className="w-full h-full block">
          {!isAssetProtocol && variants?.webp && (
            <source srcSet={variants.webp.srcSet} type="image/webp" sizes={sizes} />
          )}
          {!isAssetProtocol && variants?.avif && (
            <source srcSet={variants.avif.srcSet} type="image/avif" sizes={sizes} />
          )}
          <img 
            key={`img-${rawSrc}`} // 强制重新挂载主图以确保 onLoad 触发
            src={url} 
            srcSet={!isAssetProtocol ? srcSet : undefined}
            sizes={sizes}
            crossOrigin="anonymous"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-300 ease-out ${imgClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            onLoad={handleLoad}
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
}, (prevProps, nextProps) => {
  return (
    prevProps.page === nextProps.page &&
    prevProps.src === nextProps.src &&
    prevProps.config === nextProps.config &&
    prevProps.className === nextProps.className &&
    prevProps.rounded === nextProps.rounded &&
    prevProps.border === nextProps.border &&
    prevProps.shadow === nextProps.shadow &&
    prevProps.backgroundColor === nextProps.backgroundColor
  );
});
