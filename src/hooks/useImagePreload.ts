import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { imagePreloader } from '../utils/imagePreloader';

/**
 * useImagePreload - 智能预加载 Hook
 * 根据当前页面索引预加载相邻页面的图片。
 */
export function useImagePreload() {
  const { pages, currentPageIndex } = useStore();

  useEffect(() => {
    if (!pages || pages.length === 0) return;

    // 预加载范围：当前页的前后 2 页
    const preloadRange = 2;
    const startIndex = Math.max(0, currentPageIndex - preloadRange);
    const endIndex = Math.min(pages.length - 1, currentPageIndex + preloadRange);

    const imagesToPreload: string[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const page = pages[i];
      if (!page) continue;

      // 收集背景图片
      if (page.image) imagesToPreload.push(page.image);
      
      // 收集 Logo
      if (page.logo) imagesToPreload.push(page.logo);
      
      // 收集 Features 里的图片
      if (page.features && Array.isArray(page.features)) {
        page.features.forEach(f => {
          if (f?.image) imagesToPreload.push(f.image);
        });
      }
    }

    // 执行预加载
    // 当前页设为高优先级，其他页设为普通优先级
    const uniqueImages = [...new Set(imagesToPreload)];
    
    uniqueImages.forEach(img => {
        const isCurrentPageImage = pages[currentPageIndex]?.image === img || 
                                   pages[currentPageIndex]?.logo === img;
        imagePreloader.preload(img, isCurrentPageImage ? 'high' : 'normal');
    });

    return () => {
      // 页面卸载或索引变化时不一定需要清除，预加载器有自己的限制
    };
  }, [pages, currentPageIndex]);
}
