/**
 * 幻灯片布局配置系统
 */

export type OrientationType = 'landscape' | 'portrait' | 'square';
export type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';

export interface LayoutDimensions {
  width: number;
  height: number;
  label: string;
  orientation: OrientationType; // 新增：方向归类
}

export const LAYOUT_CONFIG: Record<AspectRatioType, LayoutDimensions> = {
  '16:9': {
    width: 1920,
    height: 1080,
    label: 'Standard (16:9)',
    orientation: 'landscape'
  },
  '2:3': {
    width: 1080,
    height: 1620,
    label: 'Poster (2:3)',
    orientation: 'portrait'
  },
  'A4': {
    width: 1240,
    height: 1754,
    label: 'A4 Document',
    orientation: 'portrait'
  },
  '1:1': {
    width: 1080,
    height: 1080,
    label: 'Square (1:1)',
    orientation: 'square'
  }
};

export const LAYOUT = {
  EDITOR_PANEL_WIDTH: 400,
  SIDEBAR_WIDTH: 96,
  SIDEBAR_OFFSET: -80,
};

export const EDITOR_PANEL_WIDTH = LAYOUT.EDITOR_PANEL_WIDTH;