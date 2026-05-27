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
  style: z.record(z.string(), z.any()).optional(),
});

const FlexLayoutPropsSchema = z.object({
  direction: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).optional(),
  align: z.enum(['start', 'center', 'end', 'baseline', 'stretch']).optional(),
  justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).optional(),
  gap: z.union([z.number(), z.string()]).optional(),
  wrap: z.boolean().optional(),
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

// 使用 z.lazy 处理递归结构
export const TemplateNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.discriminatedUnion('type', [
    BaseNodeSchema.extend({
      type: z.literal('Container'),
      layout: z.enum(['flex', 'grid', 'absolute', 'modular']),
      layoutProps: z.union([
        FlexLayoutPropsSchema,
        GridLayoutPropsSchema,
        AbsoluteLayoutPropsSchema
      ]).optional(),
      children: z.array(TemplateNodeSchema)
    }),
    BaseNodeSchema.extend({
      type: z.literal('Component'),
      componentType: z.string(),
      bind: z.string().optional(),
      props: z.record(z.string(), z.any()).optional(),
      visibleWhen: z.string().optional(),
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
  supportedRatios: z.array(z.string()),
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
