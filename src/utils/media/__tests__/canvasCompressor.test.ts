import { describe, it, expect, vi } from 'vitest';
import { compressImage } from '../canvasCompressor';
import { mockCanvas, setupIdbSandbox } from '../../storage/__tests__/idbMock';

describe('canvasCompressor', () => {
  setupIdbSandbox();

  class MockFileReader {
    result = 'data:image/png;base64,mock';
    onload: ((ev: any) => void) | null = null;
    onerror: ((ev: any) => void) | null = null;
    readAsDataURL(_file: File) {
      queueMicrotask(() => this.onload?.({ target: this } as any));
    }
  }

  class MockImage {
    width = 100;
    height = 100;
    onerror: (() => void) | null = null;
    onload: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  class FailingMockImage {
    onerror: (() => void) | null = null;
    onload: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onerror?.());
    }
  }

  it('图片压缩成功返回 webp data URL', async () => {
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'canvas') return mockCanvas() as any;
      return (originalCreateElement as any).call(document, tag);
    }) as any;

    vi.stubGlobal('FileReader', MockFileReader);
    vi.stubGlobal('Image', MockImage);

    const file = new File(['blob'], 'test.png', { type: 'image/png' });
    const result = await compressImage(file, 0.85);

    expect(result.startsWith('data:image/webp')).toBe(true);
  });

  it('图片加载失败时拒绝', async () => {
    vi.stubGlobal('FileReader', MockFileReader);
    vi.stubGlobal('Image', FailingMockImage);

    const file = new File(['blob'], 'test.png', { type: 'image/png' });
    await expect(compressImage(file)).rejects.toThrow('Failed to load image');
  });

  it('FileReader 失败时拒绝', async () => {
    class FailingFileReader extends MockFileReader {
      readAsDataURL(_file: File) {
        queueMicrotask(() => this.onerror?.({ target: this } as any));
      }
    }
    vi.stubGlobal('FileReader', FailingFileReader);
    vi.stubGlobal('Image', MockImage);

    const file = new File(['blob'], 'test.png', { type: 'image/png' });
    await expect(compressImage(file)).rejects.toThrow('Failed to read file');
  });
});
