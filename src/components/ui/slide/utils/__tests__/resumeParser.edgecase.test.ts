import { describe, it, expect } from 'vitest';
import { parseResumeContent } from '../resumeParser';

describe('resumeParser Edge Cases (Link Regex & Sanitization)', () => {
  it('preserves text preceding links and handles multiple links in one line', () => {
    const raw = 'Developed [Project Alpha](https://alpha.com) and maintained [Project Beta](https://beta.com) successfully.';
    const html = parseResumeContent(raw, '#264376');

    // 严防贪婪匹配吃掉整行前序文字
    expect(html).toContain('Developed ');
    expect(html).toContain('Project Alpha');
    expect(html).toContain('https://alpha.com');
    expect(html).toContain(' and maintained ');
    expect(html).toContain('Project Beta');
    expect(html).toContain('https://beta.com');
    expect(html).toContain(' successfully.');
  });

  it('handles consecutive links and brackets properly', () => {
    const raw = '[Link 1](https://one.com)[Link 2](https://two.com)';
    const html = parseResumeContent(raw);

    expect(html).toContain('Link 1');
    expect(html).toContain('https://one.com');
    expect(html).toContain('Link 2');
    expect(html).toContain('https://two.com');
  });

  it('neutralizes javascript: pseudoprotocol XSS injections in markdown links', () => {
    const raw = 'Click [Exploit](javascript:alert(document.cookie)) for free cookies';
    const html = parseResumeContent(raw);

    expect(html).not.toContain('javascript:alert');
    expect(html).toContain('Exploit');
  });
});
