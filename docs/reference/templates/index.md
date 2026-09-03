# 模板库参考

SlideGrid Studio 提供了 36 款专业排版模板（包含 4 款双语阅读精选模板），涵盖封面、画册、产品展示、营销宣传、双语精读及简历等领域。所有模板基于 24x24 模块化网格，由独立的 JSON 蓝图规范驱动渲染。

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

### 0.2 核心原则：强制遵循 Design Tokens 与严禁硬编码样式 🔥

**模板 Schema 严禁硬编码任何物理颜色、边框或任意数值样式**，所有视觉表现必须完全基于项目统一的 Design Tokens（设计令牌）。硬编码颜色会彻底破坏深色模式与主题系统的动态切换（如导致浅色主题下出现死黑背景、文字对比度失效）。

#### 1. 色彩语义令牌对照表（Color Tokens）

| 语义角色 | Tailwind 类名 | CSS 变量 | 原子组件 `color` 属性 | 用途 |
|---------|--------------|---------|---------------------|------|
| **画布背景** | `bg-zine-bg` | `--zine-color-background` | - | 幻灯片根容器、大底板 |
| **表面/卡片** | `bg-zine-surface` | `--zine-color-surface` | - | 悬浮卡片、弹层、头像底框 |
| **主要文字** | `text-zine-primary` | `--zine-color-primary` | `color: 'primary'` | 主标题、核心数据、正文 |
| **次要文字** | `text-zine-secondary` | `--zine-color-secondary` | `color: 'secondary'` | 副标题、出处、描述小字 |
| **品牌强调** | `text-zine-accent`, `border-zine-accent`, `bg-zine-accent` | `--zine-color-accent` | `color: 'accent'` | 强调色、重点标签、高亮 |
| **微弱分割** | `border-zine-accent/10`, `border-zine-accent/15`, `border-zine-accent/20` | - | - | 发丝分割线、网格线、卡片边框 |
| **表面反色** | `text-zine-surface` | `--zine-color-surface` | `color: 'surface'` | 深色图片/强调底色上的浅色文字 |

#### ❌ 常见硬编码反模式（严禁使用）
- ❌ `bg-white`, `bg-black`, `bg-[#111111]`, `bg-slate-900` → 破坏主题底色！必须改为 `bg-zine-bg` 或 `bg-zine-surface`。
- ❌ `border-white`, `border-slate-100`, `border-black/5` → 必须改为 `border-zine-accent/10` 或 `border-zine-surface`。
- ❌ `text-slate-900`, `text-stone-800`, `text-slate-500` → 必须改为 `text-zine-primary`、`text-zine-secondary` 或使用原子属性 `color: 'primary' | 'secondary'`。
- ❌ `text-white`、`!text-white` → 覆盖在深色图片上的文字，必须使用 `color: 'surface'` 或 `text-zine-surface`。
- ❌ `radial-gradient(#000 1px, transparent 1px)` → 必须改为 `radial-gradient(currentColor 1px, transparent 1px)`。

#### 2. 8px 律动基线字号系统（Typography Scale）
所有 Zine 原子组件（`ZineDisplay`, `ZineBody`, `ZineCaption`, `ZineVocabList`）的 `size` 属性统一基于 8px 基线倍数阶梯（由 `resolveModularFontSize` 解析），**严禁在 `className` 中乱写 `text-[28px]`**：
- `size: 1` = 8px (极小标注 / Caption)
- `size: 1.25` = 10px (微型标签 / Meta)
- `size: 1.5` = 12px (小字说明 / Subtitle)
- `size: 1.75` = 14px (辅助段落 / Body Small)
- `size: 2` = 16px (正文基准 / Body Base)
- `size: 2.25` = 18px (双语生词 / Lead Body)
- `size: 3` = 24px (三级标题 / H3)
- `size: 4` = 32px (二级标题 / H2)
- `size: 6` = 48px (主标题 / H1)
- `size: 8` = 64px (展示大标 / Display Hero)
- `size: 10+` = 80px+ (巨幅艺术标 / Masthead)

> [!TIP]
> **排版规范与踩坑预防**：
> 1. **严禁正文过小**：正文叙事段落（`ZineBody`）推荐使用 `size: 2`（16px）或 `size: 1.75`（14px），切忌在正文直接使用 `size: 1.5`（12px）或低于 10px，否则在 16:9 画布缩放后将极难辨认。
> 2. **类型安全**：无论是数字 `size: 1.5` 还是字符串 `"1.5"`、`"1.5rem"`、`"24px"`，系统均能通过 `resolveModularFontSize` 统一规范化为像素，并向上对齐行高。
> 3. **组件字号保障**：`ZineVocabList`（生词表）默认采用 `size: 2.25`（18px 基准）；`ZineIcon` 支持 `size <= 10` 自动换算为 8px 基线倍数。

#### 3. 间距语义令牌（Spacing Tokens）
在 layoutProps 中使用规范的间距字符串：`spacing.none` (0), `spacing.xs` (4px), `spacing.sm` (8px), `spacing.md` (16px), `spacing.lg` (24px), `spacing.xl` (32px), `spacing.gutter` (24px)。在 Tailwind 类中若需指定间距，优先使用 `p-zine-md`, `gap-zine-sm` 等。

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
  fields: withBaseFields([
    { key: 'title', label: 'Magazine Masthead' },
    { key: 'subtitle', label: 'Issue Theme/Tagline' },
    { key: 'image', label: 'Cover Image' },
    { key: 'imageLabel', label: 'Issue Month' },
    { key: 'imageSubLabel', label: 'Issue Volume' },
    { key: 'actionText', label: 'Year/Edition' }
  ]),
  // 模板级默认数据
  defaultData: {
    title: 'MAGAZINE TITLE',
    subtitle: 'Issue Theme',
    imageLabel: 'JANUARY',
    actionText: '2026'
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

### 0.4 动态绑定与表达式

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

### 0.5 Repeater 中的动态内容

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

### 0.6 检查清单

在提交新模板之前，请确认：

- [ ] **100% 遵守 Design Tokens 规范**：严禁硬编码物理颜色（如 `bg-white`, `border-white`, `text-slate-900`, `#111111` 等）
- [ ] **严格使用语义令牌**：`bg-zine-bg`, `bg-zine-surface`, `text-zine-primary`, `text-zine-secondary`, `border-zine-accent/xx`
- [ ] **暗部/深色图文适配**：覆盖在深色背景或照片上的文字使用 `color: 'surface'` 或 `text-zine-surface`，严禁硬编码 `!text-white`
- [ ] **字号遵循 8px 基线倍数**：使用原子组件的 `size: 1` ~ `10` 属性，严禁在 className 中硬编码任意像素字号
- [ ] **间距遵循间距令牌**：使用系统 `spacing.none` ~ `spacing.xl`
- [ ] **Schema 纯结构化**：Schema 中没有任何 `text: '固定文字'` 的硬编码
- [ ] **数据动态绑定**：所有显示内容都通过 `bind` 绑定到数据字段
- [ ] **循环动态项**：循环渲染使用 `{item.xxx}` 表达式
- [ ] **容器独立性（关键！）**：每个可编辑的 Component 都在独立的 Container 中（Repeater 内部结构除外）
- [ ] **网格直属组件**：避免不必要的 `layout: 'absolute'` Container 嵌套，直接将组件放在模块化网格中
- [ ] 如果使用 `layout: 'absolute'` Container，确保设置了 `className: 'absolute inset-0'` 或具体位置样式
- [ ] 在 `registry.ts` 中提供了 `defaultData` 或字段的 `defaultValue`
- [ ] 字段配置包含清晰的 `label`（必需）
- [ ] 复杂字段配置了 `placeholder` 作为编辑提示（可选）
