import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplatePreview } from '../TemplatePreview';
import React from 'react';

// Mock JsonTemplateRenderer to avoid store dependencies and schema rendering
vi.mock('../../JsonTemplateRenderer', () => ({
  JsonTemplateRenderer: ({ schema, page }: any) => (
    <div data-testid="json-template-renderer">
      Template: {page.layoutId}
    </div>
  ),
}));

// Mock the store
vi.mock('../../../store/useStore', () => ({
  useStore: (selector: any) =>
    selector({
      theme: {},
      designSystem: {},
    }),
}));

describe('TemplatePreview', () => {
  it('renders preview for a known template ID', () => {
    render(
      <TemplatePreview
        layoutId="zine-classic"
        aspectRatio="16:9"
      />
    );
    // Should render the preview with the template
    expect(screen.getByTestId('json-template-renderer')).toBeInTheDocument();
    expect(screen.getByText('Template: zine-classic')).toBeInTheDocument();
  });

  it('renders preview for another known template ID', () => {
    render(
      <TemplatePreview
        layoutId="editorial-classic"
        aspectRatio="2:3"
      />
    );
    expect(screen.getByTestId('json-template-renderer')).toBeInTheDocument();
    expect(screen.getByText('Template: editorial-classic')).toBeInTheDocument();
  });

  it('renders preview for a template using schema', () => {
    render(
      <TemplatePreview
        layoutId="big-statement"
        aspectRatio="16:9"
      />
    );
    expect(screen.getByTestId('json-template-renderer')).toBeInTheDocument();
    expect(screen.getByText('Template: big-statement')).toBeInTheDocument();
  });

  it('handles unknown template ID gracefully with placeholder', () => {
    const { container } = render(
      <TemplatePreview
        layoutId="nonexistent-template-id"
        aspectRatio="16:9"
      />
    );
    // Should render a placeholder div with animate-pulse
    const placeholder = container.querySelector('.animate-pulse');
    expect(placeholder).toBeInTheDocument();
  });

  it('applies correct aspect ratio via config dimensions', () => {
    const { container } = render(
      <TemplatePreview
        layoutId="zine-classic"
        aspectRatio="16:9"
      />
    );
    // For 16:9, width=1920, height=1080
    const scaledContainer = container.querySelector('[style*="transform: scale"]') as HTMLElement;
    expect(scaledContainer).toBeInTheDocument();
    expect(scaledContainer.style.width).toBe('1920px');
    expect(scaledContainer.style.height).toBe('1080px');
  });

  it('applies 2:3 aspect ratio dimensions', () => {
    const { container } = render(
      <TemplatePreview
        layoutId="zine-classic"
        aspectRatio="2:3"
      />
    );
    const scaledContainer = container.querySelector('[style*="transform: scale"]') as HTMLElement;
    expect(scaledContainer.style.width).toBe('1080px');
    expect(scaledContainer.style.height).toBe('1620px');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TemplatePreview
        layoutId="zine-classic"
        aspectRatio="16:9"
        className="my-preview"
      />
    );
    const outerWrapper = container.firstElementChild as HTMLElement;
    expect(outerWrapper.className).toContain('my-preview');
  });

  it('renders A4 aspect ratio correctly', () => {
    const { container } = render(
      <TemplatePreview
        layoutId="academic-hybrid-resume"
        aspectRatio="A4"
      />
    );
    expect(screen.getByTestId('json-template-renderer')).toBeInTheDocument();
    expect(screen.getByText('Template: academic-hybrid-resume')).toBeInTheDocument();

    const scaledContainer = container.querySelector('[style*="transform: scale"]') as HTMLElement;
    expect(scaledContainer.style.width).toBe('1240px');
    expect(scaledContainer.style.height).toBe('1754px');
  });
});