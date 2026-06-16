import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconPicker } from '../IconPicker';
import React from 'react';

// Mock react-router-dom useParams
vi.mock('react-router-dom', () => ({
  useParams: () => ({ projectId: 'test-project' }),
}));

// Mock useProject hook
vi.mock('../../../hooks/useProject', () => ({
  useProject: () => ({ imageQuality: 0.8 }),
}));

// Mock compressImage from db utils
vi.mock('../../../utils/db', () => ({
  compressImage: vi.fn((file) => Promise.resolve('data:image/png;base64,mocked')),
}));

// Mock Modal to avoid portal / framer-motion complexity
vi.mock('../../Modal', () => ({
  default: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ) : null,
}));

describe('IconPicker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders default trigger button when no trigger prop', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    expect(screen.getByText('Select Asset')).toBeInTheDocument();
  });

  it('renders custom trigger element when provided', () => {
    render(
      <IconPicker
        value=""
        onChange={() => {}}
        trigger={<button data-testid="custom-trigger">Pick Icon</button>}
      />
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.getByText('Pick Icon')).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();

    const trigger = screen.getByText('Select Asset');
    fireEvent.click(trigger);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Asset Library');
  });

  it('shows icons tab by default', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Select Asset'));
    expect(screen.getByText('Icons')).toBeInTheDocument();
    // Should render category headers from CATEGORIZED_ICONS
    expect(screen.getByText('Technology & Infrastructure')).toBeInTheDocument();
  });

  it('filters icons by search text', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Select Asset'));

    // All categories initially visible
    expect(screen.getByText('Technology & Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Biotech & Life Sciences')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search icons...');
    fireEvent.change(searchInput, { target: { value: 'dna' } });

    // Only Biotech category has dna-related icons
    expect(screen.queryByText('Technology & Infrastructure')).not.toBeInTheDocument();
    expect(screen.getByText('Biotech & Life Sciences')).toBeInTheDocument();
  });

  it('clears search text and shows all categories on empty search', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Select Asset'));

    const searchInput = screen.getByPlaceholderText('Search icons...');
    fireEvent.change(searchInput, { target: { value: 'finance' } });

    expect(screen.getByText('Finance & High-Growth')).toBeInTheDocument();
    expect(screen.queryByText('Technology & Infrastructure')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Technology & Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Finance & High-Growth')).toBeInTheDocument();
    expect(screen.getByText('Biotech & Life Sciences')).toBeInTheDocument();
  });

  it('handles empty search that matches no icons', () => {
    render(<IconPicker value="" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Select Asset'));

    const searchInput = screen.getByPlaceholderText('Search icons...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent_ZZZ' } });

    expect(screen.queryByText('Technology & Infrastructure')).not.toBeInTheDocument();
    expect(screen.queryByText('Biotech & Life Sciences')).not.toBeInTheDocument();
    expect(screen.queryByText('Finance & High-Growth')).not.toBeInTheDocument();
  });

  it('selects an icon and calls onChange with the icon name', () => {
    const onChange = vi.fn();
    render(<IconPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByText('Select Asset'));

    // Find a specific icon button - use regex for case-insensitive matching
    const dnaButton = screen.getByText(/^dna$/i).closest('button');
    expect(dnaButton).not.toBeNull();
    fireEvent.click(dnaButton!);

    expect(onChange).toHaveBeenCalledWith('Dna');
    // Modal should close after selection
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('stores selected icon in localStorage as recent', () => {
    const onChange = vi.fn();
    render(<IconPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByText('Select Asset'));

    const dnaButton = screen.getByText(/^dna$/i).closest('button');
    fireEvent.click(dnaButton!);

    const stored = JSON.parse(localStorage.getItem('slidegrid_editor_recent_assets') || '[]');
    expect(stored).toContain('Dna');
  });

  it('renders with an image URL value', () => {
    render(
      <IconPicker
        value="https://example.com/image.png"
        onChange={() => {}}
      />
    );
    // Should render an img element for the URL value
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
  });

  it('closes modal when selecting an icon', () => {
    const onChange = vi.fn();
    render(<IconPicker value="" onChange={onChange} />);

    // Open modal
    fireEvent.click(screen.getByText('Select Asset'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Select first visible icon to close
    const dnaButton = screen.getByText(/^Dna$/i).closest('button');
    fireEvent.click(dnaButton!);
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('shows history tab and empty state when no project images', () => {
    render(
      <IconPicker
        value=""
        onChange={() => {}}
        allowedTabs={['icons', 'history']}
        pages={[]}
      />
    );
    fireEvent.click(screen.getByText('Select Asset'));

    // Click History tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    expect(screen.getByText('No images used in this project yet')).toBeInTheDocument();
  });

  it('shows project images in history tab when pages have images', () => {
    const pages = [
      {
        id: 'page-1',
        image: 'https://example.com/photo1.jpg',
        signature: '',
        logo: '',
        gallery: [],
        features: [],
        bentoItems: [],
        partners: [],
        testimonials: [],
        mosaicConfig: {},
      },
    ];
    render(
      <IconPicker
        value=""
        onChange={() => {}}
        allowedTabs={['icons', 'history']}
        pages={pages as any}
      />
    );
    fireEvent.click(screen.getByText('Select Asset'));

    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Should show the image from pages
    const img = document.querySelector('img[src="https://example.com/photo1.jpg"]');
    expect(img).not.toBeNull();
  });
});