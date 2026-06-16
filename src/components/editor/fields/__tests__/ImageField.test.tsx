import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageField } from '../ImageField';
import React from 'react';

// Mock FieldWrapper
vi.mock('../FieldWrapper', () => ({
  FieldWrapper: ({ children, label, icon: Icon }: any) => (
    <div data-testid="field-wrapper">
      <span data-testid="wrapper-label">{label}</span>
      {Icon && <Icon data-testid="wrapper-icon" size={12} />}
      {children}
    </div>
  ),
}));

// Mock IconPicker — path: from __tests__/ to src/components/ui/IconPicker
vi.mock('../../../ui/IconPicker', () => ({
  default: ({ onChange, trigger, allowedTabs }: any) => (
    <div data-testid="icon-picker" data-allowed-tabs={allowedTabs?.join(',')}>
      <button
        data-testid="picker-trigger"
        onClick={() => onChange('mock-selected-value')}
      >
        {trigger}
      </button>
    </div>
  ),
  __esModule: true,
}));

// Mock useAssetUrl — path: from __tests__/ to src/hooks/useAssetUrl
vi.mock('../../../../hooks/useAssetUrl', () => ({
  useAssetUrl: (source: string | undefined) => ({
    url: source ? 'data:image/png;base64,mock' : undefined,
    isLoading: false,
    dimensions: { width: 0, height: 0 },
  }),
}));

// Mock react-router-dom so IconPicker's useParams() works
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useParams: () => ({ projectId: 'proj-1' }),
  };
});

// Mock useProject so IconPicker's useProject call works
vi.mock('../../../../hooks/useProject', () => ({
  useProject: () => ({ imageQuality: 0.95 }),
}));

// Mock useUI for useProject-internal useUI call
vi.mock('../../../../context/UIContext', () => ({
  useUI: () => ({ alert: vi.fn(), confirm: vi.fn() }),
}));

// Mock lucide icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Trash2: ({ size, ...rest }: any) => (
      <span data-testid="lucide-trash" {...rest}>
        trash
      </span>
    ),
    SlidersHorizontal: ({ size, ...rest }: any) => (
      <span data-testid="lucide-sliders" {...rest}>
        sliders
      </span>
    ),
    Plus: ({ size, ...rest }: any) => (
      <span data-testid="lucide-plus" {...rest}>
        plus
      </span>
    ),
  };
});

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  title: 'Test Page',
};

const pageWithImage: any = {
  ...basePage,
  image: 'https://example.com/photo.jpg',
  imageConfig: { scale: 1.5, x: 10, y: -5 },
};

const noop = () => {};

describe('ImageField', () => {
  it('renders label with default value', () => {
    render(<ImageField page={basePage} onUpdate={noop} />);
    expect(screen.getByTestId('wrapper-label')).toHaveTextContent(
      'Visual Asset',
    );
  });

  it('renders "Browse Library" text when no image is set', () => {
    render(<ImageField page={basePage} onUpdate={noop} />);
    expect(screen.getByText('Browse Library')).toBeInTheDocument();
  });

  it('renders "Change Source" text when image is set', () => {
    render(<ImageField page={pageWithImage} onUpdate={noop} />);
    expect(screen.getByText('Change Source')).toBeInTheDocument();
  });

  it('shows adjust button when image is present', () => {
    render(<ImageField page={pageWithImage} onUpdate={noop} />);
    expect(screen.getByTitle('Adjust Image')).toBeInTheDocument();
  });

  it('does not show adjust button when no image is set', () => {
    render(<ImageField page={basePage} onUpdate={noop} />);
    expect(screen.queryByTitle('Adjust Image')).not.toBeInTheDocument();
  });

  it('opens adjust panel when adjust button is clicked', () => {
    render(<ImageField page={pageWithImage} onUpdate={noop} />);
    const adjustBtn = screen.getByTitle('Adjust Image');
    fireEvent.click(adjustBtn);

    expect(screen.getByText('Fit to Container')).toBeInTheDocument();
    expect(screen.getByText('Remove Asset')).toBeInTheDocument();
  });

  it('calls onUpdate with reset config when Fit to Container is clicked', () => {
    const onUpdate = vi.fn();
    render(<ImageField page={pageWithImage} onUpdate={onUpdate} />);

    const adjustBtn = screen.getByTitle('Adjust Image');
    fireEvent.click(adjustBtn);
    fireEvent.click(screen.getByText('Fit to Container'));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        imageConfig: { scale: 1, x: 0, y: 0 },
      }),
    );
  });

  it('calls onUpdate with empty image when Remove Asset is clicked', () => {
    const onUpdate = vi.fn();
    render(<ImageField page={pageWithImage} onUpdate={onUpdate} />);

    const adjustBtn = screen.getByTitle('Adjust Image');
    fireEvent.click(adjustBtn);
    fireEvent.click(screen.getByText('Remove Asset'));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ image: '' }),
    );
  });

  it('uses custom fieldKey for config lookup', () => {
    const pageWithCustom: any = {
      ...basePage,
      logo: 'https://example.com/logo.png',
      logoConfig: { scale: 0.8, x: 0, y: 0 },
    };
    render(
      <ImageField
        page={pageWithCustom}
        onUpdate={noop}
        fieldKey="logo"
        label="Logo"
      />,
    );

    expect(screen.getByTestId('wrapper-label')).toHaveTextContent('Logo');
    expect(screen.getByText('Change Source')).toBeInTheDocument();
  });
});