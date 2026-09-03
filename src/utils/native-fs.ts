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

export interface NativeProjectSummary {
  id: string;
  title?: string;
  name?: string;
  filePath?: string;
  path?: string;
  date?: string;
  lastModified?: number;
  type?: string;
  aspectRatio?: string;
  thumbnail?: string | null;
}

interface ElectronAPI {
  getAppPaths: () => Promise<{ userData: string; thumbnails: string }>;
  captureThumbnail: (projectId: string, rect: { x: number; y: number; width: number; height: number }) => Promise<string | null>;
  saveProject: (content: ProjectSaveData, filePath?: string, defaultName?: string) => Promise<NativeResponse>;
  openProject: () => Promise<NativeResponse>;
  readProject: (filePath: string) => Promise<NativeResponse>;
  uploadAsset: (filename: string, base64Data: string) => Promise<NativeResponse>;
  selectDirectory: () => Promise<NativeResponse>;
  saveFileBuffer: (filePath: string, base64Data: string) => Promise<NativeResponse>;
  openExternal: (url: string) => Promise<void>;
  setActiveWorkspace: (path: string) => Promise<void>;
  listProjects: () => Promise<NativeProjectSummary[]>;
  setCurrentProject: (id: string, name: string) => Promise<void>;
  deleteProject: (projectPath: string) => Promise<NativeResponse>;
  readAssetFile: (filename: string) => Promise<string | null>;
  processResponsiveImages: (input: string | Buffer, formats: string[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const getElectronAPI = (): ElectronAPI | undefined => {
  return typeof window !== 'undefined' ? window.electronAPI : undefined;
};

// @lat: [[utils-native-fs]]
export const nativeFs = {
  isElectron: (): boolean => {
    return Boolean(getElectronAPI());
  },

  async getAppPaths(): Promise<{ userData: string; thumbnails: string }> {
    const api = getElectronAPI();
    if (!api) return { userData: '', thumbnails: '' };
    return await api.getAppPaths();
  },

  async captureThumbnail(projectId: string, rect: { x: number; y: number; width: number; height: number }): Promise<string | null> {
    const api = getElectronAPI();
    if (!api) return null;
    return await api.captureThumbnail(projectId, rect);
  },

  async readAssetFile(filename: string): Promise<string | null> {
    const api = getElectronAPI();
    if (!api) return null;
    return await api.readAssetFile(filename);
  },

  async processResponsiveImages(input: string | Buffer, formats: string[]): Promise<any> {
    const api = getElectronAPI();
    if (!api) return [];
    return await api.processResponsiveImages(input, formats);
  },

  async setActiveWorkspace(path: string) {
    const api = getElectronAPI();
    await api?.setActiveWorkspace(path);
  },

  async listProjects(): Promise<NativeProjectSummary[]> {
    const api = getElectronAPI();
    if (!api) return [];
    return await api.listProjects();
  },

  async setCurrentProject(id: string, name: string) {
    const api = getElectronAPI();
    await api?.setCurrentProject(id, name);
  },

  async openExternal(url: string) {
    const api = getElectronAPI();
    if (api) await api.openExternal(url);
    else if (typeof window !== 'undefined') window.open(url, '_blank');
  },

  async selectDirectory(): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, canceled: true };
    return await api.selectDirectory();
  },

  async saveFileBuffer(filePath: string, base64Data: string): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.saveFileBuffer(filePath, base64Data);
  },

  async saveProject(projectData: ProjectSaveData, filePath?: string, defaultName?: string): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.saveProject(projectData, filePath, defaultName);
  },

  async openProject(): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.openProject();
  },

  async readProject(filePath: string): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.readProject(filePath);
  },

  async uploadAsset(filename: string, base64Data: string): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.uploadAsset(filename, base64Data);
  },

  async deleteProject(projectPath: string): Promise<NativeResponse> {
    const api = getElectronAPI();
    if (!api) return { success: false, error: "API not found" };
    return await api.deleteProject(projectPath);
  }
};