feat: 增强编辑器功能与重构状态管理

核心变动：
1. **新增组件**：
   - 添加 GenericNumberField.tsx 通用数字字段组件，支持滑块控制
   - 添加 TemplatePreview.tsx 模板预览组件

2. **重构状态管理**：
   - Dashboard 页面从 UIContext 迁移到 useStore
   - 简化状态管理逻辑，提升性能

3. **增强导航与布局**：
   - 重构 TopNav 组件，添加 SaveAs 功能
   - 优化 Dashboard 页面布局与图标
   - 调整 EditorPage 组件结构

4. **改进资产与项目管理**：
   - 重构 useAssetUrl hook，优化资源加载逻辑
   - 简化 useProject hook
   - 改进 native-fs 工具函数

5. **模板与字段优化**：
   - 更新 GravityAnchorIntro 模板
   - 优化 FieldRenderer 组件
   - 在模板注册表中添加新模板

技术亮点：
- 统一状态管理，提升代码可维护性
- 新增通用组件，增强编辑器功能
- 优化资源加载，提升应用性能
- 改进用户界面，增强用户体验

修改文件：10 个（新增 2 个，修改 8 个）