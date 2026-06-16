# 列表与集合类字段

## 3. 列表/集合类字段

### 3.1 `FeaturesField`
功能/特性列表编辑。

- **文件**: `fields/FeaturesField.tsx`
- **绑定字段**: `page.features: FeatureData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 说明 |
| :--- | :--- | :--- |
| `title` | Input | 功能标题 |
| `description` | TextArea | 功能描述 (兼容旧字段 `desc`) |
| `icon` | IconPicker (`icons` + `upload` + `history`) | Lucide / Material Symbols 图标选择器，支持上传和项目图片复用 |
| `imageConfig` | Slider x3 | 图片缩放 + X/Y 偏移 (对有图片的条目显示调整面板) |

**额外特性**:
- **可见性开关**: Eye / EyeOff 切换显隐
- **自动 ID 迁移**: 旧数据兼容 (每个页面仅执行一次)
- **字体控制**: `PresetSelect` 分别调整 title / description 的字号与字族
- **数量限制**: 最多 8 个功能条目

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
| `description` | — | TextArea |

**关键特性**:
- **可复用性**: 通过 `titleLabel`, `subtitleLabel`, `timeLabel`, `locationLabel` 等 Props 可为简历模板定制字段名称
- **FieldWrapper 封装**: 支持显隐切换 (`fieldKey="agenda"`) 及样式配置面板 (`showStyleConfig`)

---

### 3.3 `MetricsField`
度量指标 (KPI) 编辑。使用 `FieldWrapper` 封装，字段键为 `bigDataMetrics`。

- **文件**: `fields/MetricsField.tsx`
- **绑定字段**: `page.metrics: MetricData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 示例 |
| :--- | :--- | :--- |
| `label` | Input | "年营收" |
| `value` | Input | "24.8B" |
| `unit` | Input | "USD (支持 LaTeX)" |

**特性**:
- `React.memo` 优化 (列表性能优化)
- **全局字号控制**: `PresetSelect` 调整 `styleOverrides.metrics.fontSize`
- **行内紧凑布局**

### 3.4 `BigDataMetricsField`
大数据指标网格编辑。提供一个可视化网格设计器，用于定义行列数并排列 `MetricData`。

- **文件**: `fields/BigDataMetricsField.tsx`
- **绑定字段**: `page.metrics: MetricData[]` + `page.bigDataMetricsConfig: { rows, cols }`

**编辑项**:

| 功能 | 控件 | 说明 |
| :--- | :--- | :--- |
| 样式面板 | `MetricsStylePanel` | 分别调整 value / label / unit 的字号、字体、颜色、字重、斜体 |
| 网格配置 | Input x2 | 设置 `rows` (1-10) 与 `cols` (1-10) |
| 可视化设计器 | Modal | 以网格拖拽/点击方式增删改指标条目，并同步保存 `metrics` 与 `bigDataMetricsConfig` |

---

### 3.5 `TestimonialsField`
推荐/评价列表编辑。

- **文件**: `fields/TestimonialsField.tsx`
- **绑定字段**: `page.testimonials: TestimonialData[]`

**每种条目的编辑项**:
| 字段 | 控件 | 说明 |
| :--- | :--- | :--- |
| `name` | Input | 作者姓名 |
| `quote` | TextArea | 引文/推荐语 |
| `avatar` | IconPicker | 头像，支持项目历史图片复用 |

**额外特性**:
- **可见性开关**: Eye / EyeOff 切换显隐
- **字体控制**: `PresetSelect` 分别调整 name / quote 的字号与字族
- **默认条目**: 创建时预设 `{ name, quote, avatar }`
- **数量限制**: 最多 8 条评价

---

### 3.6 `BulletsField`
无序列表 (Bullet Points) 编辑。

- **文件**: `fields/BulletsField.tsx`
- **绑定字段**: `page.bullets: string[]`
- **FieldWrapper 封装**: 支持显隐切换 (`fieldKey="bullets"`)
- **编辑**: 每项为 `DebouncedInput` 文本编辑，支持添加/删除
- **字号控制**: `PresetSelect` 调整 `styleOverrides.bullets.fontSize`
- **图标**: `List`

### 3.7 `BentoField`
Bento Grid 网格编辑。

- **文件**: `fields/BentoField.tsx`
- **绑定字段**: `page.bentoItems: BentoItem[]` + `page.bentoConfig: { rows, cols }`
- **封面描述**: 含网格配置 (行列 1-24 / 1-20)、可视化网格设计器 (Modal) 以及条目列表
- **每种条目控件**:
  - 类型选择器 (`type`): `metric` / `icon-text` / `image` / `feature-list`
  - 按类型显示不同编辑字段（metric 显示 value+title，image 显示 image picker 等）
  - 主题 (`theme`): `light` / `dark` / `accent` / `glass` (色块选择)
  - 字号控制 (`fontSize`): `PresetSelect`
  - 图片调整面板 (`imageConfig`): Scale / X Pos / Y Pos Slider
- **资产选择**: 图片项的 `IconPicker` 支持 `upload` + `map` + `history` Tab
- **可视化设计器**: 在网格上选择连续区域，双击或点击 Create Selection 创建条目，支持移除与保存

### 3.8 `GalleryField`
画廊/图片集编辑。

- **文件**: `fields/GalleryField.tsx`
- **绑定字段**: `page.gallery: { id, url, config: { scale, x, y } }[]`
- **FieldWrapper 封装**: 支持显隐切换 (`fieldKey="gallery"`)
- **资产选择**: 每个画廊图片使用 `IconPicker` 支持 `upload` + `history` Tab
- **图片调整**: 对有图片的条目支持图片缩放 (Zoom) 及 X/Y 偏移 Slider 调整面板
- **数量限制**: 最多 6 张图片

### 3.9 `MosaicField`
马赛克/拼贴编辑。

- **文件**: `fields/MosaicField.tsx`
- **绑定字段**: `page.mosaicConfig: { rows, cols, stagger, tileColor, icons }` (保存于 `mosaicConfig` 对象)
- **编辑控件**:
  - Rows / Cols: `Slider` (Rows: 1-5, Cols: 1-8)
  - Stagger Rows: `checkbox` (错行显示)
  - Tile Color: `颜色选择器`
  - Icons 网格: 每个格子使用 `IconPicker`，支持项目历史图片复用
- **格子预览**: 支持图片 / Material Symbols
- **可见性开关**: 通过独立的 Eye / EyeOff 按钮切换 (`page.visibility.mosaic`)

### 3.10 `PartnersField`
合作伙伴 Logo 列表编辑。

- **文件**: `fields/PartnersField.tsx`
- **绑定字段**: `page.partners: PartnerData[]`
- **每种条目控件**: `name` (Input)、`logo` (IconPicker)
- **资产选择**: 每个合作伙伴 Logo 支持 `IconPicker` 项目图片复用
- **可见性开关**: Eye / EyeOff 切换显隐
- **自动 ID 迁移**: 旧数据兼容 (自动生成 `id`)
- **数量限制**: 最多 8 个合作伙伴

---