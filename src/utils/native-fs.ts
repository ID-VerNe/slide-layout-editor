import { ProjectSaveData } from '../types';

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
  openExternal: (url: string) => Promise<void>;
  setActiveWorkspace: (path: string) => Promise<void>;
  setCurrentProject: (id: string, name: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const nativeFs = {
  isElectron: (): boolean => {
    return !!(window as any).electronAPI;
  },

  async setActiveWorkspace(path: string) {
    await window.electronAPI?.setActiveWorkspace(path);
  },

  async setCurrentProject(id: string, name: string) {
    await window.electronAPI?.setCurrentProject(id, name);
  },

  async openExternal(url: string) {
    if (window.electronAPI) await window.electronAPI.openExternal(url);
    else window.open(url, '_blank');
  },

  async selectDirectory(): Promise<NativeResponse> {
    if (!window.electronAPI) return { success: false, canceled: true };
    return await window.electronAPI.selectDirectory();
  },

  async saveFileBuffer(filePath: string, base64Data: string): Promise<NativeResponse> {
    if (!window.electronAPI) return { success: false, error: "API not found" };
    return await window.electronAPI.saveFileBuffer(filePath, base64Data);
  },

  async saveProject(projectData: ProjectSaveData, filePath?: string, defaultName?: string): Promise<NativeResponse> {
    if (!window.electronAPI) return { success: false, error: "API not found" };
    return await window.electronAPI.saveProject(projectData, filePath, defaultName);
  },

  async openProject(): Promise<NativeResponse> {
    if (!window.electronAPI) return { success: false, error: "API not found" };
    return await window.electronAPI.openProject();
  },

  async uploadAsset(filename: string, base64Data: string): Promise<NativeResponse> {
    if (!window.electronAPI) return { success: false, error: "API not found" };
    return await window.electronAPI.uploadAsset(filename, base64Data);
  }
};