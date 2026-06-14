# zIndex、条件渲染、Repeater 与调试

## 9. zIndex 分层系统

模板引擎使用声明式的相对 zIndex 系统，避免全局硬编码数值。

### 9.1 声明语法

```typescript
// 层级声明类型
type ZIndexDeclaration = 
  | 'bottom'           // 固定底层 (0)
  | 'page.top'         // 固定顶层 (50)
  | `${string}.top`    // 在指定元素之上 (+1)
  | `${string}.bottom` // 在指定元素之下 (-1)
  | undefined;         // 默认层级 (10)
```

### 9.2 解析流程

```typescript
// 1. 收集所有节点的 ID 和 zIndex 声明
const idMap = new Map<string, ZIndexDeclaration>();
collectIds(root, idMap);

// 2. 创建解析器
const resolveZIndex = createZIndexResolver(root);

// 3. 在渲染时解析
const finalZIndex = resolveZIndex(node.zIndex);
```

### 9.3 示例

```typescript
// 背景图层
{ id: 'bg', zIndex: 'bottom' }  // → 0

// 主内容
{ id: 'content', zIndex: undefined }  // → 10 (默认)

// 覆盖层（在主内容之上）
{ id: 'overlay', zIndex: 'content.top' }  // → 11

// 顶层元素
{ id: 'header', zIndex: 'page.top' }  // → 50
```

### 9.4 循环引用保护

```typescript
// ❌ 错误：循环引用
{ id: 'A', zIndex: 'B.top' }
{ id: 'B', zIndex: 'A.top' }

// 系统检测到循环后自动回退到 page.top (50)
console.warn('zIndex 循环引用检测：A -> B -> A');
```

---

## 10. 条件渲染与可见性控制

### 10.1 Conditional 节点

```typescript
{
  type: 'Conditional',
  condition: 'page.variant === "left"',
  then: {
    type: 'Component',
    componentType: 'ZineMedia',
    // 左侧布局
  },
  else: {
    type: 'Component',
    componentType: 'ZineMedia',
    // 右侧布局
  }
}
```

### 10.2 visibleWhen 属性

所有节点都支持 `visibleWhen` 快捷属性：

```typescript
{
  type: 'Component',
  componentType: 'ZineLogo',
  visibleWhen: 'page.visibility.logo',  // 绑定到可见性开关
  // ...
}
```

等价于：

```typescript
{
  type: 'Conditional',
  condition: 'page.visibility.logo',
  then: { /* Logo 组件 */ },
  else: undefined
}
```

---

## 11. Repeater 数据绑定

### 11.1 基础用法

```typescript
{
  type: 'Repeater',
  bind: 'page.features',  // 绑定到数据数组
  itemVariable: 'feature', // 可选，默认为 'item'
  template: {
    type: 'Container',
    layout: 'flex',
    layoutProps: { direction: 'column', gap: 8 },
    children: [
      {
        type: 'Component',
        componentType: 'ZineCaption',
        props: { text: '{feature.title}', size: 2.4 }
      },
      {
        type: 'Component',
        componentType: 'ZineBody',
        props: { text: '{feature.description}', size: 1.6 }
      }
    ]
  }
}
```

### 11.2 循环上下文变量

在 Repeater 模板内，可访问以下变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `item` | 当前循环项（或自定义 itemVariable） | `{item.title}` |
| `index` | 当前索引（从 0 开始） | `{index + 1}` |
| `$parent` | 外层 Repeater 的 item（嵌套时） | `{$parent.category}` |

### 11.3 嵌套 Repeater

```typescript
{
  type: 'Repeater',
  bind: 'page.categories',
  itemVariable: 'category',
  template: {
    type: 'Container',
    children: [
      {
        type: 'Component',
        componentType: 'ZineDisplay',
        props: { text: '{category.name}' }
      },
      {
        type: 'Repeater',
        bind: 'category.items',  // 访问外层的 category
        itemVariable: 'product',
        template: {
          type: 'Component',
          componentType: 'ZineBody',
          props: { 
            // 访问内层的 product 和外层的 category
            text: '{product.name} ({$parent.name})'
          }
        }
      }
    ]
  }
}
```

---

## 12. 错误处理与调试

### 12.1 渲染错误边界

所有模板渲染被 `TemplateRenderErrorBoundary` 包裹：

```typescript
<TemplateRenderErrorBoundary templateId={templateId}>
  <LayoutRenderer node={schema.root} page={page} theme={theme} />
</TemplateRenderErrorBoundary>
```

当渲染错误时，显示友好的错误提示而不是白屏。

### 12.2 Schema 校验

开发模式下，每个 Schema 在注册时自动校验：

```typescript
if (import.meta.env.DEV) {
  const result = validateTemplateSchema(schema);
  if (!result.success) {
    console.error(`模板 ${id} 校验失败:`, result.errors);
  }
}
```

### 12.3 表达式调试

表达式求值器提供详细的错误信息：

```typescript
try {
  const value = evaluator.evaluate(expr, context);
} catch (error) {
  console.error(`表达式求值失败: "${expr}"`, {
    context,
    error: error.message
  });
  return fallbackValue;
}
```

### 12.4 网格可视化

按 `Alt+;` 显示 24x24 网格辅助线，便于调试布局：

```typescript
// 快捷键监听
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === ';') {
      setShowGrid(prev => !prev);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```
