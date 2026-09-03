import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ProjectArchiveManager } from './archive-manager';
import { processResponsiveImages } from './image-processor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
// 确保直接启动或在测试环境中未显式传入时能正确回退到 dist 目录
process.env.DIST = process.env.DIST || path.join(__dirname, '../dist');
const THUMBNAIL_DIR = path.join(app.getPath('userData'), 'thumbnails');
const archiveManager = new ProjectArchiveManager();

protocol.registerSchemesAsPrivileged([
  { scheme: 'asset', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true, secure: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, title: 'SlideGrid Studio',
    icon: path.join(__dirname, '../public/logo.svg'),
    show: false, backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, webSecurity: true, sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const isDev = Boolean(VITE_DEV_SERVER_URL);
    const csp = isDev
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: ws: data: blob: asset:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http: ws:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http:; img-src 'self' asset: data: blob: http: https:; font-src 'self' asset: data: https://fonts.gstatic.com http:; connect-src 'self' http: ws: https:; object-src 'none';"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' asset: data: blob: https:; font-src 'self' asset: data: https://fonts.gstatic.com; connect-src 'self' https://api.gemini.com; object-src 'none'; frame-ancestors 'none';";
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(process.env.DIST || '', 'index.html'));
  win.once('ready-to-show', () => win.show());
}

app.whenReady().then(async () => {
  // --- 核心修复：更稳健的资产协议处理器 ---
  // @lat: [[electron-main#Asset Protocol]]
  protocol.handle('asset', async (req) => {
    try {
      // 1. 直接截取，不使用 URL 对象以防 hostname 解析失败
      let filename = req.url.slice('asset://'.length);
      // 2. 解码并清理路径
      filename = decodeURIComponent(filename.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, ''));
      
      // 3. 安全检查：防止路径遍历攻击
      const sanitized = path.basename(filename);
      if (sanitized !== filename || filename.includes('..') || path.isAbsolute(filename)) {
        console.error(`[Asset] Path traversal attempt blocked: ${filename}`);
        return new Response(null, { status: 403 });
      }
      
      const assetRoot = await archiveManager.getAssetRoot();
      const filePath = path.join(assetRoot, sanitized);
      
      // 4. 二次验证：确保最终路径在 assetRoot 内
      const normalizedPath = path.normalize(filePath);
      const normalizedRoot = path.normalize(assetRoot);
      if (!normalizedPath.startsWith(normalizedRoot)) {
        console.error(`[Asset] Path escape attempt blocked: ${normalizedPath}`);
        return new Response(null, { status: 403 });
      }
      
      if (!existsSync(filePath)) {
        console.error(`[Asset] Not found: ${filePath}`);
        return new Response(null, { status: 404 });
      }

      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: any = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

      return new Response(buffer, {
        headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (e: unknown) {
      console.error('[Asset] Handler error:', e);
      return new Response(null, { status: 404 });
    }
  });

  createWindow();

  ipcMain.handle('open-external', async (event, url) => {
    if (typeof url !== 'string' || !url.startsWith('https://')) {
      console.error('[open-external] Blocked non-HTTPS URL:', url);
      return;
    }
    await shell.openExternal(url);
  });
  ipcMain.handle('setActiveWorkspace', (event, path) => { archiveManager.setActiveWorkspace(path); });
  ipcMain.handle('list-projects', async () => { return await archiveManager.listProjects(); });
  ipcMain.handle('setCurrentProject', (event, { id, name }) => { archiveManager.setCurrentProject(id, name); });
  ipcMain.handle('get-app-paths', () => {
    const localWorkspace = path.join(process.cwd(), 'workspace');
    const defaultWs = existsSync(localWorkspace) ? localWorkspace : path.join(app.getPath('userData'), 'Projects');
    return {
      userData: app.getPath('userData'),
      thumbnails: THUMBNAIL_DIR,
      defaultWorkspace: defaultWs,
      localWorkspace: existsSync(localWorkspace) ? localWorkspace : undefined
    };
  });

  // 核心：直接读取工作目录文件并返回 Base64
  ipcMain.handle('read-asset-file', async (event, filename) => {
    try {
      const assetRoot = await archiveManager.getAssetRoot();
      const filePath = path.join(assetRoot, filename);
      if (!existsSync(filePath)) return null;
      const buffer = await fs.readFile(filePath);
      return buffer.toString('base64');
    } catch (e: unknown) {
      console.error('[read-asset-file] Error:', e);
      return null;
    }
  });

  ipcMain.handle('capture-page-to-thumbnail', async (event, { projectId, rect }) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win || !rect) return null;
      const bounds = win.getContentBounds();
      const x = Math.max(0, Math.floor(rect.x || 0));
      const y = Math.max(0, Math.floor(rect.y || 0));
      const maxWidth = Math.max(1, bounds.width - x);
      const maxHeight = Math.max(1, bounds.height - y);
      const width = Math.min(Math.max(1, Math.floor(rect.width || 100)), maxWidth);
      const height = Math.min(Math.max(1, Math.floor(rect.height || 100)), maxHeight);

      const image = await win.webContents.capturePage({ x, y, width, height });
      return image.resize({ width: 400, quality: 'good' }).toDataURL();
    } catch (e: unknown) {
      console.error('[capture-page-to-thumbnail] Error:', e);
      return null;
    }
  });

  ipcMain.handle('save-project', async (event, { filePath, content, defaultName }) => {
    try {
      let targetPath = filePath;
      if (!targetPath) {
        const safeName = (defaultName || 'Untitled').replace(/[<>:"/\\|?*]/g, '');
        const { canceled, filePath: savePath } = await dialog.showSaveDialog({
          title: 'Save Project', defaultPath: `${safeName}.slgrid`,
          filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }]
        });
        if (canceled) return { success: false, canceled: true };
        targetPath = savePath;
      }
      await archiveManager.saveProject(targetPath, JSON.parse(JSON.stringify(content)));
      return { success: true, filePath: targetPath };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('open-project', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({ filters: [{ name: 'SlideGrid Project', extensions: ['slgrid'] }], properties: ['openFile'] });
      if (canceled || filePaths.length === 0) return { canceled: true };
      const projectData = await archiveManager.openProject(filePaths[0]);
      return { success: true, filePath: filePaths[0], content: JSON.stringify(projectData) };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('read-project', async (event, filePath) => {
    try {
      const projectData = await archiveManager.openProject(filePath);
      return { success: true, content: JSON.stringify(projectData) };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('upload-asset', async (event, { filename, base64Data }) => {
    try {
      const buffer = Buffer.from(base64Data.replace(/^data:.*;base64,/, ""), 'base64');
      const url = await archiveManager.saveAsset(filename, buffer);
      return { success: true, url };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    if (canceled) return { canceled: true };
    return { success: true, path: filePaths[0] };
  });

  ipcMain.handle('save-file-buffer', async (event, { filePath, base64Data }) => {
    try {
      if (typeof filePath !== 'string' || !base64Data || /[\x00-\x1f]/.test(filePath)) {
        return { success: false, error: 'Invalid file path or data' };
      }
      await fs.writeFile(path.resolve(filePath), Buffer.from(base64Data.replace(/^data:.*;base64,/, ""), 'base64'));
      return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('process-responsive-images', async (event, { input, formats }) => {
    try {
      const result = await processResponsiveImages(input, formats);
      return { success: true, result };
    } catch (error: any) { return { success: false, error: error.message }; }
  });

  ipcMain.handle('delete-project', async (event, projectPath) => {
    try {
      if (typeof projectPath !== 'string' || /[\x00-\x1f]/.test(projectPath)) {
        return { success: false, error: 'Invalid project path' };
      }
      return await archiveManager.deleteProject(projectPath);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });