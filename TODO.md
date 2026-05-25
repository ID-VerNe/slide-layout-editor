# ✅ 24x24 Modular Refactoring TODO List

## Phase 1: Core Infrastructure (内核基座层) [DONE]
- [x] **1.1 数据结构升级 (`src/types.ts`)**
  - [x] 定义 `DesignSystem` 接口 (包含 tokens: color, typography, spacing)。
  - [x] 更新 `ProjectTheme`，支持中文字体配置。
  - [x] 在 `BaseNode` 中新增 `modular` 属性 (包含 `colStart`, `colSpan`, `rowStart`, `rowSpan`)。
- [x] **1.2 注入默认设计系统 (`src/store/useStore.ts`)**
  - [x] 初始化基于 `design spec.md` 的默认 `DesignSystem` 状态。
- [x] **1.3 Tailwind 体系映射 (`tailwind.config.js` & `index.css`)**
  - [x] 配置 `grid-cols-24` 和 `grid-rows-24` 扩展。
  - [x] 将 CSS 变量与 Tailwind 的 colors/spacing 绑定。
- [x] **1.4 物理辅助网格与基线 (`src/components/PageFrame.tsx`)**
  - [x] 创建 `PageFrame` 组件，作为所有模板的顶层容器。
  - [x] 实现 `GridOverlay`：按 `Alt+;` 召唤 24x24 网格辅助线与 8px 横向基线。
  - [x] 在 PageFrame 中固化 `GlobalFolio` (页码、档案号锚点)，彻底从子模板剥离。

## Phase 2: Rendering Pipeline (渲染管线接管) [DONE]
- [x] **2.1 渲染器增强 (`src/templates/schemas/LayoutRenderer.tsx`)**
  - [x] 拦截并解析 `modular` 属性，将其转换为 `grid-column` 和 `grid-row` CSS 样式。
  - [x] 实现 `presetKey` 解析逻辑（将预设字符串映射为标准化样式）。
  - [x] 支持 `modular` 布局类型。

## Phase 3: Semantic Atom Components (原子组件重构) [DONE]
- [x] **3.1 `ZineDisplay` (主标题)**
  - [x] 替换 `SlideHeadline`。支持 `baseline-snap`。
- [x] **3.2 `ZineBody` (正文)**
  - [x] 替换 `SlideParagraph`。强制行高为 8px 的倍数 (`baseline-snap`)。
- [x] **3.3 `ZineCaption` (元数据/机身参数)**
  - [x] 替换 `SlideBlockLabel`。强制全大写、超宽字距。
- [x] **3.4 `ZineMedia` (媒体资产)**
  - [x] 封装 `SlideImage`，支持硬边缘与网格适配。

## Phase 4: Archetype Templates Migration (模板库迁移) [DONE]
*按照 `template-refactor-plan.md`，将旧 React 组件重写为 100% JSON Schema。*
- [x] **4.1 旗舰模板迁移**：实现 `zine-classic` (24x24 模块化标杆)。
- [x] **4.2 Gallery 组** (`gravity-anchor-intro`, `kinfolk-feature`, `kinfolk-montage`...)
- [x] **4.3 Archive 组** (`vertical-column`, `horizon-sky`...)
- [x] **4.4 Product/Grid 组** (`apple-bento-grid`, `component-mosaic`...)
- [x] **4.5 Resume** (`academic-hybrid-resume` 保留复合组件壳，但接入网格体系)

## Phase 5: Editor Constraints (编辑器约束) [DONE]
- [x] **5.1 封印自由输入 (`src/components/editor/fields/ColorField.tsx`)**
- [x] **5.2 样式覆盖白名单**：确保 `styleOverrides` 只能写入受控的 Token 键值 (已在 `LayoutRenderer.tsx` 实现)。
- [x] **5.3 全局 UI 同步**：将 `EditorPanel.tsx` 和 `Sidebar.tsx` 对齐 8px 律动感与工业精密感。
- [x] **5.4 Zine Mode 守卫**：在 `GlobalSettings.tsx` 中增加 Zine Mode 开关，强制执行设计规范。

## Phase 6: Validation & Migration (收尾与回归) [IN PROGRESS]
- [x] **6.1 编写 `migrations/v2-to-v3.ts`**
  - [x] 将旧的 `PageData` (flex 布局) 自动转换为新的 24x24 `TemplateSchema` 数据结构 (已注入 DesignSystem & ZineMode)。
- [ ] **6.2 视觉回归检查**
  - [ ] 确保在 24x24 和 8px 基线下，"Zine" 的留白张力和物理对齐完美呈现。
