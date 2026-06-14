# SlideGrid Studio 文档中心

欢迎查阅 SlideGrid Studio 的技术文档。文档已按功能领域拆分成更细粒度的专题，方便快速定位。

---

## 📂 目录结构

### 1. 核心架构 (Architecture)
理解系统的设计哲学与底层实现。

- [系统架构总览](architecture/overview.md)
- [数据模型与类型系统](architecture/data-model/index.md)
  - [PageData 与嵌套集合](architecture/data-model/page-data.md)
  - [主题与布局系统](architecture/data-model/theme-and-layout.md)
  - [模板 Schema 类型](architecture/data-model/template-schema.md)
  - [辅助类型与预设](architecture/data-model/presets-and-helpers.md)
- [状态管理策略](architecture/state.md)
- [模板引擎与渲染机制](architecture/template-engine/index.md)
  - [节点系统与 LayoutRenderer](architecture/template-engine/nodes-and-renderer.md)
  - [24×24 网格与样式流水线](architecture/template-engine/grid-and-style.md)
  - [表达式引擎与数据绑定](architecture/template-engine/expressions.md)
  - [组件注册表、校验器与虚拟预览](architecture/template-engine/registry-validation-preview.md)
  - [zIndex、条件渲染与 Repeater](architecture/template-engine/advanced-binding.md)
- [原生集成 (Electron)](architecture/native.md)

### 2. 参考手册 (Reference)
详细的 API、组件与工具函数说明。

- [核心 Hooks 参考](reference/hooks.md)
- [模板库参考](reference/templates/index.md)
  - [模板分类目录](reference/templates/catalog.md)
  - [模板字段配置](reference/templates/field-config.md)
  - [模板测试与验证](reference/templates/testing.md)
- [全局常量与配置](reference/constants/index.md)
  - [布局与 UI 常量](reference/constants/layout-ui.md)
  - [编辑器预设](reference/constants/editor-presets.md)
  - [Design Tokens 与主题默认值](reference/constants/design-tokens.md)
  - [图标与字段配置](reference/constants/icons-fields.md)
  - [模板注册表常量与示例](reference/constants/templates-and-examples.md)

#### 🎨 UI 组件
- [核心原子组件 (Atoms)](reference/ui/atoms/index.md)
  - [文本类原子组件](reference/ui/atoms/text.md)
  - [媒体与图形类原子组件](reference/ui/atoms/media-and-divider.md)
  - [数据、图标与 Logo 原子组件](reference/ui/atoms/data-icons-logo.md)
  - [专用与内部原子组件](reference/ui/atoms/dedicated-and-internal.md)
- [布局与块组件 (Blocks)](reference/ui/blocks.md)
- [复合与功能组件 (Molecules)](reference/ui/molecules.md) — **包含 PresetSelect 与 IconPicker 组件**

#### 🛠️ 工具函数 (Utilities)
- [原生桥接 (Native FS)](reference/utils/native-fs.md)
- [图像处理与资源管理](reference/utils/image.md)
- [基础逻辑与通用工具](reference/utils/common.md)

#### ⚙️ 编辑器参考
- [编辑器架构](reference/editor/overview.md)
  - [编辑器生命周期](reference/editor/lifecycle.md)
  - [导出与打印系统](reference/editor/export-system.md)
  - [布局浏览器](reference/editor/layout-browser.md)
  - [编辑器交互体验](reference/editor/editor-ux.md)
- [编辑器字段控件参考](reference/editor/fields/index.md)
  - [文本与媒体类字段](reference/editor/fields/text-and-media.md)
  - [列表与集合类字段](reference/editor/fields/collection-fields.md)
  - [结构化与辅助字段](reference/editor/fields/structured-and-utility.md)
  - [布局与选择类字段](reference/editor/fields/layout-select.md)

### 3. 指南与基础 (Guides)
- [贡献者指南](guides/contributor.md)
- [术语表](guides/glossary.md)
- [语义化排版开发指南](guides/typography.md)
- [动态数组组件开发规范](guides/dynamic-components.md)
- [设计规范 (Design Specification)](design.md) — 24×24 网格、8px 基线、Token 系统


---

## 🚀 快速开始

如果您是第一次接触本项目，建议按以下顺序阅读：
1. 阅读 [架构总览](architecture/overview.md) 了解整体设计。
2. 查阅 [数据模型](architecture/data-model/index.md) 理解核心 Schema。
3. 参考 [UI 原子组件](reference/ui/atoms/index.md) 开始开发新组件。
