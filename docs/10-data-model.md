# 数据模型与类型系统参考

本文档完整记录了 SlideGrid Studio 中所有核心数据结构、类型定义及其关联关系。所有类型定义位于 `src/types.ts`。

---

## 1. 数据架构总览

```text
ProjectData (工程文件)
├── version: string          # 数据版本 "3.0.0"
├── title / projectTitle     # 工程标题
├── pages: PageData[]        # 核心页面数组 (见 §2)
├── theme: ProjectTheme      # 全局视觉主题 (见 §3)
├── designSystem: DesignSystem  # 设计令牌系统 (见 §4)
├── customFonts: CustomFont[]   # 自定义字体列表
├── imageQuality: number        # 图片压缩质量
├── counterStyle: CounterStyle  # 全局页码样式
├── printSettings: PrintSettings # 打印/出版设置
└── filePath?: string           # .slgrid 物理路径
```

---

## 2. PageData — 页面核心数据

`PageData` 是应用中最核心的数据结构，每一页幻灯片都是此类型的一个实例。

- **文件**: `src/types.ts` (第 161-220 行)

### 2.1 基础标识

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `string` | 页面唯一 ID (`slide-{timestamp}`) |
| `type` | `'slide' \| 'freeform'` | 页面类型: `slide` 为模板驱动，`freeform` 为自由排版 |
| `layoutId` | `TemplateId` | 关联的模板 ID (见模板注册表) |
| `aspectRatio` | `AspectRatioType` | 画面比例: `'16:9' \| '2:3' \| 'A4' \| '1:1'` |
| `layoutVariant` | `string` | 模板变体 (如 `'left'` / `'right'` / `'top'` / `'bottom'`) |

### 2.2 文本内容

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `title` | `string` (必需) | 主标题 |
| `subtitle` | `string` | 副标题 |
| `paragraph` | `string` | 段落正文 |
| `bullets` | `string[]` | 列表项 |
| `actionText` | `string` | 行动号召按钮文本 |
| `footer` | `string` | 页脚文字 |
| `imageLabel` | `string` | 图片元数据标签 |
| `imageSubLabel` | `string` | 图片副标签 |

### 2.3 媒体与视觉

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `image` | `string` | 主图片路径 (`asset://` 或 DataURL) |
| `logo` | `string` | Logo 图片路径 |
| `logoSize` | `number` | Logo 尺寸 (px) |
| `accentColor` | `string` | 强调色 (Hex) |
| `backgroundColor` | `string` | 背景色 (Hex) |
| `backgroundPattern` | `BackgroundPatternType` | 背景纹理: `'none' \| 'grid' \| 'dots' \| 'diagonal' \| 'cross'` |

### 2.4 排版控制

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `titleFont` | `string` | 标题字体 CSS 字族名 |
| `bodyFont` | `string` | 正文字体 CSS 字族名 |
| `pageNumber` | `boolean` | 是否显示页码 |
| `minimalCounter` | `boolean` | 极简页码模式 |
| `counterStyle` | `CounterStyle` | 页码样式: `'number' \| 'alpha' \| 'roman' \| 'dots'` |
| `counterColor` | `string` | 页码颜色 (Hex) |

### 2.5 可见性与覆盖

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `visibility` | `Record<string, boolean>` | 字段可见性控制 (`{ logo: false }`) |
| `styleOverrides` | `Record<string, any>` | 字段级样式覆盖 (编辑器微调) |

### 2.6 列表/集合数据 (模板特定)

| 字段 | 类型 | 关联模板示例 |
| :--- | :--- | :--- |
| `agenda` | `AgendaData[]` | Table of Contents |
| `features` | `FeatureData[]` | Platform Hero, Step Timeline |
| `metrics` | `MetricData[]` | Testimonial Card, Epilogue Pillar |
| `mosaic` | `any[]` | Component Mosaic |
| `testimonials` | `TestimonialData[]` | Testimonial Card, Community Hub |
| `gallery` | `any[]` | Gallery Capsule, Film Diptych |
| `bentoItems` | `BentoItem[]` | Apple Bento Grid |
| `resumeSections` | `ResumeSection[]` | Academic Hybrid Resume |

### 2.7 自由排版 (Freeform)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `freeformItems` | `any[]` | 自由排版元素列表 |
| `freeformConfig` | `{ gridSize, snapToGrid, showGridOverlay, showAlignmentGuides }` | 自由排版配置 |

---

## 3. 嵌套集合类型

### 3.1 `AgendaData`
议程/目录条目。

```typescript
interface AgendaData {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  location?: string;
  description?: string;
  items?: string[];
}
```

### 3.2 `FeatureData`
功能/特性条目。

```typescript
interface FeatureData {
  id: string;
  title: string;
  description?: string;
  desc?: string;       // 别名
  icon?: string;
  image?: string;
  imageConfig?: { scale: number; x: number; y: number };
}
```

### 3.3 `MetricData`
度量指标。

```typescript
interface MetricData {
  id: string;
  value: string;   // 大数字 (如 "100%")
  label: string;   // 标签
  icon?: string;
  unit?: string;
}
```

### 3.4 `TestimonialData`
推荐/评价。

```typescript
interface TestimonialData {
  id: string;
  content: string;
  quote?: string;     // 别名
  author: string;
  name?: string;      // 别名
  role?: string;
  avatar?: string;
}
```

### 3.5 `PartnerData`
合作伙伴 Logo 数据。

```typescript
interface PartnerData {
  id: string;
  name: string;
  logo?: string;
}
```

### 3.6 `BentoItem`
便当盒 (Bento Grid) 模块。

```typescript
interface BentoItem {
  id: string;
  type: 'metric' | 'icon-text' | 'image' | 'feature-list';
  x: number; y: number;       // 网格坐标
  colSpan: number; rowSpan: number;
  theme: 'light' | 'dark' | 'accent' | 'glass';
  title?: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  image?: string;
  imageConfig?: { scale: number; x: number; y: number };
  fontSize?: number;
}
```

### 3.7 `ResumeSection` / `ResumeItem`
简历数据结构 (V3+)。

```typescript
interface ResumeSection {
  id: string;
  title: string;        // 区块标题 (如 "工作经验")
  items: ResumeItem[];
}

interface ResumeItem {
  id: string;
  title: string;        // 职位/学历名称
  subtitle?: string;    // 公司/学校
  time?: string;        // 时间
  location?: string;    // 地点
  description?: string; // 详细描述 (支持 Markdown)
}
```

---

## 4. 主题系统

### 4.1 `ProjectTheme`
全局视觉主题，存储在 `ProjectData.theme` 中。

```typescript
interface ProjectTheme {
  colors: {
    primary: string;    // 主色 (默认: '#0F172A')
    secondary: string;  // 次色 (默认: '#64748B')
    accent: string;     // 强调色 (默认: '#264376')
    background: string; // 背景色 (默认: '#ffffff')
    surface: string;    // 卡片底色 (默认: '#F1F3F5')
  };
  typography: {
    headingFont: string;      // 英文标题字体 (默认: 'Playfair Display')
    bodyFont: string;         // 英文正文字体 (默认: 'Crimson Pro')
    captionFont?: string;     // 说明文字字体 (默认: 'Inter')
    headingFontZH?: string;   // 中文标题字体 (默认: 'Noto Serif SC')
    bodyFontZH?: string;      // 中文正文字体 (默认: 'Noto Serif SC')
  };
}
```

### 4.2 `DesignSystem`
设计令牌系统，提供精细化的样式拆解，**优先级高于** `ProjectTheme`。

```typescript
interface DesignSystem {
  tokens: DesignTokens;
  presets: {
    layout: Record<string, { p?: string; px?: string; py?: string }>;
    effects: Record<string, React.CSSProperties>;
  };
}
```

### 4.3 `DesignTokens`
原子化设计变量。

```typescript
interface DesignTokens {
  colors: Record<string, string>;           // 颜色 Token
  spacing: { none, xs, sm, md, lg, xl, gutter };  // 间距 Token
  typography: {
    scales: Record<string, string>;         // 字号阶梯
    body: TypographyToken;                  // 正文排版
    caption: TypographyToken;               // 说明排版
    display: TypographyToken;               // 标题排版
  };
}
```

### 4.4 `TypographyToken`
排版令牌单元。

```typescript
interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight?: string | number;
  textTransform?: string;
}
```

### 4.5 默认值 (来自 `src/constants/theme.ts`)

**默认 Design Tokens**:

| Token | fontSize | lineHeight | fontWeight | letterSpacing |
| :--- | :--- | :--- | :--- | :--- |
| `display` | 72px | 0.85 | 900 | -0.04em |
| `body` | 16px | 1.8 | 400 | 0.01em |
| `caption` | 10px | 1.5 | 900 | 0.25em |

**预设布局**:
- `'safe-area'`: `{ px: 'spacing.gutter', py: 'spacing.gutter' }`
- `'full-bleed'`: `{ p: 'spacing.none' }`

**预设效果**:
- `'glass-card'`: 毛玻璃卡片 `{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' }`
- `'hard-edge'`: 硬边缘 `{ border: '1px solid #000' }`

---

## 5. 布局系统类型

### 5.1 画面比例与方向

- **文件**: `src/constants/layout.ts`

```typescript
type AspectRatioType = '16:9' | '2:3' | 'A4' | '1:1';
type OrientationType = 'landscape' | 'portrait' | 'square' | 'resume';

interface LayoutDimensions {
  width: number;       // 像素宽度
  height: number;      // 像素高度
  label: string;       // 显示标签
  orientation: OrientationType;
}
```

**预定义尺寸**:

| 比例 | 宽度 | 高度 | 方向 |
| :--- | :--- | :--- | :--- |
| 16:9 | 1920 | 1080 | landscape |
| 2:3 | 1080 | 1620 | portrait |
| A4 | 1240 | 1754 | resume |
| 1:1 | 1080 | 1080 | square |

### 5.2 编辑器布局常量

```typescript
const LAYOUT = {
  EDITOR_PANEL_WIDTH: 400,  // 右侧编辑器宽度
  SIDEBAR_WIDTH: 96,        // 左侧侧边栏宽度
  SIDEBAR_OFFSET: -80,      // 侧边栏偏移
};
```

---

## 6. 模板 Schema 类型 (Template Schema Types)

### 6.1 节点系统

- **文件**: `src/templates/schemas/types.ts`

**支持的节点类型** (`NodeType`):
- `'Container'` — 布局容器 (Flex / Grid / Absolute / Modular)
- `'Component'` — 原子组件引用
- `'Repeater'` — 数据循环渲染
- `'Conditional'` — 条件分支
- `'Text'` — 纯文本节点

**统一联合类型**: `TemplateNode = ContainerNode | ComponentNode | ConditionalNode | RepeaterNode | TextNode`

### 6.2 `BaseNode` (所有节点公有属性)

```typescript
interface BaseNode {
  id?: string;
  className?: string;       // Tailwind CSS 类名
  style?: React.CSSProperties;  // 内联样式
  modular?: {               // 24x24 网格定位
    colStart?: number;      // 1-24
    colSpan?: number;       // 1-24
    rowStart?: number;      // 1-24
    rowSpan?: number;       // 1-24
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'stretch';
  };
  presetKey?: string;       // DesignSystem 预设引用
  visibleWhen?: string;     // 可见性表达式
}
```

### 6.3 `ContainerNode`
布局容器节点。

```typescript
interface ContainerNode extends BaseNode {
  type: 'Container';
  layout?: 'flex' | 'grid' | 'absolute' | 'modular';
  layoutProps?: FlexLayoutProps | GridLayoutProps | AbsoluteLayoutProps | ModularLayoutProps;
  children: TemplateNode[];
}
```

### 6.4 `ComponentNode`
组件引用节点，连接 Schema 与 React 视图。

```typescript
interface ComponentNode extends BaseNode {
  type: 'Component';
  componentType: string;   // COMPONENT_REGISTRY 中的 key (e.g. "ZineDisplay")
  bind?: string;           // 数据绑定表达式 (e.g. "page.title")
  props?: Record<string, any>;  // 静态 Props
}
```

### 6.5 `RepeaterNode`
数据循环渲染节点。

```typescript
interface RepeaterNode extends BaseNode {
  type: 'Repeater';
  bind: string;           // 数据源 (e.g. "page.agenda")
  itemVariable?: string;  // 循环变量名 (e.g. "item")
  template: TemplateNode; // 子模板
}
```

### 6.6 `ConditionalNode`
条件分支节点。

```typescript
interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: string;   // 条件表达式 (e.g. "page.layoutVariant === 'top'")
  then: TemplateNode;
  else?: TemplateNode;
}
```

### 6.7 `TemplateSchema`
模板完整定义。

```typescript
interface TemplateSchema {
  id: string;
  name: string;
  category: string;
  supportedRatios: AspectRatioType[];
  root: TemplateNode;
  defaults?: Record<string, any>;
  meta?: { version: string; author?: string };
}
```

---

## 7. 其他辅助类型

### 7.1 页码样式

```typescript
type CounterStyle = 'number' | 'alpha' | 'roman' | 'dots';
```

### 7.2 背景纹理

```typescript
type BackgroundPatternType = 'none' | 'grid' | 'dots' | 'diagonal' | 'cross';
```

### 7.3 自定义字体

```typescript
interface CustomFont {
  name: string;      // 字体名称
  family: string;    // CSS font-family
  dataUrl?: string;  // 字体文件 DataURL
}
```

### 7.4 排版设置

```typescript
interface TypographySettings {
  defaultLatin?: string;    // 默认拉丁字体
  defaultCJK?: string;      // 默认中文字体
  fieldOverrides?: Record<string, string>;  // 字段级字体覆盖
}
```

### 7.5 打印设置

```typescript
interface PrintSettings {
  enabled: boolean;
  widthMm: number; heightMm: number;
  gutterMm: number;
  showGutterShadow: boolean;
  showTrimShadow: boolean;
  showContentFrame: boolean;
  configs: {
    landscape: { bindingSide: Side; trimSide: Side };
    portrait: { bindingSide: Side; trimSide: Side };
    square: { bindingSide: Side; trimSide: Side };
    resume: { bindingSide: Side; trimSide: Side };
  };
}

type Side = 'left' | 'right' | 'top' | 'bottom';
```

### 7.6 保留数据结构

```typescript
interface ProjectSaveData extends ProjectData {
  assets?: Record<string, string>;  // 资产映射 (assetId -> DataURL)
}
```

---

## 8. 类型关系图

```text
ProjectData
├── pages: PageData[]
│   ├── layoutId -> TEMPLATES[].id -> TemplateConfig.schema -> TemplateSchema
│   ├── aspectRatio -> LAYOUT_CONFIG[ratio]
│   ├── agenda: AgendaData[]
│   ├── features: FeatureData[]
│   ├── metrics: MetricData[]
│   ├── testimonials: TestimonialData[]
│   ├── bentoItems: BentoItem[]
│   ├── resumeSections: ResumeSection[] -> ResumeItem[]
│   └── mosaic / gallery / freeformItems: any[]
├── theme: ProjectTheme
│   └── typography: { headingFont, bodyFont, ... }
├── designSystem: DesignSystem
│   ├── tokens: DesignTokens
│   │   ├── colors: Record<string, string>
│   │   ├── spacing: { none, xs, sm, md, lg, xl, gutter }
│   │   └── typography: { scales, body, caption, display }
│   └── presets: { layout, effects }
├── customFonts: CustomFont[]
├── printSettings: PrintSettings
└── counterStyle: CounterStyle
```