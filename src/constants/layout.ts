/**
 * 幻灯片布局配置系统
 * 支持横屏、竖屏及未来扩展比例
 */

export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';

export interface LayoutDimensions {
  width: number;
  height: number;
  label: string;
}

export const LAYOUT_CONFIG: Record<AspectRatioType, LayoutDimensions> = {
  '16:9': {
    width: 1920,
    height: 1080,
    label: 'Standard Landscape'
  },
  '2:3': {
    width: 1080,
    height: 1620,
    label: 'Portrait Poster'
  },
  'A4': {
    width: 1240,
    height: 1754,
    label: 'A4 Document'
  },
  '1:1': {
    width: 1080,
    height: 1080,
    label: 'Square Social'
  }
};

export const EDITOR_PANEL_WIDTH = 400;