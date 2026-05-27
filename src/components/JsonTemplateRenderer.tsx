import React, { useMemo } from 'react';
import { PageData, TypographySettings } from '../types';
import { useStore } from '../store/useStore';
import { LayoutRenderer, TemplateSchema } from '../templates/schemas';
import { createZIndexResolver } from '../templates/schemas/zIndexResolver';

interface JsonTemplateRendererProps {
  schema: TemplateSchema;
  page: PageData;
  typography?: TypographySettings;
}

/**
 * JsonTemplateRenderer - JSON 模板渲染器的 React 封装层
 * 负责获取 Store 中的全局主题并传递给 LayoutRenderer，
 * 同时创建 zIndex 解析器处理层叠声明
 */
export const JsonTemplateRenderer: React.FC<JsonTemplateRendererProps> = ({ 
  schema, 
  page, 
  typography 
}) => {
  const theme = useStore((state) => state.theme);

  // 创建 zIndex 解析器（schema 变化时重建）
  const resolveZIndex = useMemo(() => {
    return createZIndexResolver(schema.root);
  }, [schema.root]);

  if (!schema || !schema.root) {
    return <div className="flex items-center justify-center w-full h-full text-slate-400">Invalid Template Schema</div>;
  }

  return (
    <LayoutRenderer 
      node={schema.root} 
      page={page} 
      theme={theme} 
      typography={typography}
      resolveZIndex={resolveZIndex}
    />
  );
};
