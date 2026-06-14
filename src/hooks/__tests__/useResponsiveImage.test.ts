import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResponsiveImage } from '../useResponsiveImage';
import * as db from '../../utils/db';
import * as imageUtils from '../../utils/imageUtils';

vi.mock('../../utils/db', () => ({
  getAsset: vi.fn(),
}));

describe('useResponsiveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('非 asset:// / data: 来源直接返回原 URL', () => {
    const { result } = renderHook(() => useResponsiveImage('https://example.com/cat.jpg'));
    expect(result.current.url).toBe('https://example.com/cat.jpg');
    expect(result.current.isLoading).toBe(false);
  });

  it('无来源时返回空', () => {
    const { result } = renderHook(() => useResponsiveImage(undefined));
    expect(result.current.url).toBeUndefined();
    expect(result.current.srcSet).toBe('');
  });

  it('普通 asset 非 priority 只返回 URL', async () => {
    vi.mocked(db.getAsset).mockResolvedValue('data:image/png;base64,abc');

    const { result } = renderHook(() => useResponsiveImage('asset://test', { priority: false }));

    await waitFor(() => expect(result.current.url).toBe('data:image/png;base64,abc'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.srcSet).toBe('');
    expect(result.current.variants).toEqual({});
  });

  it('priority 模式下生成 srcSet 与 variants', async () => {
    const variants = [
      { url: 'img-320.webp', width: 320, height: 200, format: 'webp' as const },
      { url: 'img-640.webp', width: 640, height: 400, format: 'webp' as const },
      { url: 'img-320.avif', width: 320, height: 200, format: 'avif' as const },
    ];
    vi.mocked(db.getAsset).mockResolvedValue('data:image/png;base64,abc');
    vi.spyOn(imageUtils, 'generateResponsiveImages').mockResolvedValue(variants);

    const { result } = renderHook(() => useResponsiveImage('asset://test', { priority: true }));

    await waitFor(() => expect(result.current.url).toBe('data:image/png;base64,abc'));
    // srcSet 包含所有 format 的 variant
    expect(result.current.srcSet).toBe('img-320.webp 320w, img-640.webp 640w, img-320.avif 320w');
    expect(result.current.variants?.webp?.srcSet).toBe('img-320.webp 320w, img-640.webp 640w');
    expect(result.current.variants?.avif?.srcSet).toBe('img-320.avif 320w');
    expect(result.current.isLoading).toBe(false);
  });

  it('加载完成后卸载不再更新状态', async () => {
    let resolveGetAsset: (value: string) => void = () => {};
    vi.mocked(db.getAsset).mockImplementation(() => new Promise(r => { resolveGetAsset = r; }));

    const { result, unmount } = renderHook(() => useResponsiveImage('asset://slow', { priority: false }));

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    unmount();
    resolveGetAsset('data:image/png;base64,late');

    // 状态不应更新，但 React 会抛出警告 if set state after unmount; 这里验证没有崩溃即可
    expect(result.current.url).toBeUndefined();
  });

  it('加载失败时应停止 loading 并记录错误', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(db.getAsset).mockRejectedValue(new Error('db unavailable'));

    const { result } = renderHook(() => useResponsiveImage('asset://bad', { priority: false }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
