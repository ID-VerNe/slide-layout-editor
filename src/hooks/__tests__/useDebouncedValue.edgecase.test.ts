import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue Edge Cases (Unmount Flush & Manual Flush)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes pending uncommitted value synchronously when unmounting', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedValue('initial', onChange, 300),
    );

    act(() => {
      result.current[1]('typing fast before scroll');
    });

    // 尚未到期，尚未调用
    expect(onChange).not.toHaveBeenCalled();

    // 模拟虚拟列表滚动导致组件突然卸载 (Unmount)
    unmount();

    // 验证：卸载时必须立即同步刷盘，输入内容不丢失
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('typing fast before scroll');
  });

  it('supports explicit flush() call to commit pending changes immediately', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedValue('initial', onChange, 300),
    );

    act(() => {
      result.current[1]('blur value');
    });

    expect(onChange).not.toHaveBeenCalled();

    // 触发 onBlur 或主动 flush
    act(() => {
      const flush = result.current[2];
      flush();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('blur value');

    // 计时器到期后不应该重复触发
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not flush if value has not changed from initialValue', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedValue('initial', onChange, 300),
    );

    act(() => {
      // 变动后改回原值
      result.current[1]('temporary');
      result.current[1]('initial');
    });

    unmount();

    expect(onChange).not.toHaveBeenCalled();
  });
});
