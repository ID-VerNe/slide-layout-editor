import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZineBody } from '../ui/slide/atoms/ZineBody';
import { DEFAULT_DESIGN_SYSTEM, DEFAULT_THEME } from '../../constants/theme';
import { PageData } from '../../types';

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test',
  aspectRatio: '16:9',
  title: 'Title',
  paragraph: 'Body paragraph text',
  backgroundColor: '#fff',
  visibility: {},
} as any;

describe('ZineBody', () => {
  it('使用 text prop 渲染内容', () => {
    render(<ZineBody page={mockPage} text="Body text" designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME} />);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('使用 fieldKey 从 page 提取内容', () => {
    render(<ZineBody page={mockPage} fieldKey="paragraph" designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME} />);
    expect(screen.getByText('Body paragraph text')).toBeInTheDocument();
  });

  it('无 text 且无 fieldKey 时回退到 page.paragraph', () => {
    render(<ZineBody page={mockPage} designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME} />);
    expect(screen.getByText('Body paragraph text')).toBeInTheDocument();
  });

  it('fieldKey visibility 为 false 时返回 null', () => {
    const page = { ...mockPage, visibility: { paragraph: false } };
    const { container } = render(
      <ZineBody page={page as any} fieldKey="paragraph" designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('内容为空时返回 null', () => {
    const page = { ...mockPage, paragraph: '' };
    const { container } = render(
      <ZineBody page={page as any} designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME} />
    );
    expect(container.innerHTML).toBe('');
  });
});
