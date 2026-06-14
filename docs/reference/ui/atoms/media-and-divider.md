# 媒体与图形类原子组件

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
