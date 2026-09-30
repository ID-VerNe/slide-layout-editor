/**
 * 定义哪些字段在更新时需要同步到所有页面
 * 这样可以确保幻灯片的整体风格（如 Logo、字体、背景纹路）保持一致
 */
const GLOBAL_FIELD_KEYS = [
  'counterStyle',
  'counterColor',
  'backgroundPattern',
  'footer',
  'titleFont',
  'bodyFont',
  'logo',
  'logoSize',
  'accentColor',
  'pageNumber', // 建议页码开关也全局同步
] as const;

export type GlobalField = typeof GLOBAL_FIELD_KEYS[number];

// @lat: [[constants#Global Fields]]
export const GLOBAL_FIELDS: GlobalField[] = [...GLOBAL_FIELD_KEYS];
