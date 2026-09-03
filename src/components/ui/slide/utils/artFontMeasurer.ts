export interface ArtFontDimensions {
  width: number;
  height: number;
}

/** Measures art font rendering dimensions via offscreen canvas with SSR safety fallback */
export function measureArtFontDimensions(
  text: string,
  fontSize: string | number,
  fontFamily: string = 'Inter, sans-serif',
  fontWeight: string | number = 900,
  lineHeight: number = 1,
  strokeWidth: number = 2
): ArtFontDimensions {
  if (!text) return { width: 0, height: 0 };

  const parsedFontSize = typeof fontSize === 'number' ? fontSize : (parseFloat(fontSize) || 120);
  const height = parsedFontSize * lineHeight;

  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${fontWeight} ${parsedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text.toUpperCase());
        const width = metrics.width * 1.05 + strokeWidth * 2;
        return { width: Math.ceil(width), height: Math.ceil(height) };
      }
    } catch {
      // 降级回退
    }
  }

  // 服务端或测试环境降级估算：大写英文字母平均宽高比约为 0.65
  const estimatedWidth = text.length * parsedFontSize * 0.65 + strokeWidth * 2;
  return { width: Math.ceil(estimatedWidth), height: Math.ceil(height) };
}
