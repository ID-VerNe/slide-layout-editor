import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import crypto from 'crypto';
import { existsSync } from 'fs';
import sharp from 'sharp';

export class ProjectArchiveManager {
  private workspacePath: string | null = null;
  private currentProjectId: string | null = null;
  private currentProjectName: string = 'Untitled';

  public setActiveWorkspace(path: string) {
    this.workspacePath = path;
  }

  public setCurrentProject(id: string, name: string) {
    this.currentProjectId = id;
    this.currentProjectName = name || 'Untitled';
  }

  /**
   * 获取物理存储目录
   * 核心改进：对项目标题进行更彻底的清理，防止路径匹配失败
   */
  private async getProjectFolder() {
    if (!this.workspacePath) {
      this.workspacePath = path.join(app.getPath('userData'), 'DefaultWorkspace');
    }
    
    // 1. 移除非法字符，将空格替换为下划线以增加路径稳定性
    const safeName = this.currentProjectName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // 移除控制字符和非法符号
      .trim()
      .replace(/\s+/g, '_'); // 空格转下划线
      
    // 2. 文件夹名格式：标题_ID
    const folderName = `${safeName || 'Project'}_${this.currentProjectId?.slice(0, 8) || 'temp'}`;
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
    const fileBuffer = await fs.readFile(filePath);
    const isZip = fileBuffer.length > 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B;

    if (isZip) {
      const zip = new AdmZip(filePath);
      const projectJsonEntry = zip.getEntry('project.json');
      if (!projectJsonEntry) throw new Error("Invalid archive");
      
      const projectData = JSON.parse(projectJsonEntry.getData().toString('utf8'));
      
      // 先设置上下文，再获取路径，最后解压
      this.currentProjectId = projectData.id || crypto.randomUUID();
      this.currentProjectName = projectData.projectTitle || projectData.title || 'Imported';
      
      const projectFolder = await this.getProjectFolder();
      zip.extractAllTo(projectFolder, true);
      return projectData;
    } else {
      const projectData = JSON.parse(fileBuffer.toString('utf-8'));
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

    await fs.writeFile(path.join(projectFolder, 'project.json'), JSON.stringify(data, null, 2), 'utf-8');

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
    
    await fs.writeFile(path.join(assetsDir, finalFilename), processedBuffer);
    return `asset://${finalFilename}`;
  }

  private async compressImage(buffer: Buffer): Promise<{ buffer: Buffer, format: string }> {
    try {
      if (buffer.toString('ascii', 0, 4) === '<svg') return { buffer, format: 'svg' };
      const s = sharp(buffer);
      const metadata = await s.metadata();
      if (metadata.width && metadata.width > 2000) s.resize({ width: 2000, withoutEnlargement: true });
      const out = await s.webp({ quality: 85 }).toBuffer();
      return { buffer: out, format: 'webp' };
    } catch (e) { return { buffer, format: 'bin' }; }
  }
}