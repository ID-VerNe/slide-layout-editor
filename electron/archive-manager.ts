import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import crypto from 'crypto';
import { existsSync } from 'fs';
import sharp from 'sharp';

const MAX_ARCHIVE_SIZE = 100 * 1024 * 1024;   // 100 MB
const MAX_ENTRY_COUNT = 1000;

export class ProjectArchiveManager {
  private workspacePath: string | null = null;
  private currentProjectId: string | null = null;
  private currentProjectName: string = 'Untitled';
  private folderLock: Map<string, Promise<string>> = new Map();

  public setActiveWorkspace(path: string) {
    this.workspacePath = path;
  }

  public getActiveWorkspace(): string | null {
    return this.workspacePath;
  }

  public setCurrentProject(id: string, name: string) {
    this.currentProjectId = id;
    this.currentProjectName = name || 'Untitled';
  }

  public async listProjects() {
    const searchDirs: string[] = [];
    if (this.workspacePath && existsSync(this.workspacePath)) {
      searchDirs.push(this.workspacePath);
    }
    // 自动发现项目根目录下的 workspace 目录
    const localWorkspace = path.join(process.cwd(), 'workspace');
    if (existsSync(localWorkspace) && !searchDirs.includes(localWorkspace)) {
      searchDirs.push(localWorkspace);
    }
    const defaultWs = path.join(app.getPath('userData'), 'DefaultWorkspace');
    if (existsSync(defaultWs) && !searchDirs.includes(defaultWs)) {
      searchDirs.push(defaultWs);
    }
    const projectsWs = path.join(app.getPath('userData'), 'Projects');
    if (existsSync(projectsWs) && !searchDirs.includes(projectsWs)) {
      searchDirs.push(projectsWs);
    }

    const projects: any[] = [];
    const seenIds = new Set<string>();

    for (const wsDir of searchDirs) {
      try {
        const entries = await fs.readdir(wsDir, { withFileTypes: true });

        // 1. 检查根目录下的 project.json
        const rootProjectJson = path.join(wsDir, 'project.json');
        if (existsSync(rootProjectJson)) {
          try {
            const content = await fs.readFile(rootProjectJson, 'utf-8');
            const data = JSON.parse(content);
            const stats = await fs.stat(rootProjectJson);
            const projId = data.id || path.basename(wsDir);
            if (!seenIds.has(projId)) {
              seenIds.add(projId);
              projects.push({
                id: projId,
                title: data.projectTitle || data.title || 'Untitled',
                date: new Date(stats.mtime).toLocaleDateString(),
                lastModified: stats.mtimeMs,
                type: data.pages?.[0]?.layoutId || 'standard',
                aspectRatio: data.pages?.[0]?.aspectRatio || '16:9',
                thumbnail: data.thumbnail || null,
                filePath: wsDir
              });
            }
          } catch (e) {
            console.error(`Failed to read root project.json in ${wsDir}`, e);
          }
        }

        // 2. 扫描子目录与 .slgrid 文件
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (['assets', 'thumbnails', 'node_modules', '.git'].includes(entry.name)) continue;
            const projectJsonPath = path.join(wsDir, entry.name, 'project.json');
            if (existsSync(projectJsonPath)) {
              try {
                const content = await fs.readFile(projectJsonPath, 'utf-8');
                const data = JSON.parse(content);
                const stats = await fs.stat(projectJsonPath);
                const projId = data.id || entry.name.split('_').pop() || entry.name;
                if (!seenIds.has(projId)) {
                  seenIds.add(projId);
                  projects.push({
                    id: projId,
                    title: data.projectTitle || data.title || 'Untitled',
                    date: new Date(stats.mtime).toLocaleDateString(),
                    lastModified: stats.mtimeMs,
                    type: data.pages?.[0]?.layoutId || 'standard',
                    aspectRatio: data.pages?.[0]?.aspectRatio || '16:9',
                    thumbnail: data.thumbnail || null,
                    filePath: path.join(wsDir, entry.name)
                  });
                }
              } catch (e) {
                console.error(`Failed to read project.json in ${entry.name}`, e);
              }
            }
          } else if (entry.isFile() && entry.name.endsWith('.slgrid')) {
            try {
              const slgridPath = path.join(wsDir, entry.name);
              const zip = new AdmZip(slgridPath);
              const projectJsonEntry = zip.getEntry('project.json');
              if (projectJsonEntry) {
                const data = JSON.parse(projectJsonEntry.getData().toString('utf8'));
                const stats = await fs.stat(slgridPath);
                const projId = data.id || entry.name.replace('.slgrid', '');
                if (!seenIds.has(projId)) {
                  seenIds.add(projId);
                  projects.push({
                    id: projId,
                    title: data.projectTitle || data.title || entry.name.replace('.slgrid', ''),
                    date: new Date(stats.mtime).toLocaleDateString(),
                    lastModified: stats.mtimeMs,
                    type: data.pages?.[0]?.layoutId || 'standard',
                    aspectRatio: data.pages?.[0]?.aspectRatio || '16:9',
                    thumbnail: data.thumbnail || null,
                    filePath: slgridPath
                  });
                }
              }
            } catch (e) {
              console.error(`Failed to read .slgrid in ${entry.name}`, e);
            }
          }
        }
      } catch (e) {
        console.error(`Failed to scan workspace ${wsDir}:`, e);
      }
    }

    return projects.sort((a, b) => b.lastModified - a.lastModified);
  }

  /**
   * 获取物理存储目录
   * 核心改进：优先通过 ID 后缀匹配现有文件夹，防止因标题修改导致资产丢失
   * 添加锁机制防止竞态条件
   */
  private async getProjectFolder() {
    const lockKey = this.currentProjectId || 'default';

    // 如果已有进行中的操作，等待它完成
    if (this.folderLock.has(lockKey)) {
      return this.folderLock.get(lockKey)!;
    }

    // 创建新的锁
    const folderPromise = this._getProjectFolderInternal();
    this.folderLock.set(lockKey, folderPromise);

    try {
      const result = await folderPromise;
      return result;
    } finally {
      // 操作完成后释放锁
      this.folderLock.delete(lockKey);
    }
  }

  private async _getProjectFolderInternal(): Promise<string> {
    if (!this.workspacePath) {
      const localWorkspace = path.join(process.cwd(), 'workspace');
      this.workspacePath = existsSync(localWorkspace) ? localWorkspace : path.join(app.getPath('userData'), 'DefaultWorkspace');
    }

    if (!existsSync(this.workspacePath)) {
      await fs.mkdir(this.workspacePath, { recursive: true });
    }

    const idSuffix = this.currentProjectId?.slice(0, 8) || 'temp';
    const safeName = (this.currentProjectName || 'Project')
      .replace(/[<>:"/\\|?*\x00-\x1F·]/g, '') // 添加 · 等特殊字符
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 100); // 限制长度，避免路径过长

    // 1. 尝试在 Workspace 中寻找 ID 匹配的现有文件夹
    const items = await fs.readdir(this.workspacePath);
    let existingFolder = items.find(item => item.endsWith(`_${idSuffix}`));

    if (existingFolder) {
      const fullPath = path.join(this.workspacePath, existingFolder);
      // 如果标题变了，尝试重命名文件夹以保持可读性（可选，但推荐）
      const newFolderName = `${safeName}_${idSuffix}`;
      if (existingFolder !== newFolderName) {
        try {
          const newPath = path.join(this.workspacePath, newFolderName);
          // 检查目标路径是否已存在
          if (!existsSync(newPath)) {
            await fs.rename(fullPath, newPath);
            return newPath;
          }
        } catch (e) {
          // 重命名失败（可能被占用），则继续使用旧路径
          console.warn(`Failed to rename project folder: ${e}`);
        }
      }
      return fullPath;
    }

    // 2. 如果不存在，则创建新文件夹
    const folderName = `${safeName}_${idSuffix}`;
    const projectPath = path.join(this.workspacePath, folderName);

    if (!existsSync(projectPath)) await fs.mkdir(projectPath, { recursive: true });
    return projectPath;
  }

  public async getAssetRoot() {
    const projectFolder = await this.getProjectFolder();
    const assetsDir = path.join(projectFolder, 'assets');
    if (!existsSync(assetsDir)) await fs.mkdir(assetsDir, { recursive: true });
    return assetsDir;
  }

  public async openProject(filePath: string) {
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      // 如果是目录，读取目录下的 project.json
      const jsonPath = path.join(filePath, 'project.json');
      if (!existsSync(jsonPath)) throw new Error("Project metadata not found in directory");
      const content = await fs.readFile(jsonPath, 'utf-8');
      let projectData: any;
      try {
        projectData = JSON.parse(content);
      } catch (e) {
        throw new Error(`Failed to parse project.json: ${(e as Error).message}`);
      }

      this.currentProjectId = projectData.id || crypto.randomUUID();
      this.currentProjectName = projectData.projectTitle || projectData.title || 'Imported';

      return projectData;
    }

    const fileBuffer = await fs.readFile(filePath);
    const isZip = fileBuffer.length > 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B;

    if (isZip) {
      const zip = new AdmZip(filePath);

      // Security: reject zip bombs by limiting total entry count
      const entries = zip.getEntries();
      if (entries.length > MAX_ENTRY_COUNT) {
        throw new Error(`Archive contains too many entries (${entries.length} > ${MAX_ENTRY_COUNT}) — possible zip bomb`);
      }

      // Security: validate total uncompressed size to prevent zip bombs
      let totalUncompressedSize = 0;
      for (const entry of entries) {
        totalUncompressedSize += entry.header.size;
      }
      if (totalUncompressedSize > MAX_ARCHIVE_SIZE) {
        throw new Error(`Archive total size exceeds limit (${totalUncompressedSize} > ${MAX_ARCHIVE_SIZE}) — possible zip bomb`);
      }

      // Security: validate each entry path to prevent path traversal
      for (const entry of entries) {
        const normalizedEntryPath = path.normalize(entry.entryName);
        if (normalizedEntryPath.startsWith('..') || path.isAbsolute(normalizedEntryPath) || normalizedEntryPath.includes('..')) {
          throw new Error(`Archive contains entry with invalid path: ${entry.entryName}`);
        }
      }

      const projectJsonEntry = zip.getEntry('project.json');
      if (!projectJsonEntry) throw new Error("Invalid archive: missing project.json");

      let projectData: any;
      try {
        projectData = JSON.parse(projectJsonEntry.getData().toString('utf8'));
      } catch (e) {
        throw new Error(`Failed to parse project.json from archive: ${(e as Error).message}`);
      }

      // 先设置上下文，再获取路径，最后解压
      this.currentProjectId = projectData.id || crypto.randomUUID();
      this.currentProjectName = projectData.projectTitle || projectData.title || 'Imported';

      const projectFolder = await this.getProjectFolder();
      zip.extractAllTo(projectFolder, true);
      return projectData;
    } else {
      let projectData: any;
      try {
        projectData = JSON.parse(fileBuffer.toString('utf-8'));
      } catch (e) {
        throw new Error(`Failed to parse project file: ${(e as Error).message}`);
      }
      this.currentProjectId = projectData.id || crypto.randomUUID();
      this.currentProjectName = projectData.title || 'Legacy';
      await this.migrateLegacyAssets(projectData);
      return projectData;
    }
  }

  private async migrateLegacyAssets(projectData: any) {
    const assetsDir = await this.getAssetRoot();
    const process = async (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'string' && val.startsWith('data:image')) {
          const matches = val.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1].includes('svg') ? 'svg' : (matches[1] === 'jpeg' ? 'jpg' : matches[1]);
            const hash = crypto.createHash('md5').update(matches[2]).digest('hex');
            const filename = `img_${hash}.${ext}`;
            await fs.writeFile(path.join(assetsDir, filename), Buffer.from(matches[2], 'base64'));
            obj[key] = `asset://${filename}`;
          }
        } else if (typeof val === 'object') await process(val);
      }
    };
    await process(projectData);
  }

  public async saveProject(filePath: string, projectData: any) {
    const data = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;
    this.currentProjectId = data.id;
    this.currentProjectName = data.title || data.projectTitle || 'Untitled';

    const projectFolder = await this.getProjectFolder();
    const assetsDir = path.join(projectFolder, 'assets');

    // 1. 无论如何，先更新项目文件夹内的 project.json
    await fs.writeFile(path.join(projectFolder, 'project.json'), JSON.stringify(data, null, 2), 'utf-8');

    // 2. 检查 filePath 是否指向文件夹
    let isDirectory = false;
    try {
      const stats = await fs.stat(filePath);
      isDirectory = stats.isDirectory();
    } catch (e) {
      // 路径不存在（新文件保存），isDirectory 保持 false
    }

    // 3. 如果是文件夹（Workspace 模式），任务已完成
    if (isDirectory || filePath === projectFolder) {
      return;
    }

    // 4. 如果是文件路径（Export 模式 / .slgrid），则打包 ZIP
    const zip = new AdmZip();
    zip.addLocalFile(path.join(projectFolder, 'project.json'));
    if (existsSync(assetsDir)) {
      const files = await fs.readdir(assetsDir);
      if (files.length > 0) zip.addLocalFolder(assetsDir, 'assets');
    }
    await fs.writeFile(filePath, zip.toBuffer());
  }

  public async saveAsset(filename: string, buffer: Buffer) {
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const assetsDir = await this.getAssetRoot();

    const { buffer: processedBuffer, format } = await this.compressImage(buffer);
    const ext = format === 'bin' ? path.extname(filename) : `.${format === 'jpeg' ? 'jpg' : format}`;
    const finalFilename = `res_${hash.slice(0, 8)}${ext}`;

    // 安全检查：防止路径遍历
    const sanitized = path.basename(finalFilename);
    const targetPath = path.join(assetsDir, sanitized);
    if (!targetPath.startsWith(assetsDir)) {
      throw new Error('Invalid asset filename');
    }

    await fs.writeFile(targetPath, processedBuffer);
    return `asset://${sanitized}`;
  }

  private async compressImage(buffer: Buffer): Promise<{ buffer: Buffer, format: string }> {
    try {
      // 检测 SVG：可能以 <?xml、<!DOCTYPE 或 <svg 开头
      const header = buffer.toString('utf8', 0, Math.min(200, buffer.length));
      if (header.includes('<svg') || header.includes('<?xml')) {
        return { buffer, format: 'svg' };
      }

      const s = sharp(buffer);
      const metadata = await s.metadata();
      if (metadata.width && metadata.width > 2000) s.resize({ width: 2000, withoutEnlargement: true });
      const out = await s.webp({ quality: 85 }).toBuffer();
      return { buffer: out, format: 'webp' };
    } catch (e) {
      console.warn('Image compression failed, using original buffer:', e);
      return { buffer, format: 'bin' };
    }
  }

  /** 删除工程文件夹或单文件归档，内置严格的工作区白名单防护 */
  public async deleteProject(projectPath: string): Promise<{ success: boolean; error?: string }> {
    const searchDirs: string[] = [];
    if (this.workspacePath && existsSync(this.workspacePath)) searchDirs.push(path.resolve(this.workspacePath));
    const localWorkspace = path.resolve(process.cwd(), 'workspace');
    if (existsSync(localWorkspace)) searchDirs.push(localWorkspace);
    const defaultWs = path.resolve(app.getPath('userData'), 'DefaultWorkspace');
    if (existsSync(defaultWs)) searchDirs.push(defaultWs);
    const projectsWs = path.resolve(app.getPath('userData'), 'Projects');
    if (existsSync(projectsWs)) searchDirs.push(projectsWs);

    const resolved = path.resolve(projectPath);
    // 安全边界校验：目标路径必须严格位于合法工作区之内，且不可是工作区根目录自身
    const isWithinWorkspace = searchDirs.some(ws => resolved.startsWith(ws) && resolved !== ws);
    if (!isWithinWorkspace) {
      return { success: false, error: 'Access denied: Target path is not within active workspaces' };
    }

    if (!existsSync(resolved)) {
      return { success: false, error: 'Path does not exist' };
    }

    const stats = await fs.stat(resolved);
    if (stats.isDirectory()) {
      await fs.rm(resolved, { recursive: true, force: true });
      return { success: true };
    } else if (stats.isFile() && resolved.endsWith('.slgrid')) {
      await fs.unlink(resolved);
      return { success: true };
    }

    return { success: false, error: 'Path is neither a project directory nor an .slgrid file' };
  }
}