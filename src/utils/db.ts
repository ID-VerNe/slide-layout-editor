import { ProjectData } from '../types';

const DB_NAME = 'slidegrid_studio_db';
const STORE_PROJECTS = 'projects';
const STORE_ASSETS = 'assets'; // 新增：独立资源存储库
const DB_VERSION = 3; // 提升版本号

/**
 * 初始化数据库
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS);
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        // 使用 hash 作为主键，实现自动去重
        db.createObjectStore(STORE_ASSETS);
      }
    };
  });
}

/**
 * 保存资源到资源池并返回唯一 ID
 */
export async function saveAsset(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;

  const db = await initDB();
  // 简单的字符串 Hash 算法作为 ID
  let hash = 0;
  for (let i = 0; i < dataUrl.length; i++) {
    const char = dataUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  const assetId = `asset://${Math.abs(hash).toString(36)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readwrite');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.put(dataUrl, assetId);
    request.onsuccess = () => resolve(assetId);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 从资源池读取原始数据
 */
export async function getAsset(assetId: string): Promise<string | null> {
  if (!assetId || !assetId.startsWith('asset://')) return assetId;

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

/**
 * 图像压缩与格式转换
 */
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
        if (!ctx) return reject('Failed to get canvas context');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
    };
    reader.onerror = (error) => reject(reader.error);
  });
}