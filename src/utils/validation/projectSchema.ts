import { z } from 'zod';

// 单页 schema:仅断言「是 plain object」,字段全放行
// 历史页面字段差异大,逐字段必检会误杀 V1/V2 工程
const PageSchema = z.looseObject({});

// 工程 schema:唯一硬约束是 pages 必须为数组,缺省回填空数组
// 其余字段(theme / designSystem / customFonts / ...)全部 passthrough
export const ProjectSchema = z.looseObject({
  pages: z.array(PageSchema).default([]),
});

export type ValidatedProject = z.infer<typeof ProjectSchema>;

// safeParse 包装,返回标准结果供调用方分支处理
export function validateProject(data: unknown) {
  return ProjectSchema.safeParse(data);
}
