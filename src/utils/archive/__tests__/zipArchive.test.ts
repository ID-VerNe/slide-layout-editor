import { describe, it, expect, vi } from 'vitest';
import { exportPagesToZip, parseProjectArchive } from '../zipArchive';

// jsdom 的 File 不实现 .text()，用 Blob.text 兜底
function makeJsonFile(content: string, name: string): File {
  const file = new File([content], name, { type: 'application/json' });
  file.text = async () => content;
  return file;
}

// 隔离 DOM 下载副作用
vi.mock('../../dom/fileDownload', () => ({
  downloadBlob: vi.fn(),
}));

// JSZip mock：用真实 class 构造器而非箭头函数，匹配 `new JSZip()` 调用契约
vi.mock('jszip', () => {
  return {
    default: class MockJSZip {
      folder = vi.fn(() => ({ file: vi.fn() }));
      file = vi.fn();
      generateAsync = vi.fn().mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }));
      loadAsync = vi.fn().mockResolvedValue({
        file: vi.fn().mockReturnValue({
          async: vi.fn().mockResolvedValue('{"version":"3","title":"z","pages":[],"customFonts":[]}'),
        }),
      });
    },
  };
});

describe('zipArchive', () => {
  describe('exportPagesToZip', () => {
    it('调用 downloadBlob 并最终回调 100', async () => {
      const { downloadBlob } = await import('../../dom/fileDownload');
      const progress: number[] = [];

      await exportPagesToZip(
        [{ dataUrl: 'data:image/png;base64,aaa', filename: 'p1.png' }],
        'export',
        (p) => progress.push(p)
      );

      expect(downloadBlob).toHaveBeenCalledTimes(1);
      expect(progress[progress.length - 1]).toBe(100);
    });
  });

  describe('parseProjectArchive', () => {
    it('解析 .slgrid 返回 project 与 filename', async () => {
      const file = new File(['zip'], 'proj.slgrid', { type: 'application/zip' });
      const result = await parseProjectArchive(file);
      expect(result.filename).toBe('proj.slgrid');
      expect(result.project.title).toBe('z');
    });

    it('解析 .json 返回 project 与 filename', async () => {
      const payload = { version: '3', title: 'json', pages: [], customFonts: [] };
      const file = makeJsonFile(JSON.stringify(payload), 'proj.json');
      const result = await parseProjectArchive(file);
      expect(result.filename).toBe('proj.json');
      expect(result.project.title).toBe('json');
    });

    it('.json 非 plain object 抛友好错误', async () => {
      const file = makeJsonFile('[1,2,3]', 'bad.json');
      await expect(parseProjectArchive(file)).rejects.toThrow('expected a JSON object');
    });
  });
});

