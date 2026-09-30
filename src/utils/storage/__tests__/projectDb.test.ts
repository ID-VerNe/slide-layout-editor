import { describe, it, expect } from 'vitest';
import { initDB, saveProject, getProject, deleteProject } from '../projectDb';
import { createMockIDB, createFailingMockIDB, setupIdbSandbox } from './idbMock';

describe('projectDb', () => {
  setupIdbSandbox();

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
});
