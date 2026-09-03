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

**Z-Index 层叠声明系统**:
- `ZIndexKeyword`: `'page.top' | 'bottom'`
- `ZIndexReference`: `` `${string}.top` | `${string}.bottom` ``
- `ZIndexDeclaration`: `ZIndexKeyword | ZIndexReference`

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
  zIndex?: ZIndexDeclaration; // 层叠声明，默认 = 'page.top'
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
  fieldKey?: string;       // 显式绑定 PageData 中的字段键 (用于 styleOverrides)
  props?: Record<string, any>;  // 静态 Props
}
```

### 6.5 `RepeaterNode`
数据循环渲染节点。

```typescript
interface RepeaterNode extends BaseNode {
  type: 'Repeater';
  bind: string;           // 数据源 (e.g. "page.agenda")
  itemVariable?: string;  // 循环变量名 (e.g. "item", "section")
  layout?: 'flex' | 'grid' | 'absolute' | 'modular';
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps | ModularLayoutProps;
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

### 6.7 `TextNode` / `ModularLayoutProps`

纯文本节点与模组化布局属性。

```typescript
interface TextNode extends BaseNode {
  type: 'Text';
  content: string; // 支持表达式 e.g. "Page {index + 1}"
}

interface ModularLayoutProps {
  gap?: string | number; // 基于 8px 的倍数或预设
  columns?: number;      // 默认为 24
  rows?: number;         // 默认为 24
}
```

### 6.8 布局属性类型

```typescript
interface FlexLayoutProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number | string;
  wrap?: boolean | 'wrap-reverse';
}

interface GridLayoutProps {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  areas?: string[];
}

interface AbsoluteLayoutProps {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  inset?: number | string;
  zIndex?: number;
}
```

### 6.9 `TemplateSchema`
模板完整定义。**文件**: `src/templates/schemas/types.ts` (第 98-109 行)。

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

### 6.10 `TemplateDefinition` (独立 JSON 规范)
自模板解耦重构后，所有 36 个模板均以独立的 `.json` 文件存储在 `src/templates/definitions/<Category>/` 目录下：

```typescript
export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume' | 'Bilingual';
  desc: string;
  tags: string[];
  supportedRatios: AspectRatioType[];
  fields: (FieldType | FieldSchema)[];
  defaultData?: Partial<PageData>;
  root: TemplateNode;
}
```

由 `src/templates/registry.ts` 通过 `import.meta.glob('./definitions/**/*.json', { eager: true })` 静态载入，并映射为 `TEMPLATES` 供系统使用。

---

