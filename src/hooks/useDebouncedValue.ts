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
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const isFirstMount = useRef(true);
  const onChangeRef = useRef(onChange);
  const onImmediateChangeRef = useRef(onImmediateChange);
  const initialValueRef = useRef(initialValue);

  // Keep callback refs current without triggering effect re-runs.
  onChangeRef.current = onChange;
  onImmediateChangeRef.current = onImmediateChange;
  initialValueRef.current = initialValue;

  // Sync internal state when the external initialValue changes.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced onChange callback — skips the very first render.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (value !== initialValueRef.current) {
        onChangeRef.current(value);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
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

  return [value, wrappedSetValue];
}
