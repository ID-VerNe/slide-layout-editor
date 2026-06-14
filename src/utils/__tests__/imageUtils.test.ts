import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResponsiveImages, generateSrcSet, generateSizes } from '../imageUtils';

describe('imageUtils', () => {
  beforeEach(() => {
    // 模拟 electronAPI
    (window as any).electronAPI = {
      processResponsiveImages: vi.fn().mockResolvedValue([
        { url: 'image-320.webp', width: 320, height: 200, format: 'webp' },
        { url: 'image-640.webp', width: 640, height: 400, format: 'webp' }
      ])
    };
  });

  describe('generateResponsiveImages', () => {
    it('should call electronAPI.processResponsiveImages', async () => {
      const variants = await generateResponsiveImages('asset://test.jpg');

      expect((window as any).electronAPI.processResponsiveImages).toHaveBeenCalled();
      expect(variants).toHaveLength(2);
      expect(variants[0].width).toBe(320);
    });

    it('非 Electron 环境下返回空数组并警告', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      delete (window as any).electronAPI;

      const variants = await generateResponsiveImages('data:image/png;base64,xxx');

      expect(variants).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Electron'));
      warnSpy.mockRestore();
    });

    it('data URL 应提取 base64 后传给主进程', async () => {
      const processSpy = (window as any).electronAPI.processResponsiveImages;
      await generateResponsiveImages('data:image/png;base64,hello');
      expect(processSpy).toHaveBeenCalledWith('hello', ['webp', 'jpg']);
    });

    it('asset:// 直接把整个 URL 交给主进程', async () => {
      const processSpy = (window as any).electronAPI.processResponsiveImages;
      await generateResponsiveImages('asset://foo.png');
      expect(processSpy).toHaveBeenCalledWith('asset://foo.png', ['webp', 'jpg']);
    });

    it('主进程抛错时向上传播', async () => {
      (window as any).electronAPI.processRejectedValue = new Error('sharp failed');
      (window as any).electronAPI.processResponsiveImages = vi.fn().mockRejectedValue(new Error('sharp failed'));
      await expect(generateResponsiveImages('asset://bad.jpg')).rejects.toThrow('sharp failed');
    });
  });

  describe('generateSrcSet', () => {
    it('should generate valid srcset string', () => {
      const variants = [
        { url: 'image-320.webp', width: 320, height: 200, format: 'webp' as const },
        { url: 'image-640.webp', width: 640, height: 400, format: 'webp' as const }
      ];

      const srcSet = generateSrcSet(variants);
      expect(srcSet).toBe('image-320.webp 320w, image-640.webp 640w');
    });

    it('空数组返回空字符串', () => {
      expect(generateSrcSet([])).toBe('');
    });
  });

  describe('generateSizes', () => {
    it('生成响应式 sizes 字符串', () => {
      const sizes = generateSizes({
        variants: [],
        defaultVariant: { url: 'x', width: 100, height: 100, format: 'webp' },
        breakpoints: { mobile: 640, tablet: 1024, desktop: 1440 },
      });
      expect(sizes).toContain('33vw');
      expect(sizes).toContain('640px');
      expect(sizes).toContain('1024px');
      expect(sizes).toContain('50vw');
    });
  });
});
