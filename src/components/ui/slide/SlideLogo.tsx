import React from 'react';
import { PageData } from '../../../types';
import { useAssetUrl } from '../../../hooks/useAssetUrl';

interface SlideLogoProps {
  page: PageData;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SlideLogo 原子组件
 * 核心修复：移除对编辑器 BrandLogo 的默认回退，确保幻灯片只显示用户上传的 Logo
 */
export const SlideLogo: React.FC<SlideLogoProps> = ({ page, className = "", style }) => {
  const { url, isLoading } = useAssetUrl(page.logo);
  const isVisible = page.visibility?.logo !== false;
  
  // 如果不可见，或者根本没有 Logo 数据，则直接不渲染
  if (!isVisible || !page.logo) return null;

  const size = page.logoSize || 48;

  return (
    <div 
      className={`z-20 pointer-events-none ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        ...style 
      }}
    >
      {url && <img src={url} crossOrigin="anonymous" loading="lazy" decoding="async" className="w-full h-full object-contain" alt="Logo" />}
    </div>
  );
};