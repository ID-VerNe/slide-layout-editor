import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewArea from '../PreviewArea';
import { PageData } from '../../../types';
import React from 'react';

vi.mock('../../Preview', () => ({
  default: ({ page, pageIndex }: any) => <div data-testid="preview" data-page={page.id} data-index={pageIndex}>Preview</div>,
}));

const page = (id: string): PageData => ({
  id,
  type: 'slide',
  layoutId: 'modern-feature',
  aspectRatio: '16:9',
  title: id,
});

describe('PreviewArea', () => {
  const baseProps = {
    pages: [page('p1'), page('p2')],
    currentPageIndex: 0,
    previewZoom: 0.8,
    previewRef: React.createRef<HTMLDivElement>(),
    previewContainerRef: React.createRef<HTMLDivElement>(),
    enforceA4: false,
    isAutoFit: true,
    setIsAutoFit: vi.fn(),
    printSettings: { enabled: false } as any,
    onOverflowChange: vi.fn(),
    onUpdatePage: vi.fn(),
    handleManualZoom: vi.fn(),
    toggleFit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染当前页的 Preview', () => {
    render(<PreviewArea {...baseProps} />);
    expect(screen.getByTestId('preview')).toHaveAttribute('data-page', 'p1');
  });

  it('普通滚轮平移画布并关闭自动适配', () => {
    const setIsAutoFit = vi.fn();
    const { container } = render(<PreviewArea {...baseProps} setIsAutoFit={setIsAutoFit} />);
    const area = container.firstChild as HTMLElement;

    fireEvent.wheel(area, { deltaX: 10, deltaY: 20 });
    expect(setIsAutoFit).toHaveBeenCalledWith(false);
  });

  it('Ctrl + 滚轮缩放', () => {
    const handleManualZoom = vi.fn();
    const { container } = render(<PreviewArea {...baseProps} isAutoFit={false} handleManualZoom={handleManualZoom} previewZoom={0.5} />);
    const area = container.firstChild as HTMLElement;

    fireEvent.wheel(area, { ctrlKey: true, deltaY: -10 });
    expect(handleManualZoom).toHaveBeenCalledWith(0.6);
  });

  it('拖拽平移', () => {
    const setIsAutoFit = vi.fn();
    const { container } = render(<PreviewArea {...baseProps} setIsAutoFit={setIsAutoFit} />);
    const area = container.firstChild as HTMLElement;

    fireEvent.mouseDown(area, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(area, { clientX: 120, clientY: 130 });
    fireEvent.mouseUp(area);

    expect(setIsAutoFit).toHaveBeenCalledWith(false);
  });

  it('双击重置位置', () => {
    const { container } = render(<PreviewArea {...baseProps} isAutoFit={false} />);
    const area = container.firstChild as HTMLElement;
    const scroller = area.querySelector('.magazine-canvas-scaler') as HTMLElement;

    fireEvent.mouseDown(area, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(area, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(area);
    expect(scroller.style.transform).toContain('translate(50px, 50px)');

    fireEvent.doubleClick(area);
    expect(scroller.style.transform).toContain('translate(0px, 0px)');
  });

  it('Ctrl + 双击切换 fit', () => {
    const toggleFit = vi.fn();
    const { container } = render(<PreviewArea {...baseProps} toggleFit={toggleFit} />);
    const area = container.firstChild as HTMLElement;

    fireEvent.doubleClick(area, { ctrlKey: true });
    expect(toggleFit).toHaveBeenCalled();
  });

  it('自动适配时切换页面会重置 dragOffset', () => {
    const { container, rerender } = render(<PreviewArea {...baseProps} isAutoFit={true} currentPageIndex={0} />);
    const area = container.firstChild as HTMLElement;

    fireEvent.wheel(area, { deltaX: 10, deltaY: 20 });
    const scroller = area.querySelector('.magazine-canvas-scaler') as HTMLElement;
    expect(scroller.style.transform).not.toContain('translate(0px, 0px)');

    rerender(<PreviewArea {...baseProps} isAutoFit={true} currentPageIndex={1} />);
    expect(scroller.style.transform).toContain('translate(0px, 0px)');
  });
});
