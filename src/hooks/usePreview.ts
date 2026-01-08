import { useState, useCallback, useEffect, useRef } from 'react';
import { LAYOUT_CONFIG } from '../constants/layout';
import { PrintSettings } from '../types';

interface UsePreviewOptions {
  pages: any[];
  currentPageIndex: number;
  printSettings: PrintSettings;
  isLoaded?: boolean; // 新增：感知加载状态
}

export function usePreview({ pages, currentPageIndex, printSettings, isLoaded = true }: UsePreviewOptions) {
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [pagesOverflow, setPagesOverflow] = useState<Record<string, boolean>>({});
  
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const lastLayoutRef = useRef<string>('');

  const calculateFitZoom = useCallback(() => {
    // 关键加固：如果项目没加载完，或者 DOM 没准备好，不进行任何计算，防止死循环
    if (!isLoaded || !previewContainerRef.current || !pages[currentPageIndex]) return 0.5;
    
    const rect = previewContainerRef.current.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return 0.5;

    const padding = 120; 
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;

    const currentPage = pages[currentPageIndex];
    const designDims = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
    
    let targetWidth, targetHeight;

    if (printSettings?.enabled) {
      const ppi = designDims.width / (printSettings.widthMm - (designDims.orientation === 'portrait' ? printSettings.gutterMm : 0));
      targetWidth = printSettings.widthMm * ppi;
      targetHeight = printSettings.heightMm * ppi;
    } else {
      targetWidth = designDims.width;
      targetHeight = designDims.height;
    }

    const scaleX = availableWidth / targetWidth;
    const scaleY = availableHeight / targetHeight;

    return Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
  }, [pages, currentPageIndex, printSettings, isLoaded]);

  // 1. 响应窗口变化，但增加防抖
  useEffect(() => {
    if (!previewContainerRef.current || !isLoaded) return;

    let timeoutId: any;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isAutoFit) {
          setPreviewZoom(calculateFitZoom());
        }
      }, 100); // 100ms 防抖，防止与子组件的布局计算竞争
    });

    observer.observe(previewContainerRef.current);
    
    // 初次挂载延时执行
    const initTimer = setTimeout(() => {
      if (isAutoFit) setPreviewZoom(calculateFitZoom());
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [isAutoFit, calculateFitZoom, isLoaded]);

  // 2. 响应页面切换
  useEffect(() => {
    if (isAutoFit && isLoaded) {
      setPreviewZoom(calculateFitZoom());
    }
  }, [currentPageIndex, isAutoFit, isLoaded, calculateFitZoom]);

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