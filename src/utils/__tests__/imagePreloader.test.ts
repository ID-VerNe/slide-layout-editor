import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imagePreloader } from '../imagePreloader';

describe('imagePreloader', () => {
  beforeEach(() => {
    imagePreloader.clear();
    // 模拟 Image 对象
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => {
            if (this.src) this.onload();
        }, 10);
      }
    } as any;
  });

  it('should preload images', async () => {
    const url = 'test.jpg';
    await imagePreloader.preload(url);
    // 如果没有报错说明成功
    expect(true).toBe(true);
  });

  it('should preload multiple images', async () => {
    const urls = ['image1.jpg', 'image2.jpg'];
    const results = await imagePreloader.preloadMultiple(urls);
    expect(results).toHaveLength(2);
  });
});
