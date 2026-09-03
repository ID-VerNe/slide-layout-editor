import React, { useEffect, useRef } from 'react';
import Preview from '../Preview';
import { PageData, PrintSettings } from '../../types';

interface OffscreenExportRendererProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
  printSettings?: PrintSettings;
  minimalCounter?: boolean;
  onReady: (element: HTMLElement) => void;
}

/**
 * 离屏渲染器组件
 * 用于在屏幕外渲染指定页面的 Slide，并在确保图片和字体就绪后触发回调。
 */
export const OffscreenExportRenderer: React.FC<OffscreenExportRendererProps> = ({
  page,
  pageIndex,
  totalPages,
  printSettings,
  minimalCounter,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    const checkReady = async () => {
      if (!containerRef.current || !active) return;

      // 1. 等待字体就绪
      if (document.fonts) {
        try {
          await document.fonts.ready;
        } catch (e) {
          console.warn('[OffscreenExport] document.fonts.ready failed:', e);
        }
      }

      if (!active) return;

      // 2. 等待懒加载组件就绪
      const waitForTemplate = async () => {
        const maxRetries = 50; // 最多 5 秒
        for (let i = 0; i < maxRetries; i++) {
          if (!active) return false;
          const loader = containerRef.current?.querySelector('[role="status"]');
          if (!loader && containerRef.current?.querySelector('.magazine-page')) {
            return true;
          }
          await new Promise(resolve => schedule(resolve as any, 100));
        }
        console.warn('[OffscreenExport] Template load timeout, continuing anyway');
        return !!containerRef.current?.querySelector('.magazine-page');
      };

      const templateReady = await waitForTemplate();
      if (!active || !templateReady) return;

      // 3. 检查所有图片是否加载完成；超时时跳过无法加载的图片
      const checkImages = () => {
        const images = Array.from(containerRef.current?.querySelectorAll('img') || []) as HTMLImageElement[];
        if (images.length === 0) return { ready: true, broken: [] };
        const broken: HTMLImageElement[] = [];
        const pending = images.filter(img => {
          if (img.complete && img.naturalHeight === 0) broken.push(img);
          return !img.complete;
        });
        return { ready: pending.length === 0, broken };
      };

      let imageRetries = 0;
      const maxImageRetries = 100; // 最多 10 秒
      const waitForImages = () => {
        if (!active) return;
        const { ready, broken } = checkImages();
        if (ready || imageRetries >= maxImageRetries) {
          if (broken.length > 0) {
            console.warn('[OffscreenExport] Some images failed to load, exporting anyway:', broken.map(img => img.src));
          }
          schedule(() => {
            if (!active || !containerRef.current) return;
            const el = containerRef.current.querySelector('.magazine-page') as HTMLElement;
            if (el) onReady(el);
          }, 300);
        } else {
          imageRetries++;
          schedule(waitForImages, 100);
        }
      };

      waitForImages();
    };

    checkReady();

    return () => {
      active = false;
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [page.id, pageIndex, onReady]);

  return (
    <div
      className="fixed pointer-events-none opacity-0"
      style={{ left: '-9999px', top: '-9999px', width: '1920px', height: '1080px' }}
      ref={containerRef}
    >
      <Preview
        page={page}
        pageIndex={pageIndex}
        totalPages={totalPages}
        printSettings={printSettings}
        minimalCounter={minimalCounter}
        disableAnimation={true}
      />
    </div>
  );
};
