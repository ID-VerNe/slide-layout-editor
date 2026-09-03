# 开发指南：添加新模板与原子化组件

SlideGrid Studio 采用声明式、组件化的扩展方式。本章将指导你如何从零开始构建并集成一个新的幻灯片排版。

---

## 1. 项目设置

### 1.1 环境要求

- **Node.js** >= 22
- **pnpm** (包管理器，项目强制使用 pnpm)
- **Windows** / macOS / Linux

### 1.2 安装与运行

```powershell
# 安装依赖
pnpm install

# 启动开发服务器（Electron + Vite 热更新）
pnpm dev

# 运行完整测试套件（串行执行 Vitest 单元测试与 Playwright E2E 测试）
pnpm test

# 仅运行 Vitest 单元测试
pnpm test:unit:run

# 仅运行 Playwright E2E 测试
pnpm test:e2e

# 运行测试并生成覆盖率报告
pnpm test:ci

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 1.3 技术栈

| 技术 | 用途 |
| :--- | :--- |
| React 19 + TypeScript 5.8 | UI 框架 |
| Vite 6 | 构建工具 |
| Zustand 4 | 状态管理（深度快照隔离） |
| Framer Motion 12 | 交互动画（支持离屏旁路） |
| Tailwind CSS v3 | 样式框架 |
| TanStack Virtual | 虚拟滚动 |
| React Router v7 | 路由 |
| Lucide React | 图标库 |
| html-to-image + jsPDF | DOM → 图片/PDF 离屏导出 |
| Electron 39 + Sharp 0.34 | 桌面端 + 原生图形处理 |
| Vitest 4 + Playwright 1.62 | 单元测试 + 端到端测试 |

---

## 2. 核心扩展流程

添加一个新模板遵循极简的**声明式工作流**：

1. **创建 JSON 规范**: 在 `src/templates/definitions/<Category>/` 目录下新建 `<id>.json`。
2. **自动加载**: 系统的 `registry.ts` 通过 `import.meta.glob` 自动识别并载入所有 JSON 模板，**无需修改任何 TS 注册代码**！
3. **验证与表单**: 启动开发服务器后，右侧面板根据你在 JSON 中定义的 `fields` 自动生成表单控件。

---

## 3. 教程：构建一个"电影感双焦"布局

### 3.1 创建 JSON 规范文件

在 `src/templates/definitions/Cover/` 下创建 `cinematic-focus.json`：

```json
{
  "id": "cinematic-focus",
  "name": "Cinematic Focus",
  "category": "Cover",
  "desc": "非对称电影感全屏双焦封面布局",
  "tags": ["Cinematic", "Cover", "FullBleed"],
  "supportedRatios": ["16:9", "2:3", "3:4"],
  "fields": [
    "title",
    "subtitle",
    "image",
    "variant"
  ],
  "defaultData": {
    "title": "THE HORIZON",
    "subtitle": "A visual exploration of light and space",
    "variant": "bottom"
  },
  "root": {
    "type": "Container",
    "layout": "modular",
    "className": "bg-primary h-full w-full relative",
    "children": [
      {
        "type": "Component",
        "componentType": "ZineMedia",
        "modular": { "colStart": 1, "colSpan": 24, "rowStart": 1, "rowSpan": 24 },
        "bind": "page.image",
        "props": { "objectFit": "cover", "opacity": 0.6 }
      },
      {
        "type": "Container",
        "modular": { "colStart": 3, "colSpan": 18, "rowStart": 17, "rowSpan": 6 },
        "layout": "flex",
        "layoutProps": { "direction": "column", "gap": "spacing.sm" },
        "children": [
          { "type": "Component", "componentType": "ZineDisplay", "bind": "page.title" },
          { "type": "Component", "componentType": "ZineBody", "bind": "page.subtitle" }
        ]
      }
    ]
  }
}
```

### 3.2 自动生效机制

在 `src/templates/registry.ts` 中，所有模板规范通过静态 Glob 机制全量动态装配：

```typescript
const templateModules = import.meta.glob<{ default: TemplateDefinition }>(
  './definitions/**/*.json',
  { eager: true }
);
```

这意味着：保存 `cinematic-focus.json` 后，Vite 的 HMR 会立即热重载该模板，你可以在模板选择抽屉与画廊中直接看到并使用它！

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
  pages?: PageData[]; // 可选：用于在项目级历史面板中复用已有图片
}

const MyCustomField: React.FC<MyCustomFieldProps> = ({ page, onUpdate, pages }) => {
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

在 [FieldRenderer.tsx](src/components/editor/FieldRenderer.tsx) 的 `componentMap` 中添加映射。

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

- Tailwind CSS v3 优先
- 禁用的类名前缀: `shadow-*`, `blur-*`, `drop-shadow-*`, `animate-bounce/pulse/wiggle` (注意 `rounded-*` 已允许，以支持 ZineMedia 圆角特性)
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
# 交互模式（watch）
pnpm test

# 单次运行 + 覆盖率（CI 模式）
pnpm test:ci
```

**覆盖率阈值**（在 `vitest.config.ts` 中配置，低于阈值 CI 会失败）：

| 指标 | 最低要求 |
|------|---------|
| Statements | 62% |
| Branches | 45% |
| Functions | 49% |
| Lines | 63% |

测试覆盖范围：
- **Schema 验证**: 确保 `validator.ts` 正确解析新 Schema
- **组件渲染**: 测试组件在不同 `layoutVariant` 下的视觉表现
- **Store 逻辑**: 测试 undo/redo、全局同步等核心逻辑
- **Hooks**: useAssetUrl、useImagePreload、usePreview、useProject、useResponsiveImage
- **工具函数**: db、lruCache、logger、native-fs、typeGuards、comparison
- **编辑器 UI**: FieldRenderer、GlobalSettings、PreviewArea、TopNav、Dashboard

### 7.2 CI 管线

项目使用 GitHub Actions 运行自动化测试，配置文件：`.github/workflows/ci.yml`

- **触发条件**: push 或 PR 到 `master`/`main` 分支
- **环境**: Ubuntu latest, pnpm 9, Node.js 22
- **步骤**: `pnpm install --frozen-lockfile` → `pnpm test:ci`
- **覆盖率上报**: 自动上传至 Codecov

```powershell
# 本地模拟 CI 运行
pnpm test:ci
```

### 7.3 实时调试

运行 `pnpm dev`，在编辑器中切换到新模板。由于 `TemplatePreview` 是实时渲染的，你可以直接看到 24x24 网格布局的正确性。

按 `Alt+;` 可切换调试网格覆盖层，方便验证模块化定位的精确性。

### 7.4 类型检查

项目使用 TypeScript 严格模式，可通过以下命令进行类型检查：

```powershell
npx tsc --noEmit
```