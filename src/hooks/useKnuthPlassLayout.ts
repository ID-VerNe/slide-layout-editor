import { useState, useEffect, useMemo, useRef } from 'react';
import { KPWorkerRequest, KPWorkerResponse, KPLine } from '../workers/knuthPlassWorker';

let sharedWorker: Worker | null = null;
let reqCounter = 0;
const pendingCallbacks = new Map<number, (res: KPWorkerResponse) => void>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;

  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(new URL('../workers/knuthPlassWorker.ts', import.meta.url), {
        type: 'module'
      });

      sharedWorker.onmessage = (e: MessageEvent<KPWorkerResponse>) => {
        const { id } = e.data;
        if (id !== undefined && pendingCallbacks.has(id)) {
          const cb = pendingCallbacks.get(id);
          pendingCallbacks.delete(id);
          cb?.(e.data);
        }
      };

      sharedWorker.onerror = (e) => {
        console.error('[KnuthPlassWorker] error:', e);
        if (sharedWorker) {
          sharedWorker.terminate();
          sharedWorker = null;
        }
      };
    } catch (e) {
      console.error('[KnuthPlassWorker] Failed to create Worker:', e);
      sharedWorker = null;
    }
  }
  return sharedWorker;
}

export function calculateLayout(options: Omit<KPWorkerRequest, 'id'>): Promise<KPWorkerResponse> {
  return new Promise((resolve) => {
    const worker = getWorker();
    if (!worker) {
      resolve({ id: -1, fontSize: options.maxSize, lines: [], success: false });
      return;
    }

    const id = ++reqCounter;
    pendingCallbacks.set(id, resolve);

    const timer = setTimeout(() => {
      if (pendingCallbacks.has(id)) {
        pendingCallbacks.delete(id);
        resolve({ id, fontSize: options.maxSize, lines: [], success: false });
      }
    }, 2000);

    const originalCb = pendingCallbacks.get(id);
    pendingCallbacks.set(id, (res: KPWorkerResponse) => {
      clearTimeout(timer);
      originalCb?.(res);
    });

    worker.postMessage({ id, ...options });
  });
}

export interface UseKnuthPlassLayoutProps {
  text: string;
  fontFamily: string;
  maxSize: number;
  minSize: number;
  lineHeight: number;
  maxLines: number;
  containerWidth: number;
  align: 'left' | 'center' | 'right' | 'justify';
}

/**
 * 带有 500ms 防抖的 Knuth-Plass 排版 Hook
 */
export function useKnuthPlassLayout(props: UseKnuthPlassLayoutProps) {
  const [layout, setLayout] = useState<{ fontSize: number; lines: KPLine[]; success: boolean } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Memoize stable dependencies to avoid unnecessary recalculations
  const cacheKey = `${props.text}-${props.fontFamily}-${props.maxSize}-${props.minSize}-${props.maxLines}-${Math.round(props.containerWidth)}-${props.align}`;

  useEffect(() => {
    if (!props.text || props.containerWidth <= 0) {
      setLayout({ fontSize: props.maxSize, lines: [], success: true });
      return;
    }

    setIsCalculating(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await calculateLayout(props);
        setLayout({ fontSize: res.fontSize, lines: res.lines, success: res.success });
      } catch (err) {
        console.error('Failed to calculate layout:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [cacheKey]);

  return { layout, isCalculating };
}
