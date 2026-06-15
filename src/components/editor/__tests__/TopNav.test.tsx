import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopNav from '../TopNav';
import React from 'react';
import { act } from '@testing-library/react';

describe('TopNav', () => {
  const baseProps = {
    projectTitle: 'My Project',
    setProjectTitle: vi.fn(),
    fallbackTitle: 'Untitled',
    currentPageIndex: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
    previewZoom: 0.5,
    onZoomChange: vi.fn(),
    isAutoFit: true,
    onToggleAutoFit: vi.fn(),
    onExportPng: vi.fn(),
    onSave: vi.fn(),
    onSaveAs: vi.fn(),
    isExporting: false,
    showExportMenu: false,
    setShowExportMenu: vi.fn(),
    exportMenuRef: { current: null } as React.RefObject<HTMLDivElement>,
    showEditor: true,
    onToggleEditor: vi.fn(),
    canUndo: true,
    canRedo: false,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('渲染项目标题与页码', () => {
    render(<TopNav {...baseProps} />);
    expect(screen.getByDisplayValue('My Project')).toBeInTheDocument();
    expect(screen.getByText(/Slide 3 \/\/ 5/i)).toBeInTheDocument();
  });

  it('标题修改防抖调用 setProjectTitle', () => {
    render(<TopNav {...baseProps} />);
    const input = screen.getByDisplayValue('My Project') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Renamed' } });
    expect(baseProps.setProjectTitle).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(400));
    expect(baseProps.setProjectTitle).toHaveBeenCalledWith('Renamed');
  });

  it('undo / redo 在不可用时禁用', () => {
    render(<TopNav {...baseProps} canUndo={false} canRedo={false} />);
    const undo = screen.getByTitle('Undo (Ctrl+Z)');
    const redo = screen.getByTitle('Redo (Ctrl+Y)');
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
  });

  it('undo / redo 在可用时点击触发', () => {
    render(<TopNav {...baseProps} canUndo={true} canRedo={true} />);
    fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'));
    expect(baseProps.onUndo).toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Redo (Ctrl+Y)'));
    expect(baseProps.onRedo).toHaveBeenCalled();
  });

  it('缩放按钮限制在 0.1 - 1.5 之间', () => {
    render(<TopNav {...baseProps} previewZoom={0.05} />);
    const zoomOut = screen.getAllByRole('button').find((b) => b.innerHTML.includes('lucide-zoom-out'));
    expect(zoomOut).toBeTruthy();
    fireEvent.click(zoomOut!);
    expect(baseProps.onZoomChange).toHaveBeenCalledWith(0.1);
  });

  it('页面导航在边界处 clamp', () => {
    const onPageChange = vi.fn();
    render(<TopNav {...baseProps} currentPageIndex={0} totalPages={3} onPageChange={onPageChange} />);
    const left = screen.getAllByRole('button').find((b) => b.innerHTML.includes('lucide-chevron-left'));
    expect(left).toBeDisabled();
  });

  it('点击 Export 菜单并选择范围', () => {
    render(<TopNav {...baseProps} />);
    const exportBtn = screen.getByText('Export');
    fireEvent.click(exportBtn);
    expect(baseProps.setShowExportMenu).toHaveBeenCalledWith(true);
  });

  it('Save 菜单展开后点击 Save As', async () => {
    render(<TopNav {...baseProps} />);
    const chevrons = screen.getAllByRole('button').filter((b) => b.innerHTML.includes('lucide-chevron-down'));
    expect(chevrons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(chevrons[0]);
    expect(await screen.findByText('Save As')).toBeInTheDocument();
  });

  it('isExporting=true 时按钮显示导出中', () => {
    render(<TopNav {...baseProps} isExporting={true} />);
    expect(screen.getByText(/Exporting/i)).toBeInTheDocument();
  });

  it('页码导航右侧边界禁用', () => {
    render(<TopNav {...baseProps} currentPageIndex={4} totalPages={5} />);
    const right = screen.getAllByRole('button').find((b) => b.innerHTML.includes('lucide-chevron-right'));
    expect(right).toBeDisabled();
  });
});
