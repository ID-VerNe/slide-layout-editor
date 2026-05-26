# 模板库参考 (Template Catalog)

SlideGrid Studio 提供了 30+ 专业排版模板，涵盖封面、画册、产品展示、营销宣传及简历等领域。所有模板基于 24x24 模块化网格，由 `TemplateSchema` JSON 驱动渲染。

---

## 1. 模板架构

### 1.1 模板注册
所有模板在 [src/templates/registry.ts](src/templates/registry.ts) 中注册为 `TemplateConfig` 数组 `TEMPLATES`。每个模板包含：

```typescript
interface TemplateConfig {
  id: string;               // 唯一 ID (如 'zine-classic')
  name: string;             // 显示名称
  category: string;         // 分类: Cover / Product / Marketing / General / Gallery / Resume
  desc: string;             // 描述文案
  tags: string[];           // 搜索标签
  component: React.FC;      // React 渲染组件 (Schema 驱动时可为 null)
  schema?: TemplateSchema;  // 模板 Schema 定义 (JSON 布局树)
  fields: FieldSchema[];    // 编辑器面板中显示的字段列表
  supportedRatios: AspectRatioType[]; // 支持的画面比例
}
```

### 1.2 `TemplateSchema` 定义
每个模板的布局由 [src/templates/schemas/](src/templates/schemas/) 下的 TS 文件定义。Schema 使用 `Container`、`Component`、`Repeater`、`Conditional`、`Text` 五种节点类型构建渲染树。详见 [模板引擎文档](../architecture/template-engine.md)。

---

## 2. 模板分类与完整目录

### 2.1 封面类 (Cover)
用于开篇、章节首页的大张力排版。

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `cinematic-full-bleed` | Cinematic Bleed | 全屏电影感封面，支持标题置顶/置底变体 | 16:9, 2:3 |
| `editorial-classic` | Editorial Classic | Kinfolk 风格杂志封面，大面积中央主图 | 2:3 |
| `editorial-back-cover` | Editorial Back | 极简杂志封底排版 | 2:3 |

### 2.2 画册类 (Gallery)
面向摄影、时尚、艺术出版的内页排版。**这是最大的分类**，涵盖 Zine 美学体系的核心模板。

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
| `gallery-capsule` | Capsule Mosaic | 胶囊形状多图裁剪展示，支持 Under/Over/Minimal 变体 | 16:9, 2:3 |
| `editorial-split` | Editorial Split | 图片与结构化文本的平衡分割布局 | 16:9, 2:3 |

### 2.3 产品与营销 (Product & Marketing)
面向商业展示、品牌宣传的排版。

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `apple-bento-grid` | Bento Showcase | 苹果风格 16 宫格矩阵产品展示 | 16:9 |
| `modern-feature` | Modern Feature | 粗体文字 + 大面积视觉的产品展示 | 16:9, 2:3 |
| `component-mosaic` | Component Mosaic | 图标网格 + 侧边栏的组合展示 | 16:9, 2:3 |
| `platform-hero` | Platform Hero | 居中产品公告 + 功能网格 | 16:9, 2:3 |
| `testimonial-card` | Testimonial Card | 专业头像 + 引言 + 验证指标 | 16:9, 2:3 |
| `community-hub` | Community Hub | 行动号召 + 推荐语 + 合作伙伴网格 | 16:9, 2:3 |

### 2.4 通用类 (General)
跨场景使用的排版方案。

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `kinfolk-essay` | Editorial Essay | 编辑叙事排版，支持首字下沉与结构化元数据 | 2:3, A4 |
| `typography-hero` | Typography Hero | 超大字号驱动的纯文字排版艺术 | 16:9, 2:3 |
| `big-statement` | Big Statement | 居中极简主义高冲击力标语排版 | 16:9, 2:3 |
| `step-timeline` | Step Timeline | 顺序流程/里程碑时间轴 | 16:9, 2:3 |
| `table-of-contents` | Table of Contents | 卡片式导航目录页 | 16:9, 2:3 |

### 2.5 简历类 (Resume)
专为 A4 纸张设计的专业简历。

| 模板 ID | 名称 | 说明 | 支持比例 |
| :--- | :--- | :--- | :--- |
| `academic-hybrid-resume` | Dynamic Resume Pro | 基于区块的技术简历，支持智能格式化与模块化列表 | A4 |

> 注：虽然只有 1 个简历模板，但它通过 `ResumeContentHub`（集中内容管理器）提供了极高的自由度——支持多区块、多条目、拖放排序、跨页迁移等功能。

---

## 3. 模板字段配置

每个模板通过 `fields` 数组定义编辑器面板中可编辑的字段。`withBaseFields()` 辅助函数会自动为每个模板添加 `backgroundColor` 和 `pageNumber` 两个基础字段。

### 3.1 字段类型
参见 [编辑器字段参考](editor/fields.md) 中的完整字段映射表。

### 3.2 常用字段配置示例

```typescript
// 纯字符串字段
withBaseFields(['title', 'subtitle', 'image', 'imageLabel'])

// 带自定义标签
withBaseFields([
  { key: 'title', label: 'Headline' },
  { key: 'paragraph', label: 'Body Copy' },
])

// 带变体选项
withBaseFields([
  {
    key: 'variant',
    label: 'Image Side',
    props: {
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' }
      ]
    }
  },
])

// 带分隔线
withBaseFields([
  { key: 'topDivider', label: 'Top Divider', type: 'separator' },
  { key: 'title', label: 'Headline' },
  { key: 'bottomDivider', label: 'Bottom Divider', type: 'separator' },
])
```

---

## 4. 测试与验证

### 4.1 Schema 验证
每个模板 Schema 可通过 [src/templates/schemas/validator.ts](src/templates/schemas/validator.ts) 进行结构验证。

### 4.2 实时调试
运行 `pnpm dev`，在编辑器中切换到目标模板。`TemplatePreview` 组件会以蓝图风格实时渲染模板的 24x24 网格布局，便于验证排版的正确性。