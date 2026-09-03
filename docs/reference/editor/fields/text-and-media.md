# 文本与媒体类字段

## 1. 文本类字段

### 1.0 通用文本字段包装器 (`GenericTextField`)
为了遵循 DRY 原则，所有结构相似的单行/多行文本字段已统一重构为使用 `GenericTextField`。它统一封装了：
- 防抖输入控制（`DebouncedInput` / `DebouncedTextArea`）
- `FieldWrapper` 折叠、可见性开关（Eye Toggle）与图标
- `ZineStylePanel` 样式抽屉面板（`showStyleConfig=true`）集成
- 页面数据字段与 `styleOverrides` 的双向响应式同步

- **文件**: `fields/GenericTextField.tsx`

### 1.1 `TitleField`
主标题编辑。基于 `DebouncedTextArea`（多行文本区域），通过 `FieldWrapper` 内嵌 `ZineStylePanel` 样式面板。

- **文件**: `fields/TitleField.tsx`
- **绑定字段**: `page.title`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel（字体、字号、对齐、颜色等）
- **图标**: `Type`

### 1.2 `SubtitleField`
副标题编辑。基于 `DebouncedTextArea`（多行文本区域），通过 `FieldWrapper` 内嵌 `ZineStylePanel` 样式面板。

- **文件**: `fields/SubtitleField.tsx`
- **绑定字段**: `page.subtitle`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel
- **图标**: `Type`

### 1.3 `ParagraphField`
段落/正文编辑。基于 `GenericTextField`（多行文本），通过 `FieldWrapper` 内嵌 `ZineStylePanel` 样式面板。

- **文件**: `fields/ParagraphField.tsx`
- **绑定字段**: `page.paragraph`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel
- **图标**: `Type`

### 1.3.1 `ParagraphZHField` (双语中文正文)
双语精读阅读页面的中文译文正文编辑。基于 `GenericTextField`（多行文本），支持中文字体族切换与独立样式调整。

- **文件**: `fields/ParagraphZHField.tsx`
- **绑定字段**: `page.paragraphZH`
- **样式配置**: `showStyleConfig=true`
- **图标**: `Languages`

### 1.3.2 `QuoteZHField` (双语引言译文)
名言双语对照模板的中文引言译文编辑。基于 `GenericTextField`。

- **文件**: `fields/QuoteZHField.tsx`
- **绑定字段**: `page.quoteZH`
- **样式配置**: `showStyleConfig=true`
- **图标**: `Quote`

### 1.3.3 `SideHeaderField` (侧边栏小标题)
双语阅读与排版模板的侧栏/章节标题。基于 `GenericTextField`。

- **文件**: `fields/SideHeaderField.tsx`
- **绑定字段**: `page.sideHeader`
- **样式配置**: `showStyleConfig=true`
- **图标**: `AlignLeft`

### 1.4 `ActionTextField`
行动号召 (CTA) 按钮文本编辑。基于 `GenericTextField`（单行输入）。

- **文件**: `fields/ActionTextField.tsx`
- **绑定字段**: `page.actionText`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel
- **图标**: `Type`

### 1.5 `SignatureField`
签名图片编辑。基于 `IconPicker` 选择签名图片，支持 Adjust 面板控制签名高度。
在字段注册表中，`signature` FieldType 映射为 `ImageField` 组件，但当前源码使用独立的 `SignatureField` 组件实现。

- **文件**: `fields/SignatureField.tsx`
- **绑定字段**: `page.signature`
- **图标**: `PenTool`
- **IconPicker**: `allowedTabs={['upload', 'history']}` — 支持上传和复用项目已有图片（无 `icons` 和 `map` Tab）
- **Adjust 面板**（点击「Adjust」按钮展开）:
  - **Signature Height 滑块**: 控制签名图片高度 (`20` ~ `300`, 步长 `2`)，存储于 `styleOverrides.signature.fontSize`（默认 `80`）
  - **Reset 按钮**: 重置高度至 `80`

### 1.6 `PartnersTitleField`
合作伙伴区块标题编辑。

- **文件**: `fields/PartnersTitleField.tsx`
- **绑定字段**: `page.partnersTitle`
- **图标**: `Building2`

### 1.7 `FooterField`
页脚文字编辑。

- **文件**: `fields/FooterField.tsx`
- **绑定字段**: `page.footer`
- **图标**: `MessageSquare`

### 1.8 `ArtFontField`
高级艺术字编辑器。用于编辑 `page.artFont` 字段，控制 ZineArtFont 组件的 SVG 渲染参数。

- **文件**: `fields/ArtFontField.tsx`
- **绑定字段**: `page.artFont`
- **图标**: `Type`

**编辑项**:

| 控件 | 绑定 | 说明 |
| :--- | :--- | :--- |
| Input | `page.artFont` | 艺术字文本内容 (大号粗体输入) |
| **PresetSelect** | `styleOverrides.artFont.fontSize` | **字号预设选择器** (12 档：6pt-120pt) |
| -/+ 按钮 | `styleOverrides.artFont.strokeWidth` | 描边粗细控制 (步长 ±0.5px) |
| Solid/Outline 按钮 | `styleOverrides.artFont.mode` | 切换 `'solid'` (实心) / `'outline'` (空心描边) |
| Range Slider | `styleOverrides.artFont.opacity` | 不透明度 (0.1 ~ 1.0) |

**特性**:
- **SVG 渲染**: 艺术字由 `ZineArtFont` 组件以 SVG 方式渲染，支持描边和透明度叠加
- **实时预览**: 样式变更直接反映到预览区
- **受控字号**: 使用 PresetSelect 确保字号符合设计规范

---

## 2. 媒体类字段

> 🖼️ **资产复用提示**：媒体类字段内置的 `IconPicker` 已声明 `allowedTabs`（各字段视场景有所不同）。只要上层传入 `pages`，用户即可在 `History` Tab 中快速复用项目内已有的图片。
> - `ImageField`: `['upload', 'icons', 'map', 'history']` — 全 Tab
> - `SignatureField`: `['upload', 'history']` — 只有上传和历史
> - `LogoField`: 不内嵌 `IconPicker`（仅 visibility 切换）

### 2.1 `ImageField`
主图片编辑。通过 `IconPicker` 提供上传、图标库、地图和历史 Tab，支持 Adjust 微调面板。

- **文件**: `fields/ImageField.tsx`
- **绑定字段**: `page.image`（通过 `fieldKey` 参数可配置为其他字段）
- **特性**:
  - **IconPicker**: `allowedTabs={['upload', 'icons', 'map', 'history']}`（需 `pages` 以支持 History Tab）
  - **预览**: `AssetPreviewSmall` 小缩略图预览
  - **Adjust 面板**:
    - **Fit to Container**: 重置为 `scale=1, x=0, y=0`
    - **Scale 滑块**: 缩放 (`0.5` ~ `3.0`, 步长 `0.1`)
    - **Move Horiz. 滑块**: 水平偏移 (`-100` ~ `100`)
    - **Move Vert. 滑块**: 垂直偏移 (`-100` ~ `100`)
    - **Remove Asset**: 清空图片
  - **配置结构**: `page.imageConfig`（若 `fieldKey` 非 `image` 则使用 `${fieldKey}Config`）含 `{ scale, x, y }`
  - **Electron 原生支持**: 使用 `nativeFs.uploadAsset` 保存 base64 资源
- **图标**: `Image`

### 2.2 `LogoField`
Logo 显示开关。提供 visibility 切换，不内嵌图片选择器或 Adjust 面板。

- **文件**: `fields/LogoField.tsx`
- **绑定字段**: `page.logo`（通过 `fieldKey` 参数可配置）
- **特性**: `manualVisibility` + `onToggle` — 通过 `FieldWrapper` 的切换按钮控制 `page.visibility.logo`
- **图标**: `Image`

### 2.3 `ImageLabelField`
图片主标签编辑。基于单行 `DebouncedInput`，通过 `FieldWrapper` 内嵌 `ZineStylePanel` 样式面板。

- **文件**: `fields/ImageLabelField.tsx`
- **绑定字段**: `page.imageLabel`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel
- **图标**: `Type`

### 2.4 `ImageSubLabelField`
图片副标签编辑。基于单行 `DebouncedInput`，通过 `FieldWrapper` 内嵌 `ZineStylePanel` 样式面板。

- **文件**: `fields/ImageSubLabelField.tsx`
- **绑定字段**: `page.imageSubLabel`
- **样式配置**: `showStyleConfig=true` — 使用 `styleMode="text"` 的 ZineStylePanel
- **图标**: `Type`

