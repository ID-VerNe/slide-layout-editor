import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZineDivider } from '../ui/slide/atoms/ZineDivider';
import { DEFAULT_DESIGN_SYSTEM, DEFAULT_THEME } from '../../constants/theme';
import { PageData } from '../../types';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector: any) => {
    const mockState = {
      designSystem: DEFAULT_DESIGN_SYSTEM,
      theme: DEFAULT_THEME,
    };
    return selector(mockState);
  }),
}));

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test',
  aspectRatio: '16:9',
  title: 'T',
  backgroundColor: '#fff',
  visibility: {},
} as any;

describe('ZineDivider', () => {
  it('水平分割线默认宽度 100%', () => {
    const { container } = render(<ZineDivider page={mockPage} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('100%');
  });

  it('垂直分割线默认高度 100%', () => {
    const { container } = render(
      <ZineDivider page={mockPage} orientation="vertical" />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe('100%');
  });

  it('thickness 数字自动补 px', () => {
    const { container } = render(
      <ZineDivider page={mockPage} thickness={3} />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe('3px');
  });

  it('thickness 字符串直接使用', () => {
    const { container } = render(
      <ZineDivider page={mockPage} thickness="2px" />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe('2px');
  });

  it('fieldKey visibility 为 false 时返回 null', () => {
    const page = { ...mockPage, visibility: { divider: false } };
    const { container } = render(
      <ZineDivider page={page as any} fieldKey="divider" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('渲染 zine-divider className', () => {
    const { container } = render(<ZineDivider page={mockPage} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('zine-divider');
  });
});
