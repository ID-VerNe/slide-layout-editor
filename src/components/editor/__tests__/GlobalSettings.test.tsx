import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalSettings from '../GlobalSettings';
import { PageData, PrintSettings, ProjectTheme } from '../../../types';
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

const baseProps = {
  page,
  onUpdate: vi.fn(),
  customFonts: [],
  setCustomFonts: vi.fn(),
  theme: { colors: {} as any, typography: { headingFont: '', bodyFont: '' } } as ProjectTheme,
  setTheme: vi.fn(),
  imageQuality: 0.9,
  setImageQuality: vi.fn(),
  minimalCounter: false,
  setMinimalCounter: vi.fn(),
  counterStyle: 'number' as const,
  setCounterStyle: vi.fn(),
  counterColor: '#000',
  setCounterColor: vi.fn(),
  printSettings,
  setPrintSettings: vi.fn(),
};

describe('GlobalSettings', () => {
  it('默认显示 General 标签', () => {
    render(<GlobalSettings {...baseProps} />);
    expect(screen.getByText('Export & Processing')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('切换 Tabs', async () => {
    render(<GlobalSettings {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(await screen.findByText('Mechanical Print Engine')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /assets/i }));
    expect(await screen.findByTestId('font-manager')).toBeInTheDocument();
  });

  it('调整图片质量滑块调用 setImageQuality', () => {
    render(<GlobalSettings {...baseProps} />);
    const slider = screen.getAllByRole('slider')[0];
    fireEvent.change(slider, { target: { value: '0.6' } });
    expect(baseProps.setImageQuality).toHaveBeenCalledWith(0.6);
  });

  it('切换 counter style', async () => {
    render(<GlobalSettings {...baseProps} />);
    // Counter style 是纯图标按钮；没有文案的 button 即为四个样式按钮
    const counterBtns = screen.getAllByRole('button').filter((b) => b.textContent?.trim() === '');
    expect(counterBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(counterBtns[1]);
    expect(baseProps.setCounterStyle).toHaveBeenCalled();
  });

  it('切换 Minimal UI', () => {
    render(<GlobalSettings {...baseProps} />);
    fireEvent.click(screen.getByText('Minimal UI'));
    expect(baseProps.setMinimalCounter).toHaveBeenCalledWith(true);
  });

  it('切换背景图案', () => {
    render(<GlobalSettings {...baseProps} />);
    fireEvent.click(screen.getByText('Grid'));
    expect(baseProps.onUpdate).toHaveBeenCalledWith(expect.objectContaining({ backgroundPattern: 'grid' }));
  });

  it('开启打印引擎', async () => {
    render(<GlobalSettings {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    fireEvent.click(await screen.findByText('Off-Line'));
    expect(baseProps.setPrintSettings).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('修改打印尺寸', async () => {
    render(<GlobalSettings {...baseProps} printSettings={{ ...printSettings, enabled: true }} />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    await screen.findByText('Mechanical Print Engine');
    const widthInput = screen.getByDisplayValue('210');
    fireEvent.change(widthInput, { target: { value: '250' } });
    expect(baseProps.setPrintSettings).toHaveBeenCalledWith(expect.objectContaining({ widthMm: 250 }));
  });

  it('字体管理器回调', async () => {
    render(<GlobalSettings {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /assets/i }));
    fireEvent.click(await screen.findByText('Add'));
    expect(baseProps.setCustomFonts).toHaveBeenCalled();
  });
});
