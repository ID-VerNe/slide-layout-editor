import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Preview from './Preview';
import { PageData } from '../types';
import React from 'react';

describe('Preview Component with Lazy Loading', () => {
  const mockPage: PageData = {
    id: 'page-1',
    type: 'slide',
    title: 'Page 1',
    layoutId: 'modern-feature',
    aspectRatio: '16:9',
    backgroundColor: '#ffffff',
  };

  it('should render template eventually', async () => {
    render(<Preview page={mockPage} pageIndex={0} totalPages={1} />);
    
    // Wait for template content to appear
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle template switching', async () => {
    const { rerender } = render(<Preview page={mockPage} pageIndex={0} totalPages={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const newPage = { ...mockPage, id: 'page-2', layoutId: 'platform-hero', title: 'New Page' };
    rerender(<Preview page={newPage} pageIndex={0} totalPages={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('New Page')).toBeInTheDocument();
    });
  });
});
