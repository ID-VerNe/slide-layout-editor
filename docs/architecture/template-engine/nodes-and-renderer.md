# 节点系统与 LayoutRenderer

## 1. 节点系统：渲染树的构成

渲染引擎处理的是一个递归的 `TemplateNode` 树。

### 1.1 节点类型 (`NodeType`)

| 节点类型 | 说明 | 核心属性 |
| :--- | :--- | :--- |
| `Container` | 布局容器，定义布局上下文 | `layout` (flex/grid/absolute/modular), `layoutProps`, `children` |
| `Component` | 原子组件，连接 Schema 与 React 视图 | `componentType`, `bind`, `fieldKey`, `props` |
| `Repeater` | 循环节点，根据数据集合重复渲染子模板 | `bind`, `itemVariable`, `template` |
| `Conditional` | 条件分支，根据表达式动态显示 | `condition`, `then`, `else` |
| `Text` | 纯文本节点，支持字符串插值 | `content` |

### 1.2 BaseNode 通用属性

所有节点共享以下基础属性：

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `string` | 可选节点 ID (用于 React key) |
| `className` | `string` | Tailwind CSS 类名 (通过 Zine 过滤器) |
| `style` | `React.CSSProperties` | 内联样式 (通过属性白名单) |
| `modular` | `ModularProps` | 24x24 网格定位 |
| `presetKey` | `string` | DesignSystem 预设引用 (如 `"safe-area"`) |
| `visibleWhen` | `string` | 可见性表达式 (如 `"page.visibility.logo"`) |

---

## 2. LayoutRenderer：递归渲染核心

`LayoutRenderer` 是模板引擎的核心入口。它接收一个 `TemplateNode` 根节点，递归地将其展开为 React 组件树。

### 2.1 Props

```typescript
interface LayoutRendererProps {
  node: TemplateNode;               // 当前节点
  page: PageData;                   // 页面数据 (用于 bind 解析)
  theme: ProjectTheme;              // 全局主题
  designSystem: DesignSystem;       // 设计系统 Tokens
  typography?: TypographySettings;  // 排版设置
  context?: EvaluationContext;      // 计算上下文 (Repeater 使用)
  resolveZIndex?: ZIndexResolverFn; // zIndex 解析器，由 JsonTemplateRenderer 注入
}
```

### 2.2 渲染流程

```
LayoutRenderer(node, page, theme, designSystem, resolveZIndex)
  │
  ├─ 1. 可见性检查 (visibleWhen)
  │     └─ 不满足 → return null
  │
  ├─ 2. 条件分支检查 (Conditional)
  │     └─ conditionMet ? then : else
  │
  └─ 3. 按类型分发
        ├─ Container → renderContainer()
        │   ├─ resolveBaseProps() → modular 网格 + preset 注入 + zIndex
        │   ├─ 布局样式映射 (flex/grid/absolute/modular)
        │   └─ 递归渲染 children (传递 ds, resolveZIndex)
        │
        ├─ Component → renderComponent()
        │   ├─ getComponent(componentType) → COMPONENT_REGISTRY
        │   ├─ 数据绑定 → 优先使用显式 fieldKey，否则由 bind 推断
        │   ├─ 样式合并 → node.style 与 dynamicProps.style 合并后经白名单过滤
        │   └─ <Component page={...} fieldKey={...} theme={...} designSystem={...} style={...} />
        │
        ├─ Repeater → renderRepeater()
        │   ├─ evaluator.evaluate(bind) → items[]
        │   ├─ 布局处理 (flex/grid) 类似 Container，支持 transparent 模式
        │   ├─ 为每个 item 创建子 context (含 itemVar, index, $parent)
        │   └─ 递归渲染 template
        │
        ├─ Text → evaluator.interpolate(content) + <div>
        │
        └─ Conditional → conditionMet ? then : else
```

### 2.3 resolveBaseProps — 样式解析管线

`resolveBaseProps()` 是所有节点的样式解析入口：

1. **表达式求值**: `className` 和 `style` 中的 `{...}` 表达式被求值
2. **Modular 网格映射**: `modular.colStart/colSpan/rowStart/rowSpan` → CSS Grid 属性
3. **Preset 注入**: `presetKey` 从 `ds.presets.layout` 和 `ds.presets.effects` 获取预设样式
4. **属性白名单过滤** (`ALLOWED_PROPS`): **Zine Mode 关键步骤** — 仅允许几何布局、定位、核心视觉属性通过，目前已支持 `borderRadius` 以实现胶囊形状等高级审美。
5. **类名黑名单过滤**: 强制剔除 `shadow-*`、`blur-*`、`animate-*` 等"软审美" Tailwind 类名。**注意**: `rounded-*` 类名现在已被允许，以便配合 `ZineMedia` 的新圆角特性。
