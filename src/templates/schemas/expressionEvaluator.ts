import { PageData, ProjectTheme } from '../../types';

export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  [key: string]: any;
}

const MAX_EXPRESSION_DEPTH = 50;
const MAX_OBJECT_DEPTH = 20;

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'identifier'; value: string }
  | { type: 'operator'; value: string }
  | { type: 'punct'; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // 字符串字面量
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = '';
      i++;
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === '\\' && i + 1 < expr.length) {
          const next = expr[i + 1];
          if (next === 'n') value += '\n';
          else if (next === 't') value += '\t';
          else value += next;
          i += 2;
          continue;
        }
        value += expr[i];
        i++;
      }
      i++; // 跳过结束引号
      tokens.push({ type: 'string', value });
      continue;
    }

    // 数字
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(expr[i + 1]))) {
      let num = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: Number(num) });
      continue;
    }

    // 标识符 / 关键字
    if (/[A-Za-z_$]/.test(ch)) {
      let id = '';
      while (i < expr.length && /[A-Za-z0-9_$]/.test(expr[i])) {
        id += expr[i];
        i++;
      }
      if (id === 'true') tokens.push({ type: 'boolean', value: true });
      else if (id === 'false') tokens.push({ type: 'boolean', value: false });
      else tokens.push({ type: 'identifier', value: id });
      continue;
    }

    // 长度 3/2 的运算符优先于单字符
    const three = expr.slice(i, i + 3);
    if (three === '===' || three === '!==') {
      tokens.push({ type: 'operator', value: three });
      i += 3;
      continue;
    }

    const two = expr.slice(i, i + 2);
    if (['==', '!=', '>=', '<=', '&&', '||', '??', '?.'].includes(two)) {
      tokens.push({ type: 'operator', value: two });
      i += 2;
      continue;
    }

    // 单字符
    if (['+', '-', '*', '/', '>', '<', '(', ')', '[', ']', '.', '?', ':', '!'].includes(ch)) {
      let type: Token['type'] = 'operator';
      if (ch === '.' || ch === '?' || ch === ':') type = 'punct';
      tokens.push({ type, value: ch });
      i++;
      continue;
    }

    // 无法识别的字符，跳过以避免死循环
    i++;
  }

  return tokens;
}

function getTokenValue(token: Token): string {
  return token.value as string;
}

class Parser {
  private pos = 0;
  private depth = 0;

  constructor(private tokens: Token[], private context: EvaluationContext) {}

  parseExpression(): any {
    this.depth++;
    if (this.depth > MAX_EXPRESSION_DEPTH) {
      this.depth--;
      console.warn(`Expression depth exceeded in: ${this.stringifyTokens()}`);
      return undefined;
    }
    const result = this.parseTernary();
    this.depth--;
    return result;
  }

  private stringifyTokens(): string {
    return this.tokens
      .map((t) => (t.type === 'string' ? `"${t.value}"` : String(t.value)))
      .join(' ');
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(expected?: string): Token {
    const token = this.tokens[this.pos];
    if (!token) {
      throw new SyntaxError(`Unexpected end of expression, expected: ${expected || 'token'}`);
    }
    if (expected && getTokenValue(token) !== expected) {
      throw new SyntaxError(`Expected ${expected}, got ${getTokenValue(token)}`);
    }
    this.pos++;
    return token;
  }

  private match(...values: string[]): boolean {
    const token = this.peek();
    return token ? values.includes(getTokenValue(token)) : false;
  }

  private parseTernary(): any {
    const condition = this.parseNullish();
    if (this.match('?')) {
      this.consume('?');
      const trueBranch = this.parseExpression();
      this.consume(':');
      const falseBranch = this.parseExpression();
      return condition ? trueBranch : falseBranch;
    }
    return condition;
  }

  private parseNullish(): any {
    let left = this.parseOr();
    while (this.match('??')) {
      this.consume('??');
      if (left !== null && left !== undefined) {
        // 短路：消费掉后续 ?? 的右操作数以保持语法完整
        this.parseOr();
      } else {
        left = this.parseOr();
      }
    }
    return left;
  }

  private parseOr(): any {
    let left = this.parseAnd();
    while (this.match('||')) {
      this.consume('||');
      if (left) {
        this.parseAnd();
      } else {
        left = this.parseAnd();
      }
    }
    return left;
  }

  private parseAnd(): any {
    let left = this.parseEquality();
    while (this.match('&&')) {
      this.consume('&&');
      if (!left) {
        this.parseEquality();
      } else {
        left = this.parseEquality();
      }
    }
    return left;
  }

  private parseEquality(): any {
    let left = this.parseComparison();
    while (this.match('===', '==', '!==', '!=')) {
      const op = getTokenValue(this.consume());
      const right = this.parseComparison();
      if (op === '===') left = left === right;
      else if (op === '==') left = left == right;
      else if (op === '!==') left = left !== right;
      else left = left != right;
    }
    return left;
  }

  private parseComparison(): any {
    let left = this.parseAdditive();
    while (this.match('>', '<', '>=', '<=')) {
      const op = getTokenValue(this.consume());
      const right = this.parseAdditive();
      if (op === '>') left = left > right;
      else if (op === '<') left = left < right;
      else if (op === '>=') left = left >= right;
      else left = left <= right;
    }
    return left;
  }

  private parseAdditive(): any {
    let left = this.parseMultiplicative();
    while (this.match('+', '-')) {
      const op = getTokenValue(this.consume());
      const right = this.parseMultiplicative();
      const l = Number(left);
      const r = Number(right);
      if (op === '+') left = l + r;
      else left = l - r;
    }
    return left;
  }

  private parseMultiplicative(): any {
    let left = this.parseUnary();
    while (this.match('*', '/')) {
      const op = getTokenValue(this.consume());
      const right = this.parseUnary();
      const l = Number(left);
      const r = Number(right);
      if (op === '*') {
        left = l * r;
      } else {
        if (r === 0) {
          console.warn(`Division by zero in expression: ${this.stringifyTokens()}`);
          left = l === 0 ? NaN : (l > 0 ? Infinity : -Infinity);
        } else {
          left = l / r;
        }
      }
    }
    return left;
  }

  private parseUnary(): any {
    if (this.match('!')) {
      this.consume('!');
      return !this.parseUnary();
    }
    if (this.match('-')) {
      this.consume('-');
      return -Number(this.parseUnary());
    }
    if (this.match('typeof')) {
      this.consume('typeof');
      return typeof this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): any {
    const token = this.peek();
    if (!token) {
      throw new SyntaxError('Unexpected end of expression');
    }

    if (token.type === 'number' || token.type === 'string' || token.type === 'boolean') {
      this.consume();
      return token.value;
    }

    if (token.type === 'identifier') {
      this.consume();
      let value = this.context[token.value];
      return this.parseMember(value);
    }

    if (this.match('(')) {
      this.consume('(');
      const value = this.parseExpression();
      this.consume(')');
      return value;
    }

    this.consume(); // 跳过无法识别的 token
    return undefined;
  }

  private parseMember(current: any): any {
    while (true) {
      if (this.match('.')) {
        this.consume('.');
        const token = this.peek();
        if (!token || token.type !== 'identifier') {
          throw new SyntaxError('Expected property name after "."');
        }
        this.consume();
        if (current == null) return undefined;
        current = current[getTokenValue(token)];
      } else if (this.match('?.')) {
        this.consume('?.');
        const token = this.peek();
        if (!token || token.type !== 'identifier') {
          throw new SyntaxError('Expected property name after "?."');
        }
        this.consume();
        if (current == null) return undefined;
        current = current[getTokenValue(token)];
      } else if (this.match('[')) {
        this.consume('[');
        const index = this.parseExpression();
        this.consume(']');
        if (current == null) return undefined;
        current = current[index];
      } else {
        break;
      }
    }
    return current;
  }
}

/**
 * ExpressionEvaluator - 处理 JSON 模板中的数据绑定表达式
 * 支持:
 * 1. 简单字段: "page.title"
 * 2. 嵌套对象: "theme.colors.primary"
 * 3. 可选链: "page.styleOverrides?.title?.fontSize"
 * 4. 字符串插值: "bg-pattern-{page.backgroundPattern}"
 * 5. 算术/比较/逻辑/三元运算符、括号优先级
 */
export class ExpressionEvaluator {
  /**
   * 计算单个表达式的值
   */
  evaluate(expr: string, context: EvaluationContext): any {
    if (!expr) return undefined;
    if (typeof expr !== 'string') return expr;

    let cleanExpr = expr.trim();

    // 仅去掉最外层包裹的 { }
    if (cleanExpr.startsWith('{') && cleanExpr.endsWith('}')) {
      cleanExpr = cleanExpr.slice(1, -1).trim();
    }

    try {
      const tokens = tokenize(cleanExpr);
      if (tokens.length === 0) return undefined;
      return new Parser(tokens, context).parseExpression();
    } catch (err: any) {
      console.warn('[ExpressionEvaluator] Failed to evaluate:', expr, err?.message || err);
      return undefined;
    }
  }

  /**
   * 处理包含表达式的模板字符串
   * e.g. "bg-pattern-{page.backgroundPattern}" -> "bg-pattern-grid"
   */
  interpolate(template: string, context: EvaluationContext): string {
    if (typeof template !== 'string') return template;

    return template.replace(/\{([^}]+)\}/g, (_, expr) => {
      const value = this.evaluate(expr, context);
      return value !== undefined && value !== null ? String(value) : '';
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
      return obj.map((item) => this.evaluateObject(item, context, depth + 1));
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
          return this.evaluate(obj, context);
        }
        return this.interpolate(obj, context);
      }

      // 判断是否为表达式（包含运算符或数据路径）
      const hasOperator =
        /\s*(\+|\-|\*|\/|&&|\|\||===|!==|==|!=|>=|<=|>|\?)\s*/.test(obj) ||
        obj.includes('typeof ');
      const hasContextPath = obj.includes('.');

      if (hasOperator || hasContextPath) {
        const firstSegment = obj.split(/[.\s\[]/, 1)[0];
        if (
          (firstSegment && Object.prototype.hasOwnProperty.call(context, firstSegment)) ||
          hasOperator
        ) {
          return this.evaluate(obj, context);
        }
      }

      return obj;
    }

    return obj;
  }
}

export const evaluator = new ExpressionEvaluator();
