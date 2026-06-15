import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenericNumberField } from '../GenericNumberField';
import React from 'react';

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  opacity: 75,
};

const noop = () => {};

describe('GenericNumberField', () => {
  it('renders with default label from fieldKey', () => {
    render(<GenericNumberField page={basePage} onUpdate={noop} fieldKey="opacity" />);
    const labels = screen.getAllByText('opacity');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with custom label', () => {
    render(
      <GenericNumberField page={basePage} onUpdate={noop} fieldKey="opacity" label="Opacity" />
    );
    const labels = screen.getAllByText('Opacity');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the current value from page', () => {
    render(<GenericNumberField page={basePage} onUpdate={noop} fieldKey="opacity" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays default value (50) when page field is undefined', () => {
    const page = { ...basePage } as any;
    delete page.opacity;
    render(<GenericNumberField page={page} onUpdate={noop} fieldKey="opacity" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onUpdate with new value when slider changes', () => {
    const onUpdate = vi.fn();
    render(
      <GenericNumberField page={basePage} onUpdate={onUpdate} fieldKey="opacity" />
    );

    const rangeInput = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(rangeInput, { target: { value: '90' } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ opacity: 90 })
    );
  });

  it('applies min/max/step defaults', () => {
    const page = { ...basePage, scale: 50 };
    render(
      <GenericNumberField page={page} onUpdate={noop} fieldKey="scale" min={10} max={200} step={5} />
    );

    const rangeInput = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(rangeInput.min).toBe('10');
    expect(rangeInput.max).toBe('200');
    expect(rangeInput.step).toBe('5');
  });

  it('syncs local state when page prop changes', () => {
    const { rerender } = render(
      <GenericNumberField page={basePage} onUpdate={noop} fieldKey="opacity" />
    );
    expect(screen.getByText('75%')).toBeInTheDocument();

    const updatedPage = { ...basePage, opacity: 30 };
    rerender(<GenericNumberField page={updatedPage} onUpdate={noop} fieldKey="opacity" />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});
