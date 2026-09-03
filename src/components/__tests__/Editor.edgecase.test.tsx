import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Editor from '../Editor';
import { PageData } from '../../types';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 100,
    getVirtualItems: () => [{ index: 0, start: 0, size: 100, key: 0 }],
  }),
}));

describe('Editor Edge Cases (Invalid Template Defense & Memo)', () => {
  const mockPage: PageData = {
    id: 'slide-1',
    type: 'slide',
    layoutId: 'unknown-missing-template-id' as any,
    aspectRatio: '16:9',
    title: 'Slide With Corrupted Layout ID',
    backgroundColor: '#ffffff',
  };

  it('safely handles missing or undefined template without throwing TypeError or white-screening', () => {
    const onUpdate = vi.fn();

    // 严防 getTemplateById 返回 undefined 时，访问 template.fields.length 发生致命崩溃
    expect(() => {
      render(
        <div id="editor-scroll-container">
          <Editor 
            page={mockPage} 
            onUpdate={onUpdate} 
            customFonts={[]} 
            pages={[mockPage]} 
          />
        </div>
      );
    }).not.toThrow();

    expect(screen.getByText(/Template \(unknown-missing-template-id\)/i)).toBeInTheDocument();
  });
});
