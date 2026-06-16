# 模板库参考

SlideGrid Studio 提供了 30+ 专业排版模板，涵盖封面、画册、产品展示、营销宣传及简历等领域。所有模板基于 24x24 模块化网格，由 `TemplateSchema` JSON 驱动渲染。

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
