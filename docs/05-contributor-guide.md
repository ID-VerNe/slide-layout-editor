# 开发指南：添加新模板与原子化组件

SlideGrid Studio 采用声明式、组件化的扩展方式。本章将指导你如何从零开始构建并集成一个新的幻灯片排版。

## 1. 核心扩展流程

添加一个新排版涉及三个层级的协同工作：
1. **Schema 定义**: 使用 JSON 描述布局结构、网格位置与数据绑定。
2. **原子开发 (可选)**: 如果现有的组件（如 `ZineDisplay`）无法满足视觉需求，需开发新的原子组件。
3. **注册中心**: 在系统注册表中登记，并定义其在编辑器侧边栏显示的表单字段。

---

## 2. 教程：构建一个“电影感双焦”布局

### 2.1 设计 Schema (`src/templates/schemas/cinematic-focus.ts`)
我们使用 24x24 网格定义一个非对称的对比布局。

```typescript
export const CinematicFocusSchema: TemplateSchema = {
  id: 'cinematic-focus',
  name: 'Cinematic Focus',
  category: 'Cover',
  supportedRatios: ['16:9'],
  root: {
    type: 'Container',
    layout: 'modular',
    className: 'bg-primary h-full w-full',
    children: [
      // 背景大图 (全屏网格)
      {
        type: 'Component',
        componentType: 'ZineMedia',
        modular: { colStart: 1, colSpan: 24, rowStart: 1, rowSpan: 24 },
        props: { objectFit: 'cover', opacity: 0.6 }
      },
      // 浮动标题区
      {
        type: 'Container',
        modular: { colStart: 4, colSpan: 10, rowStart: 18, rowSpan: 4 },
        layout: 'flex',
        layoutProps: { direction: 'column' },
        children: [
          { type: 'Component', componentType: 'ZineDisplay', bind: 'page.title' },
          { type: 'Component', componentType: 'ZineBody', bind: 'page.subtitle' }
        ]
      }
    ]
  }
};
```

---

## 3. 开发原子组件规范

### 3.1 基础要求
所有的原子组件（Atoms）必须存放在 `src/components/ui/slide/atoms/` 目录下，并遵循以下原则：
- **无状态**: 原子应为纯函数组件，所有数据通过 Props 传入。
- **Token 优先**: 严禁使用硬编码色值，必须使用 `ds.tokens` 或 `theme`。
- **基线对齐**: 使用 `useModularStyle` 钩子自动处理 8px 基线与字号缩放。

### 3.2 注册组件 (`componentRegistry.ts`)
```typescript
export const COMPONENT_REGISTRY = {
  // ...
  MyNewAtom,
};
```

---

## 4. 定义编辑器表单 (`registry.ts`)

在 `src/templates/registry.ts` 中注册你的模板，并指定哪些字段可以在侧边栏编辑：

```typescript
{
  id: 'cinematic-focus',
  name: 'Cinematic Focus',
  schema: CinematicFocusSchema,
  fields: withBaseFields([
    'title',
    { key: 'subtitle', label: '副标题' },
    { key: 'image', label: '背景主图' }
  ]),
  supportedRatios: ['16:9']
}
```

---

## 5. 测试与验证

### 5.1 单元测试 (`Vitest`)
为关键逻辑编写测试，例如：
- **Schema 验证**: 确保 `validator.ts` 能正确解析你的 Schema。
- **原子渲染**: 测试组件在不同 `layoutVariant` 下的视觉表现。

### 5.2 实时调试
运行 `pnpm dev`，在编辑器中切换到新模板。由于 `TemplatePreview` 是实时渲染的，你可以直接看到网格布局的正确性。
