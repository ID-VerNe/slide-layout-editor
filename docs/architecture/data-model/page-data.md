# PageData 与嵌套集合类型

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
| `imageConfig` | `{ scale: number; x: number; y: number }` | 图片变换配置 (缩放 + 平移) |
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

### 2.7 列表配置 (模板特定)

| 字段 | 类型 | 关联模板 |
| :--- | :--- | :--- |
| `bentoConfig` | `{ rows: number; cols: number }` | Bento Grid 网格行列数配置 |
| `mosaicConfig` | `{ rows: number; cols: number; stagger?: boolean; tileColor?: string; icons?: Record<string, string> }` | Component Mosaic 布局配置 |

### 2.8 简历元数据

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `resumePageIndex` | `number` | 简历在多页中の逻辑页码索引 |

### 2.9 自由排版 (Freeform)

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

