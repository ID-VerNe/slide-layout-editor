import { ProjectSaveData } from '../types';
import { logger } from './logger';

interface NativeResponse {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
  canceled?: boolean;
  path?: string;
  url?: string;
}

interface ElectronAPI {
  getAppPaths: () => Promise<{ userData: string; thumbnails: string }>;
  captureThumbnail: (projectId: string, rect: { x: number; y: number; width: number; height: number }) => Promise<string | null>;
  saveProject: (content: ProjectSaveData, filePath?: string, defaultName?: string) => Promise<NativeResponse>;
  openProject: () => Promise<NativeResponse>;
  uploadAsset: (filename: string, base64Data: string) => Promise<NativeResponse>;
  selectDirectory: () => Promise<NativeResponse>;
  saveFileBuffer: (filePath: string, base64Data: string) => Promise<NativeResponse>;
  // 新增：打开外部链接
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Native File System Adapter
 */
export const nativeFs = {
  isElectron: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!((window as any).electronAPI || (window as any).process?.versions?.electron || (window as any).navigator?.userAgent?.includes('Electron'));
  },

  async openExternal(url: string) {
    const api = (window as any).electronAPI;
    if (api?.openExternal) {
      await api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  },

  async getPaths() {
    const api = (window as any).electronAPI;
    if (!api) return null;
    return await api.getAppPaths();
  },

  async saveProject(projectData: ProjectSaveData, filePath?: string, defaultName?: string): Promise<NativeResponse> {
    const api = (window as any).electronAPI;
    if (!api) throw new Error("Native API not found");
    return await api.saveProject(projectData, filePath, defaultName);
  },

  async openProject(): Promise<NativeResponse> {
    const api = (window as any).electronAPI;
    if (!api) throw new Error("Native API not found");
    return await api.openProject();
  },

  async captureThumbnail(projectId: string, rect: { x: number, y: number, width: number, height: number }): Promise<string | null> {
    const api = (window as any).electronAPI;
    if (!api) return null;
    return await api.captureThumbnail(projectId, rect);
  },

  async uploadAsset(filename: string, base64Data: string): Promise<NativeResponse> {
    const api = (window as any).electronAPI;
    if (!api) throw new Error("Native API not found");
    return await api.uploadAsset(filename, base64Data);
  },

  async selectDirectory(): Promise<NativeResponse> {
    const api = (window as any).electronAPI;
    if (!api) return { success: false, canceled: true };
    return await api.selectDirectory();
  },

  async saveFileBuffer(filePath: string, base64Data: string): Promise<NativeResponse> {
    const api = (window as any).electronAPI;
    if (!api) return { success: false, error: "API not found" };
    return await api.saveFileBuffer(filePath, base64Data);
  }
};