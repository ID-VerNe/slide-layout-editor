# 模板引擎与渲染机制深潜

SlideGrid Studio 的渲染引擎是一个声明式的“虚拟机”，它将静态的 JSON 蓝图转化为动态的、响应式的视觉界面。

## 1. 节点系统：渲染树的构成

渲染引擎处理的是一个递归的 `TemplateNode` 树。

### 1.1 节点类型 (`NodeType`)
- **`Container`**: 容器节点，定义布局上下文（Flex, Grid, Absolute, Modular）。
- **`Component`**: 原子组件，连接 Schema 与 React 视图（如 `SlideHeadline`, `ZineMedia`）。
- **`Repeater`**: 循环节点，根据数据集合（如 `page.agenda`）重复渲染子模板。
- **`Conditional`**: 条件分支，根据表达式动态显示不同内容。
- **`Text`**: 纯文本节点，支持字符串插值。

---

## 2. 24x24 模块化网格算法

项目弃用了传统的百分比布局，转而使用“模块化坐标系”。

### 2.1 坐标变换逻辑
在 `LayoutRenderer.tsx` 中，容器开启 `modular` 布局后，子节点的 `modular` 属性将被映射：
- `colStart / colSpan`: 映射到 `grid-column-start` 和 `grid-column-end`。
- `rowStart / rowSpan`: 映射到 `grid-row-start` 和 `grid-row-end`。

网格系统强制定义：
```css
grid-template-columns: repeat(24, minmax(0, 1fr));
grid-template-rows: repeat(24, minmax(0, 1fr));
```

---

## 3. 表达式引擎与数据绑定

`expressionEvaluator.ts` 实现了一个轻量级的解析器，支持在 Schema 中引用动态数据。

### 3.1 语法参考
- **简单引用**: `{page.title}`
- **深度路径**: `{page.metrics[0].value}`
- **环境上下文**: `{theme.colors.accent}`, `{index + 1}`
- **逻辑运算符**: 支持 `||`, `??` 等基础逻辑。

---

## 4. 样式流水线 (Style Pipeline)

渲染一个节点时，样式会经过以下精密漏斗：

1.  **令牌注入 (Tokens)**: 从 `DesignSystem` 注入基础字号、行高。
2.  **基线微调 (Baseline Adhesion)**: 强制将行高对齐到 8px 网格。
3.  **模板属性 (Props)**: 应用 Schema 中定义的固定样式。
4.  **约束过滤 (Zine Filtering)**: **关键步骤**。通过 `ALLOWED_PROPS` 白名单，暴力剔除任何可能破坏工业精密感的 CSS 属性。

---

## 5. 组件注册表 (`COMPONENT_REGISTRY`)

所有的 `Component` 节点必须引用已注册的组件名：

| 组件名 | 职责 | 主要 Props |
| :--- | :--- | :--- |
| `SlideHeadline` | 自动缩放标题 | `text`, `maxFontSize` |
| `SlideImage` | 资产引用图像 | `src`, `aspectRatio` |
| `ZineDisplay` | 工业感标题 (Zine) | `bind` (绑定 PageData) |
| `ZineMedia` | 模块化网格图像 | `bind`, `objectFit` |
| `MetadataOverlay` | 悬浮页码与页脚 | - |

---

## 6. 虚拟预览系统

`TemplatePreview.tsx` 展示了“真实渲染”的强大：
- 它不是加载预生成的 PNG，而是将真实组件以 `scale(0.1)` 的比例在内存中进行实例化。
- 通过 `wireframe-mode` CSS 类，它会自动将彩色视图转化为高对比度的蓝图风格。
