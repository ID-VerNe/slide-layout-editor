import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import crypto from 'crypto';
import { existsSync } from 'fs';
import sharp from 'sharp';

const TEMP_ROOT = path.join(app.getPath('userData'), 'Workspace');

interface ProjectCache {
  data: any;
  timestamp: number;
  fileMtime: number;
}

export class ProjectArchiveManager {
  private currentSessionPath: string | null = null;
  private projectCache = new Map<string, ProjectCache>();
  private assetCache = new Map<string, string>(); // hash -> filename，用于资源去重
  private MAX_CACHE_AGE = 3600000; // 1 小时缓存
  private MAX_CACHE_SIZE = 10; // 最多缓存 10 个项目

  constructor() {
    fs.rm(TEMP_ROOT, { recursive: true, force: true }).catch(() => {});
    
    // 定期清理缓存
    setInterval(() => this.clearExpiredCache(), 300000); // 每 5 分钟清理一次
  }

  private clearExpiredCache() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // 清理过期缓存
    for (const [key, cache] of this.projectCache.entries()) {
      if (now - cache.timestamp > this.MAX_CACHE_AGE) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.projectCache.delete(key));
    
    // 如果缓存超过最大大小，删除最早的缓存
    if (this.projectCache.size > this.MAX_CACHE_SIZE) {
      const keys = Array.from(this.projectCache.keys());
      const keysToRemove = keys.slice(0, keys.length - this.MAX_CACHE_SIZE);
      keysToRemove.forEach(key => this.projectCache.delete(key));
    }
  }

  private async ensureSession() {
    if (!this.currentSessionPath) {
      const sessionId = crypto.randomUUID();
      this.currentSessionPath = path.join(TEMP_ROOT, sessionId);
      // 清理资源缓存
      this.assetCache.clear();
    }
    
    try {
      if (!existsSync(this.currentSessionPath)) await fs.mkdir(this.currentSessionPath, { recursive: true });
      const assetsDir = path.join(this.currentSessionPath, 'assets');
      if (!existsSync(assetsDir)) await fs.mkdir(assetsDir, { recursive: true });
    } catch (e) {}
    
    return this.currentSessionPath;
  }

  // 压缩图片资源
  private async compressImage(buffer: Buffer): Promise<{ buffer: Buffer, format: string }> {
    try {
      // 检查是否为 SVG
      if (buffer.toString('ascii', 0, 4) === '<svg' || buffer.toString('ascii', 0, 5) === '<?xml') {
        return { buffer, format: 'svg' };
      }

      const s = sharp(buffer);
      const metadata = await s.metadata();
      
      // 如果已经是极小的图片或者 metadata 获取失败，跳过压缩
      if (!metadata.width || metadata.width < 100) {
        return { buffer, format: metadata.format || 'bin' };
      }

      // 尝试多种格式并选择体积最小的
      // 注意：AVIF 压缩较慢但效率极高
      const formats = ['avif', 'webp', 'jpeg'];
      let bestFormat = 'webp';
      let bestBuffer = buffer;
      let minSize = buffer.length;

      for (const format of formats) {
        let currentBuffer: Buffer;
        if (format === 'avif') {
          currentBuffer = await s.avif({ quality: 65, effort: 4 }).toBuffer();
        } else if (format === 'webp') {
          currentBuffer = await s.webp({ quality: 80, effort: 4 }).toBuffer();
        } else {
          currentBuffer = await s.jpeg({ quality: 85 }).toBuffer();
        }

        if (currentBuffer.length < minSize) {
          minSize = currentBuffer.length;
          bestBuffer = currentBuffer;
          bestFormat = format;
        }
      }
      
      return { buffer: bestBuffer, format: bestFormat };
    } catch (e) {
      console.error('Image compression failed:', e);
      return { buffer, format: 'bin' };
    }
  }

  public async getAssetRoot() {
    const session = await this.ensureSession();
    return path.join(session, 'assets');
  }

  public async openProject(filePath: string) {
    // 获取文件修改时间
    const fileStats = await fs.stat(filePath);
    const fileMtime = fileStats.mtime.getTime();
    
    // 检查缓存
    const cached = this.projectCache.get(filePath);
    if (cached && cached.fileMtime === fileMtime) {
      console.log('Using cached project data for:', filePath);
      // 更新缓存时间
      this.projectCache.set(filePath, {
        ...cached,
        timestamp: Date.now()
      });
      this.currentSessionPath = null;
      const sessionDir = await this.ensureSession();
      
      // 重新解压资源文件
      const zip = new AdmZip(filePath);
      zip.extractAllTo(sessionDir, true);
      
      return cached.data;
    }
    
    this.currentSessionPath = null;
    const sessionDir = await this.ensureSession();
    
    const fileBuffer = await fs.readFile(filePath);
    
    // 核心修复：更宽松的 Zip 检测 (PK..)
    const isZip = fileBuffer.length > 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B;
    let projectData;

    if (isZip) {
      try {
        const zip = new AdmZip(filePath);
        zip.extractAllTo(sessionDir, true);
        const projectJsonPath = path.join(sessionDir, 'project.json');
        if (!existsSync(projectJsonPath)) throw new Error("Invalid project: missing project.json");
        const projectJson = await fs.readFile(projectJsonPath, 'utf-8');
        projectData = JSON.parse(projectJson);
      } catch (e) {
        console.error('Zip extract failed, trying as JSON:', e);
        // 如果解压失败，尝试作为 JSON 解析 (容错)
        projectData = await this.migrateLegacyJson(fileBuffer, sessionDir);
      }
    } else {
      projectData = await this.migrateLegacyJson(fileBuffer, sessionDir);
    }
    
    // 缓存项目数据
    this.projectCache.set(filePath, {
      data: projectData,
      timestamp: Date.now(),
      fileMtime: fileMtime
    });
    
    return projectData;
  }

  // 独立的迁移逻辑
  private async migrateLegacyJson(buffer: Buffer, sessionDir: string) {
    const jsonContent = buffer.toString('utf-8');
    let projectData;
    try {
      projectData = JSON.parse(jsonContent);
    } catch (e) {
      throw new Error("Invalid file format: not a valid Zip or JSON");
    }
      
    const assetMap = new Map<string, string>(); 
    const assetsDir = path.join(sessionDir, 'assets');

    // 递归替换 Base64
    const processAssets = async (obj: any) => {
      // 遍历数组
      if (Array.isArray(obj)) {
        for (const item of obj) await processAssets(item);
        return;
      }
      
      // 遍历对象
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          const val = obj[key];
          if (typeof val === 'string' && val.startsWith('data:image')) {
            const base64 = val;
            let filename = assetMap.get(base64);
            
            if (!filename) {
              const matches = base64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
              if (matches) {
                let ext = matches[1] === 'svg+xml' ? 'svg' : matches[1];
                // 修复：jpeg 有时写作 jpeg
                if (ext === 'jpeg') ext = 'jpg';
                
                const data = matches[2];
                const hash = crypto.createHash('md5').update(data).digest('hex');
                filename = `img_${hash}.${ext}`;
                const imgBuffer = Buffer.from(data, 'base64');
                await fs.writeFile(path.join(assetsDir, filename), imgBuffer);
                assetMap.set(base64, filename);
              }
            }
            if (filename) obj[key] = `asset://${filename}`;
          } else if (typeof val === 'object' && val !== null) {
            await processAssets(val);
          }
        }
      }
    };

    await processAssets(projectData);
    return projectData;
  }

  public async saveProject(filePath: string, projectData: any) {
    const sessionDir = await this.ensureSession();
    const assetsDir = path.join(sessionDir, 'assets');

    if (!existsSync(sessionDir)) await fs.mkdir(sessionDir, { recursive: true });
    if (!existsSync(assetsDir)) await fs.mkdir(assetsDir, { recursive: true });

    await fs.writeFile(path.join(sessionDir, 'project.json'), JSON.stringify(projectData, null, 2), 'utf-8');

    const zip = new AdmZip();
    zip.addLocalFile(path.join(sessionDir, 'project.json'));
    zip.addLocalFolder(assetsDir, 'assets');
    
    const zipBuffer = zip.toBuffer();
    await fs.writeFile(filePath, zipBuffer);
  }

  public async saveAsset(filename: string, buffer: Buffer) {
    // 计算资源哈希 (基于原始 buffer)
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    
    // 检查是否已存在
    if (this.assetCache.has(hash)) {
      return `asset://${this.assetCache.get(hash)}`;
    }
    
    // 压缩图片
    const { buffer: compressedBuffer, format } = await this.compressImage(buffer);
    
    // 修正文件名扩展名 (根据选择的最佳格式)
    let finalFilename = filename;
    const targetExt = `.${format === 'jpeg' ? 'jpg' : format}`;
    if (format !== 'bin' && format !== 'svg' && !filename.toLowerCase().endsWith(targetExt)) {
      finalFilename = filename.replace(/\.[^/.]+$/, "") + targetExt;
    }
    
    const sessionDir = await this.ensureSession();
    const assetsDir = path.join(sessionDir, 'assets');
    if (!existsSync(assetsDir)) await fs.mkdir(assetsDir, { recursive: true });
    
    await fs.writeFile(path.join(assetsDir, finalFilename), compressedBuffer);
    
    // 缓存资源
    this.assetCache.set(hash, finalFilename);
    
    return `asset://${finalFilename}`;
  }
}