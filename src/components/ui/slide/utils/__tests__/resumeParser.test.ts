import { describe, it, expect } from 'vitest';
import { parseResumeContent, parseResumeDescription } from '../resumeParser';

describe('resumeParser', () => {
  it('正确解析并净化行内 Markdown', () => {
    const raw = 'Check out [My Site](https://example.com) with **bold** and `code`';
    const html = parseResumeContent(raw, '#ff0000');
    expect(html).toContain('class="resume-link');
    expect(html).toContain('style="color: #ff0000"');
    expect(html).toContain('<strong class="font-extrabold text-zine-primary">bold</strong>');
    expect(html).toContain('<code class="bg-zine-accent/10');
  });

  it('正确拆分多行描述文本为结构化列表项', () => {
    const raw = '- First item\n* Second item\nNormal line';
    const bullets = parseResumeDescription(raw);
    expect(bullets).toHaveLength(3);
    expect(bullets[0]).toEqual({ isBullet: true, cleanText: 'First item' });
    expect(bullets[1]).toEqual({ isBullet: true, cleanText: 'Second item' });
    expect(bullets[2]).toEqual({ isBullet: false, cleanText: 'Normal line' });
  });

  it('空文本安全处理', () => {
    expect(parseResumeContent('')).toBe('');
    expect(parseResumeDescription(undefined)).toEqual([]);
  });
});
