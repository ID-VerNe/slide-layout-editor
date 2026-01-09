import { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';
import { blobManager } from '../utils/blobManager';
import { LRUCache } from '../utils/lruCache';

interface ImageDimensions {
  width: number;
  height: number;
}

const assetCache = new LRUCache<string, string>(100);
const dimensionCache = new Map<string, ImageDimensions>();

/**
 * useAssetUrl - 智能资源解析 Hook
 * 功能：将 asset:// 格式的 ID 转换为可供 <img> 使用的 URL。
 * 核心优化：使用 LRU 缓存和 BlobManager 管理资源生命周期。
 */
export function useAssetUrl(assetSource: string | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    // 立即重置状态，防止旧内容残留
    setIsLoading(!!assetSource);
    setUrl(undefined);
    setDimensions({ width: 0, height: 0 });

    if (!assetSource) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDimensions = (imageUrl: string) => {
      if (dimensionCache.has(imageUrl)) {
        if (isMounted) setDimensions(dimensionCache.get(imageUrl)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (isMounted) {
          const dims = { width: img.width, height: img.height };
          dimensionCache.set(imageUrl, dims);
          setDimensions(dims);
        }
      };
      img.src = imageUrl;
    };

    if (!assetSource.startsWith('asset://')) {
      setUrl(assetSource);
      fetchDimensions(assetSource);
      return;
    }

    async function load() {
      setIsLoading(true);
      try {
        const cachedUrl = assetCache.get(assetSource);
        if (cachedUrl && isMounted) {
          setUrl(cachedUrl);
          fetchDimensions(cachedUrl);
          setIsLoading(false);
          return;
        }

        const data = await getAsset(assetSource);
        if (data && isMounted) {
          let resolvedUrl = assetSource;
          if (data !== assetSource) {
              if (data.startsWith('data:')) {
                  resolvedUrl = data;
              } else {
                  const blob = new Blob([data]);
                  resolvedUrl = blobManager.create(blob, assetSource);
              }
          }
          
          if (isMounted) {
            setUrl(resolvedUrl);
            assetCache.set(assetSource, resolvedUrl);
            fetchDimensions(resolvedUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load asset:", assetSource, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
      if (assetSource.startsWith('asset://')) {
        blobManager.release(assetSource);
      }
    };
  }, [assetSource]);

  return { url, isLoading, dimensions };
}