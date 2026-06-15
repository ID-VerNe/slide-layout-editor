import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VariantField } from '../VariantField';
import React from 'react';

// FieldWrapper is used by VariantField; ZineStylePanel must be mocked for it
vi.mock('../../zine/ZineStylePanel', () => ({
  ZineStylePanel: () => <div data-testid="zine-style-panel" />,
}));

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
};

const noop = () => {};

describe('VariantField', () => {
  it('renders default orientation buttons (left/right)', () => {
    render(<VariantField page={basePage} onUpdate={noop} />);
    expect(screen.getByText('Image Left')).toBeInTheDocument();
    expect(screen.getByText('Image Right')).toBeInTheDocument();
  });

  it('highlights left by default', () => {
    render(<VariantField page={basePage} onUpdate={noop} />);
    const leftBtn = screen.getByText('Image Left');
    expect(leftBtn.className).toContain('bg-white');
  });

  it('highlights right when layoutVariant is right', () => {
    const page = { ...basePage, layoutVariant: 'right' };
    render(<VariantField page={page} onUpdate={noop} />);
    const rightBtn = screen.getByText('Image Right');
    expect(rightBtn.className).toContain('bg-white');
  });

  it('calls onUpdate with layoutVariant on button click', () => {
    const onUpdate = vi.fn();
    render(<VariantField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Image Right'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ layoutVariant: 'right' })
    );
  });

  it('renders capsule layout buttons for gallery-capsule layout', () => {
    const capsulePage = { ...basePage, layoutId: 'gallery-capsule' };
    render(<VariantField page={capsulePage} onUpdate={noop} />);
    expect(screen.getByText('Visual Scheme')).toBeInTheDocument();
    expect(screen.getByText('Under')).toBeInTheDocument();
    expect(screen.getByText('Over')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('renders split direction buttons for film-diptych layout', () => {
    const diptychPage = { ...basePage, layoutId: 'film-diptych' };
    render(<VariantField page={diptychPage} onUpdate={noop} />);
    expect(screen.getByText('Split Direction')).toBeInTheDocument();
    expect(screen.getByText('Horizontal')).toBeInTheDocument();
    expect(screen.getByText('Vertical')).toBeInTheDocument();
  });

  it('renders schema-provided custom options', () => {
    const customOptions = [
      { value: 'option-a', label: 'Option A' },
      { value: 'option-b', label: 'Option B' },
      { value: 'option-c', label: 'Option C' },
    ];
    render(
      <VariantField
        page={basePage}
        onUpdate={noop}
        label="Custom Layout"
        options={customOptions}
      />
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('calls onUpdate with correct variant from schema options', () => {
    const onUpdate = vi.fn();
    const customOptions = [
      { value: 'compact', label: 'Compact' },
      { value: 'spacious', label: 'Spacious' },
    ];
    render(
      <VariantField
        page={basePage}
        onUpdate={onUpdate}
        options={customOptions}
      />
    );

    fireEvent.click(screen.getByText('Spacious'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ layoutVariant: 'spacious' })
    );
  });
});