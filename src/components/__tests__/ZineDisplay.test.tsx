import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZineDisplay } from '../ui/slide/atoms/ZineDisplay';
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
  title: 'Display Title',
  subtitle: 'Sub',
  backgroundColor: '#fff',
  visibility: {},
} as any;

describe('ZineDisplay', () => {
  it('使用 text prop 渲染内容', () => {
    render(<ZineDisplay page={mockPage} text="Big Headline" />);
    expect(screen.getByText('Big Headline')).toBeInTheDocument();
  });

  it('使用 fieldKey 从 page 提取内容', () => {
    render(<ZineDisplay page={mockPage} fieldKey="title" />);
    expect(screen.getByText('Display Title')).toBeInTheDocument();
  });

  it('无 text 且无 fieldKey 时回退到 page.title', () => {
    render(<ZineDisplay page={mockPage} />);
    expect(screen.getByText('Display Title')).toBeInTheDocument();
  });

  it('fieldKey visibility 为 false 时返回 null', () => {
    const page = { ...mockPage, visibility: { title: false } };
    const { container } = render(
      <ZineDisplay page={page as any} fieldKey="title" />
    );
    expect(container.innerHTML).toBe('');
  });
});
