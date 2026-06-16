import { describe, it, expect } from 'vitest';

// Replicate the font calculator logic from the web worker for pure-unit testing
function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      width += fontSize * 0.6;
    } else {
      width += fontSize * 1.0;
    }
  }
  return width;
}

function calculateFontSize(
  text: string,
  containerWidth: number,
  maxSize: number,
  minSize: number,
  lineHeight: number,
  maxLines: number,
): number {
  if (!text || !containerWidth) return maxSize;

  let fontSize = maxSize;
  let range = { min: minSize, max: maxSize };
  let retryCount = 0;

  while (retryCount <= 12 && range.max - range.min > 0.5) {
    const estimatedWidth = estimateTextWidth(text, fontSize);
    const estimatedHeight =
      (estimatedWidth / containerWidth) * fontSize * lineHeight;
    const maxHeight = fontSize * lineHeight * maxLines;

    if (
      estimatedHeight > maxHeight ||
      (maxLines === 1 && estimatedWidth > containerWidth)
    ) {
      const newMax = fontSize - 0.5;
      if (newMax <= range.min) break;
      range.max = newMax;
      fontSize = (range.min + range.max) / 2;
    } else {
      const newMin = fontSize + 0.5;
      if (newMin > range.max) break;
      range.min = newMin;
      fontSize = (range.min + range.max) / 2;
    }
    retryCount++;
  }

  return Math.floor(fontSize);
}

describe('fontCalculator', () => {
  it('returns maxSize when text is empty', () => {
    const result = calculateFontSize('', 800, 48, 12, 1.2, 2);
    expect(result).toBe(48);
  });

  it('returns maxSize when containerWidth is 0', () => {
    const result = calculateFontSize('Hello World', 0, 48, 12, 1.2, 2);
    expect(result).toBe(48);
  });

  it('reduces font size for long single-line text exceeding container', () => {
    // Long text on a single line (maxLines=1) with narrow container
    const result = calculateFontSize(
      'This is a very long sentence that should not fit',
      120,
      48,
      8,
      1.2,
      1,
    );
    expect(result).toBeLessThan(48);
    expect(result).toBeGreaterThanOrEqual(8);
  });

  it('reduces font size for multi-line text exceeding max height', () => {
    // Lots of text in a narrow container forcing font reduction
    const longText =
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    const result = calculateFontSize(longText, 200, 48, 8, 1.4, 3);
    expect(result).toBeLessThan(48);
    expect(result).toBeGreaterThanOrEqual(8);
  });

  it('keeps maxSize for short text that fits easily', () => {
    const result = calculateFontSize('Hi', 800, 48, 12, 1.2, 2);
    expect(result).toBe(48);
  });

  it('returns whole-number (floored) font size', () => {
    // Narrow container + moderate text should yield a floored result
    const result = calculateFontSize('Medium Length Text Here', 150, 36, 8, 1.2, 2);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('handles CJK characters which are wider than ASCII', () => {
    // Chinese text should be wider per character
    const cjkText = '中文标题测试';
    const asciiText = 'abcde';

    const cjkWidth = estimateTextWidth(cjkText, 24);
    const asciiWidth = estimateTextWidth(asciiText, 24);

    // 6 CJK chars * 24 = 144; 5 ASCII chars * 24 * 0.6 = 72
    expect(cjkWidth).toBe(144);
    expect(asciiWidth).toBe(72);
  });
});
