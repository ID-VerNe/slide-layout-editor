# SlideGrid Studio

一个基于 **Electron** 的桌面端幻灯片 / Zine 排版编辑器。通过 **Schema 驱动的模板引擎** 和 **24x24 模块化网格系统**，将工业级精确排版与诗性设计融为一体。

## 能做什么

- **Zine / 画册排版**：制作高精度摄影画册、独立出版物，支持 2:3 竖版和 1:1 方形画幅
- **幻灯片制作**：创建 16:9 演示文稿、产品展示页
- **简历设计**：生成 A4 专业简历，支持多区块动态排版
- **营销物料**：制作产品 Hero 页、客户评价卡、社区推广页

## 核心特性

### Schema 驱动架构（声明式排版）

所有模板以 **JSON Schema** 定义，而非硬编码 React 组件。一个 Schema 同时驱动：
- **视觉渲染**：`LayoutRenderer` 将 Schema 节点树递归渲染为 React 组件
- **编辑器 UI**：右侧编辑面板根据 Schema 自动生成对应的表单控件

**这意味着：新增一个模板 = 写一份 JSON Schema，无需手动编写编辑器 UI。**

### 24x24 模块化网格 + 8px 基线对齐

- 每个页面被划分为 **24×24 的坐标网格**，所有元素通过 `colStart / colSpan / rowStart / rowSpan` 精确定位
- 所有排版和间距强制对齐 **8px 基线**，确保跨页面垂直韵律一致
- 支持 `Alt+;` 召唤调试网格辅助线

### 原子组件体系 (Zine Atoms)

10 个原子级排版组件，替代传统 HTML 标签：

| 组件 | 职责 | 约束 |
|:---|:---|:---|
| `ZineDisplay` | 主标题 | Display Token（超大字号、极紧/极宽字距） |
| `ZineBody` | 正文 | Body Token（大行高、次级颜色、衬线体） |
| `ZineCaption` | 元数据标注 | Caption Token（全大写、超宽字距、极小字号） |
| `ZineMedia` | 媒体资产 | 硬边缘适配、`asset://` 协议 |
| `ZineMetric` | 数据指标 | KaTeX 公式与单位格式化 |
| `ZineLogo` | Logo 渲染 | 自动尺寸约束 |
| `ZineIcon` | Lucide 图标 | 标准化图标渲染 |
| `ZineDivider` | 刻度分隔线 | 精密网格对齐 |
| `ZineResume` | 简历区块 | 多区块动态排版 |
| `ZineArtFont` | 艺术字体 | 超大字重、特殊排版效果 |

所有原子组件强制消费 **Design Tokens**，禁止硬编码颜色/字号/间距。

### 动态数据组件（Repeater 模式）

支持用户在编辑器中手动创建数据项，引擎自动排版：

- **Metrics**：KPI 指标网格（值 + 标签 + 图标）
- **Features**：功能特性列表（标题 + 描述 + 图标）
- **Testimonials**：客户评价卡片（头像 + 引用 + 署名）
- **Agenda**：议程/目录条目
- **Gallery**：多图画廊（Film Diptych、Capsule Mosaic 等）
- **Bento Grid**：Apple 风格模块化信息展示
- **Resume Sections**：简历经历区块

### 三级持久化策略

| 层级 | 存储 | 时机 | 用途 |
|:---|:---|:---|:---|
| L1 内存 | Zustand Store | 实时 | 毫秒级 UI 响应 |
| L2 浏览器 | IndexedDB | 每 3 秒自动检查 | 崩溃恢复 |
| L3 物理磁盘 | `.slgrid` ZIP 归档 | `Ctrl+S` 手动保存 | 工程便携 |

`.slgrid` 文件是结构化 ZIP 包，包含 `project.json` + 资产文件夹 + 缩略图缓存。资产通过 MD5 哈希去重，同一张图在多页使用只存一份。

### 自定义资产协议 (`asset://`)

绕过 Chromium 的 `file://` 限制：
- 主进程通过 `protocol.handle` 拦截 `asset://` 请求
- 直接从磁盘流式读取 Buffer，无需 Base64 编码（省 33% 内存）
- Sharp 库自动将上传图片转为 WebP 格式并压缩

### 50 步 Undo/Redo

基于 `structuredClone()` 深度快照的撤销系统：
- 仅在 `onBlur` 等完整交互节点记录历史，避免键盘输入的每个字符都产生快照
- 保留 50 步历史，超出自动裁剪
- 恢复时同时还原 `currentPageIndex`，确保回到正确的编辑位置

## 技术栈

| 层 | 技术 |
|:---|:---|
| 桌面框架 | Electron 39 |
| UI 框架 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS 3.4 + PostCSS |
| 状态管理 | Zustand 4 + Zundo（Undo/Redo） |
| 动画 | Framer Motion 12 |
| 路由 | React Router 7 |
| 布局 | `@tanstack/react-virtual`（虚拟滚动） |
| 图像处理 | Sharp 0.34（主进程） |
| 数据校验 | Zod 4 |
| 公式渲染 | KaTeX |
| 导出 | jsPDF + html-to-image |
| 构建 | Vite 6 + vite-plugin-electron |
| 测试 | Vitest 4 + Testing Library |
| 包管理 | pnpm |

## 项目结构

```
src/
├── components/
│   ├── editor/          # 编辑器 UI（面板、侧栏、导航栏、字段控件）
│   │   ├── fields/      # 30+ 字段控件（Title、Image、Metrics、Gallery…）
│   │   └── zine/        # Zine 风格面板
│   └── ui/
│       └── slide/
│           ├── atoms/   # 10 个 Zine 原子组件
│           └── hooks/   # useModularStyle、useDataConnector
├── store/
│   └── useStore.ts      # Zustand 全局状态（页面/主题/历史/持久化）
├── templates/
│   ├── registry.ts      # 模板注册表（31 个模板的配置）
│   └── schemas/
│       ├── LayoutRenderer.tsx    # 递归 Schema 渲染引擎
│       ├── expressionEvaluator.ts # 表达式求值器
│       ├── componentRegistry.ts  # 组件名 → React 组件映射
│       ├── validator.ts          # Schema 结构校验
│       └── types.ts              # TemplateNode 类型定义
├── constants/           # 颜色 Token、布局配置、图标库
├── utils/
│   ├── migrations/      # v2 → v3 数据迁移
│   ├── native-fs.ts     # 原生文件系统桥接（IPC）
│   ├── db.ts            # IndexedDB 封装
│   └── imageUtils.ts    # 图像处理工具
└── pages/
    ├── Dashboard.tsx    # 项目列表页
    └── EditorPage.tsx   # 编辑器主页
electron/
├── main.ts              # Electron 主进程
├── preload.ts           # 预加载脚本（ContextBridge）
├── image-processor.ts   # Sharp 图像处理管线
└── archive-manager.ts   # .slgrid 归档读写
```

## 31 个模板一览

| 分类 | 模板 | 描述 |
|:---|:---|:---|
| **Cover (封面)** | Cinematic Bleed | 全屏出血电影感封面 |
| | Editorial Classic | Kinfolk 风格杂志封面 |
| | Editorial Back | 极简杂志封底 |
| **Gallery (画册)** | Zine Classic | 24×24 模块化网格标杆模板 |
| | Gravity Anchor | 底部重图像专业简介页 |
| | Sincerity Portrait | 大图人像 + 叠加排版 |
| | Editorial Feature | 竖版图文排版 |
| | Art Montage | 双图错位拼贴 |
| | Film Diptych | 双图并置 |
| | Micro Anchor | 小图居中 + 元数据锚点 |
| | Artistic L-Space | L 形负空间 + 出血图像 |
| | Floating Gallery | 居中浮图 + 宽留白 |
| | Cinematic Letterbox | 宽银幕电影感 |
| | Vertical Column | 左出血图 + 右侧白边栏 |
| | Horizon Sky | 顶部"天空"留白 + 底部"大地"图 |
| | Epilogue Pillar | 居中"柱状"文本结论页 |
| | Future Focus | 金色强调 + 背景数字 |
| | Back Cover Movie | 电影片尾字幕风格封底 |
| | Capsule Mosaic | 竖版胶囊画廊 |
| | Editorial Split | 图文平衡分栏 |
| **Product (产品)** | Bento Showcase | Apple 风格模块化网格 |
| | Modern Feature | 粗体文本 + 大视觉 |
| | Component Mosaic | 图标网格 + 编辑栏 |
| **Marketing (营销)** | Platform Hero | 集中式产品发布 + 特性网格 |
| | Testimonial Card | 专业档案 + 引用 + 认证指标 |
| | Community Hub | CTA + 评价 + 合作伙伴网格 |
| **General (通用)** | Big Statement | 居中极简口号 |
| | Editorial Essay | 首字下沉编辑叙事 |
| | Typography Hero | 超大字体排版聚焦 |
| | Step Timeline | 顺序流程时间轴 |
| | Table of Contents | 卡片式导航目录 |
| **Resume (简历)** | Dynamic Resume Pro | 模块化技术简历 |

## 支持的画幅比例

| 比例 | 尺寸 | 用途 |
|:---|:---|:---|
| 16:9 | 1920×1080 | 演示文稿、产品展示 |
| 2:3 | 1080×1620 | 画册、出版物（竖版） |
| A4 | 1240×1754 | 简历 |
| 1:1 | 1080×1080 | 社交媒体、方形出版物 |

## 快速开始

### 环境要求

- **Node.js** ≥ 22
- **pnpm**（必须使用 pnpm 作为包管理器）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发模式（Electron + Vite 热更新）
pnpm dev

# 运行测试
pnpm test

# 构建生产版本
pnpm build
```

## 开发新模板

参见 [标准作业程序 (SOP)](STANDARD_OPERATING_PROCEDURE.md)，核心流程：

1. 在 `src/templates/schemas/` 下创建 JSON Schema 文件（定义 24×24 网格布局）
2. 在 `src/templates/registry.ts` 中注册模板配置（名称、分类、字段、支持的画幅）
3. 启动开发服务器，在编辑器中验证 Schema 是否自动生成正确的编辑表单

**不需要写任何编辑器 UI 代码** — 右侧编辑面板会根据你定义的 `fields` 自动生成。

## 文档索引

| 文档 | 内容 |
|:---|:---|
| [STANDARD_OPERATING_PROCEDURE.md](STANDARD_OPERATING_PROCEDURE.md) | 模板开发 SOP（必读） |
| [docs/architecture/overview.md](docs/architecture/overview.md) | 架构总览（进程模型、IPC、持久化） |
| [docs/architecture/data-model.md](docs/architecture/data-model.md) | 数据模型与类型系统完整参考 |
| [docs/architecture/state.md](docs/architecture/state.md) | Zustand 状态管理、Undo/Redo、同步算法 |
| [docs/architecture/template-engine.md](docs/architecture/template-engine.md) | 模板引擎渲染机制 |
| [docs/architecture/native.md](docs/architecture/native.md) | Electron 原生集成（资产协议、归档、图像管线） |
| [docs/guides/typography.md](docs/guides/typography.md) | 语义化排版指南 |
| [docs/guides/dynamic-components.md](docs/guides/dynamic-components.md) | 动态组件（Repeater）开发 |
| [docs/design/SPEC.md](docs/design/SPEC.md) | Zine 设计规范（24×24 网格、8px 基线、Token 系统） |

## License

GNU GPL v3 — 保持开放，保持自由。