import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImagePreload } from '../useImagePreload';
import { imagePreloader } from '../../utils/imagePreloader';
import { useStore } from '../../store/useStore';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(),
}));

function makePage(id: string, imageUrls: string[]): any {
  return { id, coverUrl: imageUrls[0], gallery: imageUrls.slice(1).map(url => ({ imageUrl: url })) };
}

describe('useImagePreload', () => {
  beforeEach(() => {
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        pages: [
          makePage('p0', ['https://a/0.jpg']),
          makePage('p1', ['https://a/1.jpg', 'https://a/2.jpg']),
          makePage('p2', ['https://a/3.jpg']),
          makePage('p3', ['https://a/4.jpg']),
          makePage('p4', ['https://a/5.jpg']),
        ],
        currentPageIndex: 2,
      };
      return selector ? selector(state) : state;
    });
    imagePreloader.clear();
    vi.clearAllMocks();
  });

  it('预加载当前页与相邻页图片，当前页图片以高优先级', async () => {
    const preloadSpy = vi.spyOn(imagePreloader, 'preload').mockResolvedValue(undefined);

    renderHook(() => useImagePreload());

    await waitFor(() => {
      // 当前页 p2 与相邻两页的 p0,p1,p3,p4
      expect(preloadSpy.mock.calls.map(c => c[0]).sort()).toEqual(
        ['https://a/0.jpg', 'https://a/1.jpg', 'https://a/2.jpg', 'https://a/3.jpg', 'https://a/4.jpg', 'https://a/5.jpg'].sort()
      );
    });

    // 当前页图片应为高优先级
    expect(preloadSpy).toHaveBeenCalledWith('https://a/3.jpg', 'high');
    expect(preloadSpy).toHaveBeenCalledWith('https://a/0.jpg', 'normal');
  });

  it('切换页面后重新调整预加载队列', async () => {
    const clearUrlsSpy = vi.spyOn(imagePreloader, 'clearUrls').mockImplementation(() => {});
    const preloadSpy = vi.spyOn(imagePreloader, 'preload').mockResolvedValue(undefined);

    const { rerender } = renderHook(() => useImagePreload());

    // 等待初始 effect 完成
    await waitFor(() => expect(preloadSpy).toHaveBeenCalled());

    // 切换 currentPageIndex 到末尾
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = { pages: [makePage('p0', ['https://a/a.jpg']), makePage('p1', ['https://a/b.jpg'])], currentPageIndex: 1 };
      return selector ? selector(state) : state;
    });

    rerender();

    expect(clearUrlsSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(preloadSpy).toHaveBeenCalledWith('https://a/b.jpg', 'high');
    });
  });

  it('空页面不触发预加载', () => {
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = { pages: [], currentPageIndex: 0 };
      return selector ? selector(state) : state;
    });

    const preloadSpy = vi.spyOn(imagePreloader, 'preload').mockResolvedValue(undefined);
    renderHook(() => useImagePreload());

    expect(preloadSpy).not.toHaveBeenCalled();
  });

  it('单个图片失败不应阻塞其他预加载', async () => {
    vi.spyOn(imagePreloader, 'preload').mockImplementation((url?: string) => {
      if (url === 'https://a/bad.jpg') return Promise.reject(new Error('fail'));
      return Promise.resolve(undefined);
    });

    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = { pages: [makePage('p0', ['https://a/bad.jpg', 'https://a/good.jpg'])], currentPageIndex: 0 };
      return selector ? selector(state) : state;
    });

    // 不应抛出未处理的异常
    expect(() => renderHook(() => useImagePreload())).not.toThrow();

    await waitFor(() => {
      expect(imagePreloader.preload).toHaveBeenCalledWith('https://a/good.jpg', 'high');
    });
  });
});
