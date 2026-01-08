// 定义 Electron IPC 类型
interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
  };
}

// 安全获取 Electron 对象
const getElectron = (): ElectronAPI | null => {
  // @ts-ignore
  if (window.require) {
    // @ts-ignore
    const { ipcRenderer } = window.require('electron');
    return { ipcRenderer };
  }
  return null;
};

export const nativeFs = {
  isElectron: () => !!getElectron(),

  saveProject: async (content: string, filePath?: string) => {
    const electron = getElectron();
    if (!electron) throw new Error("Not in Electron environment");
    return await electron.ipcRenderer.invoke('save-project', { content, filePath });
  },

  openProject: async () => {
    const electron = getElectron();
    if (!electron) throw new Error("Not in Electron environment");
    return await electron.ipcRenderer.invoke('open-project');
  }
};
