import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZineMedia } from '../ui/slide/atoms/ZineMedia';
import React from 'react';

const flushPromises = () => act(() => Promise.resolve());

// Mock store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const mockState = {
      theme: {
        colors: { primary: '#000000', secondary: '#666666', accent: '#ff0000' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif' }
      },
      designSystem: {
        tokens: {
          colors: { primary: '#000000', secondary: '#666666', accent: '#ff0000', background: '#ffffff', surface: '#f5f5f5' }
        }
      }
    };
    return selector(mockState);
  })
}));

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

describe('ZineMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPage = {
    image: 'asset://test-image.jpg',
    visibility: { image: true },
    imageConfig: { scale: 1, x: 0, y: 0 }
  };

  it('should render image with correct src', async () => {
    render(<ZineMedia page={mockPage as any} />);
    await flushPromises();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should apply priority props to image loading', async () => {
    render(<ZineMedia page={mockPage as any} priority />);
    await flushPromises();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('should use lazy loading by default', async () => {
    render(<ZineMedia page={mockPage as any} />);
    await flushPromises();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
