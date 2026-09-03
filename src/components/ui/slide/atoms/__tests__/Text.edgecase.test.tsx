import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Text } from '../Text';

describe('Text Atom Edge Cases (Math Operators & HTML Sanitization)', () => {
  it('preserves mathematical comparison symbols like < $10M without being stripped as HTML tags', () => {
    render(<Text content="Projected Revenue < $10M in FY2026" />);
    
    // 严防 DOMPurify 将 < $10M 识别为非法 HTML 标签抹除
    expect(screen.getByText('Projected Revenue < $10M in FY2026')).toBeInTheDocument();
  });

  it('preserves multiple comparison symbols in plain text', () => {
    render(<Text content="Thresholds: min < target < max && alpha > beta" />);
    
    expect(screen.getByText('Thresholds: min < target < max && alpha > beta')).toBeInTheDocument();
  });

  it('safely renders allowed HTML tags when content contains markup', () => {
    const { container } = render(<Text content="Executive <strong>Summary</strong> with <em>emphasis</em>" />);
    
    expect(container.querySelector('strong')?.textContent).toBe('Summary');
    expect(container.querySelector('em')?.textContent).toBe('emphasis');
  });

  it('sanitizes dangerous script tags when HTML is present', () => {
    const { container } = render(<Text content="Hello <b>World</b><script>alert(1)</script>" />);
    
    expect(container.querySelector('b')?.textContent).toBe('World');
    expect(container.querySelector('script')).toBeNull();
  });
});
