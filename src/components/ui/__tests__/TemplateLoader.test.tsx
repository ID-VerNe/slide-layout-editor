import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemplateLoader from '../TemplateLoader';
import React from 'react';

// Mock framer-motion to avoid animation complexity
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, animate, transition, ...props }: any) =>
      React.createElement('div', { ...props, className, 'data-animate': JSON.stringify(animate) }, children),
  },
}));

describe('TemplateLoader', () => {
  it('renders a spinner with role="status"', () => {
    render(<TemplateLoader />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('renders circular spinner element inside', () => {
    const { container } = render(<TemplateLoader />);
    const spinnerDiv = container.querySelector('.rounded-full');
    expect(spinnerDiv).toBeInTheDocument();
  });

  it('defaults to medium size', () => {
    const { container } = render(<TemplateLoader />);
    const spinnerDiv = container.querySelector('.rounded-full');
    expect(spinnerDiv).toBeInTheDocument();
    // medium size applies w-12 h-12
    expect(spinnerDiv!.className).toContain('w-12');
    expect(spinnerDiv!.className).toContain('h-12');
  });

  it('applies small size class', () => {
    const { container } = render(<TemplateLoader size="small" />);
    const spinnerDiv = container.querySelector('.rounded-full');
    expect(spinnerDiv!.className).toContain('w-8');
    expect(spinnerDiv!.className).toContain('h-8');
  });

  it('applies large size class', () => {
    const { container } = render(<TemplateLoader size="large" />);
    const spinnerDiv = container.querySelector('.rounded-full');
    expect(spinnerDiv!.className).toContain('w-16');
    expect(spinnerDiv!.className).toContain('h-16');
  });

  it('renders with correct border classes for spinning effect', () => {
    const { container } = render(<TemplateLoader />);
    const spinnerDiv = container.querySelector('.rounded-full');
    expect(spinnerDiv!.className).toContain('border-4');
    expect(spinnerDiv!.className).toContain('border-slate-200');
    expect(spinnerDiv!.className).toContain('border-t-blue-500');
  });

  it('has aria accessibility attributes', () => {
    render(<TemplateLoader />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });
});