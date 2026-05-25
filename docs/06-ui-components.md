# UI 组件参考指南

本章完整记录了 SlideGrid Studio 中所有可用的 UI 组件及其 API。

---

## 1. 核心原子组件 (Slide Atoms)

这些组件是构成幻灯片页面的基本单元，通常用于模板 Schema 的 `Component` 节点。所有原子组件位于 `src/components/ui/slide/atoms/` 目录。

### 1.1 `ZineDisplay`
用于大张力标题，支持字距与行高的极端控制。消费 `ds.tokens.typography.display` 样式令牌。

- **文件**: `src/components/ui/slide/atoms/ZineDisplay.tsx`
- **绑定字段**: `page.title` (可通过 `fieldKey` 自定义)
- **上下文获取**: 通过 `useStore` 获取 `theme` 和 `designSystem`
- **可见性**: 支持 `page.visibility[fieldKey]` 控制

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名，优先于 `text` |
| `text` | `string` | `page.title` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'primary'` | 文字颜色 Token |
| `className` | `string` | `''` | 额外的 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 (受 Zine 过滤) |

**特性**:
- 字体来源: `page.titleFont || theme.typography.headingFont`
- 强制紧凑字距 (`tracking-tighter`)
- 由 `useModularStyle` Hook 统一处理样式优先级与 Zine 约束
- 支持 `OutlineText` 模式 (通过嵌套子组件)

---

### 1.2 `ZineBody`
用于段落文字、描述信息。消费 `ds.tokens.typography.body` 样式令牌。

- **文件**: `src/components/ui/slide/atoms/ZineBody.tsx`
- **绑定字段**: `page.paragraph` 或自定义 `fieldKey`
- **默认行高**: 1.8 (由 Token 定义)
- **默认对齐**: `justify` (两端对齐)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名 |
| `text` | `string` | `page.paragraph` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'primary'` | 文字颜色 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |
| `dropCap` | `boolean` | `false` | 是否启用首字下沉效果 |

**特性**:
- 字体来源: `page.bodyFont || theme.typography.bodyFont`
- `dropCap`: 首字符以 4.2rem 大字号浮动，使用 `accent` 色
- 支持 `visibility` 可见性检查

---

### 1.3 `ZineCaption`
用于小字标注、元数据、版权信息等。消费 `ds.tokens.typography.caption` 令牌。

- **文件**: `src/components/ui/slide/atoms/ZineCaption.tsx`
- **默认字号**: 10px / 行高 1.5
- **默认字重**: 900 (加粗)
- **默认字母间距**: 0.25em

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 |
| `text` | `string` | `undefined` | 显示的文本 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'secondary'` | 文字颜色 |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |

**特性**: 字体来源 `theme.typography.captionFont || "'Inter', sans-serif"`

---

### 1.4 `ZineMedia`
图像与媒体容器。作为 `SlideImage` 的薄封装，默认采用工业硬边缘 (`rounded="0"`)。

- **文件**: `src/components/ui/slide/atoms/ZineMedia.tsx`
- **默认绑定**: `fieldKey='image'`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `'image'` | 绑定的 PageData 字段 |
| `src` | `string` | - | 直接指定图片路径 |
| `className` | `string` | `''` | 外层容器类名 |
| `imgClassName` | `string` | `''` | 图片元素类名 |
| `style` | `React.CSSProperties` | - | 外层容器样式 |

**特性**:
- 默认全宽全高 (`w-full h-full`)
- 强制 `rounded="0"` (工业硬边缘，区别于圆角风格)
- 委托给 `SlideImage` 处理实际渲染

---

### 1.5 `ZineResume`
简历专用原子组件，封装了简历区块的完整渲染逻辑。

- **文件**: `src/components/ui/slide/atoms/ZineResume.tsx`
- **数据来源**: `page.resumeSections: ResumeSection[]`

**Props:**

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `page` | `PageData` | (必需) 当前页面数据 |

**特性**:
- 自动遍历 `resumeSections` 数组渲染多个区块
- 每区块包含标题 (section title) + 条目列表 (items)
- 支持 Markdown 风格的富文本: `**粗体**`, `*斜体*`, `` `代码` ``, 链接 `[text](url)`
- 自动识别 `-` / `*` / `•` 开头的列表项，渲染为带 accent 色点标记的列表
- 使用 DOMPurify 进行 XSS 防护
- 可滚动区域 (`overflow-y-auto`)

---

### 1.6 内部原子组件

以下组件位于 `src/components/ui/slide/atoms/`，为原子组件内部使用的基础构建块：

#### `Text`
最基础的文本渲染单元。

- **文件**: `atoms/Text.tsx`
- **Props**: `as` (标签名), `content`, `className`, `style`, `children`, `sanitize` (HTML 净化)
- **用途**: 作为 `ZineDisplay`、`ZineBody`、`ZineCaption` 的底层文本渲染器

#### `Icon`
原子化图标渲染器。

- **文件**: `atoms/Icon.tsx`
- **Props**: `name`, `size`, `color`, `className`, `style`
- **用途**: 在模板 Schema 中通过 `Component` 节点类型引用

#### `Image`
原子化图片渲染器 (基础级别)。

- **文件**: `atoms/Image.tsx`
- **Props**: `src`, `alt`, `objectFit`, `className`, `style`

#### `Divider`
原子化分割线组件。

- **文件**: `atoms/Divider.tsx`
- **Props**: `direction` (`'horizontal' | 'vertical'`), `thickness`, `color`, `className`

---

## 2. 幻灯片容器组件 (Slide Components)

这些组件位于 `src/components/ui/slide/`，通常不直接用于 Schema，而是被原子组件调用或作为模板基础。

### 2.1 `PageFrame`
所有页面的最顶层外壳，24x24 模块化网格容器。

- **文件**: `src/components/PageFrame.tsx`
- **职责**:
  1. 注入 CSS 变量 (Design System Tokens: `--zine-color-primary`, `--zine-color-accent` 等)
  2. 渲染全局页码 (GlobalFolio) — 页码、脚注文字
  3. 渲染调试网格 (Alt+; 切换 24x24 网格 + 8px 基线叠加层)
  4. 渲染背景纹理 (grid / dots / diagonal / cross)

**Props:**

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `page` | `PageData` | 当前页面数据 |
| `pageIndex` | `number` | 当前页面在列表中的索引 |
| `totalPages` | `number` | 总页数 |
| `children` | `React.ReactNode` | 页面内容 |

**页码渲染逻辑 (GlobalFolio)**:
- 支持 `counterStyle`: `'number'` (01-99), `'alpha'` (A-Z), `'roman'` (I-X), `'dots'` (圆点)
- 脚注文字来自 `page.footer`，默认显示 `FIG. XX`
- 可通过 `page.pageNumber = false` 完全隐藏
- 页码颜色受 `page.counterColor` 控制

**背景纹理 (BackgroundPattern)**:
- `'none'`: 无纹理
- `'grid'`: 48px 方格
- `'dots'`: 24px 圆点
- `'diagonal'`: 45 度斜线
- `'cross'`: 十字图案

---

### 2.2 `SlideHeadline`
自动缩放标题组件，通过 Web Worker 计算最佳字号。

- **文件**: `src/components/ui/slide/SlideHeadline.tsx`
- **特性**: 接收 `maxFontSize`, `text` 等属性，结合容器宽度二分查找最佳字号

### 2.3 `SlideImage`
资产引用图像组件。

- **文件**: `src/components/ui/slide/SlideImage.tsx`
- **特性**: 支持 `asset://` 协议、`rounded` 参数控制圆角、`objectFit` 参数

### 2.4 `SlideLogo`
品牌 Logo 渲染器。

- **文件**: `src/components/ui/slide/SlideLogo.tsx`
- **绑定字段**: `page.logo`
- **特性**: 自动根据 `page.logoSize` 缩放，支持反色模式

### 2.5 `SlideIcon`
图标渲染器，支持 Lucide 图标集。

- **文件**: `src/components/ui/slide/SlideIcon.tsx`

### 2.6 `SlideMetric`
大数字度量指标展示组件。

- **文件**: `src/components/ui/slide/SlideMetric.tsx`

### 2.7 `SlideParagraph`
段落文本渲染器。

- **文件**: `src/components/ui/slide/SlideParagraph.tsx`

### 2.8 `SlideSubHeadline`
副标题渲染器。

- **文件**: `src/components/ui/slide/SlideSubHeadline.tsx`

### 2.9 `SlideBlockLabel`
模块标签渲染器。

- **文件**: `src/components/ui/slide/SlideBlockLabel.tsx`

### 2.10 `SlideImageLabel`
图片元数据标签渲染器。

- **文件**: `src/components/ui/slide/SlideImageLabel.tsx`

### 2.11 `OutlineText`
描边文字渲染器，用于特殊视觉效果。

- **文件**: `src/components/ui/slide/OutlineText.tsx`

### 2.12 `MetadataOverlay`
悬浮页码与页脚信息覆盖层，用于非 PageFrame 场景。

- **文件**: `src/components/ui/slide/MetadataOverlay.tsx`

---

## 3. 幻灯片组件 Hooks

### 3.1 `useModularStyle`
统一处理样式优先级与 Zine Mode 约束的核心 Hook。

- **文件**: `src/components/ui/slide/hooks/useModularStyle.ts`
- **样式优先级**: Page Overrides > Template Props > Design System Tokens > Theme Defaults
- **Zine Mode 强制执行**:
  1. 基线吸附: 行高强制对齐到 8px 倍数 (`Math.ceil(rawLineHeight / 8) * 8`)
  2. Style 白名单过滤: 仅允许几何布局、定位、核心视觉属性，剔除圆角、阴影等"软审美"
  3. ClassName 黑名单过滤: 剔除 `rounded-*`, `shadow-*`, `blur-*`, `animate-*` 类
  4. 颜色冲突处理: 自动剔除 Tailwind 文本颜色类以保持 Token 一致性
  5. 字母间距补偿: 自动设置负 `margin-right` 抵消 letter-spacing 的尾部偏移

**参数**:

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `page` | `PageData` | 页面数据，用于自动提取 styleOverrides |
| `fieldKey` | `string` | 字段名，用于自动获取对应 overrides |
| `props` | `Record<string, any>` | 模板定义的静态属性 |
| `variant` | `'display' \| 'body' \| 'caption'` | 排版变体 |
| `customStyle` | `React.CSSProperties` | 自定义样式 |
| `className` | `string` | 自定义类名 |

**返回值**: `{ style, className }` — 已经过 Zine 约束过滤的最终样式和类名

---

### 3.2 `useDataConnector`
从 PageData 中提取指定字段的数据与 Overrides。

- **文件**: `src/components/ui/slide/hooks/useDataConnector.ts`
- **参数**: `fieldKey: string`, `page: PageData`
- **返回值**: `{ content, overrides, isVisible }`

---

## 4. 模板渲染组件

### 4.1 `LayoutRenderer`
模板引擎的核心渲染器，递归遍历 TemplateNode 树。

- **文件**: `src/templates/schemas/LayoutRenderer.tsx`
- **支持节点类型**: `Container`, `Component`, `Repeater`, `Conditional`, `Text`
- **关键功能**:
  - 24x24 模块化网格坐标映射 (CSS Grid)
  - DesignSystem Preset 注入 (`safe-area`, `full-bleed`, `glass-card`, `hard-edge`)
  - 可见性条件判断 (`visibleWhen`)
  - Zine 审美约束过滤 (Style 白名单 + ClassName 黑名单)
  - 表达式中继

详见 [02-模板引擎与渲染机制](02-template-engine.md)。

---

### 4.2 `JsonTemplateRenderer`
JSON 模板渲染器的 React 封装层。

- **文件**: `src/components/JsonTemplateRenderer.tsx`
- **职责**: 从 Store 获取全局 `theme`，传递给 `LayoutRenderer`

**Props:**

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `schema` | `TemplateSchema` | 模板 Schema 定义 |
| `page` | `PageData` | 当前页面数据 |
| `typography` | `TypographySettings` | 可选排版设置 |

---

### 4.3 `TemplatePreview`
自动化蓝图渲染引擎，用于模板选择器的预览卡片。

- **文件**: `src/components/ui/TemplatePreview.tsx`
- **原理**: 直接实例化真实模板组件（不加载 PNG），通过 CSS `scale()` 缩放后以 `wireframe-mode` 显示
- **Mock 数据**: 自动构造填充数据确保预览饱满
- **优势**: 100% 还原真实排版，新增模板无需手动编写预览

### 4.4 `TemplateErrorBoundary`
模板渲染的错误边界，防止单个模板崩溃影响整个应用。

- **文件**: `src/components/ui/TemplateErrorBoundary.tsx`

### 4.5 `TemplateLoader`
模板加载状态指示器。

- **文件**: `src/components/ui/TemplateLoader.tsx`

### 4.6 `DebouncedBase`
防抖渲染包装组件，用于性能敏感的实时编辑场景。

- **文件**: `src/components/ui/DebouncedBase.tsx`

---

## 5. 编辑器组件 (Editor Components)

这些组件位于 `src/components/editor/`，构成编辑器的交互界面。

### 5.1 `EditorPanel`
编辑器右侧面板容器。

- **文件**: `src/components/editor/EditorPanel.tsx`
- **固定宽度**: 400px (`LAYOUT.EDITOR_PANEL_WIDTH`)
- **职责**: 包裹 `Editor` 组件，提供滚动区域

### 5.2 `Editor`
编辑器主体，负责分发 Schema 字段到对应的编辑控件。

- **文件**: `src/components/Editor.tsx`
- **关键逻辑**: 根据当前模板的 `fields` 配置，通过 `FieldRenderer` 动态分发到具体控件

### 5.3 `FieldRenderer`
字段渲染分发器，基于 Schema `key` 匹配对应的编辑器控件。

- **文件**: `src/components/editor/FieldRenderer.tsx`
- **映射表**: 将 21 种 `fieldKey` 映射到对应的 React 控件组件
- **回退机制**: 如果未匹配到具名组件且 `type === 'number'`，使用 `GenericNumberField`

**支持的字段类型映射**:

| fieldKey | 渲染组件 |
| :--- | :--- |
| `logo` | `LogoField` |
| `title` | `TitleField` |
| `subtitle` | `SubtitleField` |
| `actionText` | `ActionTextField` |
| `paragraph` | `ParagraphField` |
| `signature` | `SignatureField` |
| `image` | `ImageField` |
| `imageLabel` | `ImageLabelField` |
| `imageSubLabel` | `ImageSubLabelField` |
| `features` | `FeaturesField` |
| `mosaic` | `MosaicField` |
| `metrics` | `MetricsField` |
| `partnersTitle` | `PartnersTitleField` |
| `partners` | `PartnersField` |
| `testimonials` | `TestimonialsField` |
| `agenda` | `AgendaField` |
| `bentoItems` | `BentoField` |
| `gallery` | `GalleryField` |
| `variant` | `VariantField` |
| `bullets` | `BulletsField` |
| `backgroundColor` | `ColorField` |
| `footer` | `FooterField` |
| `pageNumber` | `PageNumberField` |
| `resumeSections` | `ResumeSectionsField` |
| `titleY` | `TitleYField` |

### 5.4 `Sidebar`
左侧页面缩略图导航栏。

- **文件**: `src/components/editor/Sidebar.tsx`
- **宽度**: 96px (`LAYOUT.SIDEBAR_WIDTH`)
- **功能**: 页面列表、添加/删除/排序页、导入/导出、导航

### 5.5 `TopNav`
编辑器顶部工具栏。

- **文件**: `src/components/editor/TopNav.tsx`
- **功能**: 项目标题编辑、页面切换、缩放控制、导出、保存、撤销/重做

### 5.6 `PreviewArea`
中央预览区域。

- **文件**: `src/components/editor/PreviewArea.tsx`
- **职责**: 管理预览缩放、自适应、溢出检测

### 5.7 `GlobalSettings`
全局设置弹窗内容。

- **文件**: `src/components/editor/GlobalSettings.tsx`
- **涵盖**: 主题颜色、字体管理、图片质量、页码样式、打印设置

### 5.8 `ImageEditPreview`
图片编辑预览组件。

- **文件**: `src/components/editor/ImageEditPreview.tsx`

### 5.9 `OffscreenExportRenderer`
离屏导出渲染器，用于高质量图片/PDF 导出。

- **文件**: `src/components/editor/OffscreenExportRenderer.tsx`

### 5.10 `VirtualPageList`
虚拟化页面列表，基于 `@tanstack/react-virtual`。

- **文件**: `src/components/editor/VirtualPageList.tsx`

### 5.11 `FieldToolbar`
字段编辑工具栏，提供字段级样式微调。

- **文件**: `src/components/editor/fields/FieldToolbar.tsx`

### 5.12 `FieldWrapper`
字段编辑控件通用包装器，提供统一的标签、图标、交互状态。

- **文件**: `src/components/editor/fields/FieldWrapper.tsx`

---

## 6. 基础 UI 组件 (Base UI)

### 6.1 `Base`
原子化表单组件集，位于 `src/components/ui/Base.tsx`：

| 子组件 | 说明 |
| :--- | :--- |
| `Base.Input` | 样式化文本输入框，遵循项目视觉规范 |
| `Base.TextArea` | 样式化文本区域 |
| `Base.Label` | 带图标的标签组件 (`text-[10px] font-black`) |
| `Base.Section` | 编辑区块容器 |
| `Base.Slider` | 带数字输入框的滑块控件 |

### 6.2 `Modal`
通用浮层容器，通过 React Portal 渲染到 `document.body`。

- **文件**: `src/components/Modal.tsx`
- **类型**: `alert` | `confirm` | `custom`
- **特性**: Framer Motion 弹簧动画、毛玻璃背景、Portal 隔离

**Props:**

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | 是否打开 |
| `onClose` | `() => void` | 关闭回调 |
| `title` | `string` | 标题 |
| `message` | `string` | (可选) 描述文字 |
| `type` | `'alert' \| 'confirm' \| 'custom'` | 弹窗类型 |
| `onConfirm` | `() => void` | (confirm) 确认回调 |
| `confirmText` | `string` | 确认按钮文字 |
| `cancelText` | `string` | 取消按钮文字 |
| `children` | `React.ReactNode` | (custom) 自定义内容 |
| `maxWidth` | `string` | 最大宽度 CSS 类 |

### 6.3 `FontSelect`
支持本地自定义字体的实时预览下拉框。

- **文件**: `src/components/ui/FontSelect.tsx`
- **特性**: 实时渲染字体名称预览、支持自定义字体列表

### 6.4 `IconPicker`
基于 Lucide 的图标搜索与选择器。

- **文件**: `src/components/ui/IconPicker.tsx`

### 6.5 `BrandLogo`
品牌 Logo 展示组件。

- **文件**: `src/components/ui/BrandLogo.tsx`

### 6.6 `VirtualScrollContainer`
基于 `@tanstack/react-virtual` 的高性能虚拟滚动容器。

- **文件**: `src/components/ui/VirtualScrollContainer.tsx`
- **用途**: 侧边栏页面列表的大数据量渲染

---

## 7. 应用级组件

### 7.1 `ErrorBoundary`
全局 React 错误边界，捕获组件树中的未处理异常。

- **文件**: `src/components/ErrorBoundary.tsx`
- **特性**:
  - 显示崩溃恢复 UI（Reload / Home 按钮）
  - 使用 `logger` 记录错误详情
  - 美观的 Glassmorphism 风格错误卡片

### 7.2 `FontManager`
字体管理器组件，管理自定义字体上传与应用。

- **文件**: `src/components/FontManager.tsx`

### 7.3 `Editor`
编辑器主组件，连接 PageData 与编辑器控件。

- **文件**: `src/components/Editor.tsx`
- **职责**: 根据模板的 FieldSchema 列表动态生成编辑表单

### 7.4 `AutoFitHeadline`
自动适配标题，根据容器宽度动态调整字号。

- **文件**: `src/components/AutoFitHeadline.tsx`

### 7.5 `Preview`
导出预览组件。

- **文件**: `src/components/Preview.tsx`

---

## 8. 组件注册表 (`COMPONENT_REGISTRY`)

在 `src/templates/schemas/componentRegistry.ts` 中维护全局组件注册表，Schema 的 `componentType` 字段引用此表。

**完整注册表**:

```typescript
{
  // 传统组件
  SlideHeadline, SlideSubHeadline, SlideParagraph,
  SlideImage, SlideLogo, SlideIcon, SlideMetric,
  SlideBlockLabel, SlideImageLabel, MetadataOverlay, OutlineText,
  
  // Zine 新原子
  ZineDisplay, ZineBody, ZineCaption, ZineMedia, ZineResume,
}
```

通过 `getComponent(type)` 函数按名称获取组件，若组件未注册则返回 `null` 并打印警告。