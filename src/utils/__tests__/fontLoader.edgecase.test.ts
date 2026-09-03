import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerCustomFontInDOM } from '../fontLoader';

describe('fontLoader Edge Cases (asset:// Protocol & Font Security)', () => {
  let mockFontsAdd: any;
  let mockFontFaces: any[];

  beforeEach(() => {
    mockFontFaces = [];
    mockFontsAdd = vi.fn((ff: any) => mockFontFaces.push(ff));

    (global as any).document.fonts = {
      add: mockFontsAdd,
      delete: vi.fn(),
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

  it('correctly loads and registers asset:// protocol fonts for Electron projects', async () => {
    const font = {
      name: 'Project Archive Font',
      family: 'ProjectArchiveFont',
      dataUrl: 'asset://assets/project_font_hash.woff2',
    };

    await registerCustomFontInDOM(font);

    expect(mockFontsAdd).toHaveBeenCalledTimes(1);
    expect(mockFontFaces[0].family).toBe('ProjectArchiveFont');
    expect(mockFontFaces[0].source).toBe('url(asset://assets/project_font_hash.woff2)');
  });

  it('rejects invalid or unsafe protocols like ftp:// or javascript:', async () => {
    const maliciousFont = {
      name: 'Malicious',
      family: 'MaliciousFont',
      dataUrl: 'javascript:alert(1)',
    };

    await registerCustomFontInDOM(maliciousFont);

    expect(mockFontsAdd).not.toHaveBeenCalled();
  });
});
