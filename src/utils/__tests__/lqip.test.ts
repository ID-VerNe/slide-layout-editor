import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateLQIP, blurDataURL } from '../lqip';

describe('generateLQIP', () => {
  let originalImage: typeof global.Image;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalImage = global.Image;
    originalCreateElement = document.createElement.bind(document);
  });

  afterEach(() => {
    global.Image = originalImage;
    document.createElement = originalCreateElement;
  });

  function mockCanvas() {
    const toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mock');
    const drawImage = vi.fn();
    const mockCtx = { drawImage };
    const origCreate = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { width: 0, height: 0, getContext: () => mockCtx, toDataURL } as any;
      }
      return (origCreate as any).call(document, tag);
    });
    return { drawImage, toDataURL };
  }

  it('成功生成 LQIP DataURL', async () => {
    mockCanvas();
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        queueMicrotask(() => this.onload?.());
      }
    } as any;

    const result = await generateLQIP('https://example.com/img.jpg');
    expect(result).toBe('data:image/jpeg;base64,mock');
  });

  it('外部 HTTP URL 设置 crossOrigin = anonymous', async () => {
    mockCanvas();
    let crossOrigin = '';
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        crossOrigin = this.crossOrigin;
        queueMicrotask(() => this.onload?.());
      }
    } as any;

    await generateLQIP('https://example.com/img.jpg');
    expect(crossOrigin).toBe('anonymous');
  });

  it('非 HTTP URL 不设置 crossOrigin', async () => {
    mockCanvas();
    let crossOrigin = 'set';
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        crossOrigin = this.crossOrigin;
        queueMicrotask(() => this.onload?.());
      }
    } as any;

    await generateLQIP('asset://abc123');
    expect(crossOrigin).toBe('');
  });

  it('图片加载失败时 reject', async () => {
    mockCanvas();
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        queueMicrotask(() => this.onerror?.());
      }
    } as any;

    await expect(generateLQIP('bad.jpg')).rejects.toThrow('Failed to load image for LQIP generation');
  });

  it('canvas context 为 null 时 reject', async () => {
    const origCreate = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { width: 0, height: 0, getContext: () => null, toDataURL: vi.fn() } as any;
      }
      return (origCreate as any).call(document, tag);
    });

    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        queueMicrotask(() => this.onload?.());
      }
    } as any;

    await expect(generateLQIP('test.jpg')).rejects.toThrow('Failed to get canvas context');
  });
});

describe('blurDataURL', () => {
  it('返回输入的 dataUrl（恒等函数）', () => {
    const input = 'data:image/jpeg;base64,abc123';
    expect(blurDataURL(input)).toBe(input);
  });

  it('接受自定义 blurAmount 参数', () => {
    const input = 'data:image/jpeg;base64,xyz';
    expect(blurDataURL(input, 20)).toBe(input);
  });
});
