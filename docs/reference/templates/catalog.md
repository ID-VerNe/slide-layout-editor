# 模板分类目录

## 1. 模板架构

### 1.1 模板注册
所有模板在 [src/templates/registry.ts](src/templates/registry.ts) 中注册为 `TemplateConfig` 数组 `TEMPLATES`。每个模板包含：

```typescript
interface TemplateConfig {
  id: string;               // 唯一 ID (如 'zine-classic')
  name: string;             // 显示名称
  category: 'Cover' | 'Product' | 'Marketing' | 'General' | 'Gallery' | 'Resume' | 'Bilingual';
  desc: string;             // 描述文案
  tags: string[];           // 搜索标签
  component: React.FC<{ page: any; typography?: any }>;  // React 渲染组件 (Schema 驱动时设为 () => null)
  schema?: TemplateSchema;  // 模板 Schema 定义 (JSON 布局树)
  fields: FieldSchema[];    // 编辑器面板中显示的字段列表
  supportedRatios: AspectRatioType[]; // 支持的画面比例 (含 3:4)
  defaultData?: Partial<PageData>;    // 模板级默认数据
}
```

### 1.2 `TemplateDefinition` 物理存储
在最新解耦架构中，全量 36 个模板作为独立的 `.json` 文件规范保存在 [src/templates/definitions/](src/templates/definitions/) 下按**分类目录**归档。`registry.ts` 通过 Vite 的 `import.meta.glob('./definitions/**/*.json', { eager: true })` 静态载入。Schema 使用 `Container`、`Component`、`Repeater`、`Conditional`、`Text` 五种节点类型构建 24×24 网格渲染树。所有原子组件均支持 **9 点网格对齐 (9-point docking)** 与 8px 基线字阶。

## 2. 模板分类与物理结构

物理模板按照 7 大分类子目录存储在 `src/templates/definitions/<Category>/` 目录中：

### 2.1 封面类 (Cover)
目录：`src/templates/schemas/Universal-Cover` (多比例) 或 `src/templates/schemas/23-Cover` (2:3)

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `cinematic-full-bleed` | Cinematic Bleed | 全屏电影感封面，支持标题置顶/置底变体 | 16:9, 2:3 |
| `editorial-classic` | Editorial Classic | Kinfolk 风格杂志封面，大面积中央主图 | 2:3 |
| `editorial-back-cover` | Editorial Back | 极简杂志封底排版 | 2:3 |

### 2.2 画册类 (Gallery)
目录：`src/templates/schemas/Universal-Gallery` 或 `src/templates/schemas/23-Gallery`

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `zine-classic` | Zine Classic | 24x24 模块化网格标准模板，工业精密感 | 16:9, 2:3, A4 |
| `gravity-anchor-intro` | Gravity Anchor | 底部大面积图片锚点的章节引入页 | 2:3 |
| `sincerity-portrait` | Sincerity Portrait | 大面积人像图片与重叠排版 | 2:3 |
| `kinfolk-feature` | Editorial Feature | 竖向排版与大幅图片的摄影特写 | 2:3 |
| `kinfolk-montage` | Art Montage | 错落双图拼贴布局 | 2:3 |
| `film-diptych` | Film Diptych | 双图并置，支持水平/垂直分割 | 2:3 |
| `micro-anchor` | Micro Anchor | 小面积居中图片与元数据锚点 | 2:3 |
| `artistic-l-space` | Artistic L-Space | L 型负空间，图片右下出界 (支持左右变体) | 2:3 |
| `floating-gallery` | Floating Gallery | 居中悬浮图片 + 宽留白画框感 | 2:3 |
| `cinematic-letterbox` | Cinematic Letterbox | 宽银幕电影感 + 极端横向排版 | 2:3 |
| `vertical-column` | Vertical Column | 左侧出界图片 + 右侧结构化白边栏 | 2:3 |
| `horizon-sky` | Horizon Sky | 顶部"天空"负空间 + 底部"大地"图片 | 2:3 |
| `epilogue-pillar` | Epilogue Pillar | 居中竖排"柱状"结语文案 + 版权信息 | 2:3 |
| `future-focus` | Future Focus | 金色强调色 + 背景大数字 | 16:9, 2:3 |
| `back-cover-movie` | Back Cover Movie | 电影片尾字幕风格封底 | 16:9, 2:3 |
| `gallery-capsule` | Capsule Mosaic | 胶囊形状多图裁剪展示，支持圆角特性 | 16:9, 2:3 |
| `editorial-split` | Editorial Split | 图片与结构化文本的平衡分割布局 | 16:9, 2:3 |

### 2.3 产品与营销 (Product & Marketing)
目录：`src/templates/schemas/169-Product`、`src/templates/schemas/Universal-Product` 或 `src/templates/schemas/Universal-Marketing`

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `apple-bento-grid` | Bento Showcase | 苹果风格 16 宫格矩阵产品展示 | 16:9 |
| `modern-feature` | Modern Feature | 粗体文字 + 大面积视觉的产品展示 | 16:9, 2:3 |
| `component-mosaic` | Component Mosaic | 图标网格 + 侧边栏的组合展示 | 16:9, 2:3 |
| `platform-hero` | Platform Hero | 居中产品公告 + 功能网格 | 16:9, 2:3 |
| `testimonial-card` | Testimonial Card | 专业头像 + 引言 + 验证指标 | 16:9, 2:3 |
| `community-hub` | Community Hub | 行动号召 + 推荐语 + 合作伙伴网格 | 16:9, 2:3 |

### 2.4 通用类 (General)
目录：`src/templates/schemas/Universal-General`

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `kinfolk-essay` | Editorial Essay | 编辑叙事排版，支持首字下沉与结构化元数据 | 2:3, A4 |
| `typography-hero` | Typography Hero | 超大字号驱动的纯文字排版艺术 | 16:9, 2:3 |
| `big-statement` | Big Statement | 居中极简主义高冲击力标语排版 | 16:9, 2:3 |
| `step-timeline` | Step Timeline | 顺序流程/里程碑时间轴 | 16:9, 2:3 |
| `table-of-contents` | Table of Contents | 卡片式导航目录页 | 16:9, 2:3 |

### 2.5 简历类 (Resume)
目录：`src/templates/definitions/Resume/`

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `academic-hybrid-resume` | Dynamic Resume Pro | 基于区块的技术简历，支持智能格式化与模块化列表 | A4 |

> 注：虽然只有 1 个简历模板，但它通过 `ResumeContentHub`（集中内容管理器）提供了极高的自由度——支持多区块、多条目、拖放排序、跨页迁移等功能。

### 2.6 双语阅读类 (Bilingual)
目录：`src/templates/definitions/Bilingual/`

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `bilingual-cover` | Bilingual Cover | 经典画廊风双语刊头封面与精要导读 | 3:4, 2:3, 16:9 |
| `bilingual-reader` | Bilingual Reader | 编辑部精选对齐式双语正文精读与侧边栏 | 3:4, 2:3, 16:9 |
| `bilingual-quote` | Bilingual Quote | 名人名言双语对照排版，大字号衬线聚焦 | 3:4, 2:3, 16:9 |
| `bilingual-glossary` | Bilingual Glossary | 策展式词汇精读卡片，包含音标、词性与双语对照例句 | 3:4, 2:3, 16:9 |

