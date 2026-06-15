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
 * 负责获取 Store 中的全局主题与设计系统并传递给 LayoutRenderer，
 * 同时创建 zIndex 解析器处理层叠声明
 *
 * 设计说明：在此处订阅 useStore，以 props 向下传参，避免 LayoutRenderer
 * 递归渲染时每个节点都触发 store 订阅产生级联重渲染。
 */
export const JsonTemplateRenderer: React.FC<JsonTemplateRendererProps> = ({
  schema,
  page,
  typography
}) => {
  const theme = useStore((state) => state.theme);
  const designSystem = useStore((state) => state.designSystem);

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
      designSystem={designSystem}
      typography={typography}
      resolveZIndex={resolveZIndex}
    />
  );
};