import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { imagePreloader } from '../imagePreloader';

describe('imagePreloader', () => {
  beforeEach(() => {
    imagePreloader.clear();
    (imagePreloader as any).runningLoads = 0;
    (imagePreloader as any).queue = [];
    (imagePreloader as any).activeLoads.clear();
    (imagePreloader as any).loadingPromises.clear();
    (imagePreloader as any).drainTimer = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createImmediateImage() {
    return class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => {
          if (this.src) this.onload();
        }, 10);
      }
    } as any;
  }

  it('should preload images', async () => {
    global.Image = createImmediateImage();
    const url = 'test.jpg';
    await imagePreloader.preload(url);
    expect(true).toBe(true);
  });

  it('should preload multiple images', async () => {
    global.Image = createImmediateImage();
    const urls = ['image1.jpg', 'image2.jpg'];
    const results = await imagePreloader.preloadMultiple(urls);
    expect(results).toHaveLength(2);
  });

  it('high priority inserts at front of queue', () => {
    global.Image = createImmediateImage();
    imagePreloader.preload('normal-1.jpg');
    imagePreloader.preload('high.jpg', 'high');
    imagePreloader.preload('normal-2.jpg');

    const queue = (imagePreloader as any).queue as { url: string }[];
    expect(queue[0].url).toBe('high.jpg');
  });

  it('单个图片加载失败不应阻塞其他预加载', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => {
          if (this.src === 'bad.jpg') {
            this.onerror();
          } else {
            this.onload();
          }
        }, 10);
      }
    } as any;

    const results = await imagePreloader.preloadMultiple(['bad.jpg', 'good.jpg']);
    expect(results).toHaveLength(2);
    expect(results[0]).toBeUndefined();
    expect(results[1]).toBeUndefined();
  });

  it('clear 取消所有进行中的加载并清空缓存 promises', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      _src: string = '';
      get src() { return this._src; }
      set src(value: string) {
        this._src = value;
        setTimeout(() => this.onload(), 1000);
      }
    } as any;

    const promise = imagePreloader.preload('pending.jpg');
    await vi.advanceTimersByTimeAsync(50);

    expect((imagePreloader as any).loadingPromises.has('pending.jpg')).toBe(true);

    imagePreloader.clear();

    expect((imagePreloader as any).loadingPromises.has('pending.jpg')).toBe(false);

    const afterClear = imagePreloader.preload('pending.jpg');
    expect(afterClear).not.toBe(promise);
  });

  it('clearUrls 仅取消指定 URL 的加载', async () => {
    let goodLoaded = false;
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      _src: string = '';
      get src() { return this._src; }
      set src(value: string) {
        this._src = value;
        setTimeout(() => {
          if (value === 'good.jpg') goodLoaded = true;
          if (typeof this.onload === 'function') this.onload();
        }, 200);
      }
    } as any;

    const goodPromise = imagePreloader.preload('good.jpg');
    const removePromise = imagePreloader.preload('remove.jpg');

    await vi.advanceTimersByTimeAsync(50);
    expect((imagePreloader as any).activeLoads.has('good.jpg')).toBe(true);
    expect((imagePreloader as any).activeLoads.has('remove.jpg')).toBe(true);

    imagePreloader.clearUrls(['remove.jpg']);

    expect((imagePreloader as any).activeLoads.has('remove.jpg')).toBe(false);
    expect((imagePreloader as any).activeLoads.has('good.jpg')).toBe(true);
    expect(imagePreloader.preload('remove.jpg')).not.toBe(removePromise);

    await vi.advanceTimersByTimeAsync(300);
    expect(goodLoaded).toBe(true);
    await expect(goodPromise).resolves.toBeUndefined();
  });

  it('preload(undefined) 早返回不报错', async () => {
    global.Image = createImmediateImage();
    await expect(imagePreloader.preload(undefined as any)).resolves.toBeUndefined();
  });

  it('同一 URL 重复 preload 返回同一 promise', () => {
    global.Image = createImmediateImage();
    const p1 = imagePreloader.preload('dedup.jpg');
    const p2 = imagePreloader.preload('dedup.jpg');
    expect(p1).toBe(p2);
  });

  it('preloadMultiple 过滤 falsy URL', async () => {
    global.Image = createImmediateImage();
    const results = await imagePreloader.preloadMultiple(['', 'valid.jpg', undefined as any, null as any]);
    expect(results).toHaveLength(1);
  });

  it('HTTP URL 设置 crossOrigin = anonymous', async () => {
    let capturedCrossOrigin = '';
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin = '';
      _src = '';
      get src() { return this._src; }
      set src(v: string) {
        this._src = v;
        capturedCrossOrigin = this.crossOrigin;
        setTimeout(() => this.onload?.(), 10);
      }
    } as any;

    await imagePreloader.preload('http://example.com/img.jpg');
    expect(capturedCrossOrigin).toBe('anonymous');
  });
});
