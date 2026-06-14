# 术语表与规范定义 (Glossary)

本章定义了 SlideGrid Studio 开发中涉及的核心概念，确保团队沟通语境的一致性。

---

## 1. 排版与布局 (Layout)

### 24x24 模块化网格 (Modular Grid)
项目的基础坐标系。将页面横向和纵向各等分为 24 份。所有组件的位置和尺寸均基于此网格单元（Units）。在 `LayoutRenderer` 中通过 CSS Grid 的 `grid-template-columns/rows: repeat(24, minmax(0, 1fr))` 实现。

### 8px 基线网格 (Baseline Grid)
垂直方向的微观约束。所有的行高、间距、位移必须是 8px 的倍数，以确保印刷级的精密对齐。`useModularStyle` Hook 负责强制执行此约束。

### 响应式缩放 (Responsive Scale)
虽然网格是固定的（24x24），但其物理尺寸会根据容器的宽高比动态缩放。`usePreview` Hook 中的 `calculateFitZoom()` 算法保证排版逻辑在 A4、16:9 或任何屏幕尺寸下保持绝对比例一致。

### LayoutVariant (布局变体)
模板的微观配置，通过 `page.layoutVariant` 切换不同的排版方向（如 `left`/`right`/`top`/`bottom`）。在 Schema 中通过 `Conditional` 节点根据 layoutVariant 动态渲染不同分支。

---

## 2. 设计系统 (Design System)

### 设计令牌 (Design Token)
UI 的原子化属性，如 `color.primary`, `typography.body.fontSize`。禁止在代码中硬编码 Hex 色值或字号。所有渲染组件应通过 `useModularStyle` 消费 Token。

### 原子组件 (Zine Atom)
最小的可复用渲染单元。位于 [src/components/ui/slide/atoms/](src/components/ui/slide/atoms/)，包括 `ZineDisplay`、`ZineBody`、`ZineCaption`、`ZineMedia`、`ZineResume`、`ZineDivider`。它们不具备复杂的业务逻辑，仅负责消费 Token 并将数据渲染为符合 SPEC 规范的视觉形式。

### 样式流水线 (Style Pipeline)
样式从 Schema 属性到最终 CSS 的转化过程，包含四个步骤：
1. Token 注入（`ds.tokens`）
2. 基线微调（`useModularStyle`）
3. 模板属性应用（`evaluateObject`）
4. Zine 约束过滤（`ALLOWED_PROPS` 白名单 + `filterZineClassName` 黑名单）

### Zine Mode (工业精密模式)
项目的核心美学约束机制。通过 `LayoutRenderer.css` 的 `ALLOWED_PROPS` 白名单 (42 个允许的 CSS 属性，包含 `borderRadius`) 和 `filterZineClassName` 黑名单 (`shadow-*`, `blur-*`, `animate-*`)，强制执行去阴影、去模糊的极简工业感美学。**注意**: `rounded-*` 类名现已允许，以配合 `ZineMedia` 圆角特性。

### 编辑器预设系统 (Editor Preset System)
从 v3.0 开始引入的受控输入机制。字号、行高、字距等设计属性采用离散预设档位而非自由输入，确保设计一致性。由 `PresetSelect` 组件和 `editorPresets.ts` 常量共同实现。

### PresetSelect (预设选择器)
通用的下拉选择组件 ([src/components/ui/PresetSelect.tsx](src/components/ui/PresetSelect.tsx))，用于在编辑器中强制使用预设值。支持泛型类型安全 (`<T extends string | number>`)，自动将非预设值映射到最接近的档位。

### 字号预设 (Font Size Presets)
12 档离散字号：6pt (Micro) → 7pt (Caption) → 10pt (Body) → 12pt (Body+) → 14pt (Lead) → 18pt (Subhead) → 24pt (H3) → 32pt (H2) → 48pt (H1) → 64pt (Display) → 80pt (Hero) → 120pt (Art)。对齐 DesignSystem.typography.scales。

---

## 3. 数据与工程 (Data & Project)

### `.slgrid` 工程文件
SlideGrid Studio 的专有归档格式。本质上是一个包含 `project.json` 和 `assets/` 文件夹的 ZIP 压缩包。通过 Electron 主进程的 `ProjectArchiveManager` 创建和解包。

### `asset://` 协议
应用定义的虚拟协议。用于在渲染进程中安全地引用存放在磁盘上的、属于该工程的图像资产。Electron 环境下通过 `protocol.handle('asset', ...)` 拦截，Web 环境下通过 IndexedDB 的 `assets` 存储获取。

### 脏检查 (Dirty Check)
Store 中的 `hasUnsavedChanges` 标志。当 Zustand Store 中的数据通过 `pushHistory()` 标记为变更后，驱动 UI 显示"未保存"圆点，并触发 3 秒定时自动保存 (`saveToDB`)。

### 表达式绑定 (Expression Binding)
模板 Schema 中通过 `{...}` 语法引用动态数据的能力。`ExpressionEvaluator` 支持路径访问 (`page.title`)、空值合并 (`??`)、三元运算 (`? : `)、字符串插值等。详见 [表达式引擎文档](../architecture/template-engine/expressions.md)。

### Repeater (循环渲染器)
模板引擎的循环节点类型。通过 `bind` 属性绑定数据集合（如 `page.agenda`），为每个元素创建独立的 `EvaluationContext`（含 `item`、`index`、`$parent`），递归渲染子模板。

### V3 数据迁移 (V2-to-V3 Migration)
当旧版本项目数据加载时自动执行的升级流水线。在 `useStore.loadProject()` 中调用 `migrateToV3()`，完成资产解耦、令牌注入和架构重组。

---

## 4. 角色与进程 (Roles)

### 主进程 (Main Process)
Electron 的后端环境 ([electron/main.ts](src/../../electron/main.ts))。负责磁盘 IO、Sharp 图像处理、ZIP 归档打包、`asset://` 协议拦截及窗口管理。

### 渲染进程 (Renderer Process)
Electron 的前端环境（React + Vite）。负责 UI 交互、模板 Schema 计算、Framer Motion 动画表演。出于安全考虑，禁用了 Node.js 集成。

### 预加载脚本 (Preload Script)
双进程之间的"翻译官" ([electron/preload.ts](src/../../electron/preload.ts))。通过 `contextBridge.exposeInMainWorld()` 暴露 `window.electronAPI` 对象，提供类型安全的 IPC 接口给渲染进程。

### 工作空间 (Workspace)
外部文件目录关联。用户可关联一个文件夹作为工作区，应用自动将该目录下的文件变化同步到 Store，支持"零负担"项目迁移。

---

## 5. 组件架构术语

### Component Registry (组件注册表)
[componentRegistry.ts](src/templates/schemas/componentRegistry.ts) 中的 `COMPONENT_REGISTRY` 对象。将组件名字符串映射到 React 组件，是 Schema `Component` 节点到实际 React 视图的桥梁。

### FieldRenderer (字段分发器)
[FieldRenderer.tsx](src/components/editor/FieldRenderer.tsx)。根据 `FieldSchema.key` 将编辑请求分发到对应的 Field 组件（如 `key='title'` → `TitleField`），是编辑器面板的核心路由。

### FieldWrapper (字段包装器)
[FieldWrapper.tsx](src/components/editor/fields/FieldWrapper.tsx)。所有编辑器字段控件的通用外层，提供图标、标签、可见性切换 (Toggle Eye) 的统一样式。

### Template Preview (模板蓝图预览)
[TemplatePreview.tsx](src/components/ui/TemplatePreview.tsx)。在模板浏览器中以 `scale(0.1)` 比例渲染真实的 24x24 网格布局，应用 `wireframe-mode` CSS 类转化为蓝图风格。