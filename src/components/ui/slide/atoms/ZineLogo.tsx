import React from 'react';
import { PageData } from '../../../../types';
import { useAssetUrl } from '../../../../hooks/useAssetUrl';
import { useModularStyle } from '../hooks/useModularStyle';

interface ZineLogoProps {
  page: PageData;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ZineLogo 原子组件
 */
export const ZineLogo: React.FC<ZineLogoProps> = ({ page, className = "", style: customStyle }) => {
  const { url, isLoading } = useAssetUrl(page.logo);
  const isVisible = page.visibility?.logo !== false;

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey: 'logo',
    customStyle,
    className: `zine-logo z-20 pointer-events-none transition-opacity ${className}`
  });

  // 如果不可见，或者根本没有 Logo 数据，则直接不渲染
  if (!isVisible || !page.logo) return null;

  const size = page.logoSize || 48;

  const finalStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    ...style
  };

  return (
    <div
      className={`${resolvedClassName} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      style={finalStyle}
    >
      {url && <img src={url} crossOrigin="anonymous" loading="lazy" decoding="async" className="w-full h-full object-contain" alt="Logo" />}
    </div>
  );
};

export default ZineLogo;
