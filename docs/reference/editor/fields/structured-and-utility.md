# 结构化与辅助字段

## 4. 结构化字段

### 4.1 `ResumeSectionsField`
简历区块的唤起器组件。通过 Modal 打开 `ResumeContentHub` 内容中心。侧边栏只保留入口按钮，保持编辑器清爽。

- **文件**: `src/components/editor/fields/ResumeSectionsField.tsx`
- **绑定字段**: `page.resumeSections: ResumeSection[]`
- **UI**: 包含 "Open Content Hub" 按钮，点击弹出全屏 Modal 容纳 ResumeContentHub。

---

## 5. 辅助与通用字段

### 5.1 `ResumeContentHub` (核心/复杂)
简历模板的中心化内容管理器。在 Modal 内全屏展示，采用「左侧区块列表 + 右侧条目编辑」双栏布局。

- **文件**: `src/components/editor/fields/ResumeContentHub.tsx`
- **功能**:
  - **区块管理**: 添加/删除/拖拽排序简历大类 (Experience, Education 等)。
  - **条目编辑**: 每区块支持多条目输入（`title`, `subtitle`, `time`, `location`, `description`）。
  - **拖拽排序**: 基于 `framer-motion` 的区块 (`Reorder.Group`) 与条目 (`ArrowUp/ArrowDown` 按钮) 重排序。
  - **跨页迁移**: 支持将区块一键迁移至上一页或下一页的相同 `academic-hybrid-resume` 模板中；若目标页存在同名区块则合并条目。
- **数据结构**: `page.resumeSections: ResumeSection[]`
- **UI 布局**:
  - 左侧 288px 侧边栏：区块列表，支持拖拽排序、删除与跨页迁移箭头。
  - 右侧主区域：选中区块的标题编辑、条目添加按钮，以及条目卡片列表（Institution/Company, Timeline, Degree/Role, Location, Details 多行输入）。

### 5.2 `GenericNumberField`
- **文件**: `src/components/editor/fields/GenericNumberField.tsx`
- **用途**: 通用数值微调器，支持步长控制。
- **Props**: `page`, `onUpdate`, `label?`, `fieldKey` (绑定 page 上的哪个字段), `min?` (默认 0), `max?` (默认 100), `step?` (默认 1)。
- **UI**: 标签行显示字段名与当前值百分比，下方为 `Slider` 滑块控件。

### 5.3 `SeparatorField`
- **文件**: `src/components/editor/fields/SeparatorField.tsx`
- **用途**: 控制幻灯片中的分割线样式。
- **UI**: 以 `FieldWrapper` 包裹，显示一条预览分割线。点击样式齿轮图标可打开 `ZineStylePanel` 调整颜色与粗细。
- **图标**: `Minus`
- **Props**: 支持 `label?`, `fieldKey?`，通过 `showStyleConfig={true}` 和 `styleMode="divider"` 启用 ZineStylePanel。

### 5.4 `VariantField`
- **文件**: `src/components/editor/fields/VariantField.tsx`
- **用途**: 动态布局切换器，控制幻灯片中图文排列方向。
- **绑定字段**: `page.layoutVariant: string`
- **UI**:
  - 优先尝试从 Schema 传入的 `options` 渲染动态按钮组；若无则回退硬编码逻辑。
  - 硬编码分支：
    - `gallery-capsule`: under / over / minimal 三选一。
    - `film-diptych`: horizontal / vertical 二选一。
    - 默认: Image Left / Image Right 二选一。
- **图标**: `Layout`

### 5.5 `ColorField`
- **文件**: `src/components/editor/fields/ColorField.tsx`
- **用途**: 页面背景色选择器。
- **绑定字段**: `page.backgroundColor: string`
- **UI**:
  - **Zine 模板**: 展示设计系统 tokens 颜色色板，点击即应用。
  - **其他模板**: 显示原生颜色选择器 + HEX 文本输入框。
  - 均提供 "Reset to System" 按钮回到设计系统默认色。
- **图标**: `Palette`

### 5.6 `FooterField`
- **文件**: `src/components/editor/fields/FooterField.tsx`
- **用途**: 页脚元数据文本编辑。
- **绑定字段**: `page.footer: string`
- **UI**: 基于 `FieldWrapper`，包含 `DebouncedInput` 文本输入框、样式配置面板（通过 `showStyleConfig={true}` 和 `styleMode="text"` 启用）。
- **特殊行为**: 当 `page.pageNumber === false` 时返回 `null`（不渲染）。
- **图标**: `Copyright`

### 5.7 `PageNumberField`
- **文件**: `src/components/editor/fields/PageNumberField.tsx`
- **用途**: 页码/书眉开关和对齐控制。
- **绑定字段**: `page.pageNumber: boolean`, `page.folioAlignment: 'left' | 'right' | 'auto'`
- **UI**: 可见性切换按钮（Eye/EyeOff）、标签 "Folio (Page No.)"、左右对齐三按钮组（Left / Auto / Right）。
- **图标**: `Hash`

### 5.8 `TitleYField`
- **文件**: `src/components/editor/fields/TitleYField.tsx`
- **用途**: 控制标题垂直位置偏移。
- **绑定字段**: `page.styleOverrides.title.translateY: number`
- **UI**: `Slider`，范围 -500 ~ 500 px，带有 Reset 按钮回到 0。
- **注意**: 这是一个较新的字段，作用于 `styleOverrides` 深层路径，而非直接挂在 page 顶层。

### 5.9 `BulletsField`
- **文件**: `src/components/editor/fields/BulletsField.tsx`
- **用途**: 列表项（Bullet Points）编辑器。
- **绑定字段**: `page.bullets: string[]`
- **UI**: 基于 `FieldWrapper`，包含字号 `PresetSelect`、每项 `DebouncedInput` 文本框、删除按钮（X）、底部虚线 "Add Item" 按钮。
- **样式覆盖**: `page.styleOverrides.bullets.fontSize` 和 `page.styleOverrides.bullets.fontFamily`。
- **图标**: `List`

### 5.10 `ArtFontField`
- **文件**: `src/components/editor/fields/ArtFontField.tsx`
- **用途**: 艺术字（大字排版）编辑器。
- **绑定字段**: 默认 `page.artFont: string`，可通过 `fieldKey` prop 泛化到其他字符串字段。
- **UI**: 基于 `FieldWrapper`，包含：
  - 文字内容输入框（大号 uppercase 展示）。
  - 字号 `PresetSelect`。
  - 描边宽度微调（-/+)。
  - 模式切换：Solid Fill / Outline Only。
  - 透明度滑块 (0.1 ~ 1.0)。
- **样式覆盖**: `page.styleOverrides[fieldKey]` 下的 `fontSize`, `strokeWidth`, `mode`, `opacity`。
- **图标**: `Type`

### 5.11 `PartnersTitleField`
- **文件**: `src/components/editor/fields/PartnersTitleField.tsx`
- **用途**: 合作伙伴区块标题编辑。
- **绑定字段**: `page.partnersTitle: string`，可见性由 `page.visibility.partnersTitle` 控制。
- **UI**: 可见性切换按钮、字号 `PresetSelect`、文本 `Input`。不可见时整体灰显。
- **图标**: `Type`

---

## 7. 共享工具组件

### 7.1 `FieldWrapper`
所有字段控件的通用包装器。

- **文件**: `src/components/editor/fields/FieldWrapper.tsx`

**渲染内容**:
1. 可见性开关 (Eye/EyeOff 图标)
2. 字段图标 + 标签
3. 子内容 (children) — 不可见时灰显并禁用交互
4. 样式配置按钮 (可选的 `ZineStylePanel` 弹出面板，支持智能定位：自动检测下方空间是否充足，不足则向上弹出)

**Props**:

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `page` | `PageData` | 当前页面数据 |
| `onUpdate` | `(page: PageData, silent?: boolean) => void` | 更新回调 |
| `fieldKey?` | `keyof PageData` | 字段键名，用于自动控制可见性 |
| `manualVisibility?` | `boolean` | 手动控制可见性（替代 fieldKey 自动推断） |
| `onToggle?` | `(isVisible: boolean) => void` | 自定义可见性切换回调 |
| `label` | `string` | 字段标签文本 |
| `icon?` | `LucideIcon` | 字段图标 |
| `children` | `ReactNode` | 字段内容 |
| `showStyleConfig?` | `boolean` | 是否显示样式设置齿轮按钮 |
| `styleMode?` | `'text' \| 'image' \| 'divider'` | 传递给 ZineStylePanel 的模式 |
| `customFonts?` | `CustomFont[]` | 自定义字体列表 |

### 7.2 `FieldToolbar`
极简悬浮字号调节器。

- **文件**: `src/components/editor/fields/FieldToolbar.tsx`

**功能**: 提供字号增减按钮，默认以绝对定位悬浮于字段上方，hover 时浮现。

**Props**:

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `onIncrease` | `() => void` | 增大字号回调 |
| `onDecrease` | `() => void` | 减小字号回调 |
| `isFloating?` | `boolean` | 是否使用悬浮模式 (默认 `true`) |

