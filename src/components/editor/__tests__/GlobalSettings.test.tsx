import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalSettings from '../GlobalSettings';
import { useStore } from '../../../store/useStore';
import { PageData, PrintSettings, CounterStyle } from '../../../types';
import React from 'react';

vi.mock('../../FontManager', () => ({
  default: ({ fonts, onFontsChange }: any) => (
    <div data-testid="font-manager">
      Fonts: {fonts.length}
      <button onClick={() => onFontsChange([{ name: 'F', family: 'F' }])}>Add</button>
    </div>
  ),
}));

const page: PageData = {
  id: 'p1',
  type: 'slide',
  layoutId: 'modern-feature',
  aspectRatio: '16:9',
  title: 'X',
  backgroundPattern: 'none',
};

const printSettings: PrintSettings = {
  enabled: false,
  widthMm: 210,
  heightMm: 297,
  gutterMm: 10,
  showGutterShadow: false,
  showTrimShadow: false,
  showContentFrame: false,
  configs: {
    landscape: { bindingSide: 'left' as const, trimSide: 'bottom' as const },
    portrait: { bindingSide: 'left' as const, trimSide: 'bottom' as const },
    square: { bindingSide: 'left' as const, trimSide: 'bottom' as const },
    resume: { bindingSide: 'left' as const, trimSide: 'bottom' as const },
  },
};

const baseState = {
  pages: [page],
  currentPageIndex: 0,
  customFonts: [],
  imageQuality: 0.9,
  minimalCounter: false,
  counterStyle: 'number' as CounterStyle,
  printSettings,
  setPrintSettings: vi.fn(),
  setImageQuality: vi.fn(),
  setMinimalCounter: vi.fn(),
  setCounterStyle: vi.fn(),
  setCustomFonts: vi.fn(),
  updatePage: vi.fn(),
};

describe('GlobalSettings', () => {
  beforeEach(() => {
    useStore.setState(baseState, false);
    vi.clearAllMocks();
  });

  it('默认显示 General 标签', () => {
    render(<GlobalSettings />);
    expect(screen.getByText('Export & Processing')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('切换 Tabs', async () => {
    render(<GlobalSettings />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(await screen.findByText('Mechanical Print Engine')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /assets/i }));
    expect(await screen.findByTestId('font-manager')).toBeInTheDocument();
  });

  it('调整图片质量滑块调用 setImageQuality', () => {
    render(<GlobalSettings />);
    const slider = screen.getAllByRole('slider')[0];
    fireEvent.change(slider, { target: { value: '0.6' } });
    expect(baseState.setImageQuality).toHaveBeenCalledWith(0.6);
  });

  it('切换 counter style', async () => {
    render(<GlobalSettings />);
    // Counter style 是纯图标按钮;没有文案的 button 即为四个样式按钮
    const counterBtns = screen.getAllByRole('button').filter((b) => b.textContent?.trim() === '');
    expect(counterBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(counterBtns[1]);
    expect(baseState.setCounterStyle).toHaveBeenCalled();
  });

  it('切换 Minimal UI', () => {
    render(<GlobalSettings />);
    fireEvent.click(screen.getByText('Minimal UI'));
    expect(baseState.setMinimalCounter).toHaveBeenCalledWith(true);
  });

  it('切换背景图案', () => {
    render(<GlobalSettings />);
    fireEvent.click(screen.getByText('Grid'));
    expect(baseState.updatePage).toHaveBeenCalledWith(expect.objectContaining({ backgroundPattern: 'grid' }));
  });

  it('开启打印引擎', async () => {
    render(<GlobalSettings />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    fireEvent.click(await screen.findByText('Off-Line'));
    expect(baseState.setPrintSettings).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('修改打印尺寸', async () => {
    useStore.setState({ ...baseState, printSettings: { ...printSettings, enabled: true } }, false);
    render(<GlobalSettings />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    await screen.findByText('Mechanical Print Engine');
    const widthInput = screen.getByDisplayValue('210');
    fireEvent.change(widthInput, { target: { value: '250' } });
    expect(baseState.setPrintSettings).toHaveBeenCalledWith(expect.objectContaining({ widthMm: 250 }));
  });

  it('字体管理器回调', async () => {
    render(<GlobalSettings />);
    fireEvent.click(screen.getByRole('button', { name: /assets/i }));
    fireEvent.click(await screen.findByText('Add'));
    expect(baseState.setCustomFonts).toHaveBeenCalled();
  });
});
