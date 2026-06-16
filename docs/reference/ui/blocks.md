# 幻灯片布局与块组件 (Slide Blocks & Layouts)

这些组件位于 [src/components/ui/slide/](src/components/ui/slide/)，构成了幻灯片页面的布局骨架和业务模块。

---

## 1. 容器类组件

### 1.1 `PageFrame`
所有页面的最顶层外壳，24x24 模块化网格容器。

- **文件**: [src/components/PageFrame.tsx](src/components/PageFrame.tsx)
- **核心职责**:
  - 注入 CSS 变量 (色彩、间距、字体 Tokens)
  - 渲染全局页码 (页码样式、位置)
  - 可选的调试网格覆盖层 (Alt+; 切换)
  - 背景纹理与底色渲染 (grid/dots/diagonal/cross 图案)

---

## 2. 业务功能块 (Slide Components)

> **注意**: 原独立的 Slide* 组件（SlideHeadline、SlideImage、SlideLogo、SlideParagraph 等）已被重构为 Zine* 原子组件，统一位于 `src/components/ui/slide/atoms/` 目录。以下为当前活跃组件：

### 2.1 `AutoFitHeadline`
自动缩放标题组件，实时监听容器宽度进行自适应字号计算。

- **文件**: [AutoFitHeadline.tsx](src/components/AutoFitHeadline.tsx)
- **算法**: 基于字符权重的二分查找
- **精度**: 0.5px
- **Worker**: 通过 Web Worker ([fontCalculator.ts](src/workers/fontCalculator.ts)) 进行异步计算，避免阻塞主线程
- **在 `Text` 原子组件中集成**: 当 `autoFit={true}` 时启用

### 2.2 `LayoutRenderer`
模板引擎的核心渲染器，递归遍历 TemplateNode 树。

- **文件**: [src/templates/schemas/LayoutRenderer.tsx](src/templates/schemas/LayoutRenderer.tsx)
- **Props**: `node`, `page`, `theme`, `designSystem`, `typography?`, `context?`, `resolveZIndex?`
- **功能**: CSS Grid 映射、DesignSystem Preset 注入、Zine 审美约束过滤。详见 [模板引擎文档](../architecture/template-engine/nodes-and-renderer.md)。

### 2.3 `JsonTemplateRenderer`
JSON 模板渲染器的 React 封装层。

- **文件**: [src/components/JsonTemplateRenderer.tsx](src/components/JsonTemplateRenderer.tsx)
- **功能**: 接收 JSON 格式的 TemplateSchema，将其转化为 `LayoutRenderer` 可处理的节点树。

---

## 3. Slide 专用 Hooks

### 3.1 `useModularStyle`
Zine 原子组件的统一样式 Hook，处理样式优先级与 Zine Mode 约束。

- **文件**: [ui/slide/hooks/useModularStyle.ts](src/components/ui/slide/hooks/useModularStyle.ts)
- **参数**: `{ fieldKey?, overrides?, props?, variant?, orientation?, customStyle?, className?, page? }`
- **功能**:
  - 从 `DesignSystem` 消费 TypographyToken（`display` / `body` / `caption`）
  - 语义化排版：通过 `size`（8px 倍数）、`serif`/`sans`、`bold`/`italic`、`align`、`leading`、`tracking` 等抽象 Props 驱动样式
  - 方向性支持：`horizontal` / `vertical-stack`（竖排红线） / `vertical-rotate`（侧边旋转）
  - 强制执行 8px 基线网格对齐（variant 不为 `body` 时）
  - 自动从 `page.styleOverrides[fieldKey]` 提取 Overrides
  - Overrides 自动单位补全（`number` → `px`）
  - Zine Mode 过滤：只保留白名单中的 CSS 属性，剔除阴影/模糊/动画等
  - className 过滤：剔除 `shadow-*`、`blur-*`、`animate-*`、颜色类、字体冲突类
  - 返回 `{ style, className }`

### 3.2 `useDataConnector`
数据连接器 Hook，从 `PageData` 中按 `fieldKey` 提取对应字段值。

- **文件**: [ui/slide/hooks/useDataConnector.ts](src/components/ui/slide/hooks/useDataConnector.ts)
- **参数**: `(fieldKey: string, page: PageData)`
- **返回值**: `{ content, overrides, isVisible }`
  - `content`: `page[fieldKey]` 的值
  - `overrides`: `page.styleOverrides[fieldKey]` 或空对象
  - `isVisible`: `page.visibility[fieldKey] !== false`