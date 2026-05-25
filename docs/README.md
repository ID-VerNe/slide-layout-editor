# SlideGrid Studio 文档导航

欢迎来到 SlideGrid Studio 技术文档。下表列出了每份文档的编号、覆盖范围与适用读者。

## 文档目录

| # | 文档 | 覆盖范围 | 面向角色 |
| :--- | :--- | :--- | :--- |
| 01 | [平台架构与系统设计](01-architecture.md) | Electron 应用架构、IPC 通信、构建工具链、数据持久化策略 | 架构师、高级开发者 |
| 02 | [模板引擎与渲染机制](02-template-engine.md) | JSON Schema 驱动的模板系统、LayoutRenderer 树遍历、24x24 模块化网格 | 模板作者、前端开发 |
| 03 | [原生集成层](03-native-integration.md) | `asset://` 本地文件协议、项目打包 (.slgrid)、Sharp 图片管线 | 系统集成开发 |
| 04 | [状态管理](04-state-management.md) | Zustand Store 设计、Undo/Redo 快照、IndexedDB 自动持久化 | 功能开发 |
| 05 | [贡献指南 — 添加新模板](05-contributor-guide.md) | 模板注册、Schema 编写、测试验证、占位图生成 | 模板贡献者 |
| 06 | [UI 组件参考指南](06-ui-components.md) | 全部 UI 组件：Zine 原子组件、编辑器面板、基础 UI、模板渲染 | 前端开发 |
| 07 | [工具函数库参考](07-utilities.md) | native-fs、图像处理、LQIP、缓存、LRU Cache、Worker、日志 | 功能开发 |
| 08 | [术语表](08-glossary.md) | 项目核心概念 (Zine Mode、Design System、Modular Grid 等) | 全体 |
| 09 | [编辑器页面架构](09-editor-architecture.md) | EditorPage 架构、导出系统、布局浏览器、缩略图、打印设置 | 功能开发 |
| 10 | [数据模型与类型系统](10-data-model.md) | PageData、ProjectTheme、DesignSystem、所有嵌套类型 | 全体开发者 |
| 11 | [编辑器字段控件参考](11-editor-fields-reference.md) | 25+ Field 控件的 API、绑定、数据流 | 编辑器开发 |

## 文档结构总览

项目按功能域组织为三个核心组：

```text
┌── 平台基础层 (01, 03)
│
├── 核心引擎层 (02, 04, 10)
│
├── UI 层 (06, 09, 11)
│
├── 工具层 (07)
│
├── 扩展层 (05)
│
└── 参考层 (08)
```

## 各部分摘要

- **[01-架构](01-architecture.md)**: Electnron 主/渲染进程架构、IPC 通道、Vite 双构建配置、持久化双轨策略
- **[02-模板引擎](02-template-engine.md)**: TemplateNode 5 节点类型、LayoutRenderer 递归渲染、DesignSystem 绑定、Zine 约束
- **[03-原生集成](03-native-integration.md)**: HTTP 拦截 `asset://` 协议、.slgrid ZIP 打包、shnrp 处理管线
- **[04-状态管理](04-state-management.md)**: Zustand Store、Undo/Redo WithZustand、三级 persist (内存→IndexedDB→.slgrid)
- **[05-贡献指南](05-contributor-guide.md)**: 从 idea 到 merged 模板的完整流程，涵盖代码、测试和占位图
- **[06-UI 组件](06-ui-components.md)**: ZineDisplay/ZineBody/ZineMedia/ZineResume 等全部组件、COMPONENT_REGISTRY 映射
- **[07-工具函数](07-utilities.md)**: native-fs IPC 桥、IndexedDB 封装、LQIP、imagePreloader、LRU Cache、日志、Worker
- **[08-术语表](08-glossary.md)**: Zine Mode、24x24 Modular Grid、Design Tokens、Aspect Ratios
- **[09-编辑器架构](09-editor-architecture.md)**: EditorPage 生命周期、三步布局浏览器、PNG/PDF 导出、智能保存、缩略图、快捷键
- **[10-数据模型](10-data-model.md)**: ProjectData 顶层、PageData 59 字段、9 种嵌套集合、3 层 DesignSystem、5 节点 Schema
- **[11-编辑器字段](11-editor-fields-reference.md)**: 25 种 Field 控件、统一 FieldProps 接口、FieldRenderer 分发、完整映射表

---

项目版本: v3.0.0 | 框架: Electron + React + Tailwind CSS v3