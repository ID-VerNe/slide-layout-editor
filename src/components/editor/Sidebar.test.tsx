import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import { PageData } from '../../types';
import React from 'react';

// Mock VirtualPageList to see if it's being used
vi.mock('./VirtualPageList', () => ({
  default: () => <div data-testid="virtual-page-list" />
}));

// Mock BrandLogo
vi.mock('../ui/BrandLogo', () => ({
  BrandLogo: () => <div data-testid="brand-logo" />
}));

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
    render(<Sidebar {...defaultProps} pages={pages} />);
    
    // Should NOT show virtual list
    expect(screen.queryByTestId('virtual-page-list')).not.toBeInTheDocument();
    // Should show BrandLogo (part of full rendering Sidebar)
    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
    // Should show page numbers (part of full rendering Sidebar)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should use virtual scrolling for large projects (>= 30 pages)', () => {
    const pages = createPages(35);
    render(<Sidebar {...defaultProps} pages={pages} />);
    
    // Should show virtual list
    expect(screen.getByTestId('virtual-page-list')).toBeInTheDocument();
  });
});
