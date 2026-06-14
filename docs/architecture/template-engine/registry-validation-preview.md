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

[validator.ts](src/templates/schemas/validator.ts) 提供 `TemplateSchema` 的结构验证，确保：

- 所有节点 `type` 合法
- `Component` 节点的 `componentType` 在 `COMPONENT_REGISTRY` 中存在
- `modular` 属性的坐标值在 1-24 范围内
- 递归校验子节点树

---

## 8. 虚拟预览系统

[TemplatePreview.tsx](src/components/ui/TemplatePreview.tsx) 展示了"真实渲染"的强大：

- 它不是加载预生成的 PNG，而是将真实组件以 `scale(0.1)` 的比例在内存中进行实例化。
- 通过 `wireframe-mode` CSS 类，自动将彩色视图转化为高对比度的蓝图风格。
- 用于模板浏览器中的预览卡片，让用户在应用模板前就能看到其 24x24 网格布局的实际效果。
