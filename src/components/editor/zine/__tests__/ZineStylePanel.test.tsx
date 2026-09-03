import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ZineStylePanel } from '../ZineStylePanel';
import { PageData } from '../../../../types';

describe('ZineStylePanel', () => {
  const basePage: PageData = {
    id: 'p1',
    layoutId: 'zine-classic',
    title: 'Hello',
    styleOverrides: {
      title: { size: 3, bold: true },
    },
  };

  it('renders text mode correctly with bold and size controls', () => {
    const onUpdate = vi.fn();
    render(
      <ZineStylePanel
        page={basePage}
        fieldKey="title"
        onUpdate={onUpdate}
        customFonts={[]}
        mode="text"
      />
    );

    expect(screen.getByText('Style Lab')).toBeInTheDocument();
    expect(screen.getByText('Font Family')).toBeInTheDocument();
    expect(screen.getByText('Size (x8)')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('RESET')).toBeInTheDocument();
  });

  it('calls onUpdate when reset is clicked', () => {
    const onUpdate = vi.fn();
    render(
      <ZineStylePanel
        page={basePage}
        fieldKey="title"
        onUpdate={onUpdate}
        customFonts={[]}
        mode="text"
      />
    );

    fireEvent.click(screen.getByText('RESET'));
    expect(onUpdate).toHaveBeenCalled();
  });

  it('renders image mode with Rounding control', () => {
    const onUpdate = vi.fn();
    render(
      <ZineStylePanel
        page={basePage}
        fieldKey="image"
        onUpdate={onUpdate}
        customFonts={[]}
        mode="image"
      />
    );

    expect(screen.getByText('Rounding')).toBeInTheDocument();
  });

  it('renders divider mode with Thickness and Length controls', () => {
    const onUpdate = vi.fn();
    render(
      <ZineStylePanel
        page={basePage}
        fieldKey="divider"
        onUpdate={onUpdate}
        customFonts={[]}
        mode="divider"
      />
    );

    expect(screen.getByText('Thickness')).toBeInTheDocument();
    expect(screen.getByText('Length')).toBeInTheDocument();
  });
});
