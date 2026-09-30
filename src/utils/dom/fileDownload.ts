import { parseProjectArchive } from '../archive/zipArchive';
import type { ProjectData } from '../../types';

/**
 * 触发浏览器文件下载
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 导出工程为 JSON 文件下载（Web 备份）
 */
export function exportProjectAsJson(projectData: ProjectData, defaultName?: string): void {
  const safeName = (defaultName || projectData.title || projectData.projectTitle || 'SlideGrid_Project')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\p{Cc}/gu, '_');
  const fileName = `${safeName}.json`;
  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, fileName);
}

/**
 * 通过文件选择器读取本地工程 JSON 或 .slgrid 文件
 */
export function openProjectFromFilePicker(): Promise<{ project: ProjectData; filename: string } | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.slgrid';
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const result = await parseProjectArchive(file);
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        input.remove();
      }
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });
}
