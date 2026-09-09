import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { KnuthPlassText } from '../KnuthPlassText';
import * as layoutHook from '../../../hooks/useKnuthPlassLayout';
import { vi } from 'vitest';

vi.mock('../../../hooks/useKnuthPlassLayout');

describe('KnuthPlassText', () => {
  it('renders correctly with layout lines', () => {
    vi.spyOn(layoutHook, 'useKnuthPlassLayout').mockReturnValue({
      layout: {
        fontSize: 32,
        lines: [
          { text: 'Line 1', boxW: 100, ratio: 0.5, last: false },
          { text: 'Line 2', boxW: 80, ratio: 0, last: true }
        ],
        success: true
      },
      isCalculating: false
    });

    const { container } = render(
      <KnuthPlassText 
        text="Line 1 Line 2"
        fontFamily="Arial"
        maxSize={40}
        align="justify"
      />
    );

    // Wrapper div checks
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ fontFamily: 'Arial', fontSize: '32px' });
    
    // Lines check
    expect(wrapper.textContent).toContain('Line1');
    expect(wrapper.textContent).toContain('Line 2');
  });

  it('renders calculating state and applies opacity', () => {
    vi.spyOn(layoutHook, 'useKnuthPlassLayout').mockReturnValue({
      layout: null,
      isCalculating: true
    });

    const { container } = render(
      <KnuthPlassText 
        text="Waiting..."
        fontFamily="Arial"
        maxSize={40}
        align="justify"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('opacity-80');
    expect(wrapper.className).toContain('transition-opacity');
  });
});
