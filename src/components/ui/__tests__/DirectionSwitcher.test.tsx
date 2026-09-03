import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DirectionSwitcher } from '../DirectionSwitcher';

describe('DirectionSwitcher', () => {
  it('renders default left-right mode correctly', () => {
    const onChange = vi.fn();
    render(<DirectionSwitcher value="left" onChange={onChange} mode="left-right" />);

    expect(screen.getByText('Image Left')).toBeInTheDocument();
    expect(screen.getByText('Image Right')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Image Right'));
    expect(onChange).toHaveBeenCalledWith('right');
  });

  it('renders top-bottom mode correctly', () => {
    const onChange = vi.fn();
    render(<DirectionSwitcher value="bottom" onChange={onChange} mode="top-bottom" />);

    expect(screen.getByText('Headline Top')).toBeInTheDocument();
    expect(screen.getByText('Headline Bottom')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Headline Top'));
    expect(onChange).toHaveBeenCalledWith('top');
  });

  it('renders horizontal-vertical mode correctly', () => {
    const onChange = vi.fn();
    render(<DirectionSwitcher value="horizontal" onChange={onChange} mode="horizontal-vertical" />);

    expect(screen.getByText('Horizontal')).toBeInTheDocument();
    expect(screen.getByText('Vertical')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Vertical'));
    expect(onChange).toHaveBeenCalledWith('vertical');
  });

  it('renders capsule mode correctly', () => {
    const onChange = vi.fn();
    render(<DirectionSwitcher value="under" onChange={onChange} mode="capsule" />);

    expect(screen.getByText('Under')).toBeInTheDocument();
    expect(screen.getByText('Over')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Over'));
    expect(onChange).toHaveBeenCalledWith('over');
  });

  it('renders custom options when provided', () => {
    const onChange = vi.fn();
    const custom = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ];
    render(<DirectionSwitcher value="a" onChange={onChange} options={custom} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Beta'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
