import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../Dashboard';
import React from 'react';
import { UIProvider } from '../../context/UIContext';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: { div: 'div', span: 'span' },
  spring: () => ({}),
}));

const navigateMock = vi.fn();

const loadProjectMock = vi.fn();
const createProjectMock = vi.fn(() => 'new-project-id');
const setCurrentFilePathMock = vi.fn();

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(() => ({
    createProject: createProjectMock,
    loadProject: loadProjectMock,
    setCurrentFilePath: setCurrentFilePathMock,
  })),
}));

vi.mock('../../utils/native-fs', () => ({
  nativeFs: {
    isElectron: vi.fn(() => false),
    setActiveWorkspace: vi.fn(),
    listProjects: vi.fn(async () => []),
    selectDirectory: vi.fn(async () => ({ success: true, path: '/workspace' })),
    deleteProject: vi.fn(async () => ({ success: true })),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../utils/db', () => ({
  deleteProject: vi.fn(async () => {}),
}));

const renderDashboard = () =>
  render(
    <UIProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    </UIProvider>
  );

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('无 Workspace 时新建项目提示', () => {
    renderDashboard();
    fireEvent.click(screen.getByText('New Slide'));
    expect(screen.getByRole('heading', { name: /workspace not configured/i, level: 4 })).toBeInTheDocument();
  });

  it('显示最近项目并支持点击打开', async () => {
    const projects = [
      { id: 'p1', title: 'Alpha', date: '2026/06/01', aspectRatio: '16:9', thumbnail: null },
    ];
    localStorage.setItem('magazine_recent_projects', JSON.stringify(projects));
    renderDashboard();

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Alpha'));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/editor/p1'));
  });

  it('空项目列表显示占位', () => {
    renderDashboard();
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('删除最近项目记录', async () => {
    const projects = [
      { id: 'p1', title: 'Alpha', date: '2026/06/01', aspectRatio: '16:9' },
      { id: 'p2', title: 'Beta', date: '2026/06/02', aspectRatio: '2:3' },
    ];
    localStorage.setItem('magazine_recent_projects', JSON.stringify(projects));
    renderDashboard();

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    const deleteBtn = screen.getAllByRole('button').find((b) => b.innerHTML.includes('lucide-trash'));
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn!);

    // Single confirm: "Delete Project"
    const confirmBtn = await screen.findByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(screen.queryByText('Alpha')).not.toBeInTheDocument());

    const stored = JSON.parse(localStorage.getItem('slidegrid_recent_projects') || localStorage.getItem('magazine_recent_projects')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('p2');
  });
});

