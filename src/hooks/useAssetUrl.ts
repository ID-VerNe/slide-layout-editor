import { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';
import { blobManager } from '../utils/blobManager';
import { LRUCache } from '../utils/lruCache';

const assetCache = new LRUCache<string, string>(100);

/**
 * useAssetUrl - 智能资源解析 Hook
 * 功能：将 asset:// 格式的 ID 转换为可供 <img> 使用的 URL。
 * 核心优化：使用 LRU 缓存和 BlobManager 管理资源生命周期。
 */
export function useAssetUrl(assetSource: string | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!assetSource) {
      setUrl(undefined);
      return;
    }

    if (!assetSource.startsWith('asset://')) {
      setUrl(assetSource);
      return;
    }

    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const cachedUrl = assetCache.get(assetSource);
        if (cachedUrl && isMounted) {
          setUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        const data = await getAsset(assetSource);
        if (data && isMounted) {
          if (data.startsWith('data:')) {
            setUrl(data);
            assetCache.set(assetSource, data);
          } else {
            // 如果 data 是二进制数据（通常 getAsset 在 Electron 下返回 asset://）
            // 在 Web 下可能返回 DataURL 或需要转为 Blob
            // 这里的 getAsset 逻辑在 Electron 下直接返回 assetSource
            // 所以我们其实已经在上面 if (!assetSource.startsWith('asset://')) 之后跳过了
            // 但如果 getAsset 返回的是 Blob，我们需要用 blobManager
            
            // 兼容性处理：如果 getAsset 返回了 asset:// 字符串以外的东西
            if (data !== assetSource) {
                // 假设 data 是 DataURL
                if (data.startsWith('data:')) {
                    setUrl(data);
                    assetCache.set(assetSource, data);
                } else {
                    // 假设是二进制字符串或数据，转为 Blob
                    const blob = new Blob([data]);
                    const blobUrl = blobManager.create(blob, assetSource);
                    setUrl(blobUrl);
                    assetCache.set(assetSource, blobUrl);
                }
            } else {
                setUrl(data);
            }
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

  return { url, isLoading };
}

export function clearAssetCache(): void {
  assetCache.clear();
  blobManager.clear();
}