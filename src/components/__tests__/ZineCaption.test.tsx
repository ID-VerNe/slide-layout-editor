import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZineCaption } from '../ui/slide/atoms/ZineCaption';
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
  title: 'Title',
  subtitle: 'Sub',
  imageLabel: 'Image Label',
  footer: 'Footer Text',
  backgroundColor: '#fff',
  visibility: {},
} as any;

describe('ZineCaption', () => {
  it('使用 text prop 渲染内容', () => {
    render(<ZineCaption page={mockPage} text="Hello Caption" />);
    expect(screen.getByText('Hello Caption')).toBeInTheDocument();
  });

  it('使用 fieldKey 从 page 提取内容', () => {
    render(<ZineCaption page={mockPage} fieldKey="footer" />);
    expect(screen.getByText('Footer Text')).toBeInTheDocument();
  });

  it('fieldKey 对应字段为空时返回 null', () => {
    const { container } = render(
      <ZineCaption page={mockPage} fieldKey="nonexistent" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('visibility 为 false 时返回 null', () => {
    const page = {
      ...mockPage,
      visibility: { imageLabel: false },
    };
    const { container } = render(
      <ZineCaption page={page as any} fieldKey="imageLabel" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('无 fieldKey 时默认可见', () => {
    render(<ZineCaption page={mockPage} text="Always visible" />);
    expect(screen.getByText('Always visible')).toBeInTheDocument();
  });
});
