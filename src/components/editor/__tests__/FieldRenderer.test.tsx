import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldRenderer } from '../FieldRenderer';
import { PageData, FieldSchema, CustomFont } from '../../../types';
import React from 'react';

// Mock heavy field components to keep unit test focused on routing logic
vi.mock('../fields/TitleField', () => ({
  TitleField: ({ label }: any) => <div data-testid="title-field">{label}</div>,
}));
vi.mock('../fields/SeparatorField', () => ({
  SeparatorField: ({ label }: any) => <hr data-testid="separator-field" aria-label={label} />,
}));
vi.mock('../fields/GenericNumberField', () => ({
  GenericNumberField: ({ label, fieldKey }: any) => <input data-testid={`number-field-${fieldKey}`} aria-label={label} />,
}));

const basePage: PageData = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  aspectRatio: '16:9',
  title: 'Hello',
};

const customFonts: CustomFont[] = [];
const noop = () => {};

describe('FieldRenderer', () => {
  it('根据 schema key 渲染对应字段组件', () => {
    render(
      <FieldRenderer
        schema={{ key: 'title', label: 'Title' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
      />
    );
    expect(screen.getByTestId('title-field')).toHaveTextContent('Title');
  });

  it('separator 类型可通过 key 渲染', () => {
    render(
      <FieldRenderer
        schema={{ key: 'separator', label: 'Divider', type: 'separator' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
      />
    );
    expect(screen.getByTestId('separator-field')).toBeInTheDocument();
  });

  it('separator 类型可作为 fallback 渲染', () => {
    render(
      <FieldRenderer
        schema={{ key: 'unknown' as any, label: 'Line', type: 'separator' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
      />
    );
    expect(screen.getByTestId('separator-field')).toBeInTheDocument();
  });

  it('number 类型且无 key 映射时渲染 GenericNumberField', () => {
    render(
      <FieldRenderer
        schema={{ key: 'unknownNumber' as any, label: 'Size', type: 'number' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
      />
    );
    expect(screen.getByTestId('number-field-unknownNumber')).toBeInTheDocument();
  });

  it('未识别且没有 fallback 时返回 null', () => {
    const { container } = render(
      <FieldRenderer
        schema={{ key: ' totallyUnknown' as any, label: 'X' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('将 pages 透传给字段组件', () => {
    const pages = [basePage];
    render(
      <FieldRenderer
        schema={{ key: 'title', label: 'T' } as FieldSchema}
        page={basePage}
        onUpdate={noop}
        customFonts={customFonts}
        pages={pages}
      />
    );
    // 仅在支持 pages props 的字段中有意义；这里主要验证不抛错
    expect(screen.getByTestId('title-field')).toBeInTheDocument();
  });
});
