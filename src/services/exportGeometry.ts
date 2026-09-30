import { LAYOUT_CONFIG, AspectRatioType } from '../constants/layout';
import { PageData, PrintSettings } from '../types';

/**
 * 计算 PageData 在导出时的像素尺寸,考虑印刷出血与装订侧净宽。
 * 纯函数,无 React 依赖。
 */
export function getExportDimensions(
  page: PageData,
  printSettings: PrintSettings | undefined,
): { width: number; height: number } {
  const designDims = LAYOUT_CONFIG[(page.aspectRatio || '16:9') as AspectRatioType];
  if (printSettings?.enabled) {
    const orientation = designDims.orientation;
    const config =
      (printSettings.configs &&
        (printSettings.configs[orientation as keyof typeof printSettings.configs] ||
          printSettings.configs.resume)) ||
      { bindingSide: 'left', trimSide: 'bottom' };
    const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
    const netWidthMm = isHorizontalBinding
      ? printSettings.widthMm - printSettings.gutterMm
      : printSettings.widthMm;
    const ppi = designDims.width / Math.max(1, netWidthMm);
    return {
      width: Math.round(printSettings.widthMm * ppi),
      height: Math.round(printSettings.heightMm * ppi),
    };
  }
  return { width: designDims.width, height: designDims.height };
}
