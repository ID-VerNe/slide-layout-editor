import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nativeFs } from '../native-fs';

describe('nativeFs', () => {
  const originalElectronAPI = (window as any).electronAPI;

  afterEach(() => {
    // restore
    if (originalElectronAPI === undefined) {
      delete (window as any).electronAPI;
    } else {
      (window as any).electronAPI = originalElectronAPI;
    }
  });

  describe('非 Electron 环境', () => {
    beforeEach(() => {
      delete (window as any).electronAPI;
    });

    it('isElectron 返回 false', () => {
      expect(nativeFs.isElectron()).toBe(false);
    });

    it('selectDirectory 返回 canceled', async () => {
      const result = await nativeFs.selectDirectory();
      expect(result).toEqual({ success: false, canceled: true });
    });

    it('saveProject 返回 error', async () => {
      const result = await nativeFs.saveProject({} as any);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('openProject 返回 error', async () => {
      const result = await nativeFs.openProject();
      expect(result.success).toBe(false);
    });

    it('readProject 返回 error', async () => {
      const result = await nativeFs.readProject('/path');
      expect(result.success).toBe(false);
    });

    it('uploadAsset 返回 error', async () => {
      const result = await nativeFs.uploadAsset('img.png', 'base64data');
      expect(result.success).toBe(false);
    });

    it('saveFileBuffer 返回 error', async () => {
      const result = await nativeFs.saveFileBuffer('/path', 'data');
      expect(result.success).toBe(false);
    });

    it('deleteProject 返回 error', async () => {
      const result = await nativeFs.deleteProject('/path');
      expect(result.success).toBe(false);
    });

    it('listProjects 返回空数组', async () => {
      const result = await nativeFs.listProjects();
      expect(result).toEqual([]);
    });
  });

  describe('Electron 环境', () => {
    const mockAPI = {
      isElectron: vi.fn(() => true),
      setActiveWorkspace: vi.fn(async () => {}),
      listProjects: vi.fn(async () => [{ id: 'p1' }]),
      selectDirectory: vi.fn(async () => ({ success: true, path: '/workspace' })),
      saveProject: vi.fn(async () => ({ success: true, filePath: '/saved.wdz' })),
      openProject: vi.fn(async () => ({ success: true, content: '{}' })),
      readProject: vi.fn(async () => ({ success: true, content: '{}' })),
      uploadAsset: vi.fn(async () => ({ success: true, url: 'blob://asset' })),
      saveFileBuffer: vi.fn(async () => ({ success: true })),
      deleteProject: vi.fn(async () => ({ success: true })),
      setCurrentProject: vi.fn(async () => {}),
      openExternal: vi.fn(async () => {}),
      getAppPaths: vi.fn(async () => ({ userData: '/user', thumbnails: '/thumbs' })),
      captureThumbnail: vi.fn(async () => null),
    };

    beforeEach(() => {
      (window as any).electronAPI = mockAPI;
    });

    it('isElectron 返回 true', () => {
      expect(nativeFs.isElectron()).toBe(true);
    });

    it('selectDirectory 调用 electronAPI', async () => {
      const result = await nativeFs.selectDirectory();
      expect(result.success).toBe(true);
      expect(mockAPI.selectDirectory).toHaveBeenCalled();
    });

    it('listProjects 调用 electronAPI', async () => {
      const result = await nativeFs.listProjects();
      expect(result).toEqual([{ id: 'p1' }]);
    });

    it('setActiveWorkspace 调用 electronAPI', async () => {
      await nativeFs.setActiveWorkspace('/workspace');
      expect(mockAPI.setActiveWorkspace).toHaveBeenCalledWith('/workspace');
    });

    it('openExternal 调用 electronAPI', async () => {
      await nativeFs.openExternal('https://example.com');
      expect(mockAPI.openExternal).toHaveBeenCalledWith('https://example.com');
    });

    it('saveProject 传递参数', async () => {
      const data = { pages: [] } as any;
      const result = await nativeFs.saveProject(data, '/file.wdz', 'default');
      expect(result.success).toBe(true);
      expect(mockAPI.saveProject).toHaveBeenCalledWith(data, '/file.wdz', 'default');
    });

    it('deleteProject 传递路径', async () => {
      const result = await nativeFs.deleteProject('/project/path');
      expect(result.success).toBe(true);
      expect(mockAPI.deleteProject).toHaveBeenCalledWith('/project/path');
    });

    it('setCurrentProject 调用 electronAPI', async () => {
      await nativeFs.setCurrentProject('proj-1', 'My Project');
      expect(mockAPI.setCurrentProject).toHaveBeenCalledWith('proj-1', 'My Project');
    });
  });

  describe('openExternal 非 Electron 回退', () => {
    beforeEach(() => {
      delete (window as any).electronAPI;
    });

    it('回退到 window.open', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      nativeFs.openExternal('https://example.com');
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
      openSpy.mockRestore();
    });
  });
});
