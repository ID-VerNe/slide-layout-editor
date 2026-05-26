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

### 2.1 `SlideHeadline` & `AutoFitHeadline`
自动缩放标题组件。

- **`SlideHeadline`** ([ui/slide/SlideHeadline.tsx](src/components/ui/slide/SlideHeadline.tsx)): 接收静态属性，通过二分查找计算最佳字号。
- **`AutoFitHeadline`** ([AutoFitHeadline.tsx](src/components/AutoFitHeadline.tsx)): 实时监听容器宽度的适配器，使用 Web Worker ([fontCalculator.ts](src/workers/fontCalculator.ts)) 进行异步字号计算。
  - **算法**: 基于字符权重的二分查找
  - **精度**: 0.5px
  - **Worker**: 避免阻塞主线程

### 2.2 `SlideSubHeadline`
副标题渲染组件。

- **文件**: [ui/slide/SlideSubHeadline.tsx](src/components/ui/slide/SlideSubHeadline.tsx)
- **功能**: 样式化副标题渲染，支持中文字体自动切换。

### 2.3 `SlideImage` & `ZineMedia`
资产引用与展示组件。

- **`SlideImage`** ([ui/slide/SlideImage.tsx](src/components/ui/slide/SlideImage.tsx)): 处理 `asset://` 协议 URL 解析、圆角模式 (`roundedMode`)、裁剪方式 (`objectFit`)、LQIP 加载占位图。
- **`ZineMedia`** ([atoms/ZineMedia.tsx](src/components/ui/slide/atoms/ZineMedia.tsx)): 工业硬边缘图像，`rounded="0"`，`objectFit="cover"` — Zine 美学的核心图像容器。

### 2.4 `SlideLogo`
品牌 Logo 渲染器。

- **文件**: [ui/slide/SlideLogo.tsx](src/components/ui/slide/SlideLogo.tsx)
- **功能**: 支持自动缩放 (`logoSize`)、反色模式 (深色背景自动启用白色反色)。

### 2.5 `SlideParagraph`
段落文本渲染组件。

- **文件**: [ui/slide/SlideParagraph.tsx](src/components/ui/slide/SlideParagraph.tsx)
- **功能**: 首字下沉 (Drop Cap) 支持、多段落自动分段。

### 2.6 `SlideMetric`
大数字度量指标展示。

- **文件**: [ui/slide/SlideMetric.tsx](src/components/ui/slide/SlideMetric.tsx)
- **功能**: KPI 数字 + 标签 + 单位的三段式渲染。

### 2.7 `SlideIcon`
Lucide 图标集渲染器。

- **文件**: [ui/slide/SlideIcon.tsx](src/components/ui/slide/SlideIcon.tsx)
- **功能**: 将字符串 ID 映射为 Lucide React 组件，支持尺寸、颜色、描边宽度配置。

### 2.8 `SlideBlockLabel` / `SlideImageLabel`
模块与图片标签组件。

- **`SlideBlockLabel`**: 模块标题标签渲染。
- **`SlideImageLabel`** ([ui/slide/SlideImageLabel.tsx](src/components/ui/slide/SlideImageLabel.tsx)): 图片元数据标签 (如拍摄信息、日期)。

### 2.9 `MetadataOverlay`
悬浮页码与页脚覆盖层。

- **文件**: [ui/slide/MetadataOverlay.tsx](src/components/ui/slide/MetadataOverlay.tsx)
- **功能**: 在页面底部渲染页码 (`counterStyle`) 和页脚文字 (`footer`)，支持绝对定位叠加。

### 2.10 `OutlineText`
描边轮廓文字组件。

- **文件**: [ui/slide/OutlineText.tsx](src/components/ui/slide/OutlineText.tsx)
- **功能**: 生成带文字描边/轮廓效果的大字，用于高冲击力排版。

---

## 3. 布局逻辑组件

### 3.1 `LayoutRenderer`
模板引擎的核心渲染器，递归遍历 TemplateNode 树。

- **文件**: [src/templates/schemas/LayoutRenderer.tsx](src/templates/schemas/LayoutRenderer.tsx)
- **功能**: CSS Grid 映射、DesignSystem Preset 注入、Zine 审美约束过滤。详见 [模板引擎文档](../architecture/template-engine.md#2-layoutrenderer递归渲染核心)。

### 3.2 `JsonTemplateRenderer`
JSON 模板渲染器的 React 封装层。

- **文件**: [src/components/JsonTemplateRenderer.tsx](src/components/JsonTemplateRenderer.tsx)
- **功能**: 接收 JSON 格式的 TemplateSchema，将其转化为 `LayoutRenderer` 可处理的节点树。

---

## 4. Slide 专用 Hooks

### 4.1 `useModularStyle`
Zine 原子组件的样式 Hook。

- **文件**: [ui/slide/hooks/useModularStyle.ts](src/components/ui/slide/hooks/useModularStyle.ts)
- **功能**:
  - 从 `DesignSystem` 消费 TypographyToken
  - 强制执行 8px 基线网格对齐
  - 处理 `pt` 单位字体的高精度排版
  - 返回经过 Token 映射的合并样式对象

### 4.2 `useDataConnector`
数据连接器 Hook。

- **文件**: [ui/slide/hooks/useDataConnector.ts](src/components/ui/slide/hooks/useDataConnector.ts)
- **功能**: 从 `PageData` 中按 `fieldKey` 提取对应字段值，连接数据层与渲染组件。