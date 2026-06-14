# 表达式引擎与数据绑定

## 4. 表达式引擎与数据绑定

[expressionEvaluator.ts](src/templates/schemas/expressionEvaluator.ts) 实现了一个轻量级的解析器，支持在 Schema 中引用动态数据。

### 4.1 语法参考

| 表达式类型 | 语法示例 | 说明 |
| :--- | :--- | :--- |
| 简单字段引用 | `page.title` | 当前页面标题 |
| 嵌套对象访问 | `theme.colors.primary` | 主题主色 |
| 可选链 | `page.styleOverrides?.title?.fontSize` | 安全的深层访问 |
| 空值合并 | `page.backgroundColor ?? theme.colors.background ?? '#ffffff'` | 多级回退 |
| 逻辑或 | `page.subtitle \|\| page.title` | 备用值 |
| 三元运算符 | `page.layoutVariant === 'top' ? 'Top' : 'Side'` | 条件表达式 |
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
| `evaluate(expr, context)` | 计算单个表达式的值，支持 `??`、`\|\|`、`===`、`? : ` |
| `interpolate(template, context)` | 处理含 `{...}` 插值的模板字符串 |
| `hasExpression(value)` | 检测值是否包含 `{...}` 表达式 |
| `evaluateObject(obj, context)` | 递归处理对象/数组中的所有表达式 |

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
