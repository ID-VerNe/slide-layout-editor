import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualPageList from './VirtualPageList';
import { PageData } from '../../types';
import React from 'react';

// Mock BrandLogo as it might use SVG or other things that don't need to be tested here
vi.mock('../ui/BrandLogo', () => ({
  BrandLogo: () => <div data-testid="brand-logo" />
}));

describe('VirtualPageList', () => {
  const mockPages: PageData[] = Array.from({ length: 50 }, (_, i) => ({
    id: `page-${i}`,
    type: 'slide',
    title: `Page ${i + 1}`,
    layoutId: 'modern-feature',
    aspectRatio: '16:9',
    backgroundColor: '#ffffff',
  }));

  const defaultProps = {
    pages: mockPages,
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

  it('should render the list container', () => {
    render(<VirtualPageList {...defaultProps} />);
    expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
  });

  it('should call onPageSelect when a page is clicked', () => {
    // Mock container size for react-virtual
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 96 });
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 96,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 96,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    render(<VirtualPageList {...defaultProps} />);
    
    // Virtualizer might need a tick to update visible items
    // But since we are using overscan: 10, it might render some even if it thinks 0 height initially
    // Actually, we mocked it before render, so it should work.

    const page1Button = screen.getByText('1').closest('button');
    if (page1Button) {
      fireEvent.click(page1Button);
      expect(defaultProps.onPageSelect).toHaveBeenCalledWith(0);
    }
  });

  it('should call onAddPage when add button is clicked', () => {
    // Use fewer pages so the add button is visible/rendered
    const fewPages = mockPages.slice(0, 2);
    // Mock container size
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 96 });
    
    render(<VirtualPageList {...defaultProps} pages={fewPages} />);
    const addButton = screen.getByTitle('Add New Slide');
    fireEvent.click(addButton);
    expect(defaultProps.onAddPage).toHaveBeenCalled();
  });
});
