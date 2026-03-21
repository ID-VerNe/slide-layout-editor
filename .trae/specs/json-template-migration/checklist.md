# JSON 模板存储架构改造 - 验收清单

## 阶段一：核心引擎验收

### 类型定义验收 (任务 1.1)
- [ ] `BaseNode` 包含 `id`, `className`, `style` 字段
- [ ] `ContainerNode` 包含 `type: 'Container'`, `layout`, `layoutProps`, `children`
- [ ] `ComponentNode` 包含 `type`, `bind`, `props`, `visibleWhen`
- [ ] `ConditionalNode` 包含 `type: 'Conditional'`, `condition`, `then`, `else`
- [ ] `TemplateSchema` 包含 `id`, `name`, `category`, `supportedRatios`, `root`
- [ ] `TemplateNode` 联合类型正确

### Component 注册表验收 (任务 1.2)
- [ ] 所有原子组件已注册（SlideHeadline, SlideImage, SlideSubHeadline, SlideBlockLabel, SlideLogo, SlideMetric, SlideParagraph, SlideIcon）
- [ ] `getComponent()` 函数正确返回组件或 null
- [ ] TypeScript 类型完整

### Expression Evaluator 验收 (任务 1.3)
- [ ] `evaluate('page.title', { page: { title: 'Hello' } })` 返回 `'Hello'`
- [ ] `evaluate('theme.colors.primary', { theme: { colors: { primary: '#000' } } })` 返回 `'#000'`
- [ ] `evaluate('page.vis?.title', { page: { vis: null } })` 返回 `undefined`（不报错）
- [ ] `interpolate('bg-{page.pattern}', { page: { pattern: 'grid' } })` 返回 `'bg-grid'`

### Zod Validation 验收 (任务 1.4)
- [ ] 有效 Schema 通过校验
- [ ] 无效 Schema（缺少必填字段）抛出 ValidationError
- [ ] `withDefaults()` 正确填充默认值

### Layout Renderer 验收 (任务 1.5)
- [ ] Flex 容器正确应用 direction, gap, align, justify
- [ ] Absolute 容器正确应用 inset positioning
- [ ] ComponentNode 正确渲染注册表中的组件
- [ ] ComponentNode 正确绑定 `bind` 字段到 PageData
- [ ] ConditionalNode 正确求值并选择 then/else 分支
- [ ] `visibleWhen` 为 false 时组件不渲染
- [ ] 递归渲染 children 正常工作
- [ ] React.memo 正确应用（避免不必要重渲染）

---

## 阶段二：试点模板验收

### BigStatement 验收 (任务 2.1)
- [ ] Schema JSON 文件存在且格式正确
- [ ] 渲染结果与原 BigStatement.tsx 视觉一致
- [ ] 标题居中显示正确
- [ ] 支持编辑字段
- [ ] 支持 aspectRatio 切换

### MicroAnchor 验收 (任务 2.2)
- [ ] Schema JSON 文件存在且格式正确
- [ ] 渲染结果与原 MicroAnchor.tsx 视觉一致
- [ ] variant 布局变体正常
- [ ] 支持编辑字段

### JsonTemplateRenderer 验收 (任务 2.3)
- [ ] 组件正确接收 TemplateSchema + PageData + typography
- [ ] Expression Evaluator 正确解析绑定
- [ ] LayoutRenderer 正确渲染组件树
- [ ] `visibleWhen` 可见性逻辑正确

### Preview.tsx 混合模式验收 (任务 2.4)
- [ ] 有 Schema 的模板使用 JsonTemplateRenderer 渲染
- [ ] 无 Schema 的模板回退到原有 React 组件
- [ ] 模板切换功能正常
- [ ] 无控制台警告或错误

---

## 阶段三：编辑器适配验收

### Editor 组件验收 (任务 3.1)
- [ ] Schema 模板的 fields 正确读取
- [ ] FieldRenderer 正常工作
- [ ] 虚拟滚动列表正确响应 Schema 变化

### registry.ts 更新验收 (任务 3.3)
- [ ] `component: React.FC | schema: TemplateSchema` 混合模式支持
- [ ] `getTemplateSchema(id)` 正确返回 Schema 或 null
- [ ] 模板选择器显示所有模板（包括 Schema 模板）

---

## 阶段四：更多模板迁移验收

### 每批次迁移验收清单
- [ ] Schema JSON/TS 文件创建
- [ ] 渲染对比测试通过（视觉一致）
- [ ] 字段编辑功能正常
- [ ] 布局变体（layoutVariant）支持正常
- [ ] 特殊样式（styleOverrides）应用正常

### 性能验收
- [ ] Schema 渲染性能无明显下降（< 16ms per frame）
- [ ] 无不必要的重渲染
- [ ] Lazy loading 正常工作

---

## 阶段五：增强功能验收

### 布局引擎增强验收 (任务 5.1)
- [ ] 更复杂的条件表达式正常工作
- [ ] `page.visibility.xxx` 内置可见性处理正确
- [ ] 背景图案预定义映射表正确工作

---

## 回归测试清单

### 现有功能不受影响
- [ ] 22 个现有 React 模板仍然正常工作
- [ ] IndexedDB 存储/读取正常
- [ ] 文件系统操作（Electron）正常
- [ ] 打印设置正常
- [ ] 历史记录（Undo/Redo）正常

### 数据兼容性
- [ ] 旧项目文件（纯 React 模板）能正常打开
- [ ] 项目保存格式兼容
- [ ] 资源引用（图片等）正常

---

## 最终验收

### 功能完整性
- [ ] 超过 50% 的模板完成 JSON Schema 迁移
- [ ] 所有原子组件可在 Schema 中使用
- [ ] 编辑器完整支持 Schema 模板
- [ ] Hybrid 模式（React + Schema）正常工作

### 代码质量
- [ ] TypeScript 类型覆盖完整
- [ ] 无 any 类型滥用（除明确需要的外部数据）
- [ ] 组件正确使用 memo
- [ ] 无内存泄漏
- [ ] Zod Validation 完整

### 文档完整性
- [ ] Schema 编写规范文档
- [ ] 迁移指南文档
- [ ] API 文档（新增的函数和组件）

---

## 关键验收点

1. **像素级视觉一致性**：Schema 渲染的每个模板必须与原 React 组件 100% 一致
2. **零破坏性**：现有项目必须能正常打开和编辑
3. **性能达标**：Schema 渲染不导致 UI 卡顿
4. **渐进式迁移**：可以逐步迁移，不影响现有功能
