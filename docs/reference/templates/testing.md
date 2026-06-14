# 模板测试与验证

### 4.1 Schema 验证
每个模板 Schema 可通过 [src/templates/schemas/validator.ts](src/templates/schemas/validator.ts) 进行结构验证。

### 4.2 实时调试
运行 `pnpm dev`，在编辑器中切换到目标模板。`TemplatePreview` 组件会以蓝图风格实时渲染模板的 24x24 网格布局，便于验证排版的正确性。
