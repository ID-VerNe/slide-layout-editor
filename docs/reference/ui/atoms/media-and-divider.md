# 媒体与图形类原子组件

### 2.1 `ZineMedia`
图像与媒体容器。完全独立化，合并 `SlideImage` 逻辑。

- **文件**: `src/components/ui/slide/atoms/ZineMedia.tsx`
- **默认绑定**: `fieldKey='image'`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 当前页面数据 |
| `fieldKey` | `string` | `'image'` | 绑定的 PageData 字段 |
| `src` | `string` | - | 直接指定图片路径（覆盖数据连接获取的源） |
| `config` | `ImageConfig` | - | 图片配置 `{ scale, x, y }`，控制缩放和偏移 |
| `rounded` | `string \| number` | `undefined` | 圆角大小。支持像素 (如 `20`) 或胶囊形状 (`"9999px"`) |
| `priority` | `boolean` | `false` | 高优先级加载（禁用 LQIP，`loading="eager"`） |
| `sizes` | `string` | `"(max-width: 768px) 100vw, 50vw"` | 响应式 sizes 属性 |
| `className` | `string` | `''` | 额外 CSS 类名 |
| `imgClassName` | `string` | `''` | 图片元素的额外类名 |
| `style` | `React.CSSProperties` | - | 自定义内联样式 |

**特性**:
- **数据连接**: 通过 `useDataConnector` 提取 `page[fieldKey]` 和 `page[fieldKey + 'Config']`。
- **资源解析**: 使用 `useAssetUrl` 解析 `asset://` 协议，`useResponsiveImage` 构建 `srcSet`。
- **LQIP 占位**: 自动生成 20x20 低质量缩略图作为加载过渡（`priority` 模式跳过）。
- **图片配置**: 支持 `config.scale`（缩放）、`config.x/y`（偏移，映射到 `objectPosition`）。
- **可见性控制**: 通过 `page.visibility[fieldKey]` 控制组件开关。
- **9 点对齐**: 未指定 `styleOverrides` 时默认 `w-full h-full` 铺满容器；有手动对齐设置时保持原始尺寸。

**内部依赖**: `Image` 原子组件（处理 `<picture>` / `srcSet` / LQIP / 加载状态）。

---

### 2.2 `ZineDivider`
工业感分割线/精密刻度线。遵循 Zine Mode 审美约束，支持 Modular Grid 定位与 9 点对齐。

- **文件**: `src/components/ui/slide/atoms/ZineDivider.tsx`

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | `PageData` | (必需) | 页面数据 |
| `fieldKey` | `string` | `undefined` | 绑定的字段名 (用于 styleOverrides 和可见性) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 线条方向 |
| `thickness` | `number \| string` | `'1px'` | 线条粗细（支持 `page.styleOverrides[fieldKey].thickness` 覆盖） |
| `color` | `keyof DesignSystem['tokens']['colors'] \| string` | `'accent'` | 线条颜色 |
| `className` | `string` | `''` | 额外类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 (含 alignSelf, justifySelf) |

**特性**:
- **可见性控制**: 当传入 `fieldKey` 时，自动检查 `page.visibility[fieldKey] !== false`。
- **9 点对齐 (Alignment)**: 支持 `alignSelf` (垂直: top/middle/bottom) 与 `justifySelf` (水平: left/center/right)。Flexbox(column) 中自动交换以保证 9-Point 语义正确。
- **智能长度控制**: 水平线 `width` 默认 `100%`，垂直线 `height` 默认 `100%`；可通过 `style.width` / `style.height` 覆盖。
- **厚度覆盖**: 支持 `page.styleOverrides[fieldKey].thickness` 覆盖 Prop 传入的值。
- **颜色解析**: 支持 DesignSystem Token 名称（如 `'accent'`）或任意 CSS 颜色值。
- **Border 模拟**: 设为 `vertical` 且 `justifySelf="start"` 时，表现为单元格的左边框线。
