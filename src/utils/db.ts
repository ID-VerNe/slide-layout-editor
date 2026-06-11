import { ProjectData } from '../types';

const DB_NAME = 'slidegrid_studio_db';
const STORE_PROJECTS = 'projects';
const STORE_ASSETS = 'assets'; 
const DB_VERSION = 3;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS);
      if (!db.objectStoreNames.contains(STORE_ASSETS)) db.createObjectStore(STORE_ASSETS);
    };
  });
}

/**
 * 保存资源
 * 使用 Web Crypto API 生成可靠的哈希，防止碰撞
 */
export async function saveAsset(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;

  // 1. 生成 SHA-256 Hash ID（防止碰撞）
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) return dataUrl;
  
  let hashId: string;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64Data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch (e) {
    // 降级方案：使用时间戳 + 随机数
    console.warn('Crypto API not available, using fallback hash');
    hashId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  
  const ext = dataUrl.substring(dataUrl.indexOf('/') + 1, dataUrl.indexOf(';'));
  const filename = `asset_${hashId}.${ext}`;

  // 2. 直接检查 Electron 环境 (不通过 nativeFs 导入)
  const electronAPI = (window as any).electronAPI;
  if (electronAPI) {
    try {
      const result = await electronAPI.uploadAsset(filename, dataUrl);
      if (result.success) return result.url;
    } catch (e) {
      console.error("Native upload failed", e);
    }
  }

  // 3. Web 路径
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
 */
export async function getAsset(assetId: string): Promise<string | null> {
  if (!assetId || !assetId.startsWith('asset://')) return assetId;

  // Electron 环境下直接返回 ID，由 protocol 处理
  if ((window as any).electronAPI) return assetId;

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readonly');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.get(assetId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(id: string, data: ProjectData) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.put(data, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getProject(id: string): Promise<ProjectData | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProject(id: string) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function compressImage(file: File, quality: number = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed context');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/webp', quality));
      };
    };
    reader.onerror = () => reject(reader.error);
  });
}