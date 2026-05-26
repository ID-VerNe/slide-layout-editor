# 编辑器字段控件参考

本文档列出了编辑器中所有可用的字段编辑控件 (`src/components/editor/fields/`)。每个控件对应一种数据类型，在右侧编辑面板中动态渲染。

---

## 通用契约

所有 Field 组件遵循统一接口 (`FieldProps`)：

```typescript
interface FieldProps {
  page: PageData;                       // 当前页面数据
  onUpdate: (page: PageData) => void;   // 更新回调 (不可变)
  customFonts?: CustomFont[];           // 自定义字体列表 (可选)
  label?: string;                       // 自定义标签 (可选)
}
```

**关键规则**:
- `onUpdate` 必须返回新的 `PageData` 对象 (浅拷贝)
- 所有字段通过 Zustand Store 的 `updatePage` 流转
- 活跃字段高亮 (蓝色左边框)

---

## 1. 文本类字段

### 1.1 `TitleField`
主标题编辑。提供多行文本区域和字体选择。

- **文件**: `fields/TitleField.tsx`
- **绑定字段**: `page.title`
- **额外控件**:
  - `FontSelect` — 标题字体选择器
  - `Slider` — 标题 Y 轴偏移 (`page.titleY`)
  - 字符/词数统计
- **图标**: `Type`

### 1.2 `SubtitleField`
副标题编辑。

- **文件**: `fields/SubtitleField.tsx`
- **绑定字段**: `page.subtitle`
- **额外控件**: `FontSelect` — 正文字体选择器
- **图标**: `FileText`

### 1.3 `ParagraphField`
段落/正文编辑。大号多行文本区域。

- **文件**: `fields/ParagraphField.tsx`
- **绑定字段**: `page.paragraph`
- **额外控件**: `FontSelect` — 正文字体选择器
- **图标**: `AlignLeft`

### 1.4 `ActionTextField`
行动号召 (CTA) 按钮文本编辑。

- **文件**: `fields/ActionTextField.tsx`
- **绑定字段**: `page.actionText`
- **图标**: `MousePointer`

### 1.5 `SignatureField`
签名/结语文本编辑。

- **文件**: `fields/SignatureField.tsx`
- **绑定字段**: `page.signature`
- **图标**: `PenTool`

### 1.6 `PartnersTitleField`
合作伙伴区块标题编辑。

- **文件**: `fields/PartnersTitleField.tsx`
- **绑定字段**: `page.partnersTitle`
- **图标**: `Building2`

### 1.7 `FooterField`
页脚文字编辑。

- **文件**: `fields/FooterField.tsx`
- **绑定字段**: `page.footer`
- **图标**: `MessageSquare`

### 1.8 `ArtFontField`
高级艺术字编辑器。用于编辑 `page.artFont` 字段，控制 ZineArtFont 组件的 SVG 渲染参数。

- **文件**: `fields/ArtFontField.tsx`
- **绑定字段**: `page.artFont`
- **图标**: `Type`

**编辑项**:

| 控件 | 绑定 | 说明 |
| :--- | :--- | :--- |
| Input | `page.artFont` | 艺术字文本内容 (大号粗体输入) |
| -/+ 按钮 | `styleOverrides.artFont.fontSize` | 字号控制 (步长 ±20px) |
| -/+ 按钮 | `styleOverrides.artFont.strokeWidth` | 描边粗细控制 (步长 ±0.5px) |
| Solid/Outline 按钮 | `styleOverrides.artFont.mode` | 切换 `'solid'` (实心) / `'outline'` (空心描边) |
| Range Slider | `styleOverrides.artFont.opacity` | 不透明度 (0.1 ~ 1.0) |

**特性**:
- **SVG 渲染**: 艺术字由 `ZineArtFont` 组件以 SVG 方式渲染，支持描边和透明度叠加
- **实时预览**: 样式变更直接反映到预览区

---

## 2. 媒体类字段

### 2.1 `ImageField`
主图片编辑。支持拖放上传、预览、响应式处理。

- **文件**: `fields/ImageField.tsx`
- **绑定字段**: `page.image`
- **特性**:
  - **Paste 事件**: 粘贴剪贴板图片 (Ctrl+V)
  - **Drop 事件**: 拖放图片文件
  - **Upload 按钮**: 点击选择文件
  - **预览**: 小缩略图预览
  - **ImageConfig**: X/Y 偏移 (slide)，缩放 (scale)
- **图标**: `Image`

### 2.2 `LogoField`
Logo 图片编辑。功能类似于 `ImageField`。

- **文件**: `fields/LogoField.tsx`
- **绑定字段**: `page.logo`
- **额外控件**: `Slider` — logo 缩放控制 (`page.logoSize`)
- **图标**: `Circle`

### 2.3 `ImageLabelField`
图片主标签编辑。

- **文件**: `fields/ImageLabelField.tsx`
- **绑定字段**: `page.imageLabel`
- **图标**: `Tag`

### 2.4 `ImageSubLabelField`
图片副标签编辑。

- **文件**: `fields/ImageSubLabelField.tsx`
- **绑定字段**: `page.imageSubLabel`
- **图标**: `Hash`

---

## 3. 列表/集合类字段

### 3.1 `FeaturesField`
功能/特性列表编辑。

- **文件**: `fields/FeaturesField.tsx`
- **绑定字段**: `page.features: FeatureData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 说明 |
| :--- | :--- | :--- |
| `title` | Input | 功能标题 |
| `description` | TextArea | 功能描述 |
| `icon` | IconPicker | Lucide 图标选择器 |
| `imageConfig` | Slider x3 | 图片缩放 + X/Y 偏移 |

**额外特性**:
- 条目的拖放排序 (展开/折叠)
- 自动 ID 迁移 (旧数据兼容)
- `KeyDown` 事件的键盘快捷键冲突防护

---

### 3.2 `AgendaField`
议程/目录编辑。支持自定义标签 Props，可复用于简历字段。

- **文件**: `fields/AgendaField.tsx`
- **绑定字段**: `page.agenda: AgendaData[]`

**每种条目的编辑项**:
| 字段 | 可自定义标签 | 控件 |
| :--- | :--- | :--- |
| `title` | `titleLabel` | Input |
| `subtitle` | `subtitleLabel` | Input |
| `time` | `timeLabel` | Input |
| `location` | `locationLabel` | Input |

**关键特性**:
- **可复用性**: 通过 `titleLabel`, `subtitleLabel` 等 Props 可为简历模板定制字段名称
- **自动排序**: 按 `time` 字段排序 (如提供)
- **空条目清理**: 自动删除 `title` 为空的条目
- **nameKey**: 自定义集合名称 (影响可见性键)

---

### 3.3 `MetricsField`
度量指标 (KPI) 编辑。

- **文件**: `fields/MetricsField.tsx`
- **绑定字段**: `page.metrics: MetricData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 示例 |
| :--- | :--- | :--- |
| `label` | Input | "年营收" |
| `value` | Input | "24.8B" |
| `unit` | Input (小) | "USD" |

**特性**:
- `React.memo` 优化 (列表性能优化)
- 行内紧凑布局

---

### 3.4 `TestimonialsField`
推荐/评价列表编辑。

- **文件**: `fields/TestimonialsField.tsx`
- **绑定字段**: `page.testimonials: TestimonialData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 别名 |
| :--- | :--- | :--- |
| `content` / `quote` | TextArea | 引文/推荐语 |
| `name` / `author` | Input | 作者姓名 |
| `role` | Input | 职位/身份 |
| `avatar` | Image upload | 头像 |

---

### 3.5 `BulletsField`
无序列表 (Bullet Points) 编辑。

- **文件**: `fields/BulletsField.tsx`
- **绑定字段**: `page.bullets: string[]`
- **特性**: 支持拖放排序、快捷键添加/删除
- **图标**: `List`

### 3.6 `BentoField`
Bento Grid 网格编辑。

- **文件**: `fields/BentoField.tsx`
- **绑定字段**: `page.bentoItems: BentoItem[]`
- **每种条目控件**: 类型选择器 (`type`)、网格定位 (`x`, `y`, `colSpan`, `rowSpan`)、主题 (`theme`)、内容

### 3.7 `GalleryField`
画廊/图片集编辑。

- **文件**: `fields/GalleryField.tsx`
- **绑定字段**: `page.gallery: any[]`

### 3.8 `MosaicField`
马赛克/拼贴编辑。

- **文件**: `fields/MosaicField.tsx`
- **绑定字段**: `page.mosaic: any[]`

### 3.9 `PartnersField`
合作伙伴 Logo 列表编辑。

- **文件**: `fields/PartnersField.tsx`
- **绑定字段**: `page.partners: PartnerData[]`

---

## 4. 结构化字段

### 4.1 `ResumeSectionsField`
简历区块编辑。这是最复杂的字段组件之一，作为 `ResumeContentHub` 的入口。

- **文件**: `fields/ResumeSectionsField.tsx`
- **绑定字段**: `page.resumeSections: ResumeSection[]`

---

## 5. 辅助与通用字段

### 5.1 `ResumeContentHub` (核心/复杂)
简历模板的中心化内容管理器。

- **文件**: `src/components/editor/fields/ResumeContentHub.tsx`
- **功能**:
  - **区块管理**: 添加/删除/重命名简历大类 (Experience, Education 等)。
  - **条目编辑**: 每区块支持多条目输入（标题、时间、描述）。
  - **拖拽排序**: 基于 `framer-motion` 的区块与条目重排序。
  - **跨页迁移**: 支持将区块一键迁移至上一页或下一页的相同模板中。
- **数据结构**: `page.resumeSections: ResumeSection[]`

### 5.2 `GenericNumberField`
- **文件**: `fields/GenericNumberField.tsx`
- **用途**: 通用数值微调器，支持步长控制。

### 5.3 `SeparatorField`
- **文件**: `fields/SeparatorField.tsx`
- **用途**: 控制幻灯片中的分割线 (ZineDivider) 的视觉表现。
- **增强功能**:
  - **Thickness**: 精确控制线条粗细 (px)。
  - **Length**: 控制线条相对于单元格的长度 (%)。
  - **9 点对齐**: 支持在 Modular Grid 单元格内的 9 个方位贴靠（置顶、居中、置底、靠左、靠右等）。
- **图标**: `Minus`

---

## 6. 布局/选择类字段

### 6.1 `VariantField`
模板变体切换器。将 `layoutVariant` 渲染为单选按钮组。

- **文件**: `fields/VariantField.tsx`
- **绑定字段**: `page.layoutVariant`

**渲染规则**:
1. 从模板配置 (`TemplateConfig.variants`) 获取可用变体
2. 渲染为单选按钮组 (`RadioGroup`)
3. 自动标签: 将 `snake_case` 转为 `Title Case`
4. 如果模板只有一个变体，自动设置为空字符串
5. 未配置 variants 时自动隐藏

**示例**: `page.layoutVariant = 'top'` → 渲染 "Top"、"Left"、"Bottom"、"Right" 等选项

---

### 6.2 `ColorField`
颜色选择器。用 `Base.Input type="color"` 渲染。

- **文件**: `fields/ColorField.tsx`
- **绑定字段**: 取决于映射 (如 `backgroundColor` → `page.backgroundColor`)
- **图标**: `Palette`

### 6.3 `PageNumberField`
页码开关 (Toggle) + 样式选择。

- **文件**: `fields/PageNumberField.tsx`
- **绑定字段**: `page.pageNumber: boolean`
- **额外控件**: `counterStyle` (下拉选择 `number` / `alpha` / `roman` / `dots`)
- **图标**: `Hash`

### 6.4 `TitleYField`
标题 Y 轴偏移滑块。

- **文件**: `fields/TitleYField.tsx`
- **绑定字段**: `page.titleY`
- **控件**: `Slider`
- **图标**: `MoveVertical`

---

## 7. 共享工具组件

### 7.1 `FieldWrapper`
所有字段控件的通用包装器。

- **文件**: `fields/FieldWrapper.tsx`

**渲染内容**:
1. 字段标签 (带图标)
2. 可见性开关 (Toggle Eye 图标)
3. 子内容 (children)

**Props**:

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `icon` | `LucideIcon` | 字段图标 |
| `label` | `string` | 字段标签文本 |
| `isVisible` | `boolean` | 当前可见状态 |
| `onToggle` | `() => void` | 切换可见性 |
| `children` | `ReactNode` | 字段内容 |

### 7.2 `FieldToolbar`
字段级工具栏。操作按钮行。

- **文件**: `fields/FieldToolbar.tsx`

**可用操作** (受 `allowedActions` Props 控制):
- 重置默认值 (RotateCcw 图标)
- 细调样式 (Adjustments 图标)
- 可见性切换
- 自定义操作按钮

---

## 8. 完整字段映射表

| fieldKey | 组件 | 绑定字段 | 类型 |
| :--- | :--- | :--- | :--- |
| `title` | `TitleField` | `page.title` | string |
| `subtitle` | `SubtitleField` | `page.subtitle` | string |
| `paragraph` | `ParagraphField` | `page.paragraph` | string |
| `actionText` | `ActionTextField` | `page.actionText` | string |
| `signature` | `SignatureField` | `page.signature` | string |
| `partnersTitle` | `PartnersTitleField` | `page.partnersTitle` | string |
| `footer` | `FooterField` | `page.footer` | string |
| `imageLabel` | `ImageLabelField` | `page.imageLabel` | string |
| `imageSubLabel` | `ImageSubLabelField` | `page.imageSubLabel` | string |
| `image` | `ImageField` | `page.image` | asset |
| `logo` | `LogoField` | `page.logo` | asset |
| `features` | `FeaturesField` | `page.features` | array |
| `agenda` | `AgendaField` | `page.agenda` | array |
| `metrics` | `MetricsField` | `page.metrics` | array |
| `testimonials` | `TestimonialsField` | `page.testimonials` | array |
| `bullets` | `BulletsField` | `page.bullets` | array |
| `bentoItems` | `BentoField` | `page.bentoItems` | array |
| `gallery` | `GalleryField` | `page.gallery` | array |
| `mosaic` | `MosaicField` | `page.mosaic` | array |
| `partners` | `PartnersField` | `page.partners` | array |
| `resumeSections` | `ResumeSectionsField` | `page.resumeSections` | structured |
| `artFont` | `ArtFontField` | `page.artFont` | string |
| `variant` | `VariantField` | `page.layoutVariant` | enum |
| `backgroundColor` | `ColorField` | `page.backgroundColor` | color |
| `pageNumber` | `PageNumberField` | `page.pageNumber` | boolean |
| `titleY` | `TitleYField` | `page.titleY` | number |

---

## 9. 数据流

```text
FieldRenderer
├── 接收: fieldKey (str)
├── 查找: FIELD_TO_COMPONENT_MAP[fieldKey]
├── 查找: 当前页面 pageId → pages[pageId]
├── 渲染: <Component page={page} onUpdate={updatePage} />
│
└── updatePage(updatedPage)
    └── Zustand Store: set(state => ({ pages: state.pages.map(update) }))
        └── React 重新渲染: EditorPage → Editor → FieldRenderer → Field
```