import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GenericTextField } from '../GenericTextField';
import { PageData } from '../../../../types';

// Mock ZineStylePanel
vi.mock('../../zine/ZineStylePanel', () => ({
  ZineStylePanel: () => <div data-testid="zine-style-panel" />,
}));

describe('GenericTextField', () => {
  const basePage: PageData = {
    id: 'p1',
    type: 'slide',
    aspectRatio: '16:9',
    layoutId: 'modern-feature',
    title: 'Hello',
    paragraph: 'Initial paragraph',
    styleOverrides: {
      paragraph: {
        fontSize: 16,
      },
    },
  };

  it('renders single-line text input by default', () => {
    const onUpdate = vi.fn();
    render(
      <GenericTextField
        page={basePage}
        onUpdate={onUpdate}
        fieldKey="paragraph"
        label="Paragraph"
        placeholder="Enter paragraph..."
      />
    );

    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter paragraph...') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Initial paragraph');
  });

  it('renders multiline textarea when multiline is true', () => {
    const onUpdate = vi.fn();
    render(
      <GenericTextField
        page={basePage}
        onUpdate={onUpdate}
        fieldKey="paragraph"
        label="Paragraph"
        multiline={true}
        rows={6}
        placeholder="Multiline text..."
      />
    );

    const textarea = screen.getByPlaceholderText('Multiline text...') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.rows).toBe(6);
  });

  it('triggers onUpdate on immediate change', () => {
    const onUpdate = vi.fn();
    render(
      <GenericTextField
        page={basePage}
        onUpdate={onUpdate}
        fieldKey="paragraph"
        label="Paragraph"
        placeholder="Enter text..."
      />
    );

    const input = screen.getByPlaceholderText('Enter text...');
    fireEvent.change(input, { target: { value: 'New text' } });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ paragraph: 'New text' }),
      true
    );
  });
});
