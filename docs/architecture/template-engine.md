# 模板引擎与渲染机制深度解析

SlideGrid Studio 的渲染引擎是一个声明式的"虚拟机"，它将静态的 JSON 蓝图转化为动态的、响应式的视觉界面。核心实现位于以下文件：

- [src/templates/schemas/LayoutRenderer.tsx](src/templates/schemas/LayoutRenderer.tsx) — 递归渲染器
- [src/templates/schemas/types.ts](src/templates/schemas/types.ts) — 节点类型定义
- [src/templates/schemas/expressionEvaluator.ts](src/templates/schemas/expressionEvaluator.ts) — 表达式求值引擎
- [src/templates/schemas/componentRegistry.ts](src/templates/schemas/componentRegistry.ts) — 组件注册表
- [src/templates/schemas/validator.ts](src/templates/schemas/validator.ts) — Schema 校验器

---

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
  typography?: TypographySettings;  // 排版设置
  context?: EvaluationContext;      // 计算上下文 (Repeater 使用)
}
```

### 2.2 渲染流程

```
LayoutRenderer(node, page, theme)
  │
  ├─ 1. 可见性检查 (visibleWhen)
  │     └─ 不满足 → return null
  │
  ├─ 2. 条件分支检查 (Conditional)
  │     └─ conditionMet ? then : else
  │
  └─ 3. 按类型分发
        ├─ Container → renderContainer()
        │   ├─ resolveBaseProps() → modular 网格 + preset 注入
        │   ├─ 布局样式映射 (flex/grid/absolute/modular)
        │   └─ 递归渲染 children
        │
        ├─ Component → renderComponent()
        │   ├─ getComponent(componentType) → COMPONENT_REGISTRY
        │   ├─ 数据绑定 → 优先使用显式 fieldKey，否则由 bind 推断
        │   ├─ 样式合并 → 智能合并 baseProps.style (定位) 与 dynamicProps.style (自定义)
        │   └─ <Component page={...} fieldKey={...} theme={...} style={mergedStyle} />
        │
        ├─ Repeater → renderRepeater()
        │   ├─ evaluator.evaluate(bind) → items[]
        │   ├─ 为每个 item 创建子 context (含 itemVar, index, $parent)
        │   └─ 递归渲染 template
        │
        ├─ Text → 字符串插值 + <div>
        │
        └─ Conditional → conditionMet ? then : else
```

### 2.3 resolveBaseProps — 样式解析管线

`resolveBaseProps()` 是所有节点的样式解析入口：

1. **表达式求值**: `className` 和 `style` 中的 `{...}` 表达式被求值
2. **Modular 网格映射**: `modular.colStart/colSpan/rowStart/rowSpan` → CSS Grid 属性
3. **Preset 注入**: `presetKey` 从 `ds.presets.layout` 和 `ds.presets.effects` 获取预设样式
4. **属性白名单过滤** (`ALLOWED_PROPS`): **Zine Mode 关键步骤** — 仅允许几何布局、定位、核心视觉属性通过，剔除任何可能破坏工业精密感的 CSS 属性
5. **类名黑名单过滤**: 强制剔除 `rounded-*`、`shadow-*`、`blur-*`、`animate-*` 等"软审美" Tailwind 类名

---

## 3. 24x24 模块化网格算法

项目弃用了传统的百分比布局，转而使用 **模块化坐标系**。

### 3.1 网格定义

```css
/* modular 布局容器的核心 CSS */
display: grid;
grid-template-columns: repeat(24, minmax(0, 1fr));
grid-template-rows: repeat(24, minmax(0, 1fr));
```

### 3.2 坐标映射

子节点的 `modular` 属性被映射为 CSS Grid 定位：

```typescript
// Schema 定义
modular: { colStart: 4, colSpan: 8, rowStart: 6, rowSpan: 12, align: 'center' }

// 渲染结果
style = {
  gridColumnStart: 4,
  gridColumnEnd: 'span 8',
  gridRowStart: 6,
  gridRowEnd: 'span 12',
  alignSelf: 'center'
}
```

### 3.3 9 宫格对齐 (Self Alignment)

`modular.align` 和 `modular.justify` 允许子元素在网格单元内精确定位。这在分割线 (Divider) 模拟单元格边框时尤为重要：

- `alignSelf`: 控制垂直方向 (`start` 置顶 / `center` 居中 / `end` 置底 / `stretch` 拉伸)
- `justifySelf`: 控制水平方向 (`start` 靠左 / `center` 居中 / `end` 靠右 / `stretch` 拉伸)


---

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
  // Repeater 模式下动态注入:
  item?: any;       // 当前循环项
  index?: number;   // 当前循环索引
  $parent?: any;    // 父级 Repeater 的 item
  [key: string]: any; // 自定义 itemVariable
}
```

### 4.3 关键方法

| 方法 | 说明 |
| :--- | :--- |
| `evaluate(expr, context)` | 计算单个表达式的值，支持 `??`、`\|\|`、`===`、`? : ` |
| `interpolate(template, context)` | 处理含 `{...}` 插值的模板字符串 |
| `hasExpression(value)` | 检测值是否包含 `{...}` 表达式 |
| `evaluateObject(obj, context)` | 递归处理对象/数组中的所有表达式 |
| `evaluatePart(part, context)` | 路径分段求值，支持 `.`、`?.`、`[ ]` 访问 |

### 4.4 使用示例

```typescript
const evaluator = new ExpressionEvaluator();

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

---

## 5. 样式流水线 (Style Pipeline)

渲染一个节点时，样式经过以下精密漏斗：

1. **令牌注入 (Tokens)**: 从 `DesignSystem` 注入基础字号、行高、字距等原子令牌。
2. **基线微调 (Baseline Adhesion)**: `useModularStyle` Hook 强制将行高对齐到 8px 网格。
3. **模板属性 (Props)**: 应用 Schema 中定义的固定样式，经 `evaluateObject()` 处理动态表达式。
4. **约束过滤 (Zine Filtering)**: **关键步骤**。通过 `ALLOWED_PROPS` 白名单 (41 个允许的 CSS 属性) 过滤内联样式，通过 `filterZineClassName()` 剔除 forbidden 类名前缀 (`rounded-`, `shadow-`, `blur-`, `animate-`)。

### 5.1 允许的属性白名单

```
gridColumnStart, gridColumnEnd, gridRowStart, gridRowEnd,
alignSelf, justifySelf,
display, flexDirection, alignItems, justifyContent, gap, flexWrap,
padding, paddingTop, paddingBottom, paddingLeft, paddingRight,
margin, marginTop, marginBottom, marginLeft, marginRight,
position, top, left, right, bottom, inset, zIndex,
opacity, mixBlendMode, transform, transition, transitionDuration,
width, height, maxWidth, maxHeight, minWidth, minHeight,
aspectRatio, overflow, backgroundColor, borderColor, borderWidth,
borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth,
borderStyle, textAlign, fontFamily, fontSize, fontWeight, lineHeight,
letterSpacing, textTransform, color, verticalAlign, visibility, fontStyle
```

#### 智能样式合并 (Style Merging)
在 `renderComponent` 中，渲染引擎执行 **三级深度合并** 以保证定位优先级：
- **Level 1 (网格定位)**: 由 `modular` 属性计算出的 `gridColumnStart` 等。
- **Level 2 (默认层级)**: 组件默认 `zIndex: 1` 确保在容器背景之上。
- **Level 3 (自定义样式)**: 模板 Schema 中 `props.style` 定义的样式 (如 `opacity: 0.3`)。

引擎确保 Level 3 的自定义 `style` 对象**不会覆盖** Level 1 的定位属性，解决了样式冲突导致组件重置到左上角的 Bug。

### 5.2 禁止的类名前缀

```
rounded-, shadow-, blur-, drop-shadow-,
animate-bounce, animate-pulse, animate-wiggle
```

---

## 6. 组件注册表 (`COMPONENT_REGISTRY`)

所有的 `Component` 节点必须引用已注册的组件名。组件在 [componentRegistry.ts](src/templates/schemas/componentRegistry.ts) 中注册：

| 组件名 | React 组件 | 职责 |
| :--- | :--- | :--- |
| `SlideHeadline` | `SlideHeadline` | 自动缩放标题 |
| `SlideSubHeadline` | `SlideSubHeadline` | 副标题 |
| `SlideParagraph` | `SlideParagraph` | 段落正文 |
| `SlideImage` | `SlideImage` | 资产引用图像 |
| `SlideLogo` | `SlideLogo` | Logo 渲染 |
| `SlideIcon` | `SlideIcon` | Lucide 图标渲染 |
| `SlideMetric` | `SlideMetric` | KPI 度量指标 |
| `SlideBlockLabel` | `SlideBlockLabel` | 模块标签 |
| `SlideImageLabel` | `SlideImageLabel` | 图片元数据标签 |
| `MetadataOverlay` | `MetadataOverlay` | 悬浮页码与页脚 |
| `OutlineText` | `OutlineText` | 描边轮廓文字 |
| `ZineDisplay` | `ZineDisplay` | 工业感大标题 (Zine) |
| `ZineBody` | `ZineBody` | 诗性正文字体 (Zine) |
| `ZineCaption` | `ZineCaption` | 小字标注/元数据 (Zine) |
| `ZineMedia` | `ZineMedia` | 模块化网格图像 (Zine) |
| `ZineResume` | `ZineResume` | 简历区块渲染 (Zine) |
| `ZineDivider` | `ZineDivider` | 精密刻度线 (Zine) |

---

## 7. Schema 校验器

[validator.ts](src/templates/schemas/validator.ts) 提供 `TemplateSchema` 的结构验证，确保：

- 所有节点 `type` 合法
- `Component` 节点的 `componentType` 在 `COMPONENT_REGISTRY` 中存在
- `modular` 属性的坐标值在 1-24 范围内
- 递归校验子节点树

---

## 8. 虚拟预览系统

[TemplatePreview.tsx](src/components/ui/TemplatePreview.tsx) 展示了"真实渲染"的强大：

- 它不是加载预生成的 PNG，而是将真实组件以 `scale(0.1)` 的比例在内存中进行实例化。
- 通过 `wireframe-mode` CSS 类，自动将彩色视图转化为高对比度的蓝图风格。
- 用于模板浏览器中的预览卡片，让用户在应用模板前就能看到其 24x24 网格布局的实际效果。