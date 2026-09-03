# 模板引擎与渲染机制

SlideGrid Studio 的渲染引擎是一个声明式的"虚拟机"，它将静态的 JSON 蓝图转化为动态的、响应式的视觉界面。核心实现位于以下文件：

- [src/templates/schemas/LayoutRenderer.tsx](src/templates/schemas/LayoutRenderer.tsx) — 协调入口与 ErrorBoundary
- [src/templates/schemas/renderer/](src/templates/schemas/renderer/) — 解耦渲染子模块体系：
  - `basePropsResolver.ts` — 网格定位、预设注入、响应式与样式白名单过滤
  - `containerRenderer.tsx` — Flex / Grid / Modular 容器节点渲染
  - `componentRenderer.tsx` — 原子组件映射、字段绑定与 ErrorBoundary 保护
  - `repeaterRenderer.tsx` — 动态集合循环渲染与迭代上下文维护
  - `styleWhitelist.ts` — 样式白名单与 Tailwind 类名合规性过滤
  - `tokenResolver.ts` — Design Token 映射解析器
- [src/templates/schemas/utils/modularFlex.ts](src/templates/schemas/utils/modularFlex.ts) — 嵌套 Flex 布局占位与尺寸计算
- [src/templates/schemas/types.ts](src/templates/schemas/types.ts) — 节点类型定义
- [src/templates/schemas/expressionEvaluator.ts](src/templates/schemas/expressionEvaluator.ts) — 表达式求值引擎（防原型链污染）
- [src/templates/schemas/componentRegistry.ts](src/templates/schemas/componentRegistry.ts) — 组件注册表
- [src/templates/schemas/validator.ts](src/templates/schemas/validator.ts) — Schema 校验器 (Zod)
- [src/templates/schemas/zIndexResolver.ts](src/templates/schemas/zIndexResolver.ts) — zIndex 分层解析器

---

## 目录

- [节点系统与 LayoutRenderer 解耦架构](./nodes-and-renderer.md)
- [24×24 网格与样式流水线](./grid-and-style.md)
- [表达式引擎与数据绑定](./expressions.md)
- [组件注册表、校验器与虚拟预览](./registry-validation-preview.md)
- [zIndex、条件渲染、Repeater 与调试](./advanced-binding.md)
