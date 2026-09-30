import '@testing-library/jest-dom';

// Simple IndexedDB Mock
const indexedDB = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      objectStoreNames: {
        contains: () => true
      },
      transaction: () => ({
        objectStore: () => ({
          get: () => ({ onsuccess: null }),
          put: () => ({ onsuccess: null }),
          delete: () => ({ onsuccess: null })
        })
      })
    }
  })
};

(globalThis as unknown as { indexedDB: typeof indexedDB }).indexedDB = indexedDB;