import React, { useState, useEffect, useCallback } from 'react';
import { PageData } from '../../../../types';
import { useAssetUrl } from '../../../../hooks/useAssetUrl';
import { useResponsiveImage } from '../../../../hooks/useResponsiveImage';
import { generateLQIP } from '../../../../utils/lqip';
import { useDataConnector } from '../hooks/useDataConnector';
import { useModularStyle } from '../hooks/useModularStyle';
import { Image, ImageConfig } from './Image';
import { logger } from '../../../../utils/logger';

interface ZineMediaProps {
  page: PageData;
  fieldKey?: string; 
  src?: string;
  config?: ImageConfig;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  rounded?: string | number; // 新增：支持圆角 (e.g., "9999px", 20)
  [key: string]: any;
}

/**
 * ZineMedia - 媒体原子组件 (V3 Modular)
 * 彻底合并 SlideImage 逻辑，完全独立化。
 */
export const ZineMedia: React.FC<ZineMediaProps> = React.memo(({ 
  page, 
  fieldKey = 'image',
  src: overrideSrc,
  config: overrideConfig,
  className = "", 
  imgClassName = "",
  style: customStyle,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  rounded,
  ...otherProps
}) => {
  const resolvedFieldKey = otherProps.fieldKey || fieldKey || 'image';

  // 1. 数据连接
  const { content: pageSrc, isVisible } = useDataConnector(resolvedFieldKey, page);
  const { content: pageConfig } = useDataConnector(resolvedFieldKey === 'image' ? 'imageConfig' : `${resolvedFieldKey}Config`, page);

  // 2. 样式解析 (利用 useModularStyle 处理 Zine Mode 等)
  const { style, className: resolvedClassName } = useModularStyle({
    page, 
    fieldKey: resolvedFieldKey,
    props: { 
      backgroundColor: '#000000',
      ...otherProps
    },
    customStyle,
    className: `zine-media ${className}` // 移除强制 w-full h-full，让 align/justify 生效
  });

  // 3. 资源解析
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const placeholderSrc = `${baseUrl}/example_pic/example_pic_1.png`.startsWith('//') 
    ? `${baseUrl}/example_pic/example_pic_1.png`.substring(1) 
    : `${baseUrl}/example_pic/example_pic_1.png`;
    
  const rawSrc = overrideSrc || pageSrc || placeholderSrc;
  
  const { url, isLoading, dimensions } = useAssetUrl(rawSrc);
  const { srcSet, variants } = useResponsiveImage(rawSrc, { priority, sizes });
  const isAssetProtocol = rawSrc.startsWith('asset://');
  
  const [lqip, setLqip] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [rawSrc]);

  useEffect(() => {
    if (url && !priority && !isLoaded) {
      generateLQIP(url).then(setLqip).catch(() => {
        // 静默降级：LQIP 生成失败不阻碍正常渲染
      });
    }
  }, [url, priority, isLoaded]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  if (!isVisible) return null;

  const config = overrideConfig || pageConfig || { scale: 1, x: 0, y: 0 };
  
  // 检查是否有用户手动设置的对齐（通过 styleOverrides）
  const hasManualAlignment = resolvedFieldKey && page.styleOverrides?.[resolvedFieldKey] && 
    (page.styleOverrides[resolvedFieldKey].alignSelf !== undefined || 
     page.styleOverrides[resolvedFieldKey].justifySelf !== undefined);

  // 检查是否通过 style 或 className 显式指定了尺寸，若指定则不强行铺满 100%
  const hasExplicitWidth = style.width !== undefined || /\bw-(auto|\d+|\[[^\]]+\])\b/.test(className);
  const hasExplicitHeight = style.height !== undefined || /\bh-(auto|\d+|\[[^\]]+\])\b/.test(className);

  const containerStyle: React.CSSProperties = {
    width: style.width || (hasManualAlignment || hasExplicitWidth ? undefined : '100%'),
    height: style.height || (hasManualAlignment || hasExplicitHeight ? undefined : '100%'),
    ...style,
    borderRadius: rounded !== undefined 
      ? (typeof rounded === 'number' ? `${rounded}px` : rounded) 
      : (style.borderRadius || '0'), 
    aspectRatio: style.aspectRatio,
  };

  logger.debug(`[ZineMedia] Render ${resolvedFieldKey}:`, { url, config, containerStyle });

  return (
    <Image
      url={url}
      srcSet={!isAssetProtocol ? srcSet : undefined}
      variants={variants}
      lqip={lqip}
      config={config}
      isLoading={isLoading}
      priority={priority}
      sizes={sizes}
      className={resolvedClassName}
      imgClassName={`zine-media-img ${imgClassName}`}
      style={containerStyle}
      onLoad={handleLoad}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.page === nextProps.page &&
    prevProps.fieldKey === nextProps.fieldKey &&
    prevProps.src === nextProps.src &&
    prevProps.config === nextProps.config &&
    prevProps.className === nextProps.className &&
    prevProps.style === nextProps.style &&
    prevProps.rounded === nextProps.rounded
  );
});

export default ZineMedia;
