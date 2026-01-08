import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'SlideGrid Studio',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, 
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

// 开启 GPU 加速以获得丝滑动画
app.commandLine.appendSwitch('ignore-gpu-blacklist');
// app.commandLine.appendSwitch('disable-gpu'); <--- 已移除
// app.commandLine.appendSwitch('disable-gpu-compositing'); <--- 已移除

app.whenReady().then(() => {
  createWindow();

  // --- IPC Handlers for Native File System ---

  // 1. 保存项目
  ipcMain.handle('save-project', async (event, { filePath, content }) => {
    try {
      let targetPath = filePath;
      
      // 如果没有提供路径，则弹出 "另存为" 对话框
      if (!targetPath) {
        const { canceled, filePath: savePath } = await dialog.showSaveDialog({
          title: 'Save Project',
          defaultPath: 'Untitled.slgrid',
          filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }]
        });
        if (canceled) return { success: false, canceled: true };
        targetPath = savePath;
      }

      await fs.writeFile(targetPath, content, 'utf-8');
      return { success: true, filePath: targetPath };
    } catch (error: any) {
      console.error('Save failed:', error);
      return { success: false, error: error.message };
    }
  });

  // 2. 打开项目
  ipcMain.handle('open-project', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Open Project',
        filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { canceled: true };

      const filePath = filePaths[0];
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, filePath, content };
    } catch (error: any) {
      console.error('Open failed:', error);
      return { success: false, error: error.message };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});