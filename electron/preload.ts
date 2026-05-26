import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPaths: () => ipcRenderer.invoke('get-app-paths'),
  captureThumbnail: (projectId: string, rect: any) => ipcRenderer.invoke('capture-page-to-thumbnail', { projectId, rect }),
  saveProject: (content: any, filePath?: string, defaultName?: string) => ipcRenderer.invoke('save-project', { content, filePath, defaultName }),
  openProject: () => ipcRenderer.invoke('open-project'),
  readProject: (filePath: string) => ipcRenderer.invoke('read-project', filePath),
  uploadAsset: (filename: string, base64Data: string) => ipcRenderer.invoke('upload-asset', { filename, base64Data }),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveFileBuffer: (filePath: string, base64Data: string) => ipcRenderer.invoke('save-file-buffer', { filePath, base64Data }),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  setActiveWorkspace: (path: string) => ipcRenderer.invoke('setActiveWorkspace', path),
  listProjects: () => ipcRenderer.invoke('list-projects'),
  setCurrentProject: (id: string, name: string) => ipcRenderer.invoke('setCurrentProject', { id, name }),
  readAssetFile: (filename: string) => ipcRenderer.invoke('read-asset-file', filename),
  processResponsiveImages: (input: any, formats: any) => ipcRenderer.invoke('process-responsive-images', { input, formats })
});
