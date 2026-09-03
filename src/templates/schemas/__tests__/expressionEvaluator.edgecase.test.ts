import { describe, it, expect } from 'vitest';
import { evaluator } from '../expressionEvaluator';

describe('expressionEvaluator Edge Cases (Natural Text vs Real Expressions)', () => {
  const mockContext: any = {
    page: {
      title: 'Annual Review',
      counter: 10,
      visibility: { logo: true },
      layoutId: 'modern-feature',
    },
    theme: {
      colors: { accent: '#264376' },
    },
    item: {
      name: 'Item 1',
    },
    index: 0,
  };

  it('does NOT evaluate plain language phrases starting with context identifiers as expressions', () => {
    const input = {
      pageText: 'page 1 of 10',
      themeText: 'theme for the 2026 symposium',
      itemText: 'item description and notes',
      kebabText: 'page-header text-slate-800',
    };

    const result = evaluator.evaluateObject(input, mockContext);

    // 严防 "page 1" 被篡改为 [object Object]，或 "page-header" 被篡改为 NaN
    expect(result.pageText).toBe('page 1 of 10');
    expect(result.themeText).toBe('theme for the 2026 symposium');
    expect(result.itemText).toBe('item description and notes');
    expect(result.kebabText).toBe('page-header text-slate-800');
  });

  it('correctly evaluates genuine bare property paths and ternary expressions', () => {
    const input = {
      title: 'page.title',
      accent: 'theme.colors.accent',
      display: 'page.visibility.logo ? "block" : "none"',
      calc: 'page.counter + 5',
    };

    const result = evaluator.evaluateObject(input, mockContext);

    expect(result.title).toBe('Annual Review');
    expect(result.accent).toBe('#264376');
    expect(result.display).toBe('block');
    expect(result.calc).toBe(15);
  });
});
