import { useState, useRef, useCallback, useEffect } from 'react';
import { runExportPipeline, type ExportFormat, type ExportScope } from '../services/exportPipeline';
import { useOffscreenExport } from './useOffscreenExport';
import { PageData, PrintSettings } from '../types';

export interface UseExportPipelineResult {
  offscreenTarget: { page: PageData; index: number } | null;
  isExporting: boolean;
  exportProgress: number;
  handleOffscreenReady: (element: HTMLElement) => void;
  handleExport: (
    format: ExportFormat,
    scope: ExportScope,
    pages: PageData[],
    currentPageIndex: number,
    projectTitle: string,
    fallbackTitle: string,
    printSettings: PrintSettings | undefined,
  ) => Promise<void>;
  cancelExport: () => void;
}

// 导出 state + 调用 exportPipeline,内部组合 useOffscreenExport
export function useExportPipeline(): UseExportPipelineResult {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportCancelledRef = useRef(false);
  const { offscreenTarget, waitForOffscreenRender, handleOffscreenReady, resetOffscreen } = useOffscreenExport();

  const handleExport = useCallback(async (
    format: ExportFormat,
    scope: ExportScope,
    pages: PageData[],
    currentPageIndex: number,
    projectTitle: string,
    fallbackTitle: string,
    printSettings: PrintSettings | undefined,
  ) => {
    exportCancelledRef.current = false;
    setIsExporting(true);
    setExportProgress(0);
    try {
      await runExportPipeline({
        format, scope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings,
        renderOffscreen: waitForOffscreenRender,
        onProgress: setExportProgress,
        isCancelled: () => exportCancelledRef.current,
      });
    } catch (e) {
      console.error('[Export] Export failed:', e);
    } finally {
      resetOffscreen();
      if (!exportCancelledRef.current) {
        setIsExporting(false);
        setExportProgress(0);
      }
    }
  }, [waitForOffscreenRender, resetOffscreen]);

  const cancelExport = useCallback(() => {
    exportCancelledRef.current = true;
  }, []);

  // 组件卸载时取消进行中的导出
  useEffect(() => {
    return () => { exportCancelledRef.current = true; };
  }, []);

  return { offscreenTarget, isExporting, exportProgress, handleOffscreenReady, handleExport, cancelExport };
}
