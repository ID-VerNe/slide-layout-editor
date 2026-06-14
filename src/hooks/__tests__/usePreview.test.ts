import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreview } from '../usePreview';

const samplePages = [
  { id: 'p1', aspectRatio: '16:9' },
  { id: 'p2', aspectRatio: '2:3' },
];

function createContainer(rect: Partial<DOMRect>) {
  const container = document.createElement('div');
  Object.defineProperty(container, 'getBoundingClientRect', {
    value: () => ({ width: 1200, height: 800, x: 0, y: 0, ...rect }),
    configurable: true,
  });
  return container;
}

function setAutoResizeObserver() {
  class ResizeObserverMock {
    constructor(private cb: Function) {}
    observe() { this.cb(); }
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverMock as any;
}

describe('usePreview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('默认返回 0.5 缩放', () => {
    const { result } = renderHook(() =>
      usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any })
    );
    expect(result.current.previewZoom).toBe(0.5);
    expect(result.current.isAutoFit).toBe(true);
  });

  it('ResizeObserver 在容器变化时重算 zoom', () => {
    setAutoResizeObserver();

    const { result, rerender } = renderHook(
      ({ isLoaded }) => usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any, isLoaded }),
      { initialProps: { isLoaded: false } }
    );

    result.current.previewContainerRef.current = createContainer({ width: 1200, height: 800 });
    rerender({ isLoaded: true });

    expect(result.current.previewZoom).not.toBe(0.5);
    expect(result.current.previewZoom).toBeGreaterThan(0);
  });

  it('isLoaded=false 时不进行计算', () => {
    const { result } = renderHook(() =>
      usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any, isLoaded: false })
    );

    vi.advanceTimersByTime(300);
    expect(result.current.previewZoom).toBe(0.5);
  });

  it('手动缩放会关闭自动适配', () => {
    const { result } = renderHook(() =>
      usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any })
    );

    act(() => result.current.handleManualZoom(0.75));
    expect(result.current.previewZoom).toBe(0.75);
    expect(result.current.isAutoFit).toBe(false);
  });

  it('toggleFit 切换自动适配状态', () => {
    const { result } = renderHook(() =>
      usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any })
    );

    act(() => result.current.toggleFit());
    expect(result.current.isAutoFit).toBe(false);

    act(() => result.current.toggleFit());
    expect(result.current.isAutoFit).toBe(true);
  });

  it('打印设置启用时按纸张尺寸计算', () => {
    setAutoResizeObserver();

    const { result, rerender } = renderHook(
      ({ isLoaded }) =>
        usePreview({
          pages: [{ id: 'p1', aspectRatio: '16:9' }],
          currentPageIndex: 0,
          printSettings: { enabled: true, widthMm: 210, heightMm: 297, gutterMm: 0 } as any,
          isLoaded,
        }),
      { initialProps: { isLoaded: false } }
    );

    result.current.previewContainerRef.current = createContainer({ width: 1200, height: 800 });
    rerender({ isLoaded: true });

    expect(result.current.previewZoom).not.toBe(0.5);
  });

  it('溢出状态相同时不重新创建对象', () => {
    const { result } = renderHook(() =>
      usePreview({ pages: samplePages, currentPageIndex: 0, printSettings: { enabled: false } as any })
    );

    act(() => result.current.handleOverflowChange('p1', true));
    const firstOverflow = result.current.pagesOverflow;

    act(() => result.current.handleOverflowChange('p1', true));
    expect(result.current.pagesOverflow).toBe(firstOverflow);

    act(() => result.current.handleOverflowChange('p1', false));
    expect(result.current.pagesOverflow).not.toBe(firstOverflow);
    expect(result.current.pagesOverflow.p1).toBe(false);
  });

  it('切换页面时重新计算 zoom', () => {
    setAutoResizeObserver();

    const { result, rerender } = renderHook(
      ({ idx, isLoaded }: { idx: number; isLoaded: boolean }) =>
        usePreview({ pages: samplePages, currentPageIndex: idx, printSettings: { enabled: false } as any, isLoaded }),
      { initialProps: { idx: 0, isLoaded: false } }
    );

    result.current.previewContainerRef.current = createContainer({ width: 1200, height: 800 });
    rerender({ idx: 1, isLoaded: true });

    expect(result.current.previewZoom).not.toBe(0.5);
  });
});
