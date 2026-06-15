import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetUrl } from '../useAssetUrl';
import * as db from '../../utils/db';

vi.mock('../../utils/db', () => ({
  getAsset: vi.fn()
}));

vi.mock('../../utils/native-fs', () => ({
  nativeFs: {
    readAssetFile: vi.fn(),
  },
}));

describe('useAssetUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      naturalWidth: number = 1920;
      naturalHeight: number = 1080;
      _src: string = '';
      get src() { return this._src; }
      set src(value: string) {
        this._src = value;
        setTimeout(() => this.onload(), 50);
      }
    } as any;
  });

  it('应该能正确加载普通 URL 并返回尺寸', async () => {
    const testUrl = 'https://example.com/test.jpg';
    const { result } = renderHook(() => useAssetUrl(testUrl));

    await waitFor(() => {
      expect(result.current.url).toBe(testUrl);
      expect(result.current.dimensions.width).toBe(1920);
      expect(result.current.dimensions.height).toBe(1080);
    }, { timeout: 3000 });
  });

  it('应该能处理 asset:// 协议的资源', async () => {
    const assetId = 'asset://test-image-id';
    vi.mocked(db.getAsset).mockResolvedValue('data:image/png;base64,xxxx');

    const { result } = renderHook(() => useAssetUrl(assetId));

    await waitFor(() => {
      expect(result.current.url).toBe('data:image/png;base64,xxxx');
      expect(result.current.dimensions.width).toBe(1920);
      expect(result.current.dimensions.height).toBe(1080);
    }, { timeout: 3000 });

    expect(db.getAsset).toHaveBeenCalledWith(assetId);
  });

  it('Electron 环境下优先读取本地文件并识别 SVG MIME', async () => {
    const assetId = 'asset://icon.svg';
    const { nativeFs } = await import('../../utils/native-fs');
    const readAssetFile = vi.fn().mockResolvedValue('abc123');
    (nativeFs.readAssetFile as ReturnType<typeof vi.fn>).mockImplementation(readAssetFile);

    const { result } = renderHook(() => useAssetUrl(assetId));

    await waitFor(() => {
      expect(result.current.url).toBe('data:image/svg+xml;base64,abc123');
    }, { timeout: 3000 });

    expect(readAssetFile).toHaveBeenCalledWith('icon.svg');
    expect(db.getAsset).not.toHaveBeenCalled();
  });

  it('Electron 读取失败时回退到 IndexedDB', async () => {
    const assetId = 'asset://fallback-id';
    const { nativeFs } = await import('../../utils/native-fs');
    const readAssetFile = vi.fn().mockRejectedValue(new Error('disk missing'));
    (nativeFs.readAssetFile as ReturnType<typeof vi.fn>).mockImplementation(readAssetFile);
    vi.mocked(db.getAsset).mockResolvedValue('data:image/png;base64,fallback');

    const { result } = renderHook(() => useAssetUrl(assetId));

    await waitFor(() => {
      expect(result.current.url).toBe('data:image/png;base64,fallback');
    }, { timeout: 3000 });

    expect(readAssetFile).toHaveBeenCalledWith('fallback-id');
    expect(db.getAsset).toHaveBeenCalledWith(assetId);
  });

  it('图片加载失败时尺寸回退到 0', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      _src: string = '';
      get src() { return this._src; }
      set src(value: string) {
        this._src = value;
        setTimeout(() => this.onerror(), 10);
      }
    } as any;

    const { result } = renderHook(() => useAssetUrl('https://example.com/bad.jpg'));

    await waitFor(() => {
      expect(result.current.url).toBe('https://example.com/bad.jpg');
      expect(result.current.dimensions).toEqual({ width: 0, height: 0 });
    }, { timeout: 3000 });
  });
});
