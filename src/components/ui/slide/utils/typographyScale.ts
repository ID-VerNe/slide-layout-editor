/**
 * typographyScale - 8px 基线与模块化字阶纯数学换算工具
 */

/** Resolves modular font size into exact physical pixel value based on 8px rhythm grid */
export function resolveModularFontSize(size: number | string | undefined | null): number | undefined {
  if (size === undefined || size === null) return undefined;

  // 1. 数字类型：严格按 8px 基线网格换算
  if (typeof size === 'number') {
    if (isNaN(size) || size <= 0) return undefined;
    return Math.round(size * 8);
  }

  const str = String(size).trim();
  if (!str) return undefined;

  // 2. rem 与 em 单位：基准 16px 换算为像素
  if (str.endsWith('rem') || str.endsWith('em')) {
    const val = parseFloat(str);
    return isNaN(val) ? undefined : Math.round(val * 16);
  }

  // 3. px 单位：直接读取像素数值
  if (str.endsWith('px')) {
    const val = parseFloat(str);
    return isNaN(val) ? undefined : Math.round(val);
  }

  // 4. pt 单位：印刷点单位换算 1pt = 4/3 px
  if (str.endsWith('pt')) {
    const val = parseFloat(str);
    return isNaN(val) ? undefined : Math.round(val * (4 / 3));
  }

  // 5. 纯数字字符串：遵循 8px 基线网格换算
  const num = parseFloat(str);
  if (!isNaN(num) && num > 0) {
    return Math.round(num * 8);
  }

  return undefined;
}

/** Snaps line height to nearest 8px rhythm grid step */
export function resolveModularLineHeight(fontSizePx: number, leadingMultiplier: number = 1.2): number {
  const targetLeading = fontSizePx * leadingMultiplier;
  // 向上吸附到 8px 的整数倍
  return Math.ceil(targetLeading / 8) * 8;
}
