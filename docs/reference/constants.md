# 全局常量与配置参考 (Constants & Config)

本章记录了 SlideGrid Studio 中的全局设计参数、布局配置与静态资源映射。

---

## 1. 布局与画布配置 (`layout.ts`)

- **文件**: `src/constants/layout.ts`

### 1.1 比例与尺寸 (`LAYOUT_CONFIG`)
定义了编辑器画布在不同比例下的原始像素尺寸：

| 比例 | 宽度 (px) | 高度 (px) | 描述 |
| :--- | :--- | :--- | :--- |
| `16:9` | 1920 | 1080 | 标准宽屏 |
| `2:3` | 1080 | 1620 | 海报排版 |
| `A4` | 1240 | 1754 | 专业简历 (Resume 专用) |
| `1:1` | 1080 | 1080 | 正方形 |

### 1.2 编辑器 UI 常量
- `SIDEBAR_WIDTH`: 96px (左侧导航栏)
- `EDITOR_PANEL_WIDTH`: 400px (右侧编辑面板)

---

## 2. 编辑器预设系统 (`editorPresets.ts`)

- **文件**: `src/constants/editorPresets.ts`
- **用途**: 定义编辑器中字号、行高、字距的受控预设选项，确保设计一致性

### 2.1 字号预设 (`FONT_SIZE_PRESETS`)

12 档字号预设，涵盖从微小文字到艺术大字的全尺度范围：

```typescript
export const FONT_SIZE_PRESETS: PresetOption<number>[] = [
  { value: 6, label: '6pt (Micro)' },
  { value: 7, label: '7pt (Caption)' },
  { value: 10, label: '10pt (Body)' },
  { value: 12, label: '12pt (Body+)' },
  { value: 14, label: '14pt (Lead)' },
  { value: 18, label: '18pt (Subhead)' },
  { value: 24, label: '24pt (H3)' },
  { value: 32, label: '32pt (H2)' },
  { value: 48, label: '48pt (H1)' },
  { value: 64, label: '64pt (Display)' },
  { value: 80, label: '80pt (Hero)' },
  { value: 120, label: '120pt (Art)' },
];
```

**设计原则**:
- 遵循杂志排版的离散尺度体系
- 每档之间保持视觉节奏的平衡跳跃
- 对齐 DesignSystem.typography.scales

### 2.2 行高预设 (`LINE_HEIGHT_PRESETS`)

7 档行高预设，适配不同排版密度需求：

```typescript
export const LINE_HEIGHT_PRESETS: PresetOption<number>[] = [
  { value: 1.0, label: '1.0 (Tight)' },
  { value: 1.1, label: '1.1 (Display)' },
  { value: 1.2, label: '1.2 (Compact)' },
  { value: 1.4, label: '1.4 (Normal)' },
  { value: 1.6, label: '1.6 (Relaxed)' },
  { value: 1.8, label: '1.8 (Loose)' },
  { value: 2.0, label: '2.0 (Double)' },
];
```

**使用场景**:
- `1.0-1.2`: 大字号标题、艺术字
- `1.4-1.6`: 正文、段落
- `1.8-2.0`: 松散排版、诗歌引用

### 2.3 字距预设 (`LETTER_SPACING_PRESETS`)

7 档字距预设，控制字符间距：

```typescript
export const LETTER_SPACING_PRESETS: PresetOption<string>[] = [
  { value: '-0.05em', label: '-0.05em (Tight)' },
  { value: '0', label: '0 (Normal)' },
  { value: '0.05em', label: '0.05em (Wide)' },
  { value: '0.1em', label: '0.1em (Airy)' },
  { value: '0.15em', label: '0.15em (Tracking)' },
  { value: '0.2em', label: '0.2em (Caps)' },
  { value: '0.3em', label: '0.3em (Display)' },
];
```

**设计原则**:
- 负值用于大字号压紧
- 正值用于小号字母、全大写
- 以 `em` 为单位，相对于字号自适应

### 2.4 类型定义

```typescript
export interface PresetOption<T extends string | number> {
  value: T;
  label: string;
}
```

**泛型约束**: 支持 `number`（字号、行高）和 `string`（字距）类型

---

## 3. 图标系统 (`icons.ts`)

- **文件**: `src/constants/icons.ts`
- **图标库**: 基于 `lucide-react`。

### 3.1 `LUCIDE_ICON_MAP`
将字符串 ID 映射到具体的 Lucide 组件，用于模板 Schema 动态渲染图标。支持 50+ 个 Lucide 图标。

### 3.2 `CATEGORIZED_ICONS`
用于图标选择器中的分组展示，同时支持 Material Symbols 和 Lucide 图标，包含：
- Technology & Infrastructure (50+ 图标)
- Biotech & Life Sciences (50+ 图标)
- Finance & High-Growth (50+ 图标)
- Communication & Global (40+ 图标)
- Security & Systems (50+ 图标)

---

## 4. 设计系统令牌 (`theme.ts`)

- **文件**: `src/constants/theme.ts`
- **内容**: 预设的主题调色板、设计令牌系统。

### 4.1 默认设计系统 (`DEFAULT_DESIGN_SYSTEM`)

```typescript
export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  tokens: {
    colors: {
      primary: '#0F172A',      // 深灰黑（标题）
      secondary: '#64748B',    // 中灰（副标题、说明）
      accent: '#264376',       // 深蓝强调色
      background: '#ffffff',   // 背景白
      surface: '#F1F3F5'       // 表面灰
    },
    spacing: {
      none: '0px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      gutter: '24px'
    },
    typography: {
      scales: {
        display: '64pt',
        h1: '48pt',
        h2: '32pt',
        body: '10pt',
        caption: '7pt'
      },
      body: {
        fontSize: '10pt',
        lineHeight: '1.6',
        fontWeight: '400',
        letterSpacing: '0',
        fontStyle: 'italic'
      },
      caption: {
        fontSize: '7pt',
        lineHeight: '1.8',
        fontWeight: '700',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      },
      display: {
        fontSize: '48pt',
        lineHeight: '1.1',
        fontWeight: '400',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }
    }
  },
  presets: {
    layout: {
      'safe-area': { px: 'spacing.gutter', py: 'spacing.gutter' },
      'full-bleed': { p: 'spacing.none' }
    },
    effects: {
      'glass-card': { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' },
      'hard-edge': { border: '1px solid #000' }
    }
  }
};
```

### 4.2 颜色令牌系统

| 令牌名 | 默认值 | 用途 |
|--------|--------|------|
| `primary` | `#0F172A` | 主标题、正文文字 |
| `secondary` | `#64748B` | 副标题、说明文字、元数据 |
| `accent` | `#264376` | 深蓝强调色、分割线、图标 |
| `background` | `#ffffff` | 页面背景 |
| `surface` | `#F1F3F5` | 卡片、面板背景 |

### 4.3 字体令牌规模

**Display（展示级）**：
- 用于大标题、封面标题
- 默认字号: `48pt`, 默认字重: `400`, 行高: `1.1`
- 默认字距: `+0.2em`, 默认全大写

**Body（正文级）**：
- 用于段落、描述文字
- 默认字号: `10pt`, 默认字重: `400`, 行高: `1.6`
- 默认斜体 (`fontStyle: 'italic'`)

**Caption（标注级）**：
- 用于元数据、页码、小字标签
- 默认字号: `7pt`, 默认字重: `700`, 行高: `1.8`
- 默认全大写, 默认字距: `+0.2em`

### 4.4 间距令牌

基于 8px 网格系统：

| 令牌 | 值 | 用途 |
|------|-----|------|
| `none` | `0px` | 零间距 |
| `xs` | `4px` | 最小间距 |
| `sm` | `8px` | 基础单元 |
| `md` | `16px` | 标准间距 |
| `lg` | `24px` | 区块间距 |
| `xl` | `32px` | 大区块间距 |
| `gutter` | `24px` | 安全区边距 |

---

## 5. 字段配置 (`fields.ts`)

- **文件**: `src/constants/fields.ts`

### 5.1 `GLOBAL_FIELDS` 全局同步字段

定义哪些字段在更新时需要同步到所有页面，确保幻灯片整体风格一致：

```typescript
export const GLOBAL_FIELDS: Array<keyof PageData> = [
  'counterStyle',
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

- **文件**: `src/templates/registry.ts`
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
| `paragraph` | `ParagraphField` | 段落正文 |
| `actionText` | `ActionTextField` | CTA 按钮文本 |
| `signature` | `SignatureField` | 签名/结语 |
| `partnersTitle` | `PartnersTitleField` | 合作伙伴标题 |
| `footer` | `FooterField` | 页脚 |
| `imageLabel` | `ImageLabelField` | 图片主标签 |
| `imageSubLabel` | `ImageSubLabelField` | 图片副标签 |
| `image` | `ImageField` | 图片上传 |
| `logo` | `LogoField` | Logo 上传 |
| `backgroundColor` | `ColorField` | 背景色 |
| `pageNumber` | `PageNumberField` | 页码开关/样式 |
| `logoSize` | `GenericNumberField` | Logo 尺寸 |
| `titleY` | `TitleYField` | 标题 Y 偏移 |
| `variant` | `VariantField` | 布局变体选择 |
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
| `artFont` | `ArtFontField` | SVG 艺术字 |

---
## 6. 主题默认值 (`theme.ts`)

- **文件**: `src/constants/theme.ts`

### 6.1 `DEFAULT_THEME`

全局视觉主题的默认配置：

```typescript
export const DEFAULT_THEME: ProjectTheme = {
  colors: { 
    primary: '#0F172A', 
    secondary: '#64748B', 
    accent: '#264376', 
    background: '#ffffff', 
    surface: '#F1F3F5' 
  },
  typography: { 
    headingFont: "'Playfair Display', serif", 
    bodyFont: "'Inter', sans-serif",
    captionFont: "'Inter', sans-serif",
    headingFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif", 
    bodyFontZH: "'STFangsong', 'FangSong', 'Noto Serif SC', serif" 
  }
};
```

### 6.2 `DEFAULT_PRINT_SETTINGS`

打印/出版设置的默认值：

```typescript
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  enabled: false, 
  widthMm: 100, 
  heightMm: 145, 
  gutterMm: 10,
  showGutterShadow: true, 
  showTrimShadow: true, 
  showContentFrame: true,
  configs: { 
    landscape: { bindingSide: 'bottom', trimSide: 'right' }, 
    portrait: { bindingSide: 'left', trimSide: 'bottom' }, 
    square: { bindingSide: 'left', trimSide: 'bottom' },
    resume: { bindingSide: 'left', trimSide: 'bottom' }
  }
};
```

---
## 7. 模板注册表 (`registry.ts`)

- **文件**: `src/templates/registry.ts`

### 7.1 模板分类

模板按以下 6 个分类组织（定义在 `TemplateConfig.category` 联合类型中）：

| 分类 | 值 | 说明 |
|:---|:---|:---|
| Cover | `'Cover'` | 封面类 |
| Gallery | `'Gallery'` | 画册类 |
| Product | `'Product'` | 产品展示 |
| Marketing | `'Marketing'` | 营销宣传 |
| General | `'General'` | 通用排版 |
| Resume | `'Resume'` | 简历类 |

### 7.2 模板配置结构

```typescript
interface TemplateConfig {
  id: string;                      // 唯一标识
  name: string;                    // 显示名称
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume';
  desc: string;                    // 描述
  tags: string[];                  // 搜索标签
  component: React.FC;             // React 渲染组件 (Schema 驱动时可为 null)
  schema?: TemplateSchema;         // JSON Schema 定义
  fields: FieldSchema[];           // 编辑器字段
  supportedRatios: AspectRatioType[]; // 支持的画幅
  defaultData?: Partial<PageData>; // 默认数据
}
```

### 7.3 模板查询工具

```typescript
// 按 ID 查找模板
export function getTemplateById(id: string): TemplateConfig | undefined;

// 按分类过滤模板
export function getTemplatesByCategory(category: string): TemplateConfig[];

// 按画幅过滤模板
export function getTemplatesByRatio(ratio: AspectRatioType): TemplateConfig[];

// 搜索模板（名称、标签、描述）
export function searchTemplates(query: string): TemplateConfig[];
```

---
## 8. 快捷键参考

应用支持以下全局快捷键（当焦点不在输入框内时生效）：

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl+S` | 智能保存 (Smart Save) |
| `Ctrl+Shift+S` | 另存为 (Save As) |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | 重做 |
| `Alt+;` | 切换 24x24 调试网格 |
| `ArrowLeft` / `ArrowRight` | 切换页面 |
| `Delete` | 删除当前页面 |

---
## 9. 使用示例

### 9.1 访问设计令牌

```typescript
import { DEFAULT_DESIGN_SYSTEM } from '../constants/theme';

// 读取颜色令牌
const primaryColor = DEFAULT_DESIGN_SYSTEM.tokens.colors.primary;

// 读取字体令牌
const displayFont = DEFAULT_DESIGN_SYSTEM.tokens.typography.display;

// 读取间距令牌
const spacing = DEFAULT_DESIGN_SYSTEM.tokens.spacing.md;
```

### 9.2 使用布局预设

```typescript
// 在模板 Schema 中引用预设
{
  type: 'Container',
  presetKey: 'safe-area',  // 引用预设
  children: [...]
}
```

### 9.3 注册新模板

```typescript
import { TEMPLATES } from '../templates/registry';

TEMPLATES.push({
  id: 'my-custom-template',
  name: 'My Custom Template',
  category: 'Gallery',
  desc: '自定义画册模板',
  tags: ['gallery', 'photo', 'portrait'],
  component: () => null,
  schema: MyTemplateSchema,
  fields: withBaseFields(['title', 'image', 'description']),
  supportedRatios: ['2:3'],
  defaultData: {
    title: '画册标题',
    description: '描述文字'
  }
});
```
