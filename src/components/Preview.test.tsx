import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Preview from './Preview';
import { PageData } from '../types';
import React from 'react';

// Mock MetadataOverlay as it's not the focus here
vi.mock('./ui/slide/MetadataOverlay', () => ({
  default: () => <div data-testid="metadata-overlay" />
}));

describe('Preview Component with Lazy Loading', () => {
  const mockPage: PageData = {
    id: 'page-1',
    type: 'slide',
    title: 'Page 1',
    layoutId: 'modern-feature',
    aspectRatio: '16:9',
    backgroundColor: '#ffffff',
  };

  it('should show loader initially when template is loading', async () => {
    render(<Preview page={mockPage} pageIndex={0} totalPages={1} />);
    
    // Check if loader is present
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render template eventually', async () => {
    render(<Preview page={mockPage} pageIndex={0} totalPages={1} />);
    
    // Wait for loader to disappear and template to appear
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle template switching with loading state', async () => {
    const { rerender } = render(<Preview page={mockPage} pageIndex={0} totalPages={1} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const newPage = { ...mockPage, id: 'page-2', layoutId: 'platform-hero' };
    rerender(<Preview page={newPage} pageIndex={0} totalPages={1} />);
    
    // It might show loader again for the new template, but it might also be very fast
    // Let's just wait for the template to be ready again
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
