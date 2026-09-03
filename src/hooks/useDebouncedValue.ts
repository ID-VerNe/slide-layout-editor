import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A generic hook that manages debounced value synchronization.
 *
 * @param initialValue - The external (source-of-truth) value.
 * @param onChange - Callback invoked after the debounce delay when the internal value
 *   changes and differs from the external initialValue.
 * @param debounceMs - Debounce delay in milliseconds (default 300).
 * @param onImmediateChange - Optional callback fired immediately (synchronously) on
 *   every internal value change, before the debounce settles.
 * @returns A tuple of [currentValue, setValue] — identical in shape to useState.
 */
export function useDebouncedValue<T>(
  initialValue: T,
  onChange: (value: T) => void,
  debounceMs: number = 300,
  onImmediateChange?: (value: T) => void,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState(initialValue);
  const isFirstMount = useRef(true);
  const onChangeRef = useRef(onChange);
  const onImmediateChangeRef = useRef(onImmediateChange);
  const initialValueRef = useRef(initialValue);
  const currentValueRef = useRef(value);
  currentValueRef.current = value;
  const isPendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs current without triggering effect re-runs.
  onChangeRef.current = onChange;
  onImmediateChangeRef.current = onImmediateChange;

  /** 立即同步提交尚未到期的防抖数据 */
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isPendingRef.current && currentValueRef.current !== initialValueRef.current) {
      isPendingRef.current = false;
      initialValueRef.current = currentValueRef.current;
      onChangeRef.current(currentValueRef.current);
    }
  }, []);

  // Sync internal state when the external initialValue changes.
  useEffect(() => {
    setValue(initialValue);
    initialValueRef.current = initialValue;
    isPendingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [initialValue]);

  // 组件卸载时强制将未提交数据刷盘，防止虚拟列表滚动时丢失输入
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  // Debounced onChange callback — skips the very first render.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (value === initialValueRef.current) {
      isPendingRef.current = false;
      return;
    }

    isPendingRef.current = true;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (currentValueRef.current !== initialValueRef.current) {
        isPendingRef.current = false;
        initialValueRef.current = currentValueRef.current;
        onChangeRef.current(currentValueRef.current);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, debounceMs]);

  // Wrapped setValue that also fires onImmediateChange synchronously.
  const wrappedSetValue = useCallback(
    (newValue: React.SetStateAction<T>) => {
      setValue(newValue);
      if (typeof newValue !== 'function' && onImmediateChangeRef.current) {
        onImmediateChangeRef.current(newValue as T);
      }
    },
    [],
  );

  return [value, wrappedSetValue, flush];
}
