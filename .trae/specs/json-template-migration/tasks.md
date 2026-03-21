# JSON 模板存储架构改造 - 任务清单

## 阶段一：核心引擎开发

### 任务 1.1：创建 Schema 类型定义
- [ ] 创建 `src/templates/schemas/types.ts`
- [ ] 定义 `BaseNode` 接口（id, className, style）
- [ ] 定义 `ContainerNode` 接口（layout, layoutProps, children）
- [ ] 定义 `ComponentNode` 接口（type, bind, props, visibleWhen）
- [ ] 定义 `ConditionalNode` 接口（condition, then, else）
- [ ] 定义 `TemplateSchema` 接口（id, name, category, supportedRatios, root）
- [ ] 导出 `TemplateNode` 联合类型

### 任务 1.2：创建 Component 注册表
- [ ] 创建 `src/templates/schemas/componentRegistry.ts`
- [ ] 导入所有原子组件（SlideHeadline, SlideImage 等）
- [ ] 创建 `getComponent(type: string): React.FC | null`
- [ ] 创建 `COMPONENT_REGISTRY` 常量
- [ ] 导出组件类型列表

### 任务 1.3：实现 Expression Evaluator
- [ ] 创建 `src/templates/schemas/expressionEvaluator.ts`
- [ ] 实现 `evaluate(expr: string, context: any): any`
  - 支持 `page.xxx` 语法
  - 支持 `theme.xxx` 语法
  - 支持可选链 `page.vis?.title`
- [ ] 实现 `interpolate(template: string, context: any): string`
  - 处理 `bg-pattern-{page.backgroundPattern}` 类模板字符串

### 任务 1.4：实现 Zod Validation Schema
- [ ] 安装 zod 依赖（如尚未安装）
- [ ] 创建 `src/templates/schemas/validator.ts`
- [ ] 定义 `TemplateNodeZodSchema`
- [ ] 实现 `validateTemplate(schema: any): ValidationResult`
- [ ] 实现 `withDefaults(schema: TemplateSchema): TemplateSchema`

### 任务 1.5：实现 Layout Renderer
- [ ] 创建 `src/templates/schemas/LayoutRenderer.tsx`
- [ ] 实现 `renderNode(node: TemplateNode, context: RenderContext): ReactNode`
- [ ] 实现 Flex 布局容器（direction, gap, align, justify）
- [ ] 实现 Absolute 布局容器（inset positioning）
- [ ] 实现 Grid 布局容器（future-proofing）
- [ ] 实现 ComponentNode 渲染（调用注册表组件 + 绑定数据）
- [ ] 实现 ConditionalNode 渲染（条件求值 + 选择分支）
- [ ] 实现递归子节点渲染
- [ ] 添加 React.memo 优化性能

### 任务 1.6：创建主入口文件
- [ ] 创建 `src/templates/schemas/index.ts`
- [ ] 导出所有类型
- [ ] 导出 `JsonTemplateRenderer` 组件
- [ ] 导出验证工具

---

## 阶段二：试点模板迁移

### 任务 2.1：迁移 BigStatement 模板
- [ ] 分析现有 `BigStatement.tsx` 布局结构
- [ ] 提取容器层级和组件实例
- [ ] 设计对应的 TemplateSchema JSON
- [ ] 创建 `src/templates/schemas/big-statement.json`
- [ ] 创建 `src/templates/schemas/big-statement.ts` 导出 Schema

### 任务 2.2：迁移 MicroAnchor 模板
- [ ] 分析现有 `MicroAnchor.tsx` 布局结构
- [ ] 提取容器层级和组件实例
- [ ] 设计对应的 TemplateSchema JSON
- [ ] 创建 `src/templates/schemas/micro-anchor.json`

### 任务 2.3：创建 JsonTemplateRenderer 集成
- [ ] 创建 `src/components/JsonTemplateRenderer.tsx`
- [ ] 接收 `TemplateSchema` + `PageData` + `typography`
- [ ] 使用 Expression Evaluator 解析绑定
- [ ] 使用 LayoutRenderer 渲染组件树
- [ ] 处理 `visibleWhen` 可见性逻辑

### 任务 2.4：修改 Preview.tsx 支持 Schema
- [ ] 修改 `src/components/Preview.tsx`
- [ ] 在 `renderTemplate()` 中添加 Schema 检测逻辑
- [ ] 如果 `layoutId` 有对应 Schema，渲染 JsonTemplateRenderer
- [ ] 否则回退到原有 React 组件（Hybrid 模式）
- [ ] 确保模板切换功能正常

---

## 阶段三：编辑器集成

### 任务 3.1：适配 Editor 组件
- [ ] 修改 `src/components/Editor.tsx`
- [ ] 支持从 Schema 读取 `fields` 定义
- [ ] 保持 FieldRenderer 机制不变
- [ ] 实现 Schema 字段动态生成

### 任务 3.2：适配 TemplateLoader
- [ ] 创建 Schema 版本的模板懒加载
- [ ] 保持 TemplateLoader 接口不变

### 任务 3.3：更新 registry.ts
- [ ] 修改 `src/templates/registry.ts`
- [ ] 为每个模板添加可选的 `schema` 字段
- [ ] 支持 `component: React.FC | schema: TemplateSchema` 混合模式
- [ ] 创建 `getTemplateSchema(id: string): TemplateSchema | null`

---

## 阶段四：更多模板迁移

### 任务 4.1：迁移简单模板（第二批）
- [ ] 迁移 `SincerityPortrait`
- [ ] 迁移 `KinfolkFeature`
- [ ] 迁移 `TypographyHero`
- [ ] 迁移 `EditorialClassic`

### 任务 4.2：迁移中等复杂度模板（第三批）
- [ ] 迁移 `KinfolkEssay`
- [ ] 迁移 `GalleryCapsule`
- [ ] 迁移 `PlatformHero`
- [ ] 迁移 `TestimonialCard`
- [ ] 迁移 `EditorialSplit`

### 任务 4.3：迁移复杂模板（第四批）
- [ ] 迁移 `CinematicFullBleed`（含条件渲染）
- [ ] 迁移 `AppleBentoGrid`（Grid 布局）
- [ ] 迁移 `KinfolkMontage`（Gallery）
- [ ] 迁移 `FilmDiptych`（双图）

### 任务 4.4：保留复杂 React 模板（可选）
- [ ] 评估 `AcademicHybridResume` 是否值得 JSON 化
- [ ] 评估 `ComponentMosaic` 是否值得 JSON 化
- [ ] 决定是否保留为纯 React 实现

---

## 阶段五：基础设施增强

### 任务 5.1：增强布局引擎
- [ ] 添加更复杂的条件表达式支持
- [ ] 实现 `page.visibility.xxx` 内置可见性处理
- [ ] 实现背景图案预定义映射表
- [ ] 优化 memo 和重渲染

### 任务 5.2：创建 Schema 生成工具（可选）
- [ ] 开发 React 组件转 Schema 的辅助函数
- [ ] 创建 `analyzeComponent(Component): Partial<TemplateSchema>`
- [ ] 文档化 Schema 编写规范

### 任务 5.3：可视化编辑器（未来规划）
- [ ] 拖拽调整区域功能设计
- [ ] 实时预览 Schema 变化

---

## 任务依赖关系

```
任务 1.1 → 任务 1.2
    ↓
任务 1.3 (Expression Evaluator 独立)
    ↓
任务 1.4 (Validation 独立)
    ↓
任务 1.5 → 任务 1.6
              ↓
任务 2.3 ← 任务 2.1, 任务 2.2
              ↓
任务 2.4 ← 任务 2.3
              ↓
任务 3.1, 3.2, 3.3 ← 任务 2.4
              ↓
任务 4.1 → 4.2 → 4.3 → 4.4 (可选)
              ↓
任务 5.1 → 5.2 → 5.3 (可选)
```

---

## 验证标准

### 每个迁移的模板需要满足：
1. JSON Schema 渲染结果与 React 组件渲染结果视觉一致
2. 字段编辑功能正常工作
3. 模板切换功能正常工作
4. 打印预览功能正常工作
5. 性能无明显下降

---

## 里程碑

| 阶段 | 交付物 | 验收标准 |
|------|--------|---------|
| 阶段一 | 核心引擎可用 | BigStatement 可通过 Schema 渲染 |
| 阶段二 | 2个试点模板 | BigStatement + MicroAnchor 完整迁移 |
| 阶段三 | 编辑器适配 | Schema 模板可在编辑器中正常编辑 |
| 阶段四 | 12个模板 | 超过50%的模板完成迁移 |
| 阶段五 | 增强功能 | 复杂布局支持和工具链完善 |
