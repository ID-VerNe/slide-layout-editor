import React from 'react';
import { PageData } from '../../../types';
import { useAssetUrl } from '../../../hooks/useAssetUrl';

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
}

/**
 * SlideImage 原子组件 - 资源优化版
 * 核心升级：接入 useAssetUrl，支持解析资源池中的 ID。
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
  style
}) => {
  const isVisible = page.visibility?.image !== false;
  
  // 1. 确定原始资源标识 (可能是 asset:// ID，也可能是普通 URL)
  const rawSrc = overrideSrc || page.image || `${import.meta.env.BASE_URL}/example_pic/example_pic_1.png`;
  
  // 2. 解析资源 ID
  const { url, isLoading } = useAssetUrl(rawSrc);

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

  return (
    <div className={`relative flex items-center justify-center ${className} ${isLoading ? 'opacity-50 grayscale' : ''}`} style={containerStyle}>
      {url && (
        <img 
          src={url} 
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-300 ease-out ${imgClassName}`}
          style={{
            transform: `scale(${config.scale})`,
            objectPosition: `${posX}% ${posY}%`,
            transformOrigin: `${posX}% ${posY}%`
          }}
        />
      )}
      
      {/* Loading 骨架感 */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-2 border-[#264376]/20 border-t-[#264376] animate-spin" />
        </div>
      )}
    </div>
  );
};
