import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initDB, saveProject, getProject, deleteProject, saveAsset, getAsset, compressImage } from '../db';

function createRequest(resultValue?: any, errorValue?: any) {
  return {
    result: resultValue,
    error: errorValue,
    readyState: 'pending',
    onsuccess: null as any,
    onerror: null as any,
  };
}

function createMockIDB() {
  const stores: Record<string, Map<string, any>> = {};

  function ensureStore(name: string) {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  }

  const db = {
    objectStoreNames: {
      contains: (name: string) => !!stores[name],
    },
    createObjectStore: (name: string) => {
      ensureStore(name);
      return { name };
    },
    transaction: (storeNames: string | string[], _mode: string) => {
      const names = Array.isArray(storeNames) ? storeNames : [storeNames];
      names.forEach(ensureStore);
      return {
        objectStore: (name: string) => {
          const store = ensureStore(name);
          return {
            put: (value: any, key: any) => {
              const req = createRequest();
              queueMicrotask(() => {
                store.set(String(key), value);
                req.result = key;
                req.readyState = 'done';
                req.onsuccess?.({ target: req } as any);
              });
              return req;
            },
            get: (key: any) => {
              const req = createRequest();
              queueMicrotask(() => {
                req.result = store.get(String(key));
                req.readyState = 'done';
                req.onsuccess?.({ target: req } as any);
              });
              return req;
            },
            delete: (key: any) => {
              const req = createRequest();
              queueMicrotask(() => {
                store.delete(String(key));
                req.readyState = 'done';
                req.onsuccess?.({ target: req } as any);
              });
              return req;
            },
          };
        },
      };
    },
  };

  return {
    factory: {
      open: (_name: string, version?: number) => {
        const req: any = createRequest(db);
        req.onupgradeneeded = null;
        queueMicrotask(() => {
          if (version && version > 0) {
            req.onupgradeneeded?.({ target: req, oldVersion: 0, newVersion: version } as any);
          }
          req.onsuccess?.({ target: req } as any);
        });
        return req;
      },
    },
    stores,
  };
}

function createFailingMockIDB() {
  return {
    open: (_name: string, _version?: number) => {
      const req: any = createRequest();
      req.onupgradeneeded = null;
      queueMicrotask(() => {
        req.error = new Error('IDB open failed');
        req.onerror?.({ target: req } as any);
      });
      return req;
    },
  };
}

function mockCanvas() {
  const ctx = { drawImage: vi.fn() };
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toDataURL: vi.fn(() => 'data:image/webp;base64,compressed'),
  };
}

describe('db.ts', () => {
  let originalIndexedDB: any;
  let originalElectronAPI: any;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalIndexedDB = (globalThis as any).indexedDB;
    originalElectronAPI = (globalThis as any).electronAPI;
    originalCreateElement = document.createElement;
    delete (globalThis as any).electronAPI;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (globalThis as any).indexedDB = originalIndexedDB;
    (globalThis as any).electronAPI = originalElectronAPI;
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  describe('initDB', () => {
    it('应成功打开数据库', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.objectStoreNames.contains('projects')).toBe(true);
      expect(db.objectStoreNames.contains('assets')).toBe(true);
    });

    it('打开失败时应拒绝', async () => {
      (globalThis as any).indexedDB = createFailingMockIDB();

      await expect(initDB()).rejects.toThrow('IDB open failed');
    });
  });

  describe('项目持久化', () => {
    it('saveProject / getProject 往返正确', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      const project = { id: 'p1', title: 'Project', pages: [] } as any;
      await saveProject('p1', project);
      const result = await getProject('p1');
      expect(result).toEqual(project);
    });

    it('getProject 不存在返回 null', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      const result = await getProject('missing');
      expect(result).toBeNull();
    });

    it('deleteProject 删除项目', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      await saveProject('p1', { id: 'p1' } as any);
      expect(await getProject('p1')).not.toBeNull();

      await deleteProject('p1');
      expect(await getProject('p1')).toBeNull();
    });
  });

  describe('资源管理', () => {
    it('非 data URL 直接返回', async () => {
      const url = await saveAsset('https://example.com/img.png');
      expect(url).toBe('https://example.com/img.png');
    });

    it('Web 路径下 saveAsset/getAsset 往返', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;

      const dataUrl = 'data:image/png;base64,abc123';
      const assetId = await saveAsset(dataUrl);
      expect(assetId.startsWith('asset://')).toBe(true);

      const result = await getAsset(assetId);
      expect(result).toBe(dataUrl);
    });

    it('Electron 成功上传时返回本地 URL', async () => {
      (globalThis as any).electronAPI = {
        uploadAsset: vi.fn().mockResolvedValue({ success: true, url: 'file:///assets/img.png' }),
      };

      const result = await saveAsset('data:image/png;base64,abc');
      expect(result).toBe('file:///assets/img.png');
    });

    it('Electron 上传失败时回退到 IndexedDB', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;
      (globalThis as any).electronAPI = {
        uploadAsset: vi.fn().mockRejectedValue(new Error('upload failed')),
      };

      const result = await saveAsset('data:image/png;base64,abc');
      expect(result.startsWith('asset://')).toBe(true);
      expect(await getAsset(result)).toBe('data:image/png;base64,abc');
    });

    it('Electron 读取成功时返回 base64 data URL', async () => {
      (globalThis as any).electronAPI = {
        readAssetFile: vi.fn().mockResolvedValue('base64data'),
      };

      const png = await getAsset('asset://file.png');
      expect(png).toBe('data:image/png;base64,base64data');

      const svg = await getAsset('asset://file.svg');
      expect(svg).toBe('data:image/svg+xml;base64,base64data');
    });

    it('Electron 读取失败时回退到 IndexedDB', async () => {
      const { factory } = createMockIDB();
      (globalThis as any).indexedDB = factory;
      (globalThis as any).electronAPI = {
        readAssetFile: vi.fn().mockRejectedValue(new Error('read failed')),
      };

      const dataUrl = 'data:image/png;base64,abc';
      const assetId = await saveAsset(dataUrl);
      expect(await getAsset(assetId)).toBe(dataUrl);
    });

    it('非 asset:// ID 直接返回原值', async () => {
      expect(await getAsset('https://example.com/img.png')).toBe('https://example.com/img.png');
    });
  });

  describe('compressImage', () => {
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

    beforeEach(() => {
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') return mockCanvas() as any;
        return originalCreateElement.call(document, tag);
      }) as any;
    });

    it('图片压缩成功返回 webp data URL', async () => {
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
});
