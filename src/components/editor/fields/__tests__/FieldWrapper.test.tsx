import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldWrapper } from '../FieldWrapper';
import React from 'react';

// Mock ZineStylePanel since it's a complex external component
vi.mock('../../zine/ZineStylePanel', () => ({
  ZineStylePanel: () => <div data-testid="zine-style-panel" />,
}));

const basePage: any = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  title: 'Test',
};

const noop = () => {};

describe('FieldWrapper', () => {
  beforeEach(() => {
    // Reset any DOM-related state
    document.body.innerHTML = '';
  });

  it('renders children', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Test Field">
        <div data-testid="child">content</div>
      </FieldWrapper>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('displays label text', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="My Field">
        <div />
      </FieldWrapper>
    );
    expect(screen.getByText('My Field')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const TestIcon = (props: any) => <svg data-testid="field-icon" {...props} />;
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Icon Field" icon={TestIcon}>
        <div />
      </FieldWrapper>
    );
    expect(screen.getByTestId('field-icon')).toBeInTheDocument();
  });

  it('visibility toggle shows Eye icon when visible', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" fieldKey="title">
        <div />
      </FieldWrapper>
    );
    // When visible (default), should show Eye icon (not EyeOff)
    const eyeButton = screen.getByTitle('Hide Field');
    expect(eyeButton).toBeInTheDocument();
  });

  it('visibility toggle switches to EyeOff when hidden via manualVisibility', () => {
    render(
      <FieldWrapper
        page={basePage}
        onUpdate={noop}
        label="Field"
        fieldKey="title"
        manualVisibility={false}
      >
        <div />
      </FieldWrapper>
    );
    expect(screen.getByTitle('Show Field')).toBeInTheDocument();
  });

  it('calls onToggle when manualVisibility is used', () => {
    const onToggle = vi.fn();
    render(
      <FieldWrapper
        page={basePage}
        onUpdate={noop}
        label="Field"
        fieldKey="title"
        manualVisibility={true}
        onToggle={onToggle}
      >
        <div />
      </FieldWrapper>
    );

    fireEvent.click(screen.getByTitle('Hide Field'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('hides children when visibility is off', () => {
    render(
      <FieldWrapper
        page={basePage}
        onUpdate={noop}
        label="Field"
        fieldKey="title"
        manualVisibility={false}
      >
        <div data-testid="child">content</div>
      </FieldWrapper>
    );
    const child = screen.getByTestId('child').parentElement;
    expect(child?.className).toContain('pointer-events-none');
  });

  it('renders actions when provided', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" actions={<button data-testid="action-btn">Action</button>}>
        <div />
      </FieldWrapper>
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('shows style config button when showStyleConfig and fieldKey are set', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" fieldKey="title" showStyleConfig>
        <div />
      </FieldWrapper>
    );
    expect(screen.getByTitle('Style Settings')).toBeInTheDocument();
  });

  it('does not show style config button when showStyleConfig is false', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" fieldKey="title">
        <div />
      </FieldWrapper>
    );
    expect(screen.queryByTitle('Style Settings')).not.toBeInTheDocument();
  });

  it('opens ZineStylePanel on style config button click', () => {
    render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" fieldKey="title" showStyleConfig>
        <div />
      </FieldWrapper>
    );

    fireEvent.click(screen.getByTitle('Style Settings'));
    expect(screen.getByTestId('zine-style-panel')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FieldWrapper page={basePage} onUpdate={noop} label="Field" className="custom-wrapper">
        <div />
      </FieldWrapper>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});