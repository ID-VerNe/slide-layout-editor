import { useState, useEffect } from 'react';
import { LRUCache } from '../utils/lruCache';

interface ImageDimensions { width: number; height: number; }

const assetCache = new LRUCache<string, string>(100);
const dimensionCache = new Map<string, ImageDimensions>();

/**
 * useAssetUrl 4.0 - 直读式架构
 * 直接调用 Electron API 读取 Workspace 物理文件并转换为内存 URL
 */
export function useAssetUrl(assetSource: string | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!assetSource) {
      setUrl(undefined);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. 如果不是 asset:// 协议，直接使用（可能是 DataURL 或外部 Link）
    if (!assetSource.startsWith('asset://')) {
      setUrl(assetSource);
      return;
    }

    // 2. 如果是 asset:// 协议，从 Electron 读取物理文件
    async function loadDirectly() {
      setIsLoading(true);
      try {
        // 检查缓存
        if (assetCache.has(assetSource)) {
          setUrl(assetCache.get(assetSource));
          setIsLoading(false);
          return;
        }

        const filename = assetSource.replace('asset://', '');
        // 核心：调用 Electron 暴露的直接读取接口
        const base64Data = await (window as any).electronAPI.readAssetFile(filename);
        
        if (base64Data && isMounted) {
          // 这里我们使用 Base64 作为最直接的传递方式（或者 Blob）
          // 为了极致稳定性，我们将其转换为可用的图片地址
          const mime = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
          const finalUrl = `data:${mime};base64,${base64Data}`;
          
          assetCache.set(assetSource!, finalUrl);
          setUrl(finalUrl);
        }
      } catch (err) {
        console.error("Direct load failed:", assetSource, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDirectly();
    return () => { isMounted = false; };
  }, [assetSource]);

  return { url, isLoading, dimensions };
}
