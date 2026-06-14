# 文本与媒体类字段

## 1. 文本类字段

### 1.1 `TitleField`
主标题编辑。提供多行文本区域和字体选择。

- **文件**: `fields/TitleField.tsx`
- **绑定字段**: `page.title`
- **额外控件**:
  - `FontSelect` — 标题字体选择器
  - `Slider` — 标题 Y 轴偏移 (`page.titleY`)
  - 字符/词数统计
- **图标**: `Type`

### 1.2 `SubtitleField`
副标题编辑。

- **文件**: `fields/SubtitleField.tsx`
- **绑定字段**: `page.subtitle`
- **额外控件**: `FontSelect` — 正文字体选择器
- **图标**: `FileText`

### 1.3 `ParagraphField`
段落/正文编辑。大号多行文本区域。

- **文件**: `fields/ParagraphField.tsx`
- **绑定字段**: `page.paragraph`
- **额外控件**: `FontSelect` — 正文字体选择器
- **图标**: `AlignLeft`

### 1.4 `ActionTextField`
行动号召 (CTA) 按钮文本编辑。

- **文件**: `fields/ActionTextField.tsx`
- **绑定字段**: `page.actionText`
- **图标**: `MousePointer`

### 1.5 `SignatureField`
签名/结语文本编辑。

- **文件**: `fields/SignatureField.tsx`
- **绑定字段**: `page.signature`
- **特性**: 签名图片的 `IconPicker` 支持 `upload` + `history` Tab（可复用项目图片）
- **图标**: `PenTool`

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

> 🖼️ **资产复用提示**：所有媒体类字段内置的 `IconPicker` 均已声明 `allowedTabs=['upload', 'icons', 'map', 'history']`（部分字段视场景删减）。只要上层传入 `pages`，用户即可在 `History` Tab 中快速复用项目内已有的图片。

### 2.1 `ImageField`
主图片编辑。支持拖放上传、预览、响应式处理。

- **文件**: `fields/ImageField.tsx`
- **绑定字段**: `page.image`
- **特性**:
  - **Paste 事件**: 粘贴剪贴板图片 (Ctrl+V)
  - **Drop 事件**: 拖放图片文件
  - **Upload 按钮**: 点击选择文件
  - **History Tab**: 从项目其它页面复用已有图片（需 `pages`）
  - **预览**: 小缩略图预览
  - **ImageConfig**: X/Y 偏移 (slide)，缩放 (scale)
- **图标**: `Image`

### 2.2 `LogoField`
Logo 图片编辑。功能类似于 `ImageField`。

- **文件**: `fields/LogoField.tsx`
- **绑定字段**: `page.logo`
- **额外控件**: `Slider` — logo 缩放控制 (`page.logoSize`)
- **图标**: `Circle`

### 2.3 `ImageLabelField`
图片主标签编辑。

- **文件**: `fields/ImageLabelField.tsx`
- **绑定字段**: `page.imageLabel`
- **图标**: `Tag`

### 2.4 `ImageSubLabelField`
图片副标签编辑。

- **文件**: `fields/ImageSubLabelField.tsx`
- **绑定字段**: `page.imageSubLabel`
- **图标**: `Hash`

