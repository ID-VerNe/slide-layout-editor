# 数据、图标与 Logo 原子组件

### 3.1 `ZineMetric`
KPI 度量指标展示组件。将 `MetricData` 对象渲染为"大数字 + 单位 + 标签"的三段式布局，支持 KaTeX 数学公式渲染单位。

- **文件**: `src/components/ui/slide/atoms/ZineMetric.tsx`
- **数据来源**: `MetricData` (通过 `data` 属性直接传入)

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `data` | `MetricData` | (必需) | 度量数据对象 (`{ id, value, label, icon?, unit?, subLabel? }`) |
| `page` | `PageData` | `undefined` | 当前页面数据 (用于 styleOverrides) |
| `typography` | `TypographySettings` | `undefined` | 排版设置 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `valueClassName` | `string` | `''` | 数值区域的额外类名 |
| `labelClassName` | `string` | `''` | 标签区域的额外类名 |
| `unitClassName` | `string` | `''` | 单位区域的额外类名 |
| `subLabelClassName` | `string` | `''` | 副标签区域的额外类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**内部实现**:
- 使用 `useModularStyle` 解析样式 Token。
- 数值通过 `Text` 原子组件渲染（`font-[1000]`、`tracking-[-0.05em]`）。
- 单位通过 `katex.renderToString()` 渲染，支持 LaTeX 公式。
- 标签/副标签也通过 `Text` 原子组件渲染，标签默认 `text-[10px] font-black uppercase tracking-widest`。

**MetricData 结构**:
```typescript
interface MetricData {
  id: string;
  value: string;   // 大数字 (如 "24.8B", "98%")
  label: string;   // 标签文本 (如 "年营收")
  icon?: string;   // 可选图标
  unit?: string;   // 单位 (支持 LaTeX, 如 "\\text{USD}")
  subLabel?: string; // 可选副标签
}
```

---

### 3.2 `BigDataMetrics`
自定义网格布局的大数据指标展示组件。支持自定义行列数和填充顺序，常用于制作类似金融数据看板的重型指标墙。

- **文件**: `src/components/ui/slide/atoms/BigDataMetrics.tsx`
- **数据来源**: `MetricData[]`，解析优先级为 `metrics` prop > `text` prop > `page.metrics`
- **网格配置来源**: `page.bigDataMetricsConfig` (`{ rows, cols }`) > `rows`/`cols` props > 默认值 `{ rows: 3, cols: 2 }`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `metrics` | `MetricData[]` | `undefined` | 直接传入指标数据 |
| `text` | `MetricData[]` | `undefined` | 渲染引擎通过 `bind` 注入时使用的别名 |
| `page` | `PageData` | `undefined` | 当前页面数据 |
| `rows` | `number` | `undefined` | 网格行数 |
| `cols` | `number` | `undefined` | 网格列数 |
| `fillOrder` | `'bottom-right-to-top-left' \| 'top-left-to-bottom-right'` | `'bottom-right-to-top-left'` | 单元格填充顺序（当前始终按右下优先填充，此 prop 为预留） |
| `gap` | `string` | `'1.5rem'` | 行列间距 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**内部实现**:
- 不使用 `ZineMetric`，直接通过 JSX 渲染每个指标项。
- 按列优先从右到左填充：`metricIndex = (cols - 1 - colIndex) * rows + (rows - 1 - rowIndex)`。
- 数值默认 `font-black tracking-tight leading-none`；标签默认 `uppercase font-black tracking-widest opacity-50`。
- 使用 `page.styleOverrides.bigDataMetrics` 的 `value` / `label` / `unit` 分区控制样式。
- 空数据时返回 `null`。

**样式覆盖 (`page.styleOverrides.bigDataMetrics`)**:

| 分区 | 字段 | 说明 |
| :--- | :--- | :--- |
| `value` | `size` (`×8px`, 默认 `3.5`), `fontFamily`, `bold`, `italic`, `color` | 大数值样式 |
| `label` | `size` (`×8px`, 默认 `2.25`), `fontFamily`, `bold`, `italic`, `color` | 标签样式 |
| `unit` | `size` (`×8px`, 默认 `1.5`), `fontFamily`, `bold`, `italic`, `color` | 单位样式 |

**特性**:
- **独立样式分区**: 数值、单位、标签可分别设置字号、字重、斜体、颜色与字体。
- **右下优先填充**: 默认从右下角开始向左上角填充，营造数据看板的稳重感。
- **行列自适应**: 优先读取 `page.bigDataMetricsConfig`，允许编辑器通过可视化面板动态调整网格。

---
## 4. 多媒体与图标原子组件

### 4.1 `ZineIcon`
通用图标渲染器，支持三种图标源：Lucide React 图标、Material Symbols 字体图标、以及图片 URL / DataURL。

- **文件**: `src/components/ui/slide/atoms/ZineIcon.tsx`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `name` | `string` | (必需) | 图标名称/URL。自动检测源类型 |
| `page` | `PageData` | `undefined` | 当前页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 |
| `size` | `number` | `24` | 图标尺寸 (px) |
| `color` | `string` | `undefined` | 图标颜色 (Token 或 Hex) |
| `weight` | `number \| string` | `undefined` | 字体粗细 (Material Symbols) |
| `strokeWidth` | `number` | `2.5` | 描边宽度 (Lucide 图标) |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**图标源自动检测逻辑**:

| 检测条件 | 渲染方式 | 示例 |
| :--- | :--- | :--- |
| `name` 以 `data:image` 开头，或包含 `http`、`/`、`.` | `<ImageAtom>` 图片渲染 | `"data:image/png;...""`, `"asset://logo.svg"` |
| `name` 包含 `_` 或以小写字母开头 | Material Symbols 字体图标 (`fontVariationSettings`) | `"settings"`, `"play_arrow"` |
| 其他情况 (PascalCase) | `LUCIDE_ICON_MAP` 查找 → Lucide React 组件 | `"Zap"`, `"Star"` |

**特性**:
- **多源统一接口**: 同一个组件处理图片、Material Symbols、Lucide 三种图标源
- **容错回退**: Lucide 查找失败时回退到 `HelpCircle` 图标
- **useModularStyle**: 通过 Hook 解析样式 Token 与 Zine Mode 约束
- **9 点对齐**: 标准化支持网格贴靠

### 4.2 `ZineLogo`
品牌 Logo 渲染组件。通过 `useAssetUrl` 解析 Logo 资源路径，支持可见性开关和尺寸控制。

- **文件**: `src/components/ui/slide/atoms/ZineLogo.tsx`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 (读取 `logo`, `logoSize`, `visibility.logo`) |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**特性**:
- **可见性控制**: `page.visibility?.logo !== false` 时渲染，无数据时返回 `null`
- **尺寸配置**: 使用 `page.logoSize` (默认 48px)
- **渐进加载**: `useAssetUrl` 提供加载状态，加载中 `opacity-0`，完成后淡入
- **跨域支持**: `crossOrigin="anonymous"` 确保 Canvas 导出兼容
- **9 点对齐**: 标准化支持网格贴靠
