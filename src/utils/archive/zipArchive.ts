import JSZip from 'jszip';
import { downloadBlob } from '../dom/fileDownload';

/**
 * 将多张页面的 Data URL 打包为 ZIP 并在浏览器端自动下载
 */
export async function exportPagesToZip(
  pages: { dataUrl: string; filename: string }[],
  zipFilename: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('slides') || zip;

  for (let i = 0; i < pages.length; i++) {
    const { dataUrl, filename } = pages[i];
    const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    folder.file(filename, base64Data, { base64: true });
    if (onProgress) {
      onProgress(Math.round(((i + 1) / (pages.length + 1)) * 100));
    }
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.min(99, Math.round(metadata.percent)));
      }
    }
  );

  downloadBlob(zipBlob, zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`);
  if (onProgress) onProgress(100);
}

/**
 * 解析本地工程文件为 project 对象
 * 同时支持 .json（直接解析）与 .slgrid（JSZip 解压 project.json 后解析）
 * 非 plain object 在文件边界即抛友好错误
 */
export async function parseProjectArchive(file: File): Promise<{ project: any; filename: string }> {
  if (file.name.endsWith('.slgrid')) {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const projectJsonFile = zipContent.file('project.json');
    if (!projectJsonFile) {
      throw new Error('Invalid .slgrid file: missing project.json');
    }
    const text = await projectJsonFile.async('text');
    const data = JSON.parse(text);
    // 前置守卫:必须是 plain object,非对象在文件边界即抛友好错误
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid project file: expected a JSON object');
    }
    return { project: data, filename: file.name };
  }

  const text = await file.text();
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid project file: expected a JSON object');
  }
  return { project: data, filename: file.name };
}
