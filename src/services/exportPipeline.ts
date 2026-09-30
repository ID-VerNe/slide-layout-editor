import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { nativeFs } from '../utils/native-fs';
import { exportPagesToZip } from '../utils/archive/zipArchive';
import { getExportDimensions } from './exportGeometry';
import { PageData, PrintSettings } from '../types';

export type ExportFormat = 'png' | 'pdf';
export type ExportScope = 'current' | 'all';

export interface ExportPipelineOptions {
  format: ExportFormat;
  scope: ExportScope;
  pages: PageData[];
  currentPageIndex: number;
  projectTitle: string;
  fallbackTitle: string;
  printSettings: PrintSettings | undefined;
  // 由 Hook 提供:把指定页离屏渲染为 HTMLElement 并返回
  renderOffscreen: (page: PageData, index: number) => Promise<HTMLElement>;
  onProgress: (percent: number) => void;
  isCancelled: () => boolean;
}

// html-to-image 过滤器:排除跨域样式表链接,避免 tainted canvas
const buildToPngOptions = () => ({
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  filter: (n: any) =>
    !(n.tagName === 'LINK' && n.rel === 'stylesheet' && n.href && !n.href.includes(window.location.origin)),
});

// 提取简历模板超链接坐标并写入 PDF
function attachResumeLinks(doc: jsPDF, el: HTMLElement) {
  const pageRect = el.getBoundingClientRect();
  el.querySelectorAll('.resume-link').forEach((linkEl: Element) => {
    const rect = (linkEl as HTMLElement).getBoundingClientRect();
    const url = linkEl.getAttribute('data-url');
    if (url) {
      doc.link(rect.left - pageRect.left, rect.top - pageRect.top, rect.width, rect.height, { url });
    }
  });
}

// Executes multi-format export pipeline: PDF, PNG directory (Electron), PNG/ZIP
export async function runExportPipeline(options: ExportPipelineOptions): Promise<void> {
  await document.fonts.ready;
  if (options.isCancelled()) return;

  const indices = options.scope === 'all'
    ? options.pages.map((_, i) => i)
    : [options.currentPageIndex];
  const opt = buildToPngOptions();

  // Electron 桌面端:多页 PNG 直接写入用户选择的目录
  if (nativeFs.isElectron() && options.format === 'png' && options.scope === 'all') {
    const dirResult = await nativeFs.selectDirectory();
    if (options.isCancelled()) return;
    if (dirResult.canceled) return;
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const fileName = `${options.projectTitle || 'Export'}_Page_${String(idx + 1).padStart(2, '0')}.png`;
      await nativeFs.saveFileBuffer(`${dirResult.path}/${fileName}`, dataUrl);
      options.onProgress(Math.round(((i + 1) / indices.length) * 100));
    }
    return;
  }

  // PDF: 矢量文本 + 光栅页面图 + 简历链接坐标
  if (options.format === 'pdf') {
    const firstDims = getExportDimensions(options.pages[indices[0]], options.printSettings);
    const doc = new jsPDF({ unit: 'px', format: [firstDims.width, firstDims.height], hotfixes: ['px_scaling'] });
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const currentDims = getExportDimensions(options.pages[idx], options.printSettings);
      if (i > 0) doc.addPage([currentDims.width, currentDims.height]);
      doc.addImage(dataUrl, 'PNG', 0, 0, currentDims.width, currentDims.height);
      attachResumeLinks(doc, el);
      options.onProgress(Math.round(((i + 1) / indices.length) * 100));
    }
    if (!options.isCancelled()) doc.save(`${options.projectTitle || options.fallbackTitle}.pdf`);
    return;
  }

  // PNG: 多页打包 ZIP,单页直接下载
  if (indices.length > 1) {
    const renderedSlides: { dataUrl: string; filename: string }[] = [];
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const fileName = `${options.projectTitle || options.fallbackTitle}_Page_${String(idx + 1).padStart(2, '0')}.png`;
      renderedSlides.push({ dataUrl, filename: fileName });
      options.onProgress(Math.round(((i + 1) / (indices.length + 1)) * 100));
    }
    if (options.isCancelled()) return;
    await exportPagesToZip(renderedSlides, `${options.projectTitle || options.fallbackTitle}_Slides`, options.onProgress);
  } else {
    const idx = indices[0];
    const el = await options.renderOffscreen(options.pages[idx], idx);
    if (options.isCancelled()) return;
    const dataUrl = await toPng(el, opt);
    if (options.isCancelled()) return;
    const link = document.createElement('a');
    link.download = `${options.projectTitle || options.fallbackTitle}_${idx + 1}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    options.onProgress(100);
  }
}
