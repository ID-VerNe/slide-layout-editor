import { ProjectData } from '../../types';

const DB_NAME = 'slidegrid_studio_db';
const STORE_PROJECTS = 'projects';
export const STORE_ASSETS = 'assets';
const DB_VERSION = 3;

// @lat: [[utils-db]]
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS);
      if (!db.objectStoreNames.contains(STORE_ASSETS)) db.createObjectStore(STORE_ASSETS);
    };
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
    request.onsuccess = () => resolve(request.result || null);
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

/** 保存工程缩略图到 IndexedDB 资产仓库 */
export async function saveProjectThumbnail(projectId: string, dataUrl: string): Promise<string> {
  const assetKey = `thumb_${projectId}`;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readwrite');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.put(dataUrl, assetKey);
    request.onsuccess = () => resolve(assetKey);
    request.onerror = () => reject(request.error);
  });
}

/** 从 IndexedDB 资产仓库获取工程缩略图 */
export async function getProjectThumbnail(projectId: string): Promise<string | null> {
  const assetKey = `thumb_${projectId}`;
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_ASSETS, 'readonly');
    const store = transaction.objectStore(STORE_ASSETS);
    const request = store.get(assetKey);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// 供 E2E 自动化测试精准验证底层持久化与跨生命周期恢复
if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_DB__ = { initDB, saveProject, getProject, deleteProject, saveProjectThumbnail, getProjectThumbnail };
}
