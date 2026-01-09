import React, { useEffect, useRef } from 'react';
import Preview from '../Preview';
import { PageData } from '../../types';

interface OffscreenExportRendererProps {
  page: PageData;
  pageIndex: number;
  totalPages: number;
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
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const checkReady = async () => {
      if (!containerRef.current) return;

      // 1. 等待字体就绪
      if (document.fonts) {
        await document.fonts.ready;
      }

      // 2. 等待懒加载组件就绪 (直到没有 status role 的 loader)
      const waitForTemplate = async () => {
        const maxRetries = 50; // 5 seconds max
        for (let i = 0; i < maxRetries; i++) {
          const loader = containerRef.current?.querySelector('[role="status"]');
          if (!loader && containerRef.current?.querySelector('.magazine-page')) {
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
      };

      await waitForTemplate();

      // 3. 检查所有图片是否加载完成
      const checkImages = () => {
        const images = Array.from(containerRef.current?.querySelectorAll('img') || []);
        return images.every(img => img.complete && img.naturalHeight !== 0);
      };

      const waitForImages = () => {
        if (!active) return;
        if (checkImages()) {
          // 额外缓冲时间确保渲染引擎绘制完成
          setTimeout(() => {
            if (active && containerRef.current) {
              const el = containerRef.current.querySelector('.magazine-page') as HTMLElement;
              if (el) onReady(el);
            }
          }, 300);
        } else {
          setTimeout(waitForImages, 100);
        }
      };

      waitForImages();
    };

    checkReady();

    return () => { active = false; };
  }, [page.id, onReady]);

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
      />
    </div>
  );
};
