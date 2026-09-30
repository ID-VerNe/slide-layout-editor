import { nativeFs } from '../native-fs';
import { initDB, STORE_ASSETS } from './projectDb';
import { hashDataUrl, extFromDataUrl } from './assetHasher';

/**
 * 保存资源
 * Electron 环境上传到原生资产目录；失败或 Web 环境回退到 IndexedDB
 */
export async function saveAsset(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;

  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) return dataUrl;

  const hashId = await hashDataUrl(dataUrl);
  const ext = extFromDataUrl(dataUrl);
  const filename = `asset_${hashId}.${ext}`;

  if (nativeFs.isElectron()) {
    try {
      const result = await nativeFs.uploadAsset(filename, dataUrl);
      if (result.success && result.url) return result.url;
    } catch (e) {
      console.error("Native upload failed", e);
    }
  }

  const assetId = `asset://${hashId}`;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readwrite');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.put(dataUrl, assetId);
    request.onsuccess = () => resolve(assetId);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 读取资源
 * Electron 环境下优先读取物理文件；失败时回退到 IndexedDB
 */
export async function getAsset(assetId: string): Promise<string | null> {
  if (!assetId || !assetId.startsWith('asset://')) return assetId;

  const filename = assetId.replace('asset://', '');

  if (nativeFs.isElectron()) {
    try {
      const base64Data = await nativeFs.readAssetFile(filename);
      if (base64Data) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          svg: 'image/svg+xml',
          'svg+xml': 'image/svg+xml',
          webp: 'image/webp',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
        };
        const mime = (ext && mimeMap[ext]) || 'image/png';
        return `data:${mime};base64,${base64Data}`;
      }
    } catch (e) {
      console.warn('[DB] Electron readAssetFile failed, falling back to IndexedDB:', e);
    }
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readonly');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.get(assetId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
