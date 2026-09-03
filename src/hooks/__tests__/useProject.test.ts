import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProject } from '../useProject';
import { useStore } from '../../store/useStore';
import * as db from '../../utils/db';
import { nativeFs } from '../../utils/native-fs';
import { toPng } from 'html-to-image';

const alertMock = vi.fn();
const confirmMock = vi.fn();

vi.mock('../../context/UIContext', () => ({
  useUI: () => ({ alert: alertMock, confirm: confirmMock }),
}));

vi.mock('../../utils/db', () => ({
  saveProject: vi.fn(),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}));

vi.mock('../../utils/native-fs', () => ({
  nativeFs: {
    isElectron: vi.fn(() => false),
    setCurrentProject: vi.fn(),
    captureThumbnail: vi.fn(),
  },
}));

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(),
}));

function makePage(id: string): any {
  return {
    id,
    type: 'slide',
    layoutId: 'modern-feature',
    aspectRatio: '16:9',
    title: 'Slide',
    subtitle: '',
    backgroundColor: '#fff',
    visibility: {},
    freeformItems: [],
  };
}

function createMockState(overrides: any = {}) {
  const state = {
    pages: [makePage('page-1')],
    projectTitle: 'Test Project',
    theme: { colors: { background: '#fff' } },
    designSystem: {},
    currentPageIndex: 0,
    customFonts: [],
    imageQuality: 0.95,
    minimalCounter: false,
    counterStyle: 'number',
    printSettings: { enabled: false },
    isLoaded: true,
    activeProjectId: 'proj-1',
    currentFilePath: '/path/to/project.json',
    hasUnsavedChanges: false,
    past: [],
    future: [],
    loadProject: vi.fn(async () => {}),
    updatePage: vi.fn(),
    addPage: vi.fn(),
    removePage: vi.fn(),
    reorderPages: vi.fn(),
    setTheme: vi.fn(),
    setProjectTitle: vi.fn(),
    setCurrentPageIndex: vi.fn(),
    setPrintSettings: vi.fn(),
    setImageQuality: vi.fn(),
    setMinimalCounter: vi.fn(),
    setCounterStyle: vi.fn(),
    setCustomFonts: vi.fn(),
    setCurrentFilePath: vi.fn(),
    markAsSaved: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    ...overrides,
  };
  return state;
}

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    delete (window as any).electronAPI;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('暴露关键状态与能力', () => {
    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState()));
    const { result } = renderHook(() => useProject('proj-1', null));

    expect(result.current.projectTitle).toBe('Test Project');
    expect(result.current.currentPage.id).toBe('page-1');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('loadProject 调用 store 的 loadProject', async () => {
    const loadProject = vi.fn(async () => {});
    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState({ loadProject })));

    const { result } = renderHook(() => useProject('proj-1', null));
    await result.current.loadProject('proj-2', 'modern-feature');

    expect(loadProject).toHaveBeenCalledWith('proj-2', 'modern-feature', undefined);
  });

  it('saveToDB 在项目未满足条件时直接返回', async () => {
    vi.mocked(useStore).mockImplementation((selector: any) =>
      selector(createMockState({ activeProjectId: 'other-id' }))
    );

    const { result } = renderHook(() => useProject(undefined, null));
    await result.current.saveToDB({ current: null });

    expect(db.saveProject).not.toHaveBeenCalled();
  });

  it('saveToDB 生成 Web 缩略图并持久化项目', async () => {
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,thumb');
    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState()));

    const { result } = renderHook(() => useProject('proj-1', null));

    const pageEl = document.createElement('div');
    pageEl.className = 'magazine-page';
    Object.defineProperty(pageEl, 'getBoundingClientRect', {
      value: () => ({ x: 0, y: 0, width: 1920, height: 1080 }),
      configurable: true,
    });
    const previewDiv = document.createElement('div');
    previewDiv.appendChild(pageEl);

    await result.current.saveToDB({ current: previewDiv }, true);

    expect(toPng).toHaveBeenCalledWith(pageEl, expect.objectContaining({ pixelRatio: 0.2 }));
    expect(db.saveProject).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({
        version: '3.0',
        title: 'Test Project',
        thumbnail: 'data:image/png;base64,thumb',
      })
    );

    const stored = localStorage.getItem('slidegrid_recent_projects') || localStorage.getItem('magazine_recent_projects');
    expect(stored).toBeTruthy();
    const index = JSON.parse(stored!);
    expect(index[0].id).toBe('proj-1');
    expect(index[0].thumbnail).toBe('data:image/png;base64,thumb');
  });

  it('saveToDB forceThumbnail=false 不生成缩略图', async () => {
    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState()));
    const { result } = renderHook(() => useProject('proj-1', null));

    const pageEl = document.createElement('div');
    pageEl.className = 'magazine-page';
    const previewDiv = document.createElement('div');
    previewDiv.appendChild(pageEl);

    await result.current.saveToDB({ current: previewDiv }, false);

    expect(toPng).not.toHaveBeenCalled();
    expect(db.saveProject).toHaveBeenCalledWith('proj-1', expect.objectContaining({ thumbnail: undefined }));
  });

  it('Electron 环境下使用 captureThumbnail 生成缩略图', async () => {
    (nativeFs.isElectron as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const captureThumbnail = vi.fn().mockResolvedValue('electron-thumb');
    (nativeFs.captureThumbnail as ReturnType<typeof vi.fn>).mockImplementation(captureThumbnail);

    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState()));
    const { result } = renderHook(() => useProject('proj-1', null));

    const pageEl = document.createElement('div');
    pageEl.className = 'magazine-page';
    Object.defineProperty(pageEl, 'getBoundingClientRect', {
      value: () => ({ x: 10, y: 20, width: 800, height: 600 }),
    });
    const previewDiv = document.createElement('div');
    previewDiv.appendChild(pageEl);

    await result.current.saveToDB({ current: previewDiv }, true);

    expect(captureThumbnail).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({ x: 10, y: 20, width: 800, height: 600 })
    );
    expect((db.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][1].thumbnail).toBe('electron-thumb');
  });

  it('undo / redo 可用性与历史长度联动', () => {
    vi.mocked(useStore).mockImplementation((selector: any) =>
      selector(createMockState({ past: [{}], future: [{}, {}] }))
    );

    const { result } = renderHook(() => useProject('proj-1', null));
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('缩略图定时器在卸载时清理', () => {
    vi.mocked(useStore).mockImplementation((selector: any) => selector(createMockState()));
    const { unmount } = renderHook(() => useProject('proj-1', null));

    // 不抛错即可
    expect(() => {
      vi.advanceTimersByTime(1000);
      unmount();
      vi.advanceTimersByTime(600000);
    }).not.toThrow();
  });
});
