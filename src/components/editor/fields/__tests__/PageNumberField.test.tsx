import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageNumberField } from '../PageNumberField';
import React from 'react';

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
};

const noop = () => {};

describe('PageNumberField', () => {
  it('renders label', () => {
    render(<PageNumberField page={basePage} onUpdate={noop} />);
    expect(screen.getByText('Folio (Page No.)')).toBeInTheDocument();
  });

  it('shows alignment buttons when visible', () => {
    render(<PageNumberField page={basePage} onUpdate={noop} />);
    expect(screen.getByTitle('Align Left')).toBeInTheDocument();
    expect(screen.getByTitle('Auto (Based on Variant)')).toBeInTheDocument();
    expect(screen.getByTitle('Align Right')).toBeInTheDocument();
  });

  it('highlights auto alignment by default', () => {
    render(<PageNumberField page={basePage} onUpdate={noop} />);
    const autoBtn = screen.getByTitle('Auto (Based on Variant)');
    expect(autoBtn.className).toContain('bg-white');
  });

  it('calls onUpdate with folioAlignment on alignment button click', () => {
    const onUpdate = vi.fn();
    render(<PageNumberField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle('Align Left'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ folioAlignment: 'left' })
    );
  });

  it('calls onUpdate with auto alignment', () => {
    const onUpdate = vi.fn();
    render(<PageNumberField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle('Auto (Based on Variant)'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ folioAlignment: 'auto' })
    );
  });

  it('calls onUpdate with right alignment', () => {
    const onUpdate = vi.fn();
    render(<PageNumberField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle('Align Right'));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ folioAlignment: 'right' })
    );
  });

  it('hides alignment buttons when pageNumber is false', () => {
    const hiddenPage = { ...basePage, pageNumber: false };
    render(<PageNumberField page={hiddenPage} onUpdate={noop} />);
    expect(screen.queryByTitle('Align Left')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Auto (Based on Variant)')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Align Right')).not.toBeInTheDocument();
  });

  it('toggles visibility on click', () => {
    const onUpdate = vi.fn();
    render(<PageNumberField page={basePage} onUpdate={onUpdate} />);

    // The toggle button is the first button inside the component
    const toggleBtn = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(toggleBtn);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ pageNumber: false })
    );
  });

  it('shows EyeOff when hidden and toggles back on', () => {
    const onUpdate = vi.fn();
    const hiddenPage = { ...basePage, pageNumber: false };
    render(<PageNumberField page={hiddenPage} onUpdate={onUpdate} />);

    // When pageNumber is false, isVisible becomes false, EyeOff is shown
    const toggleBtn = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(toggleBtn);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ pageNumber: true })
    );
  });
});