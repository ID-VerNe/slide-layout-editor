# UI 核心原子组件 (Slide Atoms)

这些组件是构成幻灯片页面的基本单元，通常用于模板 Schema 的 `Component` 节点。所有原子组件位于 `src/components/ui/slide/atoms/` 目录。

---

## 1. 文本类原子组件

### 1.1 `ZineDisplay`
用于大张力标题。消费 `ds.tokens.typography.display` 样式令牌。

- **推荐字体**: `Playfair Display`
- **默认字号**: `32pt - 48pt`
- **字距 (Tracking)**: 强制 `+0.2em` (200)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名 |
| `text` | `string` | `page.title` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'primary'` | 文字颜色 Token |
| `orientation` | `'horizontal' \| 'vertical-stack' \| 'vertical-rotate'` | `'horizontal'` | 文字排版方向 |
| `className` | `string` | `''` | 额外的 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**特性**:
- **竖排红线 (Red Lines)**: 设为 `vertical-stack` 时，强制执行 **全大写 (ALL CAPS)** 和加宽字距，严禁小写字母竖向堆叠。
- **侧边旋转**: `vertical-rotate` 模式下文字逆时针旋转 90 度，适用于窄边栏标注。
- **9 点对齐**: 标准化支持 `alignSelf` 和 `justifySelf`。如果不指定对齐，默认占据 100% 宽度。

---

### 1.2 `ZineBody`
用于段落文字、描述信息。消费 `ds.tokens.typography.body` 样式令牌。

- **推荐字体**: `Playfair Display` (Italic 变体) 或 `仿宋 (FangSong)`
- **默认字号**: `9pt - 11pt`
- **默认行高**: `1.6倍` (由 Token 定义)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名 |
| `text` | `string` | `page.paragraph` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'primary'` | 文字颜色 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |
| `dropCap` | `boolean` | `false` | 是否启用首字下沉效果 |

**特性**:
- **诗性排版**: `body` 令牌默认开启 `italic` 样式，营造诗歌/引言质感。
- **高精度排版**: 使用 `pt` 单位，在 `useModularStyle` 中自动关闭 8px 基线吸附以保证印刷级排版精度。
- **9 点对齐**: 标准化支持网格贴靠。

---

### 1.3 `ZineCaption`
用于小字标注、元数据、页码信息。消费 `ds.tokens.typography.caption` 令牌。

- **推荐字体**: `Inter` (无衬线)
- **默认字号**: `6.5pt - 7.5pt`
- **默认样式**: **全大写 (ALL CAPS)**，Bold/Medium 字重
- **默认字距**: `+0.2em` (200)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 |
| `text` | `string` | `undefined` | 显示的文本 |
| `color` | `keyof DesignSystem['tokens']['colors']` | `'secondary'` | 文字颜色 |
| `orientation` | `'horizontal' \| 'vertical-stack' \| 'vertical-rotate'` | `'horizontal'` | 文字排版方向 |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |

**特性**:
- **9 点对齐**: 标准化支持网格贴靠。

---

### 1.4 `ZineArtFont` (New)
高级艺术字组件。支持 SVG 渲染、实心/空心切换，用于高视觉冲击力的年份、编号或大标题。

- **推荐字体**: `Inter Black` / `Playfair Display`
- **渲染方式**: **SVG** (完美支持描边与透明度叠加)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `text` | `string` | (必需) | 显示的文本内容 |
| `mode` | `'solid' \| 'outline'` | `'outline'` | 渲染模式：实心或空心描边 |
| `fontSize` | `number` | `120` | 文字大小 (px) |
| `strokeWidth` | `number` | `2` | 描边宽度 (仅 outline 模式有效) |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'center'` | 对齐方式 |
| `opacity` | `number` | `1.0` | 不透明度 |
| `mixBlendMode` | `string` | `'normal'` | 混合模式 (如 `multiply`, `overlay`) |

**特性**:
- **9 点对齐**: 标准化支持网格贴靠。

---

## 2. 媒体与图形类原子组件

### 2.1 `ZineMedia`
图像与媒体容器。作为 `SlideImage` 的薄封装，支持圆角与胶囊形状。

- **文件**: `src/components/ui/slide/atoms/ZineMedia.tsx`
- **默认绑定**: `fieldKey='image'`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `'image'` | 绑定的 PageData 字段 |
| `src` | `string` | - | 直接指定图片路径 |
| `rounded` | `string \| number` | `0` | **新增**: 圆角大小。支持像素 (如 `20`) 或 胶囊形状 (`"9999px"`) |

**特性**:
- **9 点对齐**: 标准化支持网格贴靠。如果不指定对齐，默认 `w-full h-full` 填满网格单元。

---

### 2.2 `ZineDivider`
工业感分割线/精密刻度线。遵循 Zine Mode 审美约束，支持 Modular Grid 定位与 9 点对齐。

- **文件**: `src/components/ui/slide/atoms/ZineDivider.tsx`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 (用于 styleOverrides) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 线条方向 |
| `thickness` | `number \| string` | `'1px'` | 线条粗细 |
| `color` | `keyof DesignSystem['tokens']['colors'] \| string` | `'accent'` | 线条颜色 |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 (含 alignSelf, justifySelf) |

**特性**:
- **9 点对齐 (Alignment)**: 支持 `alignSelf` (垂直: top/middle/bottom) 与 `justifySelf` (水平: left/center/right)。在 Modular Grid 中可精确定位为格子边线或居中装饰线。
- **智能长度控制**: 支持通过 `style.width` (水平) 或 `style.height` (垂直) 覆盖默认的 100% 长度。
- **Border 模拟**: 设为 `vertical` 且 `justifySelf="start"` 时，表现为单元格的左边框线。

---

## 3. 专用原子组件

### 3.1 `ZineResume`
简历专用原子组件，封装了简历区块的完整渲染逻辑。

- **文件**: `src/components/ui/slide/atoms/ZineResume.tsx`
- **数据来源**: `page.resumeSections: ResumeSection[]`

---

## 4. 内部原子构建块

以下组件位于 `src/components/ui/slide/atoms/`，为原子组件内部使用的基础构建块：

- **`Text`**: 最基础的文本渲染单元 (`atoms/Text.tsx`)。
- **`Icon`**: 原子化图标渲染器 (`atoms/Icon.tsx`)。
- **`Image`**: 原子化图片渲染器基础级别 (`atoms/Image.tsx`)。
