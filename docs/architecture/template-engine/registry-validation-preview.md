# 组件注册表、校验器与虚拟预览

## 6. 组件注册表 (`COMPONENT_REGISTRY`)

所有的 `Component` 节点必须引用已注册的组件名。组件在 [componentRegistry.ts](src/templates/schemas/componentRegistry.ts) 中注册：

| 组件名 | React 组件 | 职责 |
| :--- | :--- | :--- |
| `ZineDisplay` | `ZineDisplay` | 工业感大标题 (Zine) |
| `ZineBody` | `ZineBody` | 诗性正文字体 (Zine) |
| `ZineCaption` | `ZineCaption` | 小字标注/元数据 (Zine) |
| `ZineMedia` | `ZineMedia` | 模块化网格图像 (Zine) |
| `ZineResume` | `ZineResume` | 简历区块渲染 (Zine) |
| `ZineDivider` | `ZineDivider` | 精密刻度线 (Zine) |
| `ZineIcon` | `ZineIcon` | 多源图标渲染器 (Lucide / Material Symbols / 图片) |
| `ZineMetric` | `ZineMetric` | KPI 度量指标 (大数字 + 单位 + 标签) |
| `BigDataMetrics` | `BigDataMetrics` | 自定义行列网格大数据指标墙 |
| `ZineLogo` | `ZineLogo` | 品牌 Logo 渲染 |
| `ZineArtFont` | `ZineArtFont` | SVG 高级艺术字 (实心/空心描边) |

---

## 7. Schema 校验器

[validator.ts](src/templates/schemas/validator.ts) 提供 `TemplateSchema` 的结构验证，使用 [Zod](https://zod.dev/) 实现：

- 所有节点 `type` 合法（`'Container' | 'Component' | 'Conditional' | 'Repeater' | 'Text'`）
- `'Container'` 节点要求 `layout` 属性范围（`flex/grid/absolute/modular`）和 `children` 数组
- `'Component'` 节点要求 `componentType: string`，可选的 `bind`、`fieldKey`、`props`
- `'Repeater'` 节点要求 `bind: string`，可选的 `layout` / `layoutProps` / `itemVariable`，以及 `template` 子节点
- `'Conditional'` 节点要求 `condition: string`、`then` 子节点、可选的 `else` 子节点
- `'Text'` 节点要求 `content: string`
- `modular` 属性的坐标值在 1-24 范围内（通过 Zod `.min(1).max(24)` 验证）
- 递归校验子节点树（通过 `z.lazy()` 实现）
- `zIndex` 声明验证为 `'page.top' | 'bottom' | '<id>.top' | '<id>.bottom'` 格式

> **注意**：`componentType` 的合法性由运行时渲染时的 `getComponent()` 检查，校验器仅保证字段存在且为字符串。如果引用了未注册的组件名，渲染时会输出 console.warn 并返回 null。

---

## 8. 虚拟预览系统

[TemplatePreview.tsx](../../src/components/ui/TemplatePreview.tsx) 展示了"真实渲染"的强大：

- 它不是加载预生成的 PNG，而是将真实组件以 `scale(200 / max(w, h))` 的比例在内存中进行实例化。
- 每个预览使用 `useMemo` 构造的 Mock 页面数据（包含标题、正文、图片、特性列表等占位数据），确保组件渲染饱满。
- 通过 `wireframe-mode` CSS 类，自动将彩色视图转化为高对比度的蓝图风格。
- 缩放容器使用 `transformOrigin: 'center center'` 居中缩放到约 200px 的预览卡片尺寸。
- 顶层放置透明遮罩层，防止预览图内部产生滚动或点击交互。
- 用于模板浏览器中的预览卡片，让用户在应用模板前就能看到其 24x24 网格布局的实际效果。
