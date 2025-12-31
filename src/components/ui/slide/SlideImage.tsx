import React from 'react';
import { PageData } from '../../../types';

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
  style?: React.CSSProperties;
}

/**
 * SlideImage 原子组件 - 物理边界增强版
 * 
 * 核心逻辑：
 * 1. 使用 object-position 控制“基于原图比例”的平移。
 * 2. 浏览器会自动根据图片宽高比和容器宽高比，计算出最大可移动范围并自动 Clamp。
 * 3. 结合 transform-origin，确保缩放时始终锁定在用户的平移焦点上。
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
  style
}) => {
  const isVisible = page.visibility?.image !== false;
  if (!isVisible) return null;

  const src = overrideSrc || page.image || `${import.meta.env.BASE_URL}/example_pic/example_pic_1.png`;
  const config = overrideConfig || page.imageConfig || { scale: 1, x: 0, y: 0 };

  // 将滑块的 -100 ~ 100 映射为浏览器对齐百分比 0% ~ 100%
  const posX = (config.x + 100) / 2;
  const posY = (config.y + 100) / 2;

  const containerStyle: React.CSSProperties = {
    borderRadius: rounded || '0.125rem',
    border: border || 'none',
    boxShadow: shadow || 'none',
    overflow: 'hidden',
    backgroundColor: '#000000', 
    ...style
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={containerStyle}>
      <img 
        src={src} 
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-all duration-300 ease-out ${imgClassName}`}
        style={{
          // 核心：基于焦点的缩放
          transform: `scale(${config.scale})`,
          // 核心：基于比例的平移（浏览器自动计算边界）
          objectPosition: `${posX}% ${posY}%`,
          transformOrigin: `${posX}% ${posY}%`
        }}
      />
    </div>
  );
};