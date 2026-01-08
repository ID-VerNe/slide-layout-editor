# SlideGrid Studio 模板开发标准作业程序 (SOP) - v2.0

本指南旨在指导开发者如何基于 **Schema-Driven Engine** 快速构建并注册新模板。

---

## 1. 开发哲学：双翼模型 (The Twin-Track Model)

开发一个新模板分为两个并行部分：
1. **渲染翼 (The Renderer)**：编写 `.tsx` 模板文件，使用**原子组件**构建预览视觉。
2. **配置翼 (The Schema)**：在注册表中定义 **JSON Schema**，自动生成右侧编辑器 UI。

---

## 2. 渲染翼：组件化装配 (Atomic Assembly)

**原则**：禁止使用原始 HTML 标签（`<h1>`, `img` 等）。所有视觉元素必须使用 `src/components/ui/slide/` 下的原子组件，以确保自动感应全局 **Design Tokens**。

### 核心原子组件及其职责：
- **SlideHeadline**: 主标题。内置 Auto-fit 算法，自动消费 `theme.typography.headingFont`。
- **SlideSubHeadline**: 副标题。支持样式覆盖，自动消费 `theme.typography.bodyFont`。
- **SlideParagraph**: 长文本块。处理行高与留白。
- **SlideImage / SlideLogo**: 视觉资产。内置物理边界增强算法，支持 `asset://` 协议。
- **SlideMetric**: 数据指标。支持 KaTeX 公式与单位格式化。
- **MetadataOverlay**: **[重要]** 严禁在模板内私自渲染页码/页脚。必须确保模板容器为 `relative`，由顶层 `Preview.tsx` 统一注入 Overlay。

---

## 3. 配置翼：Schema 驱动编辑器

**原则**：不再需要修改 `Editor.tsx` 中的 `switch-case`。你只需要在注册表中通过 JSON 对象定义该模板需要哪些编辑控件。

### 字段配置协议 (`FieldSchema`):
```typescript
{
  key: 'title',           // 必填。对应 PageData 中的字段名
  label: 'Section Title', // 可选。在编辑器中显示的自定义标签
  props: { ... }          // 可选。透传给具体 Field 控件的特殊参数（如范围限制）
}
```

### 快速装配示例 (`src/templates/registry.ts`):
```tsx
{
  id: 'my-new-layout',
  name: 'Modern Showcase',
  category: 'Product',
  component: MyNewLayout,
  // 使用 withBaseFields 自动包含背景色和页码控制
  fields: withBaseFields([ 
    { key: 'title' }, 
    { key: 'image', props: { label: 'Hero Shot' } },
    { key: 'features' }
  ]),
  supportedRatios: ['16:9']
}
```

---

## 4. 详细搭建流程

### 第一步：创建渲染组件
在 `src/components/templates/` 创建 `MyNewLayout.tsx`。
- **必须** 接收 `{ page: PageData, typography?: TypographySettings }` 作为 Props。
- **必须** 将 `page.backgroundColor` 绑定至根容器。

### 第二步：定义字段协议
确定你的模板需要用户修改哪些数据。
- 基础字段建议始终通过 `withBaseFields()` 注入。
- 如果需要复杂网格，请引入 `bentoItems` 字段。

### 第三步：注册与集成
在 `src/templates/registry.ts` 中完成导入与配置。
- 运行 `pnpm dev`。
- 在桌面端进入编辑器，点击布局切换，验证 Schema 是否正确生成了对应的编辑表单。

---

## 5. 性能与样式约束

1. **绝对间距**：由于画布采用整体缩放（Scale），请优先使用像素（px）或 Tailwind 间距类（如 `p-16`）。
2. **色彩同步**：严禁硬编码颜色。必须使用 `theme.colors` 中的 Token。
3. **物理隔离**：模板根容器必须具备 `isolate` 类名，确保内部的 `z-index` 不会与顶层元数据层（MetadataOverlay）发生冲突。
4. **资产安全**：所有图片引用必须通过 `SlideImage` 组件，以兼容 Electron 环境下的物理路径解析。