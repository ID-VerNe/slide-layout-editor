import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerCustomFontInDOM, loadCustomFontsIntoDOM, removeCustomFontFromDOM } from '../fontLoader';

describe('fontLoader', () => {
  let mockFontsAdd: any;
  let mockFontsDelete: any;
  let mockFontFaces: any[];

  beforeEach(() => {
    mockFontFaces = [];
    mockFontsAdd = vi.fn((ff: any) => mockFontFaces.push(ff));
    mockFontsDelete = vi.fn((ff: any) => {
      const idx = mockFontFaces.indexOf(ff);
      if (idx > -1) mockFontFaces.splice(idx, 1);
    });

    // Mock document.fonts
    (global as any).document.fonts = {
      add: mockFontsAdd,
      delete: mockFontsDelete,
      values: () => mockFontFaces.values(),
    };

    class MockFontFace {
      family: string;
      source: string;
      constructor(family: string, source: string) {
        this.family = family;
        this.source = source;
      }
      async load() {
        return this;
      }
    }

    (global as any).FontFace = MockFontFace;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerCustomFontInDOM 正常注册合法字体的 FontFace 并添加到 document.fonts', async () => {
    const font = {
      name: 'CustomTest',
      family: 'custom-test-123',
      dataUrl: 'data:font/woff2;base64,d09GMgABAAAAAA...',
    };

    await registerCustomFontInDOM(font);

    expect(mockFontsAdd).toHaveBeenCalled();
  });

  it('loadCustomFontsIntoDOM 批量并发加载字体', async () => {
    const fonts = [
      { name: 'FontA', family: 'custom-a-1', dataUrl: 'data:font/ttf;base64,AAAA...' },
      { name: 'FontB', family: 'custom-b-2', dataUrl: 'https://example.com/font.woff2' },
    ];

    await loadCustomFontsIntoDOM(fonts);

    expect(mockFontsAdd).toHaveBeenCalledTimes(2);
  });

  it('跳过非法或非字体格式的 URL', async () => {
    const invalidFont = {
      name: 'Malicious',
      family: 'custom-bad-1',
      dataUrl: 'javascript:alert(1)',
    };

    await registerCustomFontInDOM(invalidFont);

    expect(mockFontsAdd).not.toHaveBeenCalled();
  });

  it('removeCustomFontFromDOM 能够从 document.fonts 中移除目标字体', async () => {
    const font = {
      name: 'ToRemove',
      family: 'custom-remove-99',
      dataUrl: 'data:font/woff2;base64,xxxx',
    };

    await registerCustomFontInDOM(font);
    expect(mockFontFaces.length).toBe(1);

    removeCustomFontFromDOM('custom-remove-99');
    expect(mockFontsDelete).toHaveBeenCalled();
  });
});
