import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 共享的 IndexedDB mock 工厂：项目仓库与资源存取测试共用
export function createRequest(resultValue?: any, errorValue?: any) {
  return {
    result: resultValue,
    error: errorValue,
    readyState: 'pending',
    onsuccess: null as any,
    onerror: null as any,
  };
}

export function createMockIDB() {
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

export function createFailingMockIDB() {
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

export function mockCanvas() {
  const ctx = { drawImage: vi.fn() };
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toDataURL: vi.fn(() => 'data:image/webp;base64,compressed'),
  };
}

// 统一的 beforeEach/afterEach 钩子：还原 globalThis 与 document.createElement
export function setupIdbSandbox() {
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
}
