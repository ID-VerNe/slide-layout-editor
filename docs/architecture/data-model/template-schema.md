# 模板 Schema 类型

## 6. 模板 Schema 类型 (Template Schema Types)

### 6.1 节点系统

- **文件**: `src/templates/schemas/types.ts`

**支持的节点类型** (`NodeType`):
- `'Container'` — 布局容器 (Flex / Grid / Absolute / Modular)
- `'Component'` — 原子组件引用
- `'Repeater'` — 数据循环渲染
- `'Conditional'` — 条件分支
- `'Text'` — 纯文本节点

**统一联合类型**: `TemplateNode = ContainerNode | ComponentNode | ConditionalNode | RepeaterNode | TextNode`

### 6.2 `BaseNode` (所有节点公有属性)

```typescript
interface BaseNode {
  id?: string;
  className?: string;       // Tailwind CSS 类名
  style?: React.CSSProperties;  // 内联样式
  modular?: {               // 24x24 网格定位
    colStart?: number;      // 1-24
    colSpan?: number;       // 1-24
    rowStart?: number;      // 1-24
    rowSpan?: number;       // 1-24
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'stretch';
  };
  presetKey?: string;       // DesignSystem 预设引用
  visibleWhen?: string;     // 可见性表达式
}
```

### 6.3 `ContainerNode`
布局容器节点。

```typescript
interface ContainerNode extends BaseNode {
  type: 'Container';
  layout?: 'flex' | 'grid' | 'absolute' | 'modular';
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps | ModularLayoutProps;
  children: TemplateNode[];
}
```

### 6.4 `ComponentNode`
组件引用节点，连接 Schema 与 React 视图。

```typescript
interface ComponentNode extends BaseNode {
  type: 'Component';
  componentType: string;   // COMPONENT_REGISTRY 中的 key (e.g. "ZineDisplay")
  bind?: string;           // 数据绑定表达式 (e.g. "page.title")
  props?: Record<string, any>;  // 静态 Props
}
```

### 6.5 `RepeaterNode`
数据循环渲染节点。

```typescript
interface RepeaterNode extends BaseNode {
  type: 'Repeater';
  bind: string;           // 数据源 (e.g. "page.agenda")
  itemVariable?: string;  // 循环变量名 (e.g. "item")
  template: TemplateNode; // 子模板
}
```

### 6.6 `ConditionalNode`
条件分支节点。

```typescript
interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: string;   // 条件表达式 (e.g. "page.layoutVariant === 'top'")
  then: TemplateNode;
  else?: TemplateNode;
}
```

### 6.7 `TemplateSchema`
模板完整定义。

```typescript
interface TemplateSchema {
  id: string;
  name: string;
  category: string;
  supportedRatios: AspectRatioType[];
  root: TemplateNode;
  defaults?: Record<string, any>;
  meta?: { version: string; author?: string };
}
```

---

