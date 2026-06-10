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

    it('应支持字符串比较', () => {
      expect(evaluator.evaluate('page.layoutId === "test-layout"', mockContext)).toBe(true);
      expect(evaluator.evaluate('page.aspectRatio !== "4:3"', mockContext)).toBe(true);
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
});
