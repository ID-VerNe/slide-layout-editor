import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('syncs value from initialValue on mount', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedValue('hello', onChange, 300),
    );

    expect(result.current[0]).toBe('hello');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange after debounce delay when value changes', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedValue('initial', onChange, 300),
    );

    act(() => {
      result.current[1]('updated');
    });

    // onChange should not have been called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers past the debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('does not call onChange when internal value matches external initialValue', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedValue('same', onChange, 300),
    );

    act(() => {
      result.current[1]('same');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // onChange should not be called because value equals initialValue
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { result, unmount } = renderHook(() =>
      useDebouncedValue('val', onChange, 300),
    );

    act(() => {
      result.current[1]('new value');
    });

    unmount();

    // After unmount, the timer should have been cleaned up
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('updates internal value when external initialValue changes', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ initialValue }) => useDebouncedValue(initialValue, onChange, 300),
      { initialProps: { initialValue: 'first' } },
    );

    expect(result.current[0]).toBe('first');

    rerender({ initialValue: 'second' });

    expect(result.current[0]).toBe('second');
  });

  it('fires onImmediateChange synchronously on every value change', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const onImmediate = vi.fn();

    const { result } = renderHook(() =>
      useDebouncedValue('start', onChange, 300, onImmediate),
    );

    act(() => {
      result.current[1]('immediate');
    });

    // onImmediateChange should fire synchronously
    expect(onImmediate).toHaveBeenCalledTimes(1);
    expect(onImmediate).toHaveBeenCalledWith('immediate');

    // onChange should NOT have fired yet (debounced)
    expect(onChange).not.toHaveBeenCalled();
  });
});
