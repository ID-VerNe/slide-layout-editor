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
| `description` | TextArea | 功能描述 |
| `icon` | IconPicker | Lucide 图标选择器，允许切换 `history` 复用项目图片 |
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
| 字段 | 控件 | 别名 |
| :--- | :--- | :--- |
| `content` / `quote` | TextArea | 引文/推荐语 |
| `name` / `author` | Input | 作者姓名 |
| `role` | Input | 职位/身份 |
| `avatar` | IconPicker (`upload` + `history`) | 头像，支持项目图片复用 |

---

### 3.6 `BulletsField`
无序列表 (Bullet Points) 编辑。

- **文件**: `fields/BulletsField.tsx`
- **绑定字段**: `page.bullets: string[]`
- **特性**: 支持拖放排序、快捷键添加/删除
- **图标**: `List`

### 3.7 `BentoField`
Bento Grid 网格编辑。

- **文件**: `fields/BentoField.tsx`
- **绑定字段**: `page.bentoItems: BentoItem[]`
- **每种条目控件**: 类型选择器 (`type`)、网格定位 (`x`, `y`, `colSpan`, `rowSpan`)、主题 (`theme`)、内容
- **资产选择**: 图片项的 `IconPicker` 支持 `upload` + `history` Tab

### 3.8 `GalleryField`
画廊/图片集编辑。

- **文件**: `fields/GalleryField.tsx`
- **绑定字段**: `page.gallery: any[]`
- **资产选择**: 每个画廊图片支持 `upload` + `history` Tab

### 3.9 `MosaicField`
马赛克/拼贴编辑。

- **文件**: `fields/MosaicField.tsx`
- **绑定字段**: `page.mosaicConfig.icons` 等
- **资产选择**: 每个马赛克格子使用 `IconPicker`，支持项目历史图片复用

### 3.10 `PartnersField`
合作伙伴 Logo 列表编辑。

- **文件**: `fields/PartnersField.tsx`
- **绑定字段**: `page.partners: PartnerData[]`
- **资产选择**: 每个合作伙伴 Logo 支持 `IconPicker` 项目历史图片复用

