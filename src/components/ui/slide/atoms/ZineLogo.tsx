import React from 'react';
import { PageData, DesignSystem, ProjectTheme } from '../../../../types';
import { useAssetUrl } from '../../../../hooks/useAssetUrl';
import { useModularStyle } from '../hooks/useModularStyle';
import { useDataConnector } from '../hooks/useDataConnector';

interface ZineLogoProps {
  page: PageData;
  className?: string;
  style?: React.CSSProperties;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
}

/**
 * ZineLogo 原子组件
 * 严格限制在 24 格网格内自适应贴合，绝不溢出撑破
 */
export const ZineLogo: React.FC<ZineLogoProps> = ({ page, className = "", style: customStyle }) => {
  const { isVisible } = useDataConnector('logo', page);
  const { url, isLoading } = useAssetUrl(page.logo);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey: 'logo',
    customStyle,
    className: `zine-logo z-20 pointer-events-none transition-opacity ${className}`
  });

  // 如果不可见，或者没有 Logo 数据，则直接不渲染
  if (!isVisible || !page.logo) return null;

  const size = page.logoSize || 48;

  const finalStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    boxSizing: 'border-box',
    width: `${size}px`,
    height: `${size}px`,
    ...style
  };

  return (
    <div
      className={`${resolvedClassName} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      style={finalStyle}
    >
      {url && (
        <img
          src={url}
          crossOrigin="anonymous"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
          alt="Logo"
        />
      )}
    </div>
  );
};

export default ZineLogo;
