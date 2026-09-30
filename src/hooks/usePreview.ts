import { useState, useCallback, useEffect, useRef } from 'react';
import { AspectRatioType } from '../constants/layout';
import { PrintSettings } from '../types';
import { getPrintGeometry } from '../utils/printGeometry';

interface UsePreviewOptions {
  pages: any[];
  currentPageIndex: number;
  printSettings: PrintSettings;
  isLoaded?: boolean; // 感知加载状态,未加载时不进行计算以防死循环
  minimalCounter?: boolean;
}

export function usePreview({ pages, currentPageIndex, printSettings, isLoaded = true }: UsePreviewOptions) {
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [pagesOverflow, setPagesOverflow] = useState<Record<string, boolean>>({});

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 仅依赖当前页宽高比标量与打印设置,避免每次击键因 pages 引用变化重建回调
  const currentRatio = (pages[currentPageIndex]?.aspectRatio || '16:9') as AspectRatioType;

  const calculateFitZoom = useCallback(() => {
    // 项目未加载或 DOM 未就绪时不计算,防止死循环
    if (!isLoaded || !previewContainerRef.current || !pages[currentPageIndex]) return 0.5;

    const rect = previewContainerRef.current.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return 0.5;

    const padding = 120;
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;

    const { rasterPx } = getPrintGeometry(currentRatio, printSettings);
    const targetWidth = rasterPx.width;
    const targetHeight = rasterPx.height;

    const scaleX = availableWidth / targetWidth;
    const scaleY = availableHeight / targetHeight;

    return Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
  }, [currentRatio, printSettings, isLoaded, pages, currentPageIndex]);

  // observer effect 仅依赖 isLoaded,经 ref 调最新计算函数与自动适配状态,
  // 避免击键时 calculateFitZoom 引用变化导致 ResizeObserver 反复 disconnect/rebuild
  const fitZoomRef = useRef(calculateFitZoom);
  const autoFitRef = useRef(isAutoFit);
  fitZoomRef.current = calculateFitZoom;
  autoFitRef.current = isAutoFit;

  useEffect(() => {
    if (!previewContainerRef.current || !isLoaded) return;

    let timeoutId: any;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (autoFitRef.current) {
          setPreviewZoom(fitZoomRef.current());
        }
      }, 100); // 100ms 防抖,防止与子组件的布局计算竞争
    });

    observer.observe(previewContainerRef.current);

    // 初次挂载延时执行
    const initTimer = setTimeout(() => {
      if (autoFitRef.current) setPreviewZoom(fitZoomRef.current());
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [isLoaded]);

  // 2. 响应页面切换与打印设置变化时重算
  useEffect(() => {
    if (isAutoFit && isLoaded) {
      setPreviewZoom(calculateFitZoom());
    }
  }, [currentRatio, currentPageIndex, printSettings, isAutoFit, isLoaded, calculateFitZoom]);

  const handleManualZoom = (value: number) => {
    setIsAutoFit(false);
    setPreviewZoom(value);
  };

  const toggleFit = () => {
    setIsAutoFit(!isAutoFit);
  };

  const handleOverflowChange = (pageId: string, isOverflowing: boolean) => {
    setPagesOverflow(prev => {
      if (prev[pageId] === isOverflowing) return prev;
      return { ...prev, [pageId]: isOverflowing };
    });
  };

  return {
    previewZoom,
    setPreviewZoom,
    isAutoFit,
    setIsAutoFit,
    pagesOverflow,
    previewRef,
    previewContainerRef,
    handleManualZoom,
    toggleFit,
    handleOverflowChange
  };
}
