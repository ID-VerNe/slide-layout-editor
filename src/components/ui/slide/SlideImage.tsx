import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageData } from '../../../types';
import { useAssetUrl } from '../../../hooks/useAssetUrl';
import { useResponsiveImage } from '../../../hooks/useResponsiveImage';
import { generateLQIP } from '../../../utils/lqip';
import { useDataConnector } from './hooks/useDataConnector';
import { useModularStyle } from './hooks/useModularStyle';
import { Image, ImageConfig } from './atoms/Image';

interface SlideImageProps {
  page: PageData;
  fieldKey?: string; // 新增
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
 * SlideImage - 已重构：使用 Atomic Image 组件与 Modular Hooks
 */
export const SlideImage: React.FC<SlideImageProps> = React.memo(({ 
  page, 
  fieldKey = 'image', // 默认 fieldKey
  src: overrideSrc,
  config: overrideConfig,
  className = "", 
  imgClassName = "",
  rounded,
  border,
  shadow,
  backgroundColor,
  style: customStyle,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw"
}) => {
  // 1. 数据连接
  const { content: pageSrc, isVisible } = useDataConnector(fieldKey, page);
  const { content: pageConfig } = useDataConnector(fieldKey === 'image' ? 'imageConfig' : `${fieldKey}Config`, page);

  // 2. 样式解析 (利用 useModularStyle 处理 Zine Mode 等)
  const { style, className: resolvedClassName } = useModularStyle({
    page, // 传入 page
    fieldKey,
    props: { backgroundColor },
    customStyle,
    className
  });

  // 3. 资源解析 (保持原有 Hook 逻辑)
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
      generateLQIP(url).then(setLqip).catch(console.error);
    }
  }, [url, priority, isLoaded]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  if (!isVisible) return null;

  const config = overrideConfig || pageConfig || { scale: 1, x: 0, y: 0 };
  
  const containerStyle: React.CSSProperties = {
    ...style,
    borderRadius: rounded || style.borderRadius || '0.125rem',
    border: border || style.border || 'none',
    boxShadow: shadow || style.boxShadow || 'none',
    backgroundColor: backgroundColor || style.backgroundColor || '#000000',
    aspectRatio: dimensions?.width && dimensions?.height 
      ? `${dimensions.width} / ${dimensions.height}` 
      : style.aspectRatio,
  };

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
      imgClassName={imgClassName}
      style={containerStyle}
      onLoad={handleLoad}
    />
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
