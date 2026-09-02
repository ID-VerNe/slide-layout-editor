import { PageData } from '../types';
import { getTemplateById } from '../templates/registry';

export interface CoverBounds {
  maxShiftX: number;
  maxShiftY: number;
  canMoveHoriz: boolean;
  canMoveVert: boolean;
  scaledWidth: number;
  scaledHeight: number;
}

export interface PanOffset {
  shiftX: number;
  shiftY: number;
}

/** Calculates safe physical cover bounds and maximum allowed shifts for an image container */
export function calculateCoverBounds(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  scale: number = 1
): CoverBounds {
  // 空值或无效尺寸安全保护
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) {
    return {
      maxShiftX: 0,
      maxShiftY: 0,
      canMoveHoriz: false,
      canMoveVert: false,
      scaledWidth: 0,
      scaledHeight: 0
    };
  }

  const safeScale = Math.max(1, scale);
  const containerRatio = containerW / containerH;
  const imageRatio = imageW / imageH;

  let baseCoverW: number;
  let baseCoverH: number;

  if (imageRatio >= containerRatio) {
    // 图片更宽：高度铺满容器，宽度向两侧溢出
    baseCoverH = containerH;
    baseCoverW = containerH * imageRatio;
  } else {
    // 图片更高：宽度铺满容器，高度向上下溢出
    baseCoverW = containerW;
    baseCoverH = containerW / imageRatio;
  }

  const scaledWidth = baseCoverW * safeScale;
  const scaledHeight = baseCoverH * safeScale;

  // 最大允许平移像素量（从中心向两侧）
  const maxShiftX = Math.max(0, (scaledWidth - containerW) / 2);
  const maxShiftY = Math.max(0, (scaledHeight - containerH) / 2);

  // 裁剪余量小于 1 像素视为无法移动
  const canMoveHoriz = maxShiftX > 1;
  const canMoveVert = maxShiftY > 1;

  return {
    maxShiftX,
    maxShiftY,
    canMoveHoriz,
    canMoveVert,
    scaledWidth,
    scaledHeight
  };
}

/** Translates slider values [-100, 100] to safe pixel offsets strictly clamped to bounds */
export function resolveSafePanOffset(
  configX: number = 0,
  configY: number = 0,
  bounds: CoverBounds
): PanOffset {
  let shiftX = 0;
  let shiftY = 0;

  if (bounds.canMoveHoriz && bounds.maxShiftX > 0) {
    const rawShiftX = (configX / 100) * bounds.maxShiftX;
    shiftX = Math.max(-bounds.maxShiftX, Math.min(bounds.maxShiftX, rawShiftX));
  }

  if (bounds.canMoveVert && bounds.maxShiftY > 0) {
    const rawShiftY = (configY / 100) * bounds.maxShiftY;
    shiftY = Math.max(-bounds.maxShiftY, Math.min(bounds.maxShiftY, rawShiftY));
  }

  return { shiftX, shiftY };
}

/** Parses numeric ratio from slide aspect ratio string */
export function parseSlideAspectRatio(aspectRatio?: string): number {
  switch (aspectRatio) {
    case '16:9': return 16 / 9;
    case '3:4': return 3 / 4;
    case '2:3': return 2 / 3;
    case '1:1': return 1;
    case 'A4': return 210 / 297;
    default: return 16 / 9;
  }
}

/** Resolves the aspect ratio of an image field container from page and template schema */
export function getContainerAspectRatioFromPage(
  page: PageData,
  fieldKey: string = 'image'
): number | null {
  try {
    const tpl = getTemplateById(page.layoutId);
    if (!tpl?.schema?.root) return null;

    const findModular = (node: any): { colSpan: number; rowSpan: number } | null => {
      if (!node) return null;
      if (node.type === 'Component' && (node.fieldKey === fieldKey || node.bind === `page.${fieldKey}`)) {
        if (node.modular) {
          return {
            colSpan: node.modular.colSpan || 24,
            rowSpan: node.modular.rowSpan || 24
          };
        }
      }
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          const res = findModular(child);
          if (res) return res;
        }
      }
      return null;
    };

    const modular = findModular(tpl.schema.root);
    if (!modular) return null;

    const slideRatio = parseSlideAspectRatio(page.aspectRatio);
    // 在 24x24 网格中：容器宽高比 = (colSpan / rowSpan) * 幻灯片宽高比
    return (modular.colSpan / modular.rowSpan) * slideRatio;
  } catch {
    return null;
  }
}
