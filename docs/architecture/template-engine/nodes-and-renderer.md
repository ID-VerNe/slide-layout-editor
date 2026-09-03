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

## 2. LayoutRenderer：解耦渲染管线架构

在最新架构中，`LayoutRenderer.tsx` 从单一庞大组件重构为**纯协调器 (Coordinator) 与顶层 ErrorBoundary**，具体渲染逻辑深度解耦到 `src/templates/schemas/renderer/` 子模块体系中。

### 2.1 子渲染器分工

| 子模块 | 路径 | 核心职责 |
| :--- | :--- | :--- |
| `basePropsResolver` | `renderer/basePropsResolver.ts` | 统一解析 24 格网格定位、9 点对齐停靠 (docking)、预设注入、zIndex 映射与样式白名单过滤 |
| `containerRenderer` | `renderer/containerRenderer.tsx` | 渲染 Flex、Grid、Absolute 与 Modular 容器，嵌套递归渲染子节点 |
| `componentRenderer` | `renderer/componentRenderer.tsx` | 从 `COMPONENT_REGISTRY` 动态映射 React 原子组件，绑定数据并捕获组件级异常 |
| `repeaterRenderer` | `renderer/repeaterRenderer.tsx` | 循环迭代集合数据（如 Agenda、VocabItems、Metrics），派生子评估上下文 |
| `styleWhitelist` | `renderer/styleWhitelist.ts` | 维护严格的 CSS 样式白名单与类名安全过滤规则，防止软审美侵蚀 |
| `tokenResolver` | `renderer/tokenResolver.ts` | 将语义化 Design Token 键名解析为实际 CSS 属性值 |
| `modularFlex` | `utils/modularFlex.ts` | 提供嵌套 Flex 容器的尺寸占位与自适应网格辅助计算 |

### 2.2 协调分发流程

```
LayoutRenderer(node, page, theme, designSystem, resolveZIndex)
  │
  ├─ 1. 可见性检查 (visibleWhen) ──> 不满足则返回 null
  │
  ├─ 2. 条件分支检查 (Conditional) ──> evaluate(condition) ? then : else
  │
  └─ 3. 委派专职子渲染器
        ├─ Container ──> containerRenderer()
        │     ├─ basePropsResolver(node) ──> 计算 grid 坐标、预设与 zIndex
        │     ├─ 布局样式映射 (flex / grid / absolute / modular)
        │     └─ 递归调用 LayoutRenderer 渲染 children
        │
        ├─ Component ──> componentRenderer()
        │     ├─ COMPONENT_REGISTRY[componentType] 查找原子组件
        │     ├─ 数据绑定 ──> 解析 bind 表达式或显式 fieldKey
        │     ├─ 样式白名单过滤 ──> 剔除不合规的 CSS 属性与类名
        │     └─ 渲染原子组件（包裹独立 ComponentErrorBoundary）
        │
        ├─ Repeater ──> repeaterRenderer()
        │     ├─ evaluate(bind) ──> 提取 items 数组
        │     ├─ 创建带有 item、index、$parent 的子上下文
        │     └─ 循环渲染子模板 node.template
        │
        └─ Text ──> interpolate(content) ──> 渲染纯文本 <div>
```

### 2.3 basePropsResolver 样式解析管线

所有节点在挂载到 DOM 之前均经过 `basePropsResolver` 处理：

1. **表达式求值**: `className` 和 `style` 中的 `{...}` 动态表达式由 `expressionEvaluator` 安全求值。
2. **Modular 24 网格映射**: `modular.colStart/colSpan/rowStart/rowSpan` 转换为精确的 CSS Grid 坐标，对齐 8px 基线。
3. **9 点网格停靠 (Docking)**: 支持 `align` (start/center/end/stretch) 与 `justify` (start/center/end/stretch) 轴向停靠。
4. **Preset 注入**: `presetKey` 从 `ds.presets.layout` 和 `ds.presets.effects` 获取预设样式注入。
5. **属性白名单过滤** (`ALLOWED_PROPS`): 严格限制仅允许几何布局、间距、排版与核心视觉属性，支持 `borderRadius` 胶囊圆角。
6. **类名合规性过滤**: 剔除 `shadow-*`、`blur-*` 等未经设计令牌授权的修饰类名。
