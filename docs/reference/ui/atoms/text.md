# 文本类原子组件

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
| `size` | `number` | - | **语义化**: 8px 的倍数 (如 `size: 10` 为 80px) |
| `serif / sans` | `boolean` | - | **语义化**: 切换衬线/无衬线体 |
| `bold / italic` | `boolean` | - | **语义化**: 加粗/斜体开关 |
| `align` | `string` | `'left'` | **语义化**: `'left' \| 'center' \| 'right' \| 'justify'` |
| `leading` | `number` | `1.1` | **语义化**: 行高倍数，自动基线吸附 |
| `tracking` | `number` | `0.2` | **语义化**: 字距 (em) |
| `text` | `string` | `page.title` | 显示的文本内容 |
| `color` | `string` | `'primary'` | 颜色 Token 或 Hex |
| `orientation` | `'horizontal' \| 'vertical-stack' \| 'vertical-rotate'` | `'horizontal'` | 文字排版方向 |
| `className` | `string` | `''` | 额外的 CSS 类名 (受 Zine Mode 过滤) |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**特性**:
- **意图化驱动**: 组件内部不再硬编码字体名称。所有排版意图通过语义化 Props 表达，由渲染引擎统一解析。
- **基线吸附**: 自动确保行高为 8px 的整数倍。
- **竖排红线 (Red Lines)**: 设为 `vertical-stack` 时，强制执行 **全大写 (ALL CAPS)** 和加宽字距，严禁小写字母竖向堆叠。
- **侧边旋转**: `vertical-rotate` 模式下文字逆时针旋转 90 度，适用于窄边栏标注。

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
