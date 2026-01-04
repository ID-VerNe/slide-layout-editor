import { useState, useCallback, useEffect, useRef } from 'react';
import { LAYOUT_CONFIG } from '../constants/layout';

interface UsePreviewOptions {
  pages: any[];
  currentPageIndex: number;
}

export function usePreview({ pages, currentPageIndex }: UsePreviewOptions) {
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

    const padding = 120; // 增加边距以获得更好的呼吸感
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;

    // 核心：根据当前页面的比例获取物理尺寸
    const currentPage = pages[currentPageIndex];
    const dimensions = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
    
    const targetWidth = dimensions.width;
    const targetHeight = dimensions.height;

    const scaleX = availableWidth / targetWidth;
    const scaleY = availableHeight / targetHeight;

    return Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
  }, [pages, currentPageIndex]);

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