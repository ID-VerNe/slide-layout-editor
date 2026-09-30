import { LAYOUT_CONFIG, AspectRatioType, OrientationType } from '../constants/layout';
import { PrintSettings } from '../types';

export interface PrintBindingConfig {
  bindingSide: 'left' | 'right' | 'top' | 'bottom';
  trimSide: 'left' | 'right' | 'top' | 'bottom';
}

export interface PrintGeometry {
  /** 物理画幅像素:导出光栅与预览适配基准,按净宽求 PPI */
  rasterPx: { width: number; height: number; ppi: number };
  /** 屏幕画布像素:Preview 外框尺寸,按满宽求 PPI */
  canvasPx: { width: number; height: number; ppi: number };
  /** 内容在画布内的缩放与装订像素 */
  content: { scaleFactor: number; gutterPx: number };
  /** 解析后的装订配置与方向标记 */
  binding: PrintBindingConfig;
  isHorizontalBinding: boolean;
}

const DEFAULT_BINDING: PrintBindingConfig = { bindingSide: 'left', trimSide: 'bottom' };

/** Returns the binding config for an orientation, falling back to resume then default */
export function resolvePrintBinding(
  orientation: OrientationType,
  printSettings?: PrintSettings
): PrintBindingConfig {
  const configs = printSettings?.configs;
  if (!configs) return DEFAULT_BINDING;
  return configs[orientation] || configs['resume'] || DEFAULT_BINDING;
}

/** Computes print geometry for both export rasterization and on-screen preview canvas */
export function getPrintGeometry(
  aspectRatio: AspectRatioType = '16:9',
  printSettings?: PrintSettings
): PrintGeometry {
  const designDims = LAYOUT_CONFIG[aspectRatio] || LAYOUT_CONFIG['16:9'];

  if (!printSettings?.enabled) {
    return {
      rasterPx: { width: designDims.width, height: designDims.height, ppi: 1 },
      canvasPx: { width: designDims.width, height: designDims.height, ppi: 1 },
      content: { scaleFactor: 1, gutterPx: 0 },
      binding: DEFAULT_BINDING,
      isHorizontalBinding: false,
    };
  }

  const { widthMm, heightMm, gutterMm } = printSettings;
  const binding = resolvePrintBinding(designDims.orientation, printSettings);
  const isHorizontalBinding = binding.bindingSide === 'left' || binding.bindingSide === 'right';

  // 装订边占用的物理方向:水平装订扣宽,垂直装订扣高
  const netWidthMm = isHorizontalBinding ? Math.max(1, widthMm - gutterMm) : widthMm;
  const netHeightMm = !isHorizontalBinding ? Math.max(1, heightMm - gutterMm) : heightMm;

  // 物理画幅:以设计宽度对净宽求 PPI,画幅按物理尺寸外扩
  const rasterPpi = designDims.width / netWidthMm;
  const rasterPx = {
    width: widthMm * rasterPpi,
    height: heightMm * rasterPpi,
    ppi: rasterPpi,
  };

  // 屏幕画布:外框固定为设计宽度,高度按物理宽高比外扩
  const canvasPpi = designDims.width / widthMm;
  const canvasPx = {
    width: designDims.width,
    height: designDims.width * (heightMm / widthMm),
    ppi: canvasPpi,
  };

  // 内容缩放:装订后净画幅占满画布的比例
  const content = {
    scaleFactor: Math.min(netWidthMm / widthMm, netHeightMm / heightMm),
    gutterPx: gutterMm * canvasPpi,
  };

  return { rasterPx, canvasPx, content, binding, isHorizontalBinding };
}
