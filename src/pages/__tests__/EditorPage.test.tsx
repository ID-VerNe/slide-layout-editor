import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditorPage from '../EditorPage';
import React from 'react';

// --- Mocks ---

// Framer Motion: render children directly
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  spring: () => ({}),
}));

// html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(async () => 'data:image/png;base64,mock'),
}));

// jspdf
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    link: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
  })),
}));

// Lucide icons: render as simple text placeholders
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  const iconPlaceholder = (name: string) =>
    ({ size, ...props }: any) =>
      <span data-testid={`icon-${name}`} {...props}>{name}</span>;

  return {
    ...actual,
    FileImage: iconPlaceholder('FileImage'),
    FileText: iconPlaceholder('FileText'),
    Monitor: iconPlaceholder('Monitor'),
    Smartphone: iconPlaceholder('Smartphone'),
    ChevronRight: iconPlaceholder('ChevronRight'),
    Tag: iconPlaceholder('Tag'),
    Square: iconPlaceholder('Square'),
    Check: iconPlaceholder('Check'),
    LayoutGrid: iconPlaceholder('LayoutGrid'),
    FileUser: iconPlaceholder('FileUser'),
  };
});

// React Router: preserve actual MemoryRouter/Routes/Route but mock hooks
const navigateMock = vi.fn();
const paramsMock = { projectId: 'proj-1' };
let searchParamsObj = new URLSearchParams();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useParams: () => paramsMock,
    useSearchParams: () => [searchParamsObj, vi.fn()],
    useNavigate: () => navigateMock,
  };
});

// NativeFS
vi.mock('../../utils/native-fs', () => ({
  nativeFs: {
    isElectron: vi.fn(() => false),
    setCurrentProject: vi.fn(),
    saveProject: vi.fn(async () => ({ success: true, filePath: '/path/proj.json' })),
    openProject: vi.fn(() => ({ success: false })),
    captureThumbnail: vi.fn(() => 'mock-thumb'),
    readAssetFile: vi.fn(() => null),
  },
}));

// Mock useUI for useProject-internal calls
vi.mock('../../context/UIContext', () => ({
  useUI: () => ({ alert: vi.fn(), confirm: vi.fn() }),
}));

// TemplatePreview
vi.mock('../../components/ui/TemplatePreview', () => ({
  TemplatePreview: () => <div data-testid="template-preview">Preview</div>,
}));

// LAYOUT constants
vi.mock('../../constants/layout', () => ({
  LAYOUT: { EDITOR_PANEL_WIDTH: 360 },
  LAYOUT_CONFIG: {
    '16:9': { width: 1920, height: 1080, label: 'Standard (16:9)', orientation: 'landscape' },
    '2:3': { width: 1080, height: 1920, label: 'Portrait (2:3)', orientation: 'portrait' },
    'A4': { width: 2480, height: 3508, label: 'A4', orientation: 'resume' },
    '1:1': { width: 1080, height: 1080, label: 'Square (1:1)', orientation: 'square' },
  },
  AspectRatioType: {},
  OrientationType: {},
}));

// Store mock (also used by useProject internally via useStore)
const storeState = {
  pages: [],
  projectTitle: 'Test Project',
  theme: { colors: { primary: '#000', secondary: '#666', accent: '#264376', background: '#fff', surface: '#f5f5f5' }, typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingFontZH: 'serif', bodyFontZH: 'sans-serif' } },
  currentPageIndex: 0,
  isLoaded: true,
  activeProjectId: 'proj-1',
  customFonts: [],
  imageQuality: 0.95,
  minimalCounter: false,
  counterStyle: 'number',
  printSettings: { enabled: false, widthMm: 210, heightMm: 297, gutterMm: 0, showGutterShadow: false, showTrimShadow: false, showContentFrame: false, configs: { landscape: { bindingSide: 'left', trimSide: 'left' }, portrait: { bindingSide: 'left', trimSide: 'left' }, square: { bindingSide: 'left', trimSide: 'left' }, resume: { bindingSide: 'left', trimSide: 'left' } } },
  currentFilePath: null,
  hasUnsavedChanges: false,
  past: [],
  future: [],
  createProject: vi.fn(() => 'new-id'),
  loadProject: vi.fn(async () => {}),
  setPages: vi.fn(),
  setProjectTitle: vi.fn(),
  setTheme: vi.fn(),
  setPrintSettings: vi.fn(),
  setImageQuality: vi.fn(),
  setMinimalCounter: vi.fn(),
  setCounterStyle: vi.fn(),
  setCustomFonts: vi.fn(),
  setCurrentPageIndex: vi.fn(),
  setCurrentFilePath: vi.fn(),
  markAsSaved: vi.fn(),
  updatePage: vi.fn(),
  addPage: vi.fn(),
  removePage: vi.fn(),
  reorderPages: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  pushHistory: vi.fn(),
  getState: vi.fn(() => ({
    loadProject: vi.fn(async () => {}),
  })),
};

vi.mock('../../store/useStore', () => ({
  useStore: (selector: any) => selector(storeState),
}));

// Editor child components: render as simple wrappers
vi.mock('../../components/editor/Sidebar', () => ({
  default: ({ onAddPage, onRemovePage, onPageSelect, onNavigateHome, pages }: any) => (
    <div data-testid="sidebar">
      <button data-testid="sidebar-home" onClick={onNavigateHome}>
        Home
      </button>
      <span data-testid="page-count">{pages?.length || 0}</span>
      <button data-testid="sidebar-add" onClick={onAddPage}>
        Add Page
      </button>
    </div>
  ),
}));

vi.mock('../../components/editor/TopNav', () => ({
  default: () => <div data-testid="topnav">TopNav</div>,
}));

vi.mock('../../components/editor/PreviewArea', () => ({
  default: () => <div data-testid="preview-area">Preview Area</div>,
}));

vi.mock('../../components/editor/EditorPanel', () => ({
  default: () => <div data-testid="editor-panel">Editor Panel</div>,
}));

vi.mock('../../components/editor/GlobalSettings', () => ({
  default: () => <div data-testid="global-settings">Global Settings</div>,
}));

// usePreview hook
const previewState = {
  previewZoom: 0.5,
  setPreviewZoom: vi.fn(),
  isAutoFit: true,
  setIsAutoFit: vi.fn(),
  previewRef: { current: null },
  previewContainerRef: { current: document.createElement('div') },
  handleManualZoom: vi.fn(),
  toggleFit: vi.fn(),
  handleOverflowChange: vi.fn(),
  pagesOverflow: {},
};

vi.mock('../../hooks/usePreview', () => ({
  usePreview: () => previewState,
}));

// Modal component
vi.mock('../../components/Modal', () => ({
  default: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

const renderEditorPage = () =>
  render(
    <MemoryRouter initialEntries={['/editor/proj-1']}>
      <Routes>
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('EditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsObj = new URLSearchParams();
    storeState.projectTitle = 'Test Project';
    storeState.pages = [
      {
        id: 'page-1',
        type: 'slide',
        layoutId: 'modern-feature',
        aspectRatio: '16:9',
        title: 'Test Project',
        subtitle: '',
        backgroundColor: '#ffffff',
        accentColor: '#264376',
        titleFont: 'serif',
        bodyFont: 'sans-serif',
        counterStyle: 'number',
        visibility: {},
      },
    ];
    storeState.isLoaded = true;
    storeState.activeProjectId = 'proj-1';
    storeState.hasUnsavedChanges = false;
    storeState.currentFilePath = null;
    storeState.currentPageIndex = 0;
    document.title = '';
    window.getComputedStyle = vi.fn(() => ({ fontSize: '16px' })) as any;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    renderEditorPage();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders main layout sections: sidebar, topnav, preview area, editor panel', () => {
    renderEditorPage();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topnav')).toBeInTheDocument();
    expect(screen.getByTestId('preview-area')).toBeInTheDocument();
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
  });

  it('renders loading state (isLoaded=false) without crash', () => {
    storeState.isLoaded = false;
    storeState.pages = [];
    renderEditorPage();
    // Should still render the shell layout without error
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topnav')).toBeInTheDocument();
  });

  it('loads project when projectId differs from activeProjectId', () => {
    // Set activeProjectId to null so the guard in the useEffect passes
    storeState.activeProjectId = null;
    renderEditorPage();
    expect(storeState.loadProject).toHaveBeenCalled();
  });

  it('navigates to home when sidebar home button is clicked', () => {
    renderEditorPage();
    fireEvent.click(screen.getByTestId('sidebar-home'));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('sets document title based on project title', async () => {
    renderEditorPage();
    await waitFor(() => {
      expect(document.title).toContain('Test Project');
    });
  });

  it('shows unsaved changes indicator in document title', async () => {
    storeState.hasUnsavedChanges = true;
    renderEditorPage();
    await waitFor(() => {
      expect(document.title).toContain('●');
    });
  });
});
