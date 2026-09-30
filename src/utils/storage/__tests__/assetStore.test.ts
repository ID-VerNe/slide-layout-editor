import { describe, it, expect, vi } from 'vitest';
import { saveAsset, getAsset } from '../assetStore';
import { createMockIDB, setupIdbSandbox } from './idbMock';

describe('assetStore', () => {
  setupIdbSandbox();

  describe('saveAsset', () => {
    it('非 data URL 直接返回', async () => {
      const url = await saveAsset('https://example.com/img.png');
      expect(url).toBe('https://example.com/img.png');
    });

    it('Web 路径下 saveAsset/getAsset 往返', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      const dataUrl = 'data:image/png;base64,abc123';
      const assetId = await saveAsset(dataUrl);
      expect(assetId.startsWith('asset://')).toBe(true);

      const result = await getAsset(assetId);
      expect(result).toBe(dataUrl);
    });

    it('Electron 成功上传时返回本地 URL', async () => {
      (globalThis as any).electronAPI = {
        uploadAsset: vi.fn().mockResolvedValue({ success: true, url: 'file:///assets/img.png' }),
      };

      const result = await saveAsset('data:image/png;base64,abc');
      expect(result).toBe('file:///assets/img.png');
    });

    it('Electron 上传失败时回退到 IndexedDB', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;
      (globalThis as any).electronAPI = {
        uploadAsset: vi.fn().mockRejectedValue(new Error('upload failed')),
      };

      const result = await saveAsset('data:image/png;base64,abc');
      expect(result.startsWith('asset://')).toBe(true);
      expect(await getAsset(result)).toBe('data:image/png;base64,abc');
    });
  });

  describe('getAsset', () => {
    it('Electron 读取成功时返回 base64 data URL', async () => {
      (globalThis as any).electronAPI = {
        readAssetFile: vi.fn().mockResolvedValue('base64data'),
      };

      const png = await getAsset('asset://file.png');
      expect(png).toBe('data:image/png;base64,base64data');

      const svg = await getAsset('asset://file.svg');
      expect(svg).toBe('data:image/svg+xml;base64,base64data');
    });

    it('Electron 读取失败时回退到 IndexedDB', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;
      (globalThis as any).electronAPI = {
        readAssetFile: vi.fn().mockRejectedValue(new Error('read failed')),
      };

      const dataUrl = 'data:image/png;base64,abc';
      const assetId = await saveAsset(dataUrl);
      expect(await getAsset(assetId)).toBe(dataUrl);
    });

    it('非 asset:// ID 直接返回原值', async () => {
      expect(await getAsset('https://example.com/img.png')).toBe('https://example.com/img.png');
    });
  });
});
