import { useState, useRef, useCallback, useEffect } from 'react';
import { PageData } from '../types';

interface OffscreenTarget {
  page: PageData;
  index: number;
}

export interface UseOffscreenExportResult {
  offscreenTarget: OffscreenTarget | null;
  waitForOffscreenRender: (targetPage: PageData, targetIndex: number) => Promise<HTMLElement>;
  handleOffscreenReady: (element: HTMLElement) => void;
  resetOffscreen: () => void;
}

// 离屏渲染协调:挂起 Promise 等待 OffscreenExportRenderer 报告就绪
// 修复原 EditorPage 的 15s 定时器泄漏:resolve/reject/unmount 三路径都 clearTimeout
export function useOffscreenExport(): UseOffscreenExportResult {
  const [offscreenTarget, setOffscreenTarget] = useState<OffscreenTarget | null>(null);
  const offscreenResolveRef = useRef<{ fn: (el: HTMLElement) => void; timer: ReturnType<typeof setTimeout> } | null>(null);

  const waitForOffscreenRender = useCallback((targetPage: PageData, targetIndex: number) => {
    // 清理上一个未完成的等待,避免跨页导出时定时器叠加
    if (offscreenResolveRef.current) {
      clearTimeout(offscreenResolveRef.current.timer);
      offscreenResolveRef.current = null;
    }
    return new Promise<HTMLElement>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (offscreenResolveRef.current?.fn === resolve) {
          offscreenResolveRef.current = null;
          reject(new Error(`Offscreen render timeout for page ${targetIndex + 1}`));
        }
      }, 15000);
      offscreenResolveRef.current = { fn: resolve, timer };
      setOffscreenTarget({ page: targetPage, index: targetIndex });
    });
  }, []);

  const handleOffscreenReady = useCallback((element: HTMLElement) => {
    const pending = offscreenResolveRef.current;
    if (pending) {
      clearTimeout(pending.timer);
      offscreenResolveRef.current = null;
      pending.fn(element);
    }
  }, []);

  const resetOffscreen = useCallback(() => {
    if (offscreenResolveRef.current) {
      clearTimeout(offscreenResolveRef.current.timer);
      offscreenResolveRef.current = null;
    }
    setOffscreenTarget(null);
  }, []);

  // 卸载时清理,防止组件销毁后定时器触发 setState
  useEffect(() => {
    return () => {
      if (offscreenResolveRef.current) {
        clearTimeout(offscreenResolveRef.current.timer);
        offscreenResolveRef.current = null;
      }
    };
  }, []);

  return { offscreenTarget, waitForOffscreenRender, handleOffscreenReady, resetOffscreen };
}
