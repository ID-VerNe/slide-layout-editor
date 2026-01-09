import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResponsiveImages, generateSrcSet } from '../imageUtils';

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
  });
});
