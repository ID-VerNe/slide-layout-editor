import { PageData } from '../types';

/**
 * 定义哪些字段在更新时需要同步到所有页面
 * 这样可以确保幻灯片的整体风格（如 Logo、字体、背景纹路）保持一致
 */
export const GLOBAL_FIELDS: Array<keyof PageData> = [
  'counterStyle',
  'backgroundPattern',
  'footer',
  'titleFont',
  'bodyFont',
  'logo',
  'logoSize',
  'themeColor',
  'pageNumber' // 建议页码开关也全局同步
];
