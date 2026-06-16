import { contextBridge, ipcRenderer } from 'electron';

const INVALID_PATH_RE = /\.\.|[\x00-\x1f<>:"|?*\\]/;

function validatePathParam(name: string, value: string): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  if (INVALID_PATH_RE.test(value)) {
    console.warn(`[preload] Rejected invalid ${name}: "${value}"`);
    return null;
  }
  return value;
}

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPaths: async () => {
    try { return await ipcRenderer.invoke('get-app-paths'); }
    catch (e) { console.error('[preload] getAppPaths failed:', e); return null; }
  },
  captureThumbnail: async (projectId: string, rect: any) => {
    try { return await ipcRenderer.invoke('capture-page-to-thumbnail', { projectId, rect }); }
    catch (e) { console.error('[preload] captureThumbnail failed:', e); return null; }
  },
  saveProject: async (content: any, filePath?: string, defaultName?: string) => {
    try { return await ipcRenderer.invoke('save-project', { content, filePath, defaultName }); }
    catch (e) { console.error('[preload] saveProject failed:', e); return null; }
  },
  openProject: async () => {
    try { return await ipcRenderer.invoke('open-project'); }
    catch (e) { console.error('[preload] openProject failed:', e); return null; }
  },
  readProject: async (filePath: string) => {
    if (!validatePathParam('filePath', filePath)) return null;
    try { return await ipcRenderer.invoke('read-project', filePath); }
    catch (e) { console.error('[preload] readProject failed:', e); return null; }
  },
  uploadAsset: async (filename: string, base64Data: string) => {
    if (!validatePathParam('filename', filename)) return null;
    try { return await ipcRenderer.invoke('upload-asset', { filename, base64Data }); }
    catch (e) { console.error('[preload] uploadAsset failed:', e); return null; }
  },
  selectDirectory: async () => {
    try { return await ipcRenderer.invoke('select-directory'); }
    catch (e) { console.error('[preload] selectDirectory failed:', e); return null; }
  },
  saveFileBuffer: async (filePath: string, base64Data: string) => {
    if (!validatePathParam('filePath', filePath)) return null;
    try { return await ipcRenderer.invoke('save-file-buffer', { filePath, base64Data }); }
    catch (e) { console.error('[preload] saveFileBuffer failed:', e); return null; }
  },
  openExternal: async (url: string) => {
    try { return await ipcRenderer.invoke('open-external', url); }
    catch (e) { console.error('[preload] openExternal failed:', e); return null; }
  },
  setActiveWorkspace: async (path: string) => {
    if (!validatePathParam('workspace path', path)) return null;
    try { return await ipcRenderer.invoke('setActiveWorkspace', path); }
    catch (e) { console.error('[preload] setActiveWorkspace failed:', e); return null; }
  },
  listProjects: async () => {
    try { return await ipcRenderer.invoke('list-projects'); }
    catch (e) { console.error('[preload] listProjects failed:', e); return []; }
  },
  setCurrentProject: async (id: string, name: string) => {
    try { return await ipcRenderer.invoke('setCurrentProject', { id, name }); }
    catch (e) { console.error('[preload] setCurrentProject failed:', e); return null; }
  },
  readAssetFile: async (filename: string) => {
    if (!validatePathParam('filename', filename)) return null;
    try { return await ipcRenderer.invoke('read-asset-file', filename); }
    catch (e) { console.error('[preload] readAssetFile failed:', e); return null; }
  },
  processResponsiveImages: async (input: any, formats: any) => {
    try { return await ipcRenderer.invoke('process-responsive-images', { input, formats }); }
    catch (e) { console.error('[preload] processResponsiveImages failed:', e); return null; }
  },
  deleteProject: async (projectPath: string) => {
    if (!validatePathParam('projectPath', projectPath)) return null;
    try { return await ipcRenderer.invoke('delete-project', projectPath); }
    catch (e) { console.error('[preload] deleteProject failed:', e); return null; }
  }
});