import { useState, useCallback, useEffect, useRef } from 'react';
import { LAYOUT_CONFIG } from '../constants/layout';
import { PrintSettings } from '../types';

interface UsePreviewOptions {
  pages: any[];
  currentPageIndex: number;
  printSettings: PrintSettings; // 传入打印设置
}

export function usePreview({ pages, currentPageIndex, printSettings }: UsePreviewOptions) {
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [pagesOverflow, setPagesOverflow] = useState<Record<string, boolean>>({});
  
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const calculateFitZoom = useCallback(() => {
    if (!previewContainerRef.current || !pages[currentPageIndex]) return 0.5;
    
    const rect = previewContainerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    if (containerHeight <= 0 || containerWidth <= 0) return 0.5;

    const padding = 120; 
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;

    const currentPage = pages[currentPageIndex];
    const designDims = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
    
    let targetWidth, targetHeight;

    // 核心修复：如果开启了打印模式，则以纸张的物理比例计算缩放
    if (printSettings?.enabled) {
      // 我们以设计稿的宽度作为基准像素，换算纸张的像素尺寸
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
  }, [pages, currentPageIndex, printSettings]);

  useEffect(() => {
    if (!previewContainerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (isAutoFit) {
        setPreviewZoom(calculateFitZoom());
      }
    });

    observer.observe(previewContainerRef.current);
    
    const timeoutId = setTimeout(() => {
      if (isAutoFit) {
        setPreviewZoom(calculateFitZoom());
      }
    }, 50);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isAutoFit, calculateFitZoom]);

  useEffect(() => {
    if (isAutoFit) {
      setPreviewZoom(calculateFitZoom());
    }
  }, [currentPageIndex, isAutoFit, calculateFitZoom, pages]);

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
