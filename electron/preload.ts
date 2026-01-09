import { contextBridge, ipcRenderer } from 'electron';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPaths: () => ipcRenderer.invoke('get-app-paths'),
  
  captureThumbnail: (projectId: string, rect: Rect) =>
    ipcRenderer.invoke('capture-page-to-thumbnail', { projectId, rect }),
  
  saveProject: (content: any, filePath?: string, defaultName?: string) =>
    ipcRenderer.invoke('save-project', { content, filePath, defaultName }),
  
  openProject: () =>
    ipcRenderer.invoke('open-project'),
  
  uploadAsset: (filename: string, base64Data: string) =>
    ipcRenderer.invoke('upload-asset', { filename, base64Data }),
  
  selectDirectory: () =>
    ipcRenderer.invoke('select-directory'),
  
  saveFileBuffer: (filePath: string, base64Data: string) =>
    ipcRenderer.invoke('save-file-buffer', { filePath, base64Data }),

  processResponsiveImages: (input: string | Buffer, formats: string[]) =>
    ipcRenderer.invoke('process-responsive-images', { input, formats })
});
