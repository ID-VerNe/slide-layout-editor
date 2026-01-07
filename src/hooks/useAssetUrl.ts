import { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';

/**
 * useAssetUrl - 智能资源解析 Hook
 * 功能：将 asset:// 格式的 ID 转换为可供 <img> 使用的 URL。
 * 优势：自动管理 Blob 生命周期，防止内存泄漏。
 */
export function useAssetUrl(assetSource: string | undefined) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. 如果是空，直接返回
    if (!assetSource) {
      setUrl(undefined);
      return;
    }

    // 2. 如果已经是普通 DataURL 或 Http 链接，直接使用
    if (!assetSource.startsWith('asset://')) {
      setUrl(assetSource);
      return;
    }

    // 3. 处理 asset:// 协议资源
    let isMounted = true;
    let objectUrl: string | null = null;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getAsset(assetSource);
        if (data && isMounted) {
          // 为了极致性能，如果是 DataURL 我们直接用；
          // 如果后续我们存的是原始 Blob，这里会调用 URL.createObjectURL
          setUrl(data);
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
      // 预留：如果是 ObjectURL，在这里销毁
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetSource]);

  return { url, isLoading };
}
