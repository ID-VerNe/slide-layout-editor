# 模板库参考 (Template Catalog)

SlideGrid Studio 提供了 30+ 专业排版模板，涵盖封面、画册、产品展示、营销宣传及简历等领域。所有模板基于 24x24 模块化网格，由 `TemplateSchema` JSON 驱动渲染。

---

## 0. 模板设计原则 ⚠️

### 0.1 核心原则：结构与内容分离

**模板 Schema 必须保持纯结构化**，仅用于定义组件的布局、样式和数据绑定关系，**严禁在 Schema 中硬编码任何显示内容**。

#### ❌ 错误示例（硬编码文字）

```typescript
{
  type: 'Component',
  componentType: 'ZineCaption',
  bind: 'page.subtitle',
  props: {
    text: 'BRAND LOGO',  // ❌ 硬编码！用户无法修改
    className: 'opacity-20'
  }
}
```

#### ✅ 正确示例（数据绑定）

```typescript
{
  type: 'Component',
  componentType: 'ZineCaption',
  bind: 'page.logo',  // ✅ 绑定到数据字段
  props: {
    className: 'opacity-20'
  }
}
```

### 0.1.5 关键原则：组件容器独立性 🔥

**每个可编辑的 Component 必须在独立的 Container 中**，确保用户使用 9-Point Docking 调整对齐时不会影响其他组件。

#### ❌ 错误示例（多个组件共享容器）

```typescript
{
  type: 'Container',
  layout: 'flex',
  layoutProps: { direction: 'column', align: 'center', justify: 'end' },
  modular: { colStart: 0, colSpan: 24, rowStart: 16, rowSpan: 6 },
  children: [
    {
      type: 'Component',
      componentType: 'ZineCaption',
      bind: 'page.subtitle'  // ❌ 与 title 共享容器
    },
    {
      type: 'Component',
      componentType: 'ZineDisplay',
      bind: 'page.title'     // ❌ 调整对齐会影响 subtitle
    }
  ]
}
```

#### ✅ 正确示例（独立容器）

```typescript
// Subtitle 独立容器
{
  type: 'Container',
  layout: 'flex',
  layoutProps: { direction: 'column', align: 'center', justify: 'center' },
  modular: { colStart: 0, colSpan: 24, rowStart: 16, rowSpan: 2 },
  children: [
    {
      type: 'Component',
      componentType: 'ZineCaption',
      bind: 'page.subtitle'  // ✅ 独立容器，不受其他组件影响
    }
  ]
},
// Title 独立容器
{
  type: 'Container',
  layout: 'flex',
  layoutProps: { direction: 'column', align: 'center', justify: 'end' },
  modular: { colStart: 0, colSpan: 24, rowStart: 18, rowSpan: 4 },
  children: [
    {
      type: 'Component',
      componentType: 'ZineDisplay',
      bind: 'page.title'     // ✅ 独立容器，不受其他组件影响
    }
  ]
}
```

**为什么重要？**
- 9-Point Docking 使用 `margin: auto` 来控制垂直对齐
- 在 Flexbox 容器中，`margin: auto` 会影响同一容器内的所有兄弟元素
- 独立容器确保每个组件的对齐完全独立

**例外情况**：
- ✅ **Repeater 内部**：Repeater 模板中的多个组件可以共享容器（因为它们是作为一个整体重复的）
- ✅ **装饰性元素**：不可编辑的纯视觉元素（如背景、分割线）可以共享容器

### 0.2.5 避免不必要的 Container 嵌套 ⚠️

**直接将组件放置在模块化网格中，而不是嵌套在 `layout: 'absolute'` 的 Container 内**，除非明确需要该容器的布局功能。

#### ❌ 错误示例（不必要的 absolute 容器）

```typescript
{
  type: 'Container',
  layout: 'absolute',  // ❌ 没有提供 inset-0 或位置样式
  modular: { colStart: 13, colSpan: 12, rowStart: 3, rowSpan: 20 },
  children: [
    {
      type: 'Component',
      componentType: 'ZineMedia',
      props: { className: 'w-full h-full object-cover' }
    }
  ]
}
```

**问题**：
- `layout: 'absolute'` 的 Container 如果没有设置 `className: 'absolute inset-0'` 或具体的位置样式，会塌缩成内容大小
- 导致内部组件无法正确填充分配的网格区域
- 图片可能只显示在一小块区域而不是填满整个空间

#### ✅ 正确示例（直接放置组件）

```typescript
{
  type: 'Component',
  componentType: 'ZineMedia',
  modular: { colStart: 13, colSpan: 12, rowStart: 3, rowSpan: 20 },
  props: { className: 'w-full h-full object-cover' }
}
```

**何时需要 Container**：
- ✅ 需要 Flexbox 对齐（`layout: 'flex'`）
- ✅ 需要 Grid 布局（`layout: 'grid'`）
- ✅ 需要嵌套的模块化网格（`layout: 'modular'`）
- ✅ 需要明确设置 `absolute inset-0` 的绝对定位容器

### 0.3 如何提供默认引导内容

虽然 Schema 不能硬编码显示内容，但可以通过**数据层的默认值**来提供引导语，告诉用户每个字段的用途。

系统支持两种方式设置默认值，可根据场景灵活选择：

#### 方法一：模板级 `defaultData`（推荐用于简单场景）

在 `TemplateConfig` 中提供完整的默认数据对象，适合一次性初始化多个字段。

```typescript
// src/templates/registry.ts
{
  id: 'editorial-classic',
  name: 'Editorial Classic',
  schema: EditorialClassicSchema,
  fields: withBaseFields(['title', 'subtitle', 'image', 'imageLabel']),
  // 模板级默认数据
  defaultData: {
    title: 'MAGAZINE TITLE',
    subtitle: 'ISSUE THEME',
    imageLabel: 'JANUARY',
    imageSubLabel: 'VOL. 01'
  },
  supportedRatios: ['2:3']
}
```

**优点**：
- 集中管理，一目了然
- 适合字段较多的模板
- 代码简洁

#### 方法二：字段级 `defaultValue`（推荐用于复杂场景）

在字段配置中为每个字段单独设置默认值和占位符，适合需要精确控制的场景。

```typescript
withBaseFields([
  { 
    key: 'logo', 
    label: 'Brand Logo',
    defaultValue: 'BRAND NAME',           // 字段默认值
    placeholder: 'Enter your brand name'  // 编辑器提示文字
  },
  {
    key: 'partnersTitle',
    label: 'Partners Section Title',
    defaultValue: 'POWERED BY',
    placeholder: 'e.g., Trusted by, Used by'
  }
])
```

**优点**：
- 字段级精确控制
- 可同时配置 `defaultValue` 和 `placeholder`
- 适合需要详细说明的复杂字段

#### 混合使用

两种方法可以组合使用，字段级的 `defaultValue` 优先级更高：

```typescript
{
  id: 'platform-hero',
  fields: withBaseFields([
    { key: 'logo', defaultValue: 'BRAND NAME' },
    { key: 'title' },  // 使用 defaultData 中的值
    { key: 'subtitle' }
  ]),
  defaultData: {
    title: 'Your Platform Name',
    subtitle: 'Tagline here'
  }
}
```

**优先级规则**：
1. 字段级 `defaultValue` 最高
2. 模板级 `defaultData` 次之
3. 系统默认值最低（`'New Slide'`）

### 0.3 动态绑定与表达式

对于需要根据数据动态生成的内容，使用表达式绑定：

```typescript
// ✅ 使用表达式组合多个字段
{
  type: 'Component',
  componentType: 'ZineCaption',
  bind: 'page.footer',
  props: {
    // 在运行时通过 bind 求值，而不是硬编码
    // 例如 footer 的默认值可以是 'CV — {page.title || "NAME"}'
  }
}
```

### 0.4 Repeater 中的动态内容

在循环渲染（Repeater）中，**必须使用 `{item}` 表达式**绑定数据：

```typescript
{
  type: 'Repeater',
  bind: 'page.features',
  template: {
    type: 'Component',
    componentType: 'ZineCaption',
    props: {
      text: '{item.title}',  // ✅ 动态绑定循环项
      size: 2.4
    }
  }
}
```

### 0.5 检查清单

在提交新模板之前，请确认：

- [ ] Schema 中没有任何 `text: '固定文字'` 的硬编码
- [ ] 所有显示内容都通过 `bind` 绑定到数据字段
- [ ] 循环渲染使用 `{item.xxx}` 表达式
- [ ] **每个可编辑的 Component 都在独立的 Container 中**（关键！）
- [ ] Repeater 内部结构除外（它们作为整体重复）
- [ ] **避免不必要的 `layout: 'absolute'` Container 嵌套**（直接将组件放在模块化网格中）
- [ ] 如果使用 `layout: 'absolute'` Container，确保设置了 `className: 'absolute inset-0'` 或具体位置样式
- [ ] 在 `registry.ts` 中提供了 `defaultData` 或字段的 `defaultValue`
- [ ] 字段配置包含清晰的 `label`（必需）
- [ ] 复杂字段配置了 `placeholder` 作为编辑提示（可选）

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
每个模板的布局由 [src/templates/schemas/](src/templates/schemas/) 下按 **“比例-分类”** 组织的 TS 文件定义。Schema 使用 `Container`、`Component`、`Repeater`、`Conditional`、`Text` 五种节点类型构建渲染树。详见 [模板引擎文档](../architecture/template-engine.md)。目前所有 Zine 原子组件均支持 **9 点网格对齐 (9-point docking)**，极大地增强了布局的灵活性。

---

## 2. 模板分类与物理结构

为了方便开发者快速匹配代码与界面显示名称，模板 Schema 现在按照 `[Ratio]-[Category]` 模式存储在物理子目录中。

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
目录：`src/templates/schemas/169-Product` 或 `src/templates/schemas/Universal-Product`

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
目录：`src/templates/schemas/A4-Resume`

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