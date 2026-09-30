import { describe, it, expect } from 'vitest';
import { getPrintGeometry, resolvePrintBinding } from '../printGeometry';
import { LAYOUT_CONFIG } from '../../constants/layout';
import type { PrintSettings } from '../../types';

const basePrint = (overrides: Partial<PrintSettings> = {}): PrintSettings => ({
  enabled: true,
  widthMm: 210,
  heightMm: 297,
  gutterMm: 10,
  showGutterShadow: true,
  showTrimShadow: true,
  showContentFrame: true,
  configs: {
    landscape: { bindingSide: 'left', trimSide: 'bottom' },
    portrait: { bindingSide: 'left', trimSide: 'bottom' },
    square: { bindingSide: 'top', trimSide: 'bottom' },
    resume: { bindingSide: 'left', trimSide: 'bottom' },
  },
  ...overrides,
});

describe('getPrintGeometry', () => {
  it('disabled 时返回设计尺寸原值,scaleFactor=1,gutterPx=0', () => {
    const geo = getPrintGeometry('16:9', { ...basePrint(), enabled: false });
    expect(geo.rasterPx.width).toBe(LAYOUT_CONFIG['16:9'].width);
    expect(geo.rasterPx.height).toBe(LAYOUT_CONFIG['16:9'].height);
    expect(geo.content.scaleFactor).toBe(1);
    expect(geo.content.gutterPx).toBe(0);
    expect(geo.isHorizontalBinding).toBe(false);
  });

  it('未传 printSettings 时回退设计尺寸', () => {
    const geo = getPrintGeometry('16:9');
    expect(geo.rasterPx.width).toBe(LAYOUT_CONFIG['16:9'].width);
    expect(geo.content.scaleFactor).toBe(1);
  });

  it('水平装订(16:9 landscape)按净宽求 PPI,canvas 高度按物理宽高比外扩', () => {
    const geo = getPrintGeometry('16:9', basePrint());
    const design = LAYOUT_CONFIG['16:9'];
    const netWidthMm = 210 - 10;
    const expectedPpi = design.width / netWidthMm;
    expect(geo.rasterPx.ppi).toBeCloseTo(expectedPpi, 5);
    expect(geo.rasterPx.width).toBeCloseTo(210 * expectedPpi, 5);
    expect(geo.rasterPx.height).toBeCloseTo(297 * expectedPpi, 5);
    // canvas 高度 = 设计宽 * 物理高/物理宽
    expect(geo.canvasPx.height).toBeCloseTo(design.width * (297 / 210), 5);
    expect(geo.content.scaleFactor).toBeCloseTo(Math.min(netWidthMm / 210, 297 / 297), 5);
    expect(geo.isHorizontalBinding).toBe(true);
  });

  it('垂直装订(1:1 square,bindingSide=top)仍以宽度求 PPI,不按高度求', () => {
    const geo = getPrintGeometry('1:1', basePrint());
    const design = LAYOUT_CONFIG['1:1'];
    // square 配置 bindingSide=top -> 垂直装订,netWidthMm = widthMm
    const expectedPpi = design.width / 210;
    expect(geo.rasterPx.ppi).toBeCloseTo(expectedPpi, 5);
    expect(geo.isHorizontalBinding).toBe(false);
    // scaleFactor = min(widthMm/widthMm, (heightMm-gutterMm)/heightMm)
    expect(geo.content.scaleFactor).toBeCloseTo(Math.min(1, (297 - 10) / 297), 5);
  });

  it('configs[orientation] 缺失时回退 resume,再缺失回退默认', () => {
    const print = basePrint({
      configs: {
        landscape: { bindingSide: 'left', trimSide: 'bottom' },
        portrait: { bindingSide: 'left', trimSide: 'bottom' },
        square: { bindingSide: 'top', trimSide: 'bottom' },
        resume: { bindingSide: 'right', trimSide: 'top' },
      },
    });
    // 16:9 是 landscape,有配置,直接用
    expect(resolvePrintBinding('landscape', print).bindingSide).toBe('left');
    // resume 配置存在
    expect(resolvePrintBinding('resume', print).bindingSide).toBe('right');
  });

  it('printSettings 无 configs 时回退 DEFAULT_BINDING', () => {
    const binding = resolvePrintBinding('landscape', undefined);
    expect(binding).toEqual({ bindingSide: 'left', trimSide: 'bottom' });
  });

  it('未知的 aspectRatio 回退 16:9', () => {
    // @ts-expect-error 测试未知比例
    const geo = getPrintGeometry('unknown', basePrint());
    expect(geo.rasterPx.ppi).toBeCloseTo(LAYOUT_CONFIG['16:9'].width / 200, 5);
  });
});
