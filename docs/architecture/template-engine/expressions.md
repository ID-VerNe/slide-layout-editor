# 表达式引擎与数据绑定

## 4. 表达式引擎与数据绑定

[expressionEvaluator.ts](src/templates/schemas/expressionEvaluator.ts) 实现了一个轻量级的解析器，支持在 Schema 中引用动态数据。

### 4.1 语法参考

| 表达式类型 | 语法示例 | 说明 |
| :--- | :--- | :--- |
| 简单字段引用 | `page.title` | 当前页面标题 |
| 嵌套对象访问 | `theme.colors.primary` | 主题主色 |
| 数组索引访问 | `page.gallery[0]` | 通过 `[]` 访问数组元素 |
| 可选链 | `page.styleOverrides?.title?.fontSize` | 安全的深层访问 |
| 空值合并 | `page.backgroundColor ?? theme.colors.background ?? '#ffffff'` | 多级回退 |
| 逻辑与/或 | `page.subtitle \|\| page.title` / `flag && 'on'` | 条件短路 |
| 三元运算符 | `page.layoutVariant === 'top' ? 'Top' : 'Side'` | 条件表达式 |
| 等值比较 | `===` `!==` `==` `!=` | 严格/松散相等性判断 |
| 关系比较 | `>` `<` `>=` `<=` | 数值比较 |
| 算术运算 | `+` `-` `*` `/` | 基本数学运算 |
| 一元运算 | `!flag` `-value` `typeof value` | 逻辑非、取反、类型检测 |
| 括号分组 | `(x + y) * 2` | 改变运算优先级 |
| 字符串插值 | `bg-pattern-{page.backgroundPattern}` | 模板字符串 |
| 循环上下文 | `index + 1` | Repeater 内的当前索引 |
| 父级引用 | `$parent.title` | 嵌套 Repeater 的外层变量 |

### 4.2 Context 结构

```typescript
interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  [key: string]: any; // Repeater 模式下动态注入 item / index / $parent 等
}
```

> **注意**: Repeater 上下文变量（`item`、`index`、`$parent`）并非 `EvaluationContext` 的显式属性，
> 而是通过 `[key: string]: any` 索引签名在 Repeater 渲染时动态注入。

### 4.3 关键方法

| 方法 | 说明 |
| :--- | :--- |
| `evaluate(expr, context)` | 计算单个表达式的值，支持 `??`、`\|\|`、`===`、`? : `、算术运算等 |
| `interpolate(template, context)` | 处理含 `{...}` 插值的模板字符串 |
| `hasExpression(value)` | 检测值是否包含 `{...}` 表达式 |
| `evaluateObject(obj, context)` | 递归处理对象/数组中的所有表达式，支持自动检测纯表达式字符串并保持原始类型 |

### 4.4 单例实例

模块导出一个预创建的单例，应用中统一使用：

```typescript
import { evaluator } from './expressionEvaluator';
// 直接使用 evaluator.evaluate(...) / evaluator.interpolate(...)
```

### 4.5 使用示例

```typescript
import { evaluator } from './expressionEvaluator';

// 简单字段
evaluator.evaluate('page.title', { page: { title: 'Hello' }, theme });
// => 'Hello'

// 空值合并
evaluator.evaluate('page.image ?? theme.colors.accent', { page, theme });
// => 图片路径 或 强调色

// 字符串插值
evaluator.interpolate('Chart {index + 1}: {item.title}', context);
// => 'Chart 3: Revenue Growth'
```

### 4.6 自然语言与 CSS 类名安全解析机制

在 `evaluateObject` 递归处理模板对象时，为防止非表达式字符串被误解析为 JavaScript 代码，引擎引入了三重安全屏障：

1. **Token 完整消费校验 (`hasUnconsumedTokens`)**:
   解析器在计算表达式后，若发现未消费的剩余 Token（例如 `"page 1 of 5"` 中，`page` 变量被读取后仍留存 `1`、`of` 等 Token），立即判定为非合法独立表达式并返回 `undefined`，保留原字符串，避免篡改为 `[object Object]`。
2. **Kebab-Case 连字符保护**:
   匹配 `/[a-zA-Z0-9_]-[a-zA-Z0-9_]/` 模式的连字符标识符（如 `"page-header"`, `"text-slate-900"`）被直接识别为 CSS 类名或标识符，杜绝误识别为减法算术运算产生 `NaN`。
3. **顶层上下文白名单**:
   首个单词必须是当前 Context 中实际存在的顶层标识符（如 `page`, `theme`, `index`, `item`, `$parent`）才触发求值尝试，未绑定的自由文本（如 `"spacing.none"`）保持原值。
