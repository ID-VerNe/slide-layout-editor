# 开发指南：添加新模板与原子化组件

SlideGrid Studio 采用声明式、组件化的扩展方式。本章将指导你如何从零开始构建并集成一个新的幻灯片排版。

---

## 1. 项目设置

### 1.1 环境要求

- **Node.js** >= 18
- **pnpm** (包管理器)
- **Windows** / macOS / Linux

### 1.2 安装与运行

```powershell
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 运行类型检查
pnpm typecheck
```

### 1.3 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Zustand | 状态管理 |
| Framer Motion | 交互动画 |
| Tailwind CSS v3 | 样式框架 |
| TanStack Virtual | 虚拟滚动 |
| Lucide React | 图标库 |
| html-to-image | DOM → 图片导出 |
| jsPDF | PDF 导出 |
| Electron + Sharp | 桌面端 + 图像处理 |

---

## 2. 核心扩展流程

添加一个新排版涉及三个层级的协同工作：

1. **Schema 定义**: 使用 JSON 描述布局结构、网格位置与数据绑定。
2. **原子开发 (可选)**: 如果现有的组件（如 `ZineDisplay`）无法满足视觉需求，需开发新的原子组件。
3. **注册中心**: 在系统注册表中登记，并定义其在编辑器侧边栏显示的表单字段。

---

## 3. 教程：构建一个"电影感双焦"布局

### 3.1 创建 Schema 文件

在 [src/templates/schemas/](src/templates/schemas/) 下创建 `cinematic-focus.ts`：

```typescript
import { TemplateSchema } from './types';

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
        bind: 'page.image',
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

### 3.2 导出 Schema

在 [src/templates/schemas/index.ts](src/templates/schemas/index.ts) 中添加导出：

```typescript
export { CinematicFocusSchema } from './cinematic-focus';
```

### 3.3 注册到模板注册表

在 [src/templates/registry.ts](src/templates/registry.ts) 中：

1. 导入 Schema
2. 添加 `TemplateConfig` 条目

```typescript
{
  id: 'cinematic-focus',
  name: 'Cinematic Focus',
  category: 'Cover',
  desc: '非对称电影感双焦布局',
  tags: ['Cinematic', 'Cover'],
  component: () => null,  // Schema 驱动，不需要组件
  schema: CinematicFocusSchema,
  fields: withBaseFields([
    { key: 'title', label: 'Headline' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'image', label: 'Background Image' }
  ]),
  supportedRatios: ['16:9']
}
```

---

## 4. 开发原子组件规范

### 4.1 基础要求

所有的原子组件（Atoms）必须存放在 [src/components/ui/slide/atoms/](src/components/ui/slide/atoms/) 目录下，并遵循以下原则：

- **无状态**: 原子应为纯函数组件，所有数据通过 Props 传入。
- **Token 优先**: 严禁使用硬编码色值，必须使用 `ds.tokens` 或 `theme`。
- **基线对齐**: 使用 `useModularStyle` 钩子自动处理 8px 基线与字号缩放。
- **fieldKey 支持**: 通过 `fieldKey` 属性实现数据绑定，使组件可被 Schema `bind` 引用。

### 4.2 原子组件模板

```typescript
import React from 'react';
import { PageData } from '../../../types';
import { useModularStyle } from '../hooks/useModularStyle';

interface MyAtomProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MyAtom: React.FC<MyAtomProps> = ({
  page, fieldKey, text, color = 'primary', className = '', style: externalStyle
}) => {
  // 1. 获取 DesignSystem 令牌
  const { getTokenStyle } = useModularStyle();

  // 2. 解析显示文本 (fieldKey 绑定 或 直接 text)
  const displayText = fieldKey ? (page as any)[fieldKey] : text;

  // 3. 注入 Token 样式
  const tokenStyle = getTokenStyle(color);

  return (
    <div
      className={className}
      style={{
        ...tokenStyle,
        ...externalStyle,
      }}
    >
      {displayText}
    </div>
  );
};
```

### 4.3 注册组件

在 [src/templates/schemas/componentRegistry.ts](src/templates/schemas/componentRegistry.ts) 中：

```typescript
import { MyAtom } from '../components/ui/slide/atoms/MyAtom';

export const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  // ...现有组件
  MyAtom,
};
```

Schema 中即可通过 `componentType: 'MyAtom'` 引用。

---

## 5. 添加新的编辑器字段

### 5.1 创建 Field 组件

在 [src/components/editor/fields/](src/components/editor/fields/) 下创建新字段：

```typescript
// MyCustomField.tsx
import React from 'react';
import { PageData } from '../../../types';
import FieldWrapper from './FieldWrapper';

interface MyCustomFieldProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
}

const MyCustomField: React.FC<MyCustomFieldProps> = ({ page, onUpdate }) => {
  const handleChange = (value: string) => {
    onUpdate({ ...page, myCustomField: value });
  };

  return (
    <FieldWrapper icon={/* LucideIcon */} label="My Field">
      <input value={(page as any).myCustomField} onChange={e => handleChange(e.target.value)} />
    </FieldWrapper>
  );
};

export default MyCustomField;
```

### 5.2 注册到 FieldRenderer

在 [FieldRenderer.tsx](src/components/editor/FieldRenderer.tsx) 的 `FIELD_TO_COMPONENT_MAP` 中添加映射。

### 5.3 在模板中使用

在 `registry.ts` 的 `fields` 数组中添加：

```typescript
fields: withBaseFields([
  { key: 'myCustomField' as FieldType, label: 'Custom Field' }
])
```

---

## 6. 代码规范

### 6.1 命名规范

- **文件名**: 使用 PascalCase (如 `ZineDisplay.tsx`, `useModularStyle.ts`)
- **组件名**: 与文件名一致
- **Props 接口**: `{ComponentName}Props`
- **Schema 名称**: `{Name}Schema`

### 6.2 样式规范

- **Tailwind CSS v3** 优先（不使用 v4）
- 禁用的类名前缀: `rounded-*`, `shadow-*`, `blur-*`, `animate-bounce/pulse/wiggle`
- 色值通过 DesignSystem Token 获取，不硬编码

### 6.3 类型规范

- 所有组件必须显式定义 Props 接口
- 使用 `PageData` 标准类型，尽量不扩展 `any`
- 新类型定义在 [src/types.ts](src/types.ts) 中

---

## 7. 测试与验证

### 7.1 单元测试 (Vitest)

运行测试：

```powershell
pnpm test
```

测试覆盖范围：
- **Schema 验证**: 确保 `validator.ts` 正确解析新 Schema
- **组件渲染**: 测试组件在不同 `layoutVariant` 下的视觉表现
- **Store 逻辑**: 测试 undo/redo、全局同步等核心逻辑

### 7.2 实时调试

运行 `pnpm dev`，在编辑器中切换到新模板。由于 `TemplatePreview` 是实时渲染的，你可以直接看到 24x24 网格布局的正确性。

按 `Alt+;` 可切换调试网格覆盖层，方便验证模块化定位的精确性。

### 7.3 类型检查

```powershell
pnpm typecheck
```