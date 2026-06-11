import { PageData, ProjectTheme } from '../../types';

export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  [key: string]: any;
}

const MAX_EXPRESSION_DEPTH = 50;
const MAX_OBJECT_DEPTH = 20;

/**
 * ExpressionEvaluator - 处理 JSON 模板中的数据绑定表达式
 * 支持:
 * 1. 简单字段: "page.title"
 * 2. 嵌套对象: "theme.colors.primary"
 * 3. 可选链: "page.styleOverrides?.title?.fontSize"
 * 4. 字符串插值: "bg-pattern-{page.backgroundPattern}"
 */
export class ExpressionEvaluator {
  /**
   * 计算单个表达式的值
   * 支持: 
   * 1. 路径访问: "page.title"
   * 2. 空值合并: "page.backgroundColor ?? theme.colors.background ?? '#ffffff'"
   */
  evaluate(expr: string, context: EvaluationContext): any {
    if (!expr) return undefined;

    // 清理花括号
    const cleanExpr = expr.replace(/\{|\}/g, '').trim();

    // 处理三元运算符 (cond ? a : b)
    if (cleanExpr.includes(' ? ') && cleanExpr.includes(' : ')) {
      const qIndex = cleanExpr.indexOf(' ? ');
      const cIndex = cleanExpr.lastIndexOf(' : ');
      const condition = cleanExpr.slice(0, qIndex).trim();
      const trueVal = cleanExpr.slice(qIndex + 3, cIndex).trim();
      const falseVal = cleanExpr.slice(cIndex + 3).trim();

      const result = this.evaluate(condition, context);
      return result ? this.evaluatePart(trueVal, context) : this.evaluatePart(falseVal, context);
    }

    // 处理算术运算符 (+)
    if (cleanExpr.includes(' + ')) {
      const parts = cleanExpr.split(' + ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return Number(left) + Number(right);
    }

    // 处理算术运算符 (-)
    if (cleanExpr.includes(' - ')) {
      const parts = cleanExpr.split(' - ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return Number(left) - Number(right);
    }

    // 处理算术运算符 (*)
    if (cleanExpr.includes(' * ')) {
      const parts = cleanExpr.split(' * ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return Number(left) * Number(right);
    }

    // 处理算术运算符 (/)
    if (cleanExpr.includes(' / ')) {
      const parts = cleanExpr.split(' / ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return Number(left) / Number(right);
    }

    // 处理逻辑非 (!)
    if (cleanExpr.startsWith('!')) {
      const operand = cleanExpr.slice(1).trim();
      const value = this.evaluatePart(operand, context);
      return !value;
    }

    // 处理逻辑运算符 (&&)
    if (cleanExpr.includes(' && ')) {
      const parts = cleanExpr.split(' && ').map(p => p.trim());
      for (const part of parts) {
        const value = this.evaluate(part, context);
        if (!value) return false;
      }
      return true;
    }

    // 处理逻辑运算符 (||)
    if (cleanExpr.includes(' || ')) {
      const parts = cleanExpr.split(' || ').map(p => p.trim());
      for (const part of parts) {
        const value = this.evaluate(part, context);
        if (value) return value;
      }
      return false;
    }

    // 处理比较运算符 (>)
    if (cleanExpr.includes(' > ')) {
      const parts = cleanExpr.split(' > ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return left > right;
    }

    // 处理比较运算符 (<)
    if (cleanExpr.includes(' < ')) {
      const parts = cleanExpr.split(' < ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return left < right;
    }

    // 处理等于 (===)
    if (cleanExpr.includes(' === ')) {
      const parts = cleanExpr.split(' === ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return left === right;
    }

    // 处理不等于 (!==)
    if (cleanExpr.includes(' !== ')) {
      const parts = cleanExpr.split(' !== ').map(p => p.trim());
      const left = this.evaluatePart(parts[0], context);
      const right = this.evaluatePart(parts[1], context);
      return left !== right;
    }

    // 处理 typeof
    if (cleanExpr.startsWith('typeof ')) {
      const operand = cleanExpr.slice(7).trim();
      const value = this.evaluatePart(operand, context);
      return typeof value;
    }

    // 处理空值合并 (??)
    if (cleanExpr.includes('??')) {
      const parts = cleanExpr.split('??').map(p => p.trim());
      for (const part of parts) {
        const value = this.evaluatePart(part, context);
        if (value !== null && value !== undefined) {
          return value;
        }
      }
      return undefined;
    }

    return this.evaluatePart(cleanExpr, context);
  }

  /**
   * 计算表达式的一个部分 (不含 ??)
   */
  private evaluatePart(part: string, context: EvaluationContext, depth = 0): any {
    if (depth > MAX_EXPRESSION_DEPTH) {
      console.error(`Expression too deep (>${MAX_EXPRESSION_DEPTH}): ${part}`);
      return undefined;
    }
    
    // 处理字符串字面量
    if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
      return part.slice(1, -1);
    }

    // 处理布尔字面量
    if (part === 'true') return true;
    if (part === 'false') return false;

    // 处理数字
    if (!isNaN(Number(part)) && part !== '') return Number(part);

    // 路径分割：正确处理 . ?. [ ] 运算符
    // 将 ?. 替换为特殊标记后统一处理
    const normalized = part.replace(/\?\./g, '.?.');
    const segments = normalized.split(/\.(?!\?)|\[|\]/).filter(Boolean);
    
    // 防止路径过深
    if (segments.length > MAX_EXPRESSION_DEPTH) {
      console.error(`Expression path too deep (>${MAX_EXPRESSION_DEPTH} segments)`);
      return undefined;
    }
    
    let current: any = context;
    let isOptional = false;
    for (const seg of segments) {
      if (seg === '?') { isOptional = true; continue; }
      if (current === null || current === undefined) return undefined;
      current = current[seg];
      isOptional = false;
    }

    return current;
  }

  /**
   * 处理包含表达式的模板字符串
   * e.g. "bg-pattern-{page.backgroundPattern}" -> "bg-pattern-grid"
   */
  interpolate(template: string, context: EvaluationContext): string {
    if (typeof template !== 'string') return template;

    return template.replace(/\{([^}]+)\}/g, (_, expr) => {
      const value = this.evaluate(expr, context);
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * 判断一个值是否包含表达式
   */
  hasExpression(value: any): boolean {
    return typeof value === 'string' && /\{([^}]+)\}/.test(value);
  }

  /**
   * 递归处理对象中的所有表达式
   */
  evaluateObject(obj: any, context: EvaluationContext, depth = 0): any {
    if (depth > MAX_OBJECT_DEPTH) {
      console.warn(`Object evaluation depth exceeded (>${MAX_OBJECT_DEPTH}), returning as-is`);
      return obj;
    }
    
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.evaluateObject(item, context, depth + 1));
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.evaluateObject(obj[key], context, depth + 1);
      }
      return result;
    }

    if (typeof obj === 'string') {
      if (this.hasExpression(obj)) {
        // 如果整个字符串就是一个表达式 e.g. "{page.logoSize}", 尝试保持原始类型
        if (obj.startsWith('{') && obj.endsWith('}') && obj.indexOf('{', 1) === -1) {
          const result = this.evaluate(obj, context);
          return result;
        }
        return this.interpolate(obj, context);
      }
      // 判断是否为表达式（包含运算符或数据路径）
      const hasOperator = obj.includes('?') || obj.includes('&&') || obj.includes('||') || 
                          obj.includes('===') || obj.includes('!==') || 
                          obj.includes(' > ') || obj.includes(' < ');
      const hasContextPath = obj.includes('.');
      
      if (hasOperator || hasContextPath) {
        const firstSegment = obj.split(/[.?\s(]/, 1)[0];
        // 如果第一个 segment 在 context 中，或者包含运算符，就求值
        if ((firstSegment && context.hasOwnProperty(firstSegment)) || hasOperator) {
          return this.evaluate(obj, context);
        }
      }
      // 纯字面量字符串，直接返回
      return obj;
    }

    return obj;
  }
}

export const evaluator = new ExpressionEvaluator();
