# 图标与字段配置

## 3. 图标系统 (`icons.ts`)

- **文件**: `src/constants/icons.ts`
- **图标库**: 基于 `lucide-react`。

### 3.1 `LUCIDE_ICON_MAP`
将字符串 ID 映射到具体的 Lucide 组件，用于模板 Schema 动态渲染图标。支持 85 个 Lucide 图标。

### 3.2 `CATEGORIZED_ICONS`
用于图标选择器中的分组展示，同时支持 Material Symbols 和 Lucide 图标。每个分类包含一个代表图标 (`icon` 字段) 和图标列表 (`icons` 数组)，包含：

| 分类 | 代表图标 | Lucide 图标数 | Material 图标数 | 总计 |
|:---|:---|:---:|:---:|:---:|
| Technology & Infrastructure | `Cpu` | 15 | ~55 | 70+ |
| Biotech & Life Sciences | `Rocket` | 18 | ~45 | 60+ |
| Finance & High-Growth | `BarChart3` | 13 | ~50 | 60+ |
| Communication & Global | `Globe` | 14 | ~40 | 50+ |
| Security & Systems | `ShieldCheck` | 15 | ~40 | 55+ |

部分 Lucide 图标（如 `HelpCircle`、`Search`、`LayoutGrid`、`Upload`、`History`、`Image`）仅注册在 `LUCIDE_ICON_MAP` 中，未出现在分类列表里。

---

## 5. 字段配置 (`fields.ts`)

- **文件**: `src/constants/fields.ts`

### 5.1 `GLOBAL_FIELDS` 全局同步字段

定义哪些字段在更新时需要同步到所有页面，确保幻灯片整体风格一致：

```typescript
export const GLOBAL_FIELDS: Array<keyof PageData> = [
  'counterStyle',
  'counterColor',
  'backgroundPattern',
  'footer',
  'titleFont',
  'bodyFont',
  'logo',
  'logoSize',
  'accentColor',
  'pageNumber'
];
```

### 5.2 `withBaseFields` 辅助函数

- **文件**: `src/templates/registry.ts`（模块内部常量，未导出）
- **用途**: 为模板自动添加基础字段（背景色、页码）：

```typescript
const withBaseFields = (fields: (FieldType | FieldSchema)[]): FieldSchema[] => {
  const base: FieldSchema[] = [{ key: 'backgroundColor' }, { key: 'pageNumber' }];
  const custom = fields.map(f => typeof f === 'string' ? { key: f as FieldType } : f);
  return [...base, ...custom];
};
```

### 5.3 字段类型枚举

完整的 `FieldType` 联合类型（来自 `src/types.ts`）：

| 字段类型 | 对应组件 | 说明 |
|---------|---------|------|
| `title` | `TitleField` | 主标题文本 |
| `subtitle` | `SubtitleField` | 副标题文本 |
| `paragraph` | `ParagraphField` | 段落正文（基于 `GenericTextField`） |
| `paragraphZH` | `ParagraphZHField` | 双语中文正文（基于 `GenericTextField`） |
| `quoteZH` | `QuoteZHField` | 双语引言中文字段（基于 `GenericTextField`） |
| `sideHeader` | `SideHeaderField` | 侧边栏小标题（基于 `GenericTextField`） |
| `actionText` | `ActionTextField` | CTA 按钮文本（基于 `GenericTextField`） |
| `signature` | `SignatureField` | 签名/结语 |
| `partnersTitle` | `PartnersTitleField` | 合作伙伴标题 |
| `footer` | `FooterField` | 页脚 |
| `imageLabel` | `ImageLabelField` | 图片主标签（基于 `GenericTextField`） |
| `imageSubLabel` | `ImageSubLabelField` | 图片副标签（基于 `GenericTextField`） |
| `image` | `ImageField` | 图片上传 |
| `logo` | `LogoField` | Logo 上传 |
| `backgroundColor` | `ColorField` | 背景色 |
| `pageNumber` | `PageNumberField` | 页码开关/样式 |
| `logoSize` | `GenericNumberField` | Logo 尺寸 |
| `titleY` | `TitleYField` | 标题 Y 偏移 |
| `variant` | `VariantField` | 布局变体（使用 `DirectionSwitcher` 分段器） |
| `separator` | `SeparatorField` | 分割线控制 |
| `features` | `FeaturesField` | 功能特性列表 |
| `bentoItems` | `BentoField` | Bento Grid |
| `mosaic` | `MosaicField` | 拼贴网格 |
| `metrics` | `MetricsField` | KPI 指标 |
| `testimonials` | `TestimonialsField` | 推荐/评价 |
| `agenda` | `AgendaField` | 议程/目录 |
| `gallery` | `GalleryField` | 多图画廊 |
| `bullets` | `BulletsField` | 无序列表 |
| `partners` | `PartnersField` | 合作伙伴 Logo |
| `resumeSections` | `ResumeSectionsField` | 简历区块 |
| `vocabItems` | `VocabItemsField` | 策展双语生词卡片列表 |
| `artFont` | `ArtFontField` | SVG 艺术字 |
| `group` | `GroupField` | 字段分组折叠 |
| `bigDataMetrics` | `BigDataMetricsField` | 可视化网格指标 |
