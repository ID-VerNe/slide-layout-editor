import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SlideImage } from '../ui/slide/SlideImage';
import React from 'react';

// Mock hooks with correct relative paths
vi.mock('../../hooks/useAssetUrl', () => ({
  useAssetUrl: vi.fn().mockReturnValue({ url: 'test-image.jpg', isLoading: false })
}));

vi.mock('../../hooks/useResponsiveImage', () => ({
  useResponsiveImage: vi.fn().mockReturnValue({ srcSet: '', variants: {}, isLoading: false })
}));

vi.mock('../../utils/lqip', () => ({
  generateLQIP: vi.fn().mockResolvedValue('data:image/jpeg;base64,lqip')
}));

describe('SlideImage', () => {
  const mockPage = {
    image: 'asset://test-image.jpg',
    visibility: { image: true },
    imageConfig: { scale: 1, x: 0, y: 0 }
  };

  it('should render image with correct src', () => {
    render(<SlideImage page={mockPage as any} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should apply priority props to image loading', () => {
    render(<SlideImage page={mockPage as any} priority />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('should use lazy loading by default', () => {
    render(<SlideImage page={mockPage as any} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});