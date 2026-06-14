import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from './Sidebar';
import { PageData } from '../../types';
import React from 'react';
import { UIProvider } from '../../context/UIContext';

// Mock VirtualPageList to see if it's being used
vi.mock('./VirtualPageList', () => ({
  default: () => <div data-testid="virtual-page-list" />
}));

// Mock BrandLogo
vi.mock('../ui/BrandLogo', () => ({
  BrandLogo: () => <div data-testid="brand-logo" />
}));

const renderWithUI = (ui: React.ReactElement) => render(<UIProvider>{ui}</UIProvider>);

describe('Sidebar Hybrid Rendering', () => {
  const createPages = (count: number): PageData[] => 
    Array.from({ length: count }, (_, i) => ({
      id: `page-${i}`,
      type: 'slide',
      title: `Page ${i + 1}`,
      layoutId: 'modern-feature',
      aspectRatio: '16:9',
      backgroundColor: '#ffffff',
    }));

  const defaultProps = {
    currentPageIndex: 0,
    onPageSelect: vi.fn(),
    onAddPage: vi.fn(),
    onRemovePage: vi.fn(),
    onReorderPages: vi.fn(),
    onClearAll: vi.fn(),
    onToggleFontManager: vi.fn(),
    showFontManager: false,
    onNavigateHome: vi.fn(),
  };

  it('should use full rendering for small projects (< 30 pages)', () => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    const pages = createPages(20);
    renderWithUI(<Sidebar {...defaultProps} pages={pages} />);
    
    // Should NOT show virtual list
    expect(screen.queryByTestId('virtual-page-list')).not.toBeInTheDocument();
    // Should show BrandLogo (part of full rendering Sidebar)
    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
    // Should show page numbers (part of full rendering Sidebar)
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should use virtual scrolling for large projects (>= 30 pages)', () => {
    const pages = createPages(35);
    renderWithUI(<Sidebar {...defaultProps} pages={pages} />);

    // Should show virtual list
    expect(screen.getByTestId('virtual-page-list')).toBeInTheDocument();
  });
});

describe('Sidebar Interaction', () => {
  const createPages = (count: number, layoutId = 'modern-feature'): PageData[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `page-${i}`,
      type: 'slide',
      title: `Page ${i + 1}`,
      layoutId,
      aspectRatio: '16:9',
      backgroundColor: '#ffffff',
    }));

  const makeProps = (overrides: any = {}) => ({
    currentPageIndex: 0,
    onPageSelect: vi.fn(),
    onAddPage: vi.fn(),
    onRemovePage: vi.fn(),
    onReorderPages: vi.fn(),
    onClearAll: vi.fn(),
    onImport: vi.fn(),
    onExport: vi.fn(),
    onToggleFontManager: vi.fn(),
    showFontManager: false,
    onNavigateHome: vi.fn(),
    onNativeSave: vi.fn(),
    onNativeSaveAs: vi.fn(),
    onNativeOpen: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('点击页面按钮触发 onPageSelect', () => {
    const onPageSelect = vi.fn();
    renderWithUI(<Sidebar {...makeProps({ onPageSelect, currentPageIndex: 1 })} pages={createPages(3)} />);

    fireEvent.click(screen.getByText('01'));
    expect(onPageSelect).toHaveBeenCalledWith(0);
  });

  it('点击 Add 按钮触发 onAddPage', () => {
    const onAddPage = vi.fn();
    renderWithUI(<Sidebar {...makeProps({ onAddPage })} pages={createPages(2)} />);

    const addBtn = screen.getByTitle('Add New Slide');
    fireEvent.click(addBtn);
    expect(onAddPage).toHaveBeenCalled();
  });

  it('删除当前页先调用 confirm，确认后才删除', async () => {
    const onRemovePage = vi.fn();
    renderWithUI(
      <Sidebar {...makeProps({ onRemovePage, currentPageIndex: 0 })} pages={createPages(3)} />
    );

    fireEvent.click(screen.getByTitle('Delete Slide'));
    expect(await screen.findByRole('heading', { name: /delete slide/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /delete slide/i })).not.toBeInTheDocument();
    });
    expect(onRemovePage).toHaveBeenCalledWith('page-0');
  });

  it('Reset Project 需要确认', async () => {
    const onClearAll = vi.fn();
    renderWithUI(<Sidebar {...makeProps({ onClearAll })} pages={createPages(2)} />);

    fireEvent.click(screen.getByTitle('Reset Project'));
    expect(await screen.findByRole('heading', { name: /reset project/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /reset project/i })).not.toBeInTheDocument();
    });
    expect(onClearAll).toHaveBeenCalled();
  });

  it('当前激活页面有标识条', () => {
    renderWithUI(<Sidebar {...makeProps({ currentPageIndex: 2 })} pages={createPages(5)} />);
    const active = screen.getByText('03').closest('button');
    expect(active).toHaveClass('bg-zine-accent');
  });
});
