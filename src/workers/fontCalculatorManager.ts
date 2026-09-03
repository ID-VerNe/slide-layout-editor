interface CalculateFontOptions {
  text: string;
  maxSize: number;
  lineHeight: number;
  maxLines: number;
  minSize: number;
  containerWidth: number;
}

let sharedWorker: Worker | null = null;
let reqCounter = 0;
const pendingCallbacks = new Map<number, (fontSize: number) => void>();

/** 获取全局共享的字体计算 Worker 单例 */
export function getFontCalculatorWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }

  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(new URL('./fontCalculator.ts', import.meta.url), {
        type: 'module'
      });

      sharedWorker.onmessage = (e: MessageEvent) => {
        const { id, fontSize } = e.data || {};
        if (id !== undefined && pendingCallbacks.has(id)) {
          const cb = pendingCallbacks.get(id);
          pendingCallbacks.delete(id);
          cb?.(fontSize);
        } else if (fontSize !== undefined && pendingCallbacks.size === 1) {
          // 兼容测试环境中未回传 id 的模拟 Worker
          const firstKey = pendingCallbacks.keys().next().value;
          if (firstKey !== undefined) {
            const cb = pendingCallbacks.get(firstKey);
            pendingCallbacks.delete(firstKey);
            cb?.(fontSize);
          }
        }
      };

      sharedWorker.onerror = (e) => {
        console.error('[FontCalculatorManager] Worker error:', e);
        resetFontCalculatorWorker();
      };
    } catch (e) {
      console.error('[FontCalculatorManager] Failed to create Worker:', e);
      sharedWorker = null;
    }
  }

  return sharedWorker;
}

/** 通过共享 Worker 计算最佳字号 */
export function calculateFontSizeWithWorker(options: CalculateFontOptions): Promise<number> {
  return new Promise((resolve) => {
    const worker = getFontCalculatorWorker();
    if (!worker) {
      resolve(options.maxSize);
      return;
    }

    const id = ++reqCounter;
    pendingCallbacks.set(id, resolve);

    // 超时兜底防死锁
    const timer = setTimeout(() => {
      if (pendingCallbacks.has(id)) {
        pendingCallbacks.delete(id);
        resolve(options.maxSize);
      }
    }, 2000);

    const originalCb = pendingCallbacks.get(id);
    pendingCallbacks.set(id, (size: number) => {
      clearTimeout(timer);
      originalCb?.(size);
    });

    worker.postMessage({
      id,
      ...options
    });
  });
}

/** 重置并终止共享 Worker */
export function resetFontCalculatorWorker(): void {
  if (sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
  }
  pendingCallbacks.clear();
}
