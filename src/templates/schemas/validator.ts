import { z } from 'zod';

const ZIndexDeclarationSchema = z.union([
  z.literal('page.top'),
  z.literal('bottom'),
  z.string().regex(/^.+\.(top|bottom)$/, '必须是 "组件id.top" 或 "组件id.bottom" 格式'),
]);

const BaseNodeSchema = z.object({
  id: z.string().optional(),
  zIndex: ZIndexDeclarationSchema.optional(),
  className: z.string().optional(),
  style: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  modular: z.lazy(() => ModularLayoutPropsSchema).optional(),
  presetKey: z.string().optional(),
  visibleWhen: z.string().optional(),
});

const FlexLayoutPropsSchema = z.object({
  direction: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).optional(),
  align: z.enum(['start', 'center', 'end', 'baseline', 'stretch']).optional(),
  justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).optional(),
  gap: z.union([z.number(), z.string()]).optional(),
  wrap: z.union([z.boolean(), z.literal('wrap-reverse')]).optional(),
});

const GridLayoutPropsSchema = z.object({
  columns: z.union([z.number(), z.string()]).optional(),
  rows: z.union([z.number(), z.string()]).optional(),
  gap: z.union([z.number(), z.string()]).optional(),
  areas: z.array(z.string()).optional(),
});

const AbsoluteLayoutPropsSchema = z.object({
  top: z.union([z.number(), z.string()]).optional(),
  left: z.union([z.number(), z.string()]).optional(),
  right: z.union([z.number(), z.string()]).optional(),
  bottom: z.union([z.number(), z.string()]).optional(),
  inset: z.union([z.number(), z.string()]).optional(),
  zIndex: z.number().optional(),
});

const ModularLayoutPropsSchema = z.object({
  colStart: z.number().min(1).max(24).optional(),
  colSpan: z.number().min(1).max(24).optional(),
  rowStart: z.number().min(1).max(24).optional(),
  rowSpan: z.number().min(1).max(24).optional(),
  align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  justify: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  gap: z.union([z.number(), z.string()]).optional(),
  columns: z.number().min(1).optional(),
  rows: z.number().min(1).optional(),
});

// 使用 z.lazy 处理递归结构
export const TemplateNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion('type', [
    BaseNodeSchema.extend({
      type: z.literal('Container'),
      layout: z.enum(['flex', 'grid', 'absolute', 'modular']).optional(),
      layoutProps: z.union([
        FlexLayoutPropsSchema,
        GridLayoutPropsSchema,
        AbsoluteLayoutPropsSchema,
        ModularLayoutPropsSchema,
      ]).optional(),
      children: z.array(TemplateNodeSchema)
    }),
    BaseNodeSchema.extend({
      type: z.literal('Component'),
      componentType: z.string(),
      bind: z.string().optional(),
      fieldKey: z.string().optional(),
      props: z.record(z.string(), z.any()).optional(),
    }),
    BaseNodeSchema.extend({
      type: z.literal('Conditional'),
      condition: z.string(),
      then: TemplateNodeSchema,
      else: TemplateNodeSchema.optional(),
    }),
    BaseNodeSchema.extend({
      type: z.literal('Repeater'),
      bind: z.string(),
      itemVariable: z.string().optional(),
      layout: z.enum(['flex', 'grid', 'absolute', 'modular']).optional(),
      layoutProps: z.union([
        FlexLayoutPropsSchema,
        GridLayoutPropsSchema,
        AbsoluteLayoutPropsSchema,
        ModularLayoutPropsSchema,
      ]).optional(),
      template: TemplateNodeSchema,
    }),
    BaseNodeSchema.extend({
      type: z.literal('Text'),
      content: z.string(),
    })
  ])
);

export const TemplateSchemaValidator = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  supportedRatios: z.array(z.string()).min(1, "supportedRatios 不能为空"),
  root: TemplateNodeSchema,
  defaults: z.record(z.string(), z.any()).optional(),
  meta: z.object({
    version: z.string(),
    author: z.string().optional(),
  }).optional(),
});

export function validateTemplate(data: any) {
  return TemplateSchemaValidator.safeParse(data);
}

// 别名导出以兼容测试
export const validateTemplateSchema = validateTemplate;
