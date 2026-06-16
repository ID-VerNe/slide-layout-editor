import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { imagePreloader } from '../utils/imagePreloader';
import { PageData } from '../types';

const IMAGE_URL_RE = /^data:image|^https?:\/\/|^asset:\/\//;

function collectImageUrls(value: any): string[] {
  const urls: string[] = [];
  if (!value) return urls;

  if (typeof value === 'string' && IMAGE_URL_RE.test(value)) {
    urls.push(value);
  } else if (Array.isArray(value)) {
    value.forEach(item => urls.push(...collectImageUrls(item)));
  } else if (typeof value === 'object') {
    Object.values(value).forEach(v => urls.push(...collectImageUrls(v)));
  }

  return urls;
}

function extractPageImageUrls(page: PageData): string[] {
  if (!page) return [];
  // 递归扫描整个页面对象，包含 backgroundImage、gallery、mosaic、partners、testimonials、bento 等
  return collectImageUrls(page);
}

/**
 * useImagePreload - 智能预加载 Hook
 * 根据当前页面索引预加载相邻页面的图片，并在页面切换时取消不再需要的加载。
 */
export function useImagePreload() {
  const pages = useStore(state => state.pages);
  const currentPageIndex = useStore(state => state.currentPageIndex);

  useEffect(() => {
    if (!pages || pages.length === 0) return;

    const preloadRange = 2;
    const startIndex = Math.max(0, currentPageIndex - preloadRange);
    const endIndex = Math.min(pages.length - 1, currentPageIndex + preloadRange);

    const imagesToPreload: string[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const page = pages[i];
      if (!page) continue;
      imagesToPreload.push(...extractPageImageUrls(page));
    }

    const uniqueImages = [...new Set(imagesToPreload.filter(Boolean))];
    const currentPage = pages[currentPageIndex];

    uniqueImages.forEach(img => {
      const isCurrentPageImage = currentPage ? extractPageImageUrls(currentPage).includes(img) : false;
      imagePreloader.preload(img, isCurrentPageImage ? 'high' : 'normal').catch((err) => {
        if (import.meta.env.DEV) console.debug('[ImagePreload] Failed:', img, err);
      });
    });

    return () => {
      // 清理本 effect 产生的预加载任务，避免切换页面后继续加载无关图片
      imagePreloader.clearUrls(uniqueImages);
    };
  }, [pages, currentPageIndex]);
}
