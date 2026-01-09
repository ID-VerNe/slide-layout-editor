import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetUrl } from '../useAssetUrl';
import * as db from '../../utils/db';

vi.mock('../../utils/db', () => ({
  getAsset: vi.fn()
}));

vi.mock('../../utils/blobManager', () => ({
  blobManager: {
    create: vi.fn().mockImplementation((blob, id) => `blob:${id}`),
    release: vi.fn()
  }
}));

describe('useAssetUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    global.Image = class {
      onload: () => void = () => {};
      src: string = '';
      width: number = 1920;
      height: number = 1080;
      constructor() {
        // 模拟图片加载延迟
        setTimeout(() => this.onload(), 50);
      }
    } as any;
  });

  it('应该能正确加载普通 URL 并返回尺寸', async () => {
    const testUrl = 'https://example.com/test.jpg';
    const { result } = renderHook(() => useAssetUrl(testUrl));

    // 使用 expect 确保 waitFor 会重试
    await waitFor(() => {
      expect(result.current.dimensions.width).toBe(1920);
    }, { timeout: 3000 });

    expect(result.current.url).toBe(testUrl);
  });

  it('应该能处理 asset:// 协议的资源', async () => {
    const assetId = 'asset://test-image-id';
    vi.mocked(db.getAsset).mockResolvedValue('data:image/png;base64,xxxx');

    const { result } = renderHook(() => useAssetUrl(assetId));

    await waitFor(() => {
      expect(result.current.url).toBe('data:image/png;base64,xxxx');
      expect(result.current.dimensions.width).toBe(1920);
    }, { timeout: 3000 });
  });
});