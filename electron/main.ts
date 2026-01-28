import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
// ... 保持其他导入不变

// 在 app.whenReady().then(...) 内部增加：
  ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
  });
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ProjectArchiveManager } from './archive-manager';
import { processResponsiveImages } from './image-processor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const THUMBNAIL_DIR = path.join(app.getPath('userData'), 'thumbnails');
const archiveManager = new ProjectArchiveManager();

// 缩略图缓存
const thumbnailCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;
let isCapturing = false; // 并发锁

// 定期清理缓存
setInterval(() => {
  if (thumbnailCache.size > MAX_CACHE_SIZE) {
    const keys = Array.from(thumbnailCache.keys());
    keys.slice(0, keys.length - MAX_CACHE_SIZE).forEach(key => {
      thumbnailCache.delete(key);
    });
  }
}, 60000);

protocol.registerSchemesAsPrivileged([
  { scheme: 'asset', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true, secure: true } }
]);

(async () => {
  if (!existsSync(THUMBNAIL_DIR)) {
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  }
})();

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'SlideGrid Studio',
    icon: path.join(__dirname, '../public/logo.svg'),
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false, // 暂时关闭沙盒以确保 preload 脚本在某些 Windows 环境下能正常注入 API
      preload: path.join(__dirname, 'preload.js'),
      experimentalFeatures: true,
      enableBlinkFeatures: 'CSSColorSchemeUARendering',
    },
  });

  // 添加 CSP 策略
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' asset: data: blob: https: http:; " + // 增加 https: http: 支持
          "font-src 'self' asset: data: https://fonts.gstatic.com; " +
          "connect-src 'self' https://api.gemini.com;"
        ]
      }
    });
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  // 优化窗口显示时机
  win.once('ready-to-show', () => {
    win.show();
  });
}

// 硬件加速优化 (移除过于激进的标志，保持默认 Skia 渲染以提高稳定性)
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

app.whenReady().then(async () => {
  const assetRoot = await archiveManager.getAssetRoot();
  
  protocol.handle('asset', async (req) => {
    try {
      // 获取文件名：直接截取 asset:// 之后的部分并清理尾部斜杠
      let filename = req.url.replace(/^asset:\/\//, '');
      // 清理查询参数、尾部斜杠以及 URL 编码
      filename = decodeURIComponent(filename.split('?')[0].replace(/\/$/, ''));
      
      const assetRoot = await archiveManager.getAssetRoot();
      const filePath = path.join(assetRoot, filename);
      
      try {
        const buffer = await fs.readFile(filePath);
        const extension = path.extname(filename).toLowerCase();
        
        let mimeType = 'image/png';
        if (extension === '.jpg' || extension === '.jpeg') mimeType = 'image/jpeg';
        else if (extension === '.webp') mimeType = 'image/webp';
        else if (extension === '.avif') mimeType = 'image/avif';
        else if (extension === '.svg') mimeType = 'image/svg+xml';

        return new Response(buffer, {
          headers: { 
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (readError) {
        console.error(`[Asset Protocol] 404 - File not found: ${filePath}`);
        return new Response(null, { status: 404 });
      }
    } catch (e) {
      console.error('[Asset Protocol] Critical Error:', e);
      return new Response(null, { status: 404 });
    }
  });

  createWindow();

  ipcMain.handle('get-app-paths', () => ({
    userData: app.getPath('userData'),
    thumbnails: THUMBNAIL_DIR
  }));

  ipcMain.handle('capture-page-to-thumbnail', async (event, { projectId, rect }) => {
    if (isCapturing) return null; // 如果正在截图中，直接跳过
    
    try {
      isCapturing = true;
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return null;

      // 创建缓存键 (增加时间戳偏移以防旧缓存)
      const cacheKey = `${projectId}_${Math.floor(rect.width)}_${Math.floor(rect.height)}`;
      
      const image = await win.webContents.capturePage({
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      });

      const thumbnail = image.resize({ width: 300, quality: 'good' }); 
      const thumbnailData = thumbnail.toDataURL();
      return thumbnailData;
    } catch (e) {
      console.error('Native capture failed:', e);
      return null;
    } finally {
      isCapturing = false;
    }
  });

  // 核心修改：接收 defaultName 参数
  ipcMain.handle('save-project', async (event, { filePath, content, defaultName }) => {
    console.log('[Main] save-project triggered', { hasPath: !!filePath, defaultName });
    try {
      let targetPath = filePath;
      if (!targetPath) {
        console.log('[Main] No path provided, showing save dialog...');
        // 使用前端传来的文件名作为默认值，sanitize 掉非法字符
        const safeName = (defaultName || 'Untitled').replace(/[<>:"/\\|?*]/g, '');
        const { canceled, filePath: savePath } = await dialog.showSaveDialog({
          title: 'Save Project',
          defaultPath: `${safeName}.slgrid`, // 自动填充
          filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }]
        });
        if (canceled) return { success: false, canceled: true };
        targetPath = savePath;
      }

      let projectData = content;
      if (typeof content === 'string') projectData = JSON.parse(content);

      await archiveManager.saveProject(targetPath, projectData);
      return { success: true, filePath: targetPath };
    } catch (error: any) {
      console.error('Save failed:', error);
      return { success: false, error: error.stack || error.message };
    }
  });

  ipcMain.handle('open-project', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Open Project',
        filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }],
        properties: ['openFile']
      });
      if (canceled || filePaths.length === 0) return { canceled: true };
      const filePath = filePaths[0];
      const projectData = await archiveManager.openProject(filePath);
      return { success: true, filePath, content: JSON.stringify(projectData) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('upload-asset', async (event, { filename, base64Data }) => {
    try {
      const buffer = Buffer.from(base64Data.replace(/^data:.*;base64,/, ""), 'base64');
      const assetUrl = await archiveManager.saveAsset(filename, buffer);
      return { success: true, url: assetUrl };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: 'Select Export Folder', properties: ['openDirectory', 'createDirectory'] });
    if (canceled || filePaths.length === 0) return { canceled: true };
    return { success: true, path: filePaths[0] };
  });

  ipcMain.handle('save-file-buffer', async (event, { filePath, base64Data }) => {
    try {
      const buffer = Buffer.from(base64Data.replace(/^data:.*;base64,/, ""), 'base64');
      await fs.writeFile(filePath, buffer);
      return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('process-responsive-images', async (event, { input, formats }) => {
    try {
      let buffer: Buffer;
      if (typeof input === 'string') {
        if (input.startsWith('asset://')) {
          const assetRoot = await archiveManager.getAssetRoot();
          const filename = input.replace('asset://', '');
          const filePath = path.join(assetRoot, filename);
          buffer = await fs.readFile(filePath);
        } else {
          buffer = Buffer.from(input, 'base64');
        }
      } else {
        buffer = input;
      }
      return await processResponsiveImages(buffer, formats);
    } catch (error: any) {
      console.error('Responsive image processing failed:', error);
      return [];
    }
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
