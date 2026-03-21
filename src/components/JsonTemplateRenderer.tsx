import React from 'react';
import { PageData, TypographySettings } from '../types';
import { useStore } from '../store/useStore';
import { LayoutRenderer, TemplateSchema } from '../templates/schemas';

interface JsonTemplateRendererProps {
  schema: TemplateSchema;
  page: PageData;
  typography?: TypographySettings;
}

/**
 * JsonTemplateRenderer - JSON 模板渲染器的 React 封装层
 * 负责获取 Store 中的全局主题并传递给 LayoutRenderer
 */
export const JsonTemplateRenderer: React.FC<JsonTemplateRendererProps> = ({ 
  schema, 
  page, 
  typography 
}) => {
  const theme = useStore((state) => state.theme);

  if (!schema || !schema.root) {
    return <div className="flex items-center justify-center w-full h-full text-slate-400">Invalid Template Schema</div>;
  }

  return (
    <LayoutRenderer 
      node={schema.root} 
      page={page} 
      theme={theme} 
      typography={typography} 
    />
  );
};
