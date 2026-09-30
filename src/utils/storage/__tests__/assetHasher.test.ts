import { describe, it, expect } from 'vitest';
import { hashDataUrl, extFromDataUrl } from '../assetHasher';

describe('assetHasher', () => {
  describe('hashDataUrl', () => {
    it('相同 data URL 哈希稳定', async () => {
      const dataUrl = 'data:image/png;base64,abc123';
      const a = await hashDataUrl(dataUrl);
      const b = await hashDataUrl(dataUrl);
      expect(a).toBe(b);
    });

    it('不同 data URL 哈希不同', async () => {
      const a = await hashDataUrl('data:image/png;base64,abc');
      const b = await hashDataUrl('data:image/png;base64,xyz');
      expect(a).not.toBe(b);
    });

    it('无 base64 段时原样返回', async () => {
      const url = 'https://example.com/img.png';
      expect(await hashDataUrl(url)).toBe(url);
    });
  });

  describe('extFromDataUrl', () => {
    it('识别 png', () => {
      expect(extFromDataUrl('data:image/png;base64,xxx')).toBe('png');
    });
    it('识别 jpg', () => {
      expect(extFromDataUrl('data:image/jpeg;base64,xxx')).toBe('jpg');
    });
    it('识别 webp', () => {
      expect(extFromDataUrl('data:image/webp;base64,xxx')).toBe('webp');
    });
    it('识别 svg', () => {
      expect(extFromDataUrl('data:image/svg+xml;base64,xxx')).toBe('svg');
    });
    it('识别 gif', () => {
      expect(extFromDataUrl('data:image/gif;base64,xxx')).toBe('gif');
    });
    it('未知类型回退 png', () => {
      expect(extFromDataUrl('data:application/octet-stream;base64,xxx')).toBe('octet-stream');
    });
    it('无 MIME 前缀回退 png', () => {
      expect(extFromDataUrl('not-a-data-url')).toBe('png');
    });
  });
});
