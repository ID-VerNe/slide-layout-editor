import { describe, it, expect } from 'vitest';
import { evaluator } from '../expressionEvaluator';
import { PageData, ProjectTheme } from '../../../types';
import { DEFAULT_THEME } from '../../../constants/theme';

const mockPage: PageData = {
  id: 'test-page',
  type: 'slide',
  layoutId: 'test-layout',
  aspectRatio: '16:9',
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  backgroundColor: '#ffffff',
  visibility: { logo: true, pageNumber: false },
};

const mockTheme: ProjectTheme = DEFAULT_THEME;

const mockContext = {
  page: mockPage,
  theme: mockTheme,
  index: 0,
};

describe('Expression Evaluator', () => {
  describe('evaluate - 表达式求值', () => {
    it('应求值简单属性访问', () => {
      expect(evaluator.evaluate('page.title', mockContext)).toBe('Test Title');
      expect(evaluator.evaluate('page.subtitle', mockContext)).toBe('Test Subtitle');
    });

    it('应求值嵌套属性访问', () => {
      expect(evaluator.evaluate('page.visibility.logo', mockContext)).toBe(true);
      expect(evaluator.evaluate('page.visibility.pageNumber', mockContext)).toBe(false);
    });

    it('应求值数值运算', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('page.counter + 8', contextWithCounter)).toBe(50);
      expect(evaluator.evaluate('page.counter * 2', contextWithCounter)).toBe(84);
      expect(evaluator.evaluate('page.counter - 10', contextWithCounter)).toBe(32);
    });

    it('应求值布尔表达式', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('page.title === "Test Title"', mockContext)).toBe(true);
      expect(evaluator.evaluate('page.counter > 40', contextWithCounter)).toBe(true);
      expect(evaluator.evaluate('page.counter < 40', contextWithCounter)).toBe(false);
      expect(evaluator.evaluate('page.visibility.logo && true', mockContext)).toBe(true);
    });

    it('应支持逻辑运算', () => {
      expect(evaluator.evaluate('page.title && page.subtitle', mockContext)).toBeTruthy();
      expect(evaluator.evaluate('page.title || page.subtitle', mockContext)).toBe('Test Title');
      expect(evaluator.evaluate('!page.visibility.pageNumber', mockContext)).toBe(true);
    });

    it('应处理 undefined 属性', () => {
      expect(evaluator.evaluate('page.nonExistent', mockContext)).toBeUndefined();
    });

    it('应支持三元运算符', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('page.counter > 40 ? "big" : "small"', contextWithCounter)).toBe('big');
      expect(evaluator.evaluate('page.title ? "has title" : "no title"', mockContext)).toBe('has title');
    });

    it('应支持 >= 和 <= 比较', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('page.counter >= 42', contextWithCounter)).toBe(true);
      expect(evaluator.evaluate('page.counter >= 43', contextWithCounter)).toBe(false);
      expect(evaluator.evaluate('page.counter <= 42', contextWithCounter)).toBe(true);
      expect(evaluator.evaluate('page.counter <= 41', contextWithCounter)).toBe(false);
    });

    it('应遵循算术优先级与括号', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('2 + 3 * 4', contextWithCounter)).toBe(14);
      expect(evaluator.evaluate('(2 + 3) * 4', contextWithCounter)).toBe(20);
      expect(evaluator.evaluate('page.counter - 2 * 10', contextWithCounter)).toBe(22);
    });

    it('应支持可选链访问', () => {
      const optionalContext = {
        ...mockContext,
        page: {
          ...mockPage,
          styleOverrides: { title: { fontSize: 64 } },
        },
      };
      expect(evaluator.evaluate('page.styleOverrides?.title?.fontSize', optionalContext)).toBe(64);
      expect(evaluator.evaluate('page.missing?.deep?.value', optionalContext)).toBeUndefined();
    });

    it('除零应返回 Infinity 或 NaN 且不抛错', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('page.counter / 0', contextWithCounter)).toBe(Infinity);
      expect(evaluator.evaluate('0 / 0', contextWithCounter)).toBeNaN();
    });
  });

  describe('interpolate - 字符串插值', () => {
    it('应插值单个变量', () => {
      expect(evaluator.interpolate('{page.title}', mockContext)).toBe('Test Title');
      expect(evaluator.interpolate('{page.subtitle}', mockContext)).toBe('Test Subtitle');
    });

    it('应插值多个变量', () => {
      expect(evaluator.interpolate('{page.title} - {page.subtitle}', mockContext)).toBe(
        'Test Title - Test Subtitle'
      );
    });

    it('应插值表达式', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.interpolate('Page {index + 1}', mockContext)).toBe('Page 1');
      expect(evaluator.interpolate('Count: {page.counter * 2}', contextWithCounter)).toBe('Count: 84');
    });

    it('应处理纯文本', () => {
      expect(evaluator.interpolate('No variables here', mockContext)).toBe('No variables here');
    });

    it('应处理空字符串', () => {
      expect(evaluator.interpolate('', mockContext)).toBe('');
    });

    it('应处理混合内容', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      const result = evaluator.interpolate(
        'Title: {page.title}, Count: {page.counter}, Result: {page.counter > 40 ? "High" : "Low"}',
        contextWithCounter
      );
      expect(result).toBe('Title: Test Title, Count: 42, Result: High');
    });
  });

  describe('evaluateObject - 对象求值', () => {
    it('应求值对象的所有属性', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      const input = {
        color: 'page.backgroundColor',
        fontSize: 'page.counter',
        display: 'page.visibility.logo ? "block" : "none"',
      };

      const result = evaluator.evaluateObject(input, contextWithCounter);

      expect(result.color).toBe('#ffffff');
      expect(result.fontSize).toBe(42);
      expect(result.display).toBe('block');
    });

    it('应保留非字符串值', () => {
      const input = {
        width: 100,
        height: 200,
        visible: true,
      };

      const result = evaluator.evaluateObject(input, mockContext);

      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
      expect(result.visible).toBe(true);
    });

    it('应处理嵌套对象', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      const input = {
        style: {
          color: 'page.backgroundColor',
          fontSize: 'page.counter',
        },
      };

      const result = evaluator.evaluateObject(input, contextWithCounter);

      expect(result.style.color).toBe('#ffffff');
      expect(result.style.fontSize).toBe(42);
    });

    it('应处理空对象', () => {
      const result = evaluator.evaluateObject({}, mockContext);
      expect(result).toEqual({});
    });
  });

  describe('边界情况', () => {
    it('应安全处理无效表达式', () => {
      expect(() => evaluator.evaluate('invalid..syntax', mockContext)).not.toThrow();
    });

    it('应处理 null context', () => {
      expect(() => evaluator.evaluate('page.title', {} as any)).not.toThrow();
    });

    it('应处理复杂嵌套访问', () => {
      const complexContext = {
        ...mockContext,
        data: {
          nested: {
            deep: {
              value: 'found',
            },
          },
        },
      };

      expect(evaluator.evaluate('data.nested.deep.value', complexContext)).toBe('found');
    });
  });

  describe('特殊语法支持', () => {
    it('应支持数组访问', () => {
      const contextWithArray = {
        ...mockContext,
        page: {
          ...mockPage,
          items: ['first', 'second', 'third'],
        },
      };

      expect(evaluator.evaluate('page.items[0]', contextWithArray)).toBe('first');
      expect(evaluator.evaluate('page.items[2]', contextWithArray)).toBe('third');
    });

    it('应支持 typeof 检查', () => {
      const pageWithCounter = { ...mockPage, counter: 42 };
      const contextWithCounter = { ...mockContext, page: pageWithCounter };
      expect(evaluator.evaluate('typeof page.title', mockContext)).toBe('string');
      expect(evaluator.evaluate('typeof page.counter', contextWithCounter)).toBe('number');
    });
  });

  describe('nullish coalescing 与短路边界', () => {
    it('?? 在 null/undefined 时取右值', () => {
      expect(evaluator.evaluate('page.missing ?? "fallback"', mockContext)).toBe('fallback');
      const nullishContext = { ...mockContext, page: { ...mockPage, missing: null } };
      expect(evaluator.evaluate('page.missing ?? "fallback"', nullishContext)).toBe('fallback');
    });

    it('?? 在 0 / false 时短路保留左值', () => {
      const zeroContext = { ...mockContext, page: { ...mockPage, counter: 0 } };
      expect(evaluator.evaluate('page.counter ?? -1', zeroContext)).toBe(0);
      const falseContext = { ...mockContext, page: { ...mockPage, flag: false } };
      expect(evaluator.evaluate('page.flag ?? true', falseContext)).toBe(false);
    });

    it('|| 在 falsy 值时取右值', () => {
      const zeroContext = { ...mockContext, page: { ...mockPage, counter: 0 } };
      expect(evaluator.evaluate('page.counter || 99', zeroContext)).toBe(99);
      const emptyContext = { ...mockContext, page: { ...mockPage, title: '' } };
      expect(evaluator.evaluate('page.title || "default"', emptyContext)).toBe('default');
    });
  });

  describe('非法表达式安全降级', () => {
    it('不支持的函数调用不抛错', () => {
      expect(evaluator.evaluate('Math.max(1, 2)', mockContext)).toBeUndefined();
    });

    it('语法错误返回 undefined', () => {
      expect(evaluator.evaluate('..', mockContext)).toBeUndefined();
      expect(evaluator.evaluate('(1 + 2', mockContext)).toBeUndefined();
    });

    it('typeof 访问未定义路径返回 undefined', () => {
      expect(evaluator.evaluate('typeof page.missing.deep', mockContext)).toBe('undefined');
    });
  });

  describe('辅助 API', () => {
    it('hasExpression 识别含 { } 的字符串', () => {
      expect(evaluator.hasExpression('Hello {page.title}')).toBe(true);
      expect(evaluator.hasExpression('Plain text')).toBe(false);
    });

    it('evaluateObject 对纯字段路径字符串求值', () => {
      const result = evaluator.evaluateObject({ color: 'page.backgroundColor' }, mockContext);
      expect(result.color).toBe('#ffffff');
    });

    it('evaluate 对非字符串输入按源码语义返回', () => {
      expect(evaluator.evaluate(123 as any, mockContext)).toBe(123);
      expect(evaluator.evaluate({ answer: 42 } as any, mockContext)).toEqual({ answer: 42 });
      expect(evaluator.evaluate('', mockContext)).toBeUndefined();
      expect(evaluator.evaluate(null as any, mockContext)).toBeUndefined();
    });

    it('interpolate 对非字符串输入原样返回', () => {
      expect(evaluator.interpolate(null as any, mockContext)).toBeNull();
    });
  });
});
