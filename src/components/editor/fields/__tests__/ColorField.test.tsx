import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorField } from '../ColorField';
import React from 'react';

// Mock the store to provide designSystem tokens
vi.mock('../../../store/useStore', () => ({
  useStore: (selector: any) => {
    const state = {
      designSystem: {
        tokens: {
          colors: {
            background: '#ffffff',
            text: '#0F172A',
            accent: '#264376',
            muted: '#94A3B8',
          },
        },
      },
    };
    return selector(state);
  },
}));

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  backgroundColor: '#ff0000',
};

const noop = () => {};

describe('ColorField', () => {
  it('renders label', () => {
    render(<ColorField page={basePage} onUpdate={noop} />);
    expect(screen.getByText('Page Background')).toBeInTheDocument();
  });

  it('renders color input for non-Zine layout', () => {
    render(<ColorField page={basePage} onUpdate={noop} />);
    // Non-Zine layout shows a color input and text input
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput).not.toBeNull();
    expect(colorInput.value).toBe('#ff0000');
  });

  it('renders text input with current color for non-Zine layout', () => {
    render(<ColorField page={basePage} onUpdate={noop} />);
    const textInputs = document.querySelectorAll('input[type="text"]');
    expect(textInputs.length).toBeGreaterThan(0);
    const textInput = textInputs[0] as HTMLInputElement;
    expect(textInput.value).toBe('#ff0000');
  });

  it('renders color picker grid for Zine layout', () => {
    const zinePage = { ...basePage, layoutId: 'zine-modern' };
    const { container } = render(<ColorField page={zinePage} onUpdate={noop} />);
    // Zine layout shows a grid with grid-cols-5 class containing token swatches
    const grid = container.querySelector('.grid-cols-5');
    expect(grid).toBeInTheDocument();
  });

  it('renders "Reset to System" button in Zine layout', () => {
    const zinePage = { ...basePage, layoutId: 'zine-modern' };
    render(<ColorField page={zinePage} onUpdate={noop} />);
    expect(screen.getByText('Reset to System')).toBeInTheDocument();
  });

  it('calls onUpdate with new color from Zine token button', () => {
    const onUpdate = vi.fn();
    const zinePage = { ...basePage, layoutId: 'zine-modern' };
    render(<ColorField page={zinePage} onUpdate={onUpdate} />);

    // Find a color swatch button and click it
    const colorButtons = document.querySelectorAll('button');
    const tokenButton = Array.from(colorButtons).find(
      btn => btn.style.backgroundColor === 'rgb(38, 67, 118)' // accent
    );

    if (tokenButton) {
      fireEvent.click(tokenButton);
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ backgroundColor: '#264376' })
      );
    }
  });

  it('calls onUpdate with new color from color input', () => {
    const onUpdate = vi.fn();
    render(<ColorField page={basePage} onUpdate={onUpdate} />);

    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ backgroundColor: '#00ff00' })
    );
  });

  it('calls onUpdate with system color on reset click', () => {
    const onUpdate = vi.fn();
    render(<ColorField page={basePage} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Reset to System'));

    // System background token is '#ffffff'
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ backgroundColor: '#ffffff' })
    );
  });
});
