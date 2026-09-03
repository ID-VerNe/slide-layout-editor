# 文本类原子组件

### 1.1 `ZineDisplay`
用于大张力标题。消费 `ds.tokens.typography.display` 样式令牌。所有排版意图通过语义化 Props 表达，由 `useModularStyle` 统一解析。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名 |
| `text` | `string` | `page.title` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors'] \| string` | `'primary'` | 颜色 Token 或 Hex |
| `orientation` | `'horizontal' \| 'vertical-stack' \| 'vertical-rotate'` | `'horizontal'` | 文字排版方向 |
| `className` | `string` | `''` | 额外的 CSS 类名 (受 Zine Mode 过滤) |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |
| `children` | `React.ReactNode` | - | 子元素（当 `text` 属性未提供时渲染） |

**特性**:
- **意图化驱动**: 所有排版意图通过语义化 Props 表达，由 `useModularStyle` 统一从 DesignSystem Token 中解析。
- **可见性控制**: 当传入 `fieldKey` 时，自动检查 `page.visibility[fieldKey] !== false` 控制显示。
- **9 点对齐**: 支持通过 `styleOverrides[fieldKey].alignSelf` / `justifySelf` 实现 Grid 对齐。Flexbox(column) 中自动交换对齐属性以匹配 9-Point 语义。
- **基线吸附**: 自动确保行高为 8px 的整数倍。
- **竖排红线 (Red Lines)**: 设为 `vertical-stack` 时，强制执行全大写 (ALL CAPS) 和加宽字距。
- **侧边旋转**: `vertical-rotate` 模式下文字逆时针旋转 90 度，适用于窄边栏标注。

---

### 1.2 `ZineBody`
用于段落文字、描述信息。消费 `ds.tokens.typography.body` 样式令牌。

- **默认行高**: `1.6倍` (由 Token 定义)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的 PageData 字段名 |
| `text` | `string` | `page.paragraph` | 显示的文本内容 |
| `color` | `keyof DesignSystem['tokens']['colors'] \| string` | `'primary'` | 文字颜色 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |
| `dropCap` | `boolean` | `false` | 是否启用首字下沉效果 |

**特性**:
- **可见性控制**: 当传入 `fieldKey` 时，自动检查 `page.visibility[fieldKey]`。
- **9 点对齐**: 支持通过 `styleOverrides[fieldKey].alignSelf` / `justifySelf` 实现 Grid 对齐。Flexbox(column) 中自动交换对齐属性。
- **首字下沉**: `dropCap` 模式渲染大号首字（`4.2rem`，`font-black`，accent 颜色），其余文本通过 `Text` 原子组件渲染。

---

### 1.3 `ZineCaption`
用于小字标注、元数据、页码信息。消费 `ds.tokens.typography.caption` 令牌。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 |
| `text` | `string` | `undefined` | 显示的文本 |
| `color` | `keyof DesignSystem['tokens']['colors'] \| string` | `'secondary'` | 文字颜色 |
| `orientation` | `'horizontal' \| 'vertical-stack' \| 'vertical-rotate'` | `'horizontal'` | 文字排版方向 |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |

**特性**:
- **可见性控制**: 当传入 `fieldKey` 时，自动检查 `page.visibility[fieldKey]`。
- **9 点对齐**: 支持通过 `styleOverrides[fieldKey].alignSelf` / `justifySelf` 实现 Grid 对齐。Flexbox(column) 中自动交换对齐属性。

---

### 1.4 `ZineArtFont`
高级艺术字组件。支持 SVG 渲染、实心/空心切换，用于高视觉冲击力的年份、编号或大标题。

- **渲染方式**: **SVG** (完美支持描边与透明度叠加)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `text` | `string` | (必需) | 显示的文本内容（自动转为全大写） |
| `page` | `PageData` | - | 当前页面数据（用于 styleOverrides） |
| `fieldKey` | `string` | - | 绑定的字段名 |
| `mode` | `'solid' \| 'outline'` | `'outline'` | 渲染模式：实心或空心描边 |
| `color` | `string` | `'#0F172A'` | 文字颜色 (实心填充色 / 描边颜色) |
| `strokeColor` | `string` | `'#0F172A'` | 描边颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 (仅 outline 模式有效) |
| `fontSize` | `number` | `120` | 文字大小 (px) |
| `fontFamily` | `string` | `'Inter, sans-serif'` | 字体族 |
| `fontWeight` | `number \| string` | `900` | 字重 |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'center'` | SVG 内对齐方式 |
| `lineHeight` | `number` | `1` | 行高倍数 |
| `letterSpacing` | `string` | `'-0.02em'` | 字间距 |
| `opacity` | `number` | `1.0` | 不透明度 |
| `mixBlendMode` | `React.CSSProperties['mixBlendMode']` | `'normal'` | 混合模式 (如 `multiply`, `overlay`) |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

---

### 1.5 `Text` (底层基础原子组件)
所有文本类原子的基石，负责 24 格物理隔离、安全断词与智能 XSS/符号保留。

- **文件**: [src/components/ui/slide/atoms/Text.tsx](src/components/ui/slide/atoms/Text.tsx)

**特性**:
- **智能纯文本/HTML 分流**:
  通过 `/<[a-z][\s\S]*>/i` 探测文本中是否包含实际 HTML 标记：
  - **纯文本模式**: 直接作为原生 React 节点渲染，**完整保留数学运算与比较符号（如 `< $10M`、`A < B`、`Count <= 5`）**，彻底避免被 DOMPurify 误杀。
  - **HTML 模式**: 仅在文本包含标记时调用 `DOMPurify.sanitize()`，过滤未授权标签与脚本注入。
- **物理安全样式**: 自动注入 `wordBreak: 'break-word'`, `overflowWrap: 'break-word'`, `boxSizing: 'border-box'`，防止长英文撑破网格单元。

---

### 1.6 `AutoFitHeadline` (自适应大标题)
基于全局单例 Web Worker 与闭式代数公式的动态字号自适应组件，使大标题在限定容器内瞬间计算出完美贴合尺寸。

- **文件**: [src/components/AutoFitHeadline.tsx](src/components/AutoFitHeadline.tsx)
- **底层调度**: [src/workers/fontCalculatorManager.ts](src/workers/fontCalculatorManager.ts)

**特性**:
- **$O(1)$ 闭式代数公式 (Closed-Form Calculation)**:
  彻底淘汰二分逼近遍历循环，Worker 内部通过字符权重推导（`ASCII: 0.6`, `CJK: 1.0`）结合容器宽高与行数限制，以代数公式瞬时解算最佳字号，无任何主线程阻塞。
- **全局 Worker 单例与并发安全 (FontCalculatorManager)**:
  采用全局唯一 Worker 管理器，使用自增消息 ID 严格匹配异步 Promise 响应，杜绝组件并发挂载时重复创建 Worker 导致的内存与句柄暴涨。
- **容器宽度感知缓存 (Width Bucket Isolation)**:
  缓存 Key 纳入容器物理宽度的 20px 离散分桶（`w${Math.round(containerWidth / 20) * 20}`），确保相同标题在 16:9 宽屏、2:3 竖屏或 3:4 小红书比例中各自计算独立字号，不发生跨比例溢出。
- **容量保护**: 内部设置最大 500 条缓存上限，淘汰老旧条目，防止长时间编辑内存泄漏。
- **可见性安全**: 移除计算期 `0.01` 不透明度，避免离屏导出与页面截图时捕获到半透明或空白标题。
