# SlideGrid Studio 文档中心

欢迎查阅 SlideGrid Studio 的技术文档。本文档已按功能领域进行重构，以便于快速定位所需信息。

---

## 📂 目录结构

### 1. 核心架构 (Architecture)
理解系统的设计哲学与底层实现。
- [系统架构总览](architecture/overview.md)
- [数据模型与类型系统](architecture/data-model.md)
- [状态管理策略](architecture/state.md)
- [模板引擎与渲染机制](architecture/template-engine.md)
- [原生集成 (Electron)](architecture/native.md)

### 2. 参考手册 (Reference)
详细的 API、组件与工具函数说明。

- [核心 Hooks 参考](reference/hooks.md)
- [模板库参考 (Catalog)](reference/templates.md)
- [全局常量与配置](reference/constants.md)

#### 🎨 UI 组件
- [核心原子组件 (Atoms)](reference/ui/atoms.md)
- [布局与块组件 (Blocks)](reference/ui/blocks.md)
- [复合与功能组件 (Molecules)](reference/ui/molecules.md)

#### 🛠️ 工具函数 (Utilities)
- [原生桥接 (Native FS)](reference/utils/native-fs.md)
- [图像处理与资源管理](reference/utils/image.md)
- [基础逻辑与通用工具](reference/utils/common.md)

#### ⚙️ 编辑器参考
- [编辑器架构](reference/editor/overview.md)
- [编辑器字段控件参考](reference/editor/fields.md)

### 3. 指南与基础 (Guides)
- [贡献者指南](guides/contributor.md)
- [术语表](guides/glossary.md)

### 4. 设计与计划 (Design)
- [设计规范与重构计划](design/)

### 5. 归档记录 (Archive)
- [历史 Session 记录](archive/)

---

## 🚀 快速开始

如果您是第一次接触本项目，建议按以下顺序阅读：
1. 阅读 [架构总览](architecture/overview.md) 了解整体设计。
2. 查阅 [数据模型](architecture/data-model.md) 理解核心 Schema。
3. 参考 [UI 原子组件](reference/ui/atoms.md) 开始开发新组件。
