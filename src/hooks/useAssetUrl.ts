import { useState, useEffect } from 'react';
import { LRUCache } from '../utils/lruCache';
import { getAsset } from '../utils/db';
import { nativeFs } from '../utils/native-fs';

interface ImageDimensions { width: number; height: number; }

const assetCache = new LRUCache<string, string>(100);
const dimensionCache = new Map<string, ImageDimensions>();

/**
 * useAssetUrl 4.0 - 直读式架构
 * 在 Electron 环境下直接读取 Workspace 物理文件；缺失时回退到 IndexedDB 资源。
 */
export function useAssetUrl(assetSource: string | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!assetSource) {
      setUrl(undefined);
      setIsLoading(false);
      setDimensions({ width: 0, height: 0 });
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    (async () => {
      let finalUrl: string | null = null;

      // 1. 非 asset:// 协议直接使用；仍然需要读取尺寸
      if (!assetSource.startsWith('asset://')) {
        finalUrl = assetSource;
        setUrl(assetSource);
      } else if (assetCache.has(assetSource)) {
        // 2.1 命中缓存，直接返回
        const cached = assetCache.get(assetSource);
        if (isMounted) {
          setUrl(cached);
          setDimensions(dimensionCache.get(assetSource) || { width: 0, height: 0 });
        }
        return;
      } else {
        // 2.2 asset:// 协议：尝试本地/缓存读取，否则回退 IndexedDB
        const filename = assetSource.replace('asset://', '');
        try {
          const base64Data = await nativeFs.readAssetFile(filename);

          if (base64Data) {
            const mime = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
            finalUrl = `data:${mime};base64,${base64Data}`;
          }
        } catch (err) {
          console.warn('Electron readAssetFile failed:', err);
        }

        if (!finalUrl) {
          finalUrl = await getAsset(assetSource);
        }
      }

      if (finalUrl && isMounted) {
        if (assetSource.startsWith('asset://')) {
          assetCache.set(assetSource, finalUrl);
        }
        setUrl(finalUrl);

        // 读取图片尺寸并缓存
        const img = new Image();
        img.onload = () => {
          const dims = { width: img.naturalWidth, height: img.naturalHeight };
          if (assetSource.startsWith('asset://')) {
            dimensionCache.set(assetSource, dims);
          }
          if (isMounted) setDimensions(dims);
        };
        img.onerror = () => {
          if (isMounted) setDimensions({ width: 0, height: 0 });
        };
        img.src = finalUrl;
      }
    })()
      .catch((err) => console.error('Direct load failed:', assetSource, err))
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [assetSource]);

  return { url, isLoading, dimensions };
}
