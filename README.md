# SlideGrid Studio

一个基于 **Electron** 的桌面端幻灯片 / Zine 排版编辑器。通过 **Schema 驱动的模板引擎** 和 **24x24 模块化网格系统**，将工业级精确排版与诗性设计融为一体。

## 能做什么

- **Zine / 画册排版**：制作高精度摄影画册、独立出版物，支持 2:3 竖版、3:4 阅读版和 1:1 方形画幅
- **幻灯片制作**：创建 16:9 演示文稿、产品展示页
- **简历设计**：生成 A4 专业简历，支持多区块动态排版
- **营销物料**：制作产品 Hero 页、客户评价卡、社区推广页
- **双语阅读物料**：制作中英双语精读、引言对照与策展生词卡片

## 核心特性

### Schema 驱动架构（声明式排版）

所有模板以 **独立 JSON 规范**（`src/templates/definitions/`）定义，而非硬编码 React 组件。一个 Schema 同时驱动：
- **视觉渲染**：`LayoutRenderer` 调度专职子渲染器将 Schema 节点树递归渲染为 React 组件
- **编辑器 UI**：右侧编辑面板根据 Schema 自动生成对应的表单控件

**这意味着：新增一个模板 = 写一份 JSON Schema 文件，无需手动编写编辑器 UI。**

### 24x24 模块化网格 + 8px 基线对齐

- 每个页面被划分为 **24×24 的坐标网格**，所有元素通过 `colStart / colSpan / rowStart / rowSpan` 精确定位
- 所有排版和间距强制对齐 **8px 基线**，确保跨页面垂直韵律一致
- 支持 `Alt+;` 召唤调试网格辅助线

### 原子组件体系 (Zine Atoms)

11 个原子级排版组件，替代传统 HTML 标签：

| 组件 | 职责 | 约束 |
|:---|:---|:---|
| `ZineDisplay` | 主标题 | Display Token（超大字号、极紧/极宽字距、9点停靠） |
| `ZineBody` | 正文 | Body Token（大行高、次级颜色、衬线体） |
| `ZineCaption` | 元数据标注 | Caption Token（全大写、超宽字距、极小字号） |
| `ZineVocabList` | 双语生词表 | 策展词汇卡片、8px 基准、物理字号下限保护 |
| `ZineMedia` | 媒体资产 | 硬边缘适配、亚像素物理平移、`asset://` 协议 |
| `ZineMetric` | 数据指标 | KaTeX 公式与单位格式化 |
| `ZineLogo` | Logo 渲染 | 自动尺寸约束 |
| `ZineIcon` | Lucide 图标 | 标准化图标渲染、基线倍数阶梯 |
| `ZineDivider` | 刻度分隔线 | 精密网格对齐 |
| `ZineResume` | 简历区块 | 多区块动态排版 |
| `ZineArtFont` | 艺术字体 | 超大字重、离屏宽度测量 |

所有原子组件强制消费 **Design Tokens**，禁止硬编码颜色/字号/间距。

### 动态数据组件（Repeater 模式）

支持用户在编辑器中手动创建数据项，引擎自动排版：

- **Metrics**：KPI 指标网格（值 + 标签 + 图标）
- **Features**：功能特性列表（标题 + 描述 + 图标）
- **Testimonials**：客户评价卡片（头像 + 引用 + 署名）
- **Agenda**：议程/目录条目
- **VocabItems**：双语词汇卡片（词汇 + 音标 + 释义 + 例句）
- **Gallery**：多图画廊（Film Diptych、Capsule Mosaic 等）
- **Bento Grid**：Apple 风格模块化信息展示
- **Resume Sections**：简历经历区块

### 三级持久化策略

| 层级 | 存储 | 时机 | 用途 |
|:---|:---|:---|:---|
| L1 内存 | Zustand Store | 实时 | 毫秒级 UI 响应 |
| L2 浏览器 | IndexedDB + LocalStorage | 自动增量检查 | 崩溃恢复与配额分级保全 |
| L3 物理磁盘 | `.slgrid` ZIP 归档 | `Ctrl+S` 手动保存 | 工程便携与沙箱校验 |

`.slgrid` 文件是结构化 ZIP 包，包含 `project.json` + 资产文件夹 + 缩略图缓存。资产通过 MD5 哈希去重，同一张图在多页使用只存一份。主进程内置路径越界与 ADS（备用数据流）安全拦截。

### 自定义资产协议 (`asset://`)

绕过 Chromium 的 `file://` 限制：
- 主进程通过 `protocol.handle` 拦截 `asset://` 请求
- 直接从磁盘流式读取 Buffer，无需 Base64 编码（省 33% 内存）
- Sharp 库自动将上传图片转为 WebP 格式并压缩

### 50 步 Undo/Redo

基于深度快照隔离的撤销系统：
- 仅在 `onBlur` 等完整交互节点记录历史，支持 `silent` 瞬态更新防快照污染
- 保留 50 步历史，恢复时深拷贝隔离状态并还原 `currentPageIndex`

## 技术栈

| 层 | 技术 |
|:---|:---|
| 桌面框架 | Electron 39 |
| UI 框架 | React 19 + TypeScript 5.8 |
| 样式 | Tailwind CSS 3.4 + PostCSS |
| 状态管理 | Zustand 4 + Zundo（Undo/Redo） |
| 动画 | Framer Motion 12（支持导出离屏旁路） |
| 路由 | React Router 7 |
| 布局 | `@tanstack/react-virtual`（虚拟滚动） |
| 图像处理 | Sharp 0.34（主进程） |
| 数据校验 | Zod 4 |
| 公式渲染 | KaTeX |
| 导出 | jsPDF + html-to-image（离屏容器无感捕获） |
| 构建 | Vite 6 + vite-plugin-electron |
| 测试 | Vitest 4 + Playwright 1.62（单元 + E2E 联合体系） |
| 包管理 | pnpm |

## 项目结构

```
src/
├── components/
│   ├── editor/          # 编辑器 UI（面板、侧栏、导航栏、字段控件）
│   │   ├── fields/      # 30+ 字段控件（GenericTextField、Image、Metrics…）
│   │   └── zine/        # Zine 风格面板与样式配置器
│   └── ui/
│       ├── DirectionSwitcher.tsx # 方向与变体分段切换器
│       ├── FontSelect.tsx        # 字体选择与自定义字体渲染
│       └── slide/
│           ├── atoms/   # 11 个 Zine 原子组件（Text、Media、VocabList…）
│           └── hooks/   # useModularStyle、useDataConnector
├── services/
│   └── recentProjects.ts # 近期工程存储配额分级保全服务
├── store/
│   └── useStore.ts      # Zustand 全局状态（深快照隔离、持久化）
├── templates/
│   ├── definitions/     # 36 个独立 JSON 模板规范（按分类归档）
│   │   ├── Bilingual/   # 双语阅读模板规范 (4)
│   │   ├── Cover/       # 封面模板规范 (3)
│   │   ├── Gallery/     # 画册模板规范 (17)
│   │   ├── General/     # 通用模板规范 (5)
│   │   ├── Marketing/   # 营销模板规范 (3)
│   │   ├── Product/     # 产品模板规范 (3)
│   │   └── Resume/      # 简历模板规范 (1)
│   ├── registry.ts      # 模板动态注册中心（import.meta.glob 自动载入）
│   └── schemas/
│       ├── LayoutRenderer.tsx    # 渲染器协调入口与 ErrorBoundary
│       ├── renderer/             # 专职子渲染器与样式白名单
│       │   ├── basePropsResolver.ts
│       │   ├── containerRenderer.tsx
│       │   ├── componentRenderer.tsx
│       │   ├── repeaterRenderer.tsx
│       │   └── styleWhitelist.ts
│       ├── expressionEvaluator.ts # 表达式求值器（防原型链污染）
│       └── componentRegistry.ts  # 组件名 → React 组件映射
├── workers/
│   ├── fontCalculatorManager.ts # 全局 Worker 单例并发管理器
│   └── fontCalculator.ts        # O(1) 闭式字号计算 Worker 线程
├── constants/           # Design Tokens、布局画幅、图标库
├── utils/
│   ├── fontLoader.ts    # DOM 自定义字体加载与注册
│   ├── imageGeometry.ts # 图像亚像素平移与安全边界
│   ├── numberFormatters.ts # 罗马数字与 Alpha 编号
│   ├── thumbnailCapture.ts # 跨环境统一缩略图截取
│   ├── native-fs.ts     # 原生文件系统桥接与沙箱边界校验
│   └── db.ts            # IndexedDB 封装（带缩略图专用表）
└── pages/
    ├── Dashboard.tsx    # 项目列表与工程管理页
    └── EditorPage.tsx   # 编辑器主页（集成 OffscreenExportRenderer）
electron/
├── main.ts              # Electron 主进程（协议拦截与沙箱拦截）
├── preload.ts           # 预加载脚本（ContextBridge）
├── image-processor.ts   # Sharp 图像处理管线
└── archive-manager.ts   # .slgrid ZIP 归档管理与路径越界检查
e2e/                     # Playwright 端到端自动化测试套件
```

## 36 个模板一览

| 分类 | 模板 | 描述 |
|:---|:---|:---|
| **Cover (封面)** | Cinematic Bleed | 全屏出血电影感封面，支持置顶/置底变体 |
| | Editorial Classic | Kinfolk 风格杂志封面，居中大面积主图 |
| | Editorial Back | 极简杂志封底排版 |
| **Gallery (画册)** | Zine Classic | 24×24 模块化网格标杆模板，工业精密感 |
| | Gravity Anchor | 底部重图像专业简介页 |
| | Sincerity Portrait | 大图人像 + 叠加排版 |
| | Editorial Feature | 竖版图文摄影特写 |
| | Art Montage | 双图错位拼贴 |
| | Film Diptych | 双图并置（支持水平/垂直分割） |
| | Micro Anchor | 小图居中 + 元数据锚点 |
| | Artistic L-Space | L 形负空间 + 出血图像 |
| | Floating Gallery | 居中浮图 + 宽留白画框感 |
| | Cinematic Letterbox | 宽银幕电影感 + 极限横向排版 |
| | Vertical Column | 左出血图 + 右侧白边栏 |
| | Horizon Sky | 顶部"天空"留白 + 底部"大地"图 |
| | Epilogue Pillar | 居中"柱状"文本结论页 |
| | Future Focus | 金色强调 + 背景数字 |
| | Back Cover Movie | 电影片尾字幕风格封底 |
| | Capsule Mosaic | 竖版胶囊多图画廊 |
| | Editorial Split | 图文平衡分割布局 |
| **Product (产品)** | Bento Showcase | Apple 风格模块化矩阵网格 |
| | Modern Feature | 粗体文本 + 大视觉展示 |
| | Component Mosaic | 图标网格 + 编辑侧栏 |
| **Marketing (营销)** | Platform Hero | 集中式产品发布 + 特性网格 |
| | Testimonial Card | 专业档案 + 引用 + 认证指标 |
| | Community Hub | CTA + 评价 + 合作伙伴网格 |
| **General (通用)** | Big Statement | 居中极简高冲击力标语 |
| | Editorial Essay | 首字下沉编辑叙事排版 |
| | Typography Hero | 超大字体排版聚焦 |
| | Step Timeline | 顺序流程与里程碑时间轴 |
| | Table of Contents | 卡片式导航目录 |
| **Resume (简历)** | Dynamic Resume Pro | 模块化技术简历，支持多区块动态排版 |
| **Bilingual (双语阅读)** | Bilingual Cover | 中英双语封面与精要导读 |
| | Bilingual Reader | 对齐式中英双语精读与侧边栏 |
| | Bilingual Quote | 名人名言双语对照与排版 |
| | Bilingual Glossary | 策展生词精选与释义卡片 |

## 支持的画幅比例

| 比例 | 尺寸 | 核心用途 |
|:---|:---|:---|
| 16:9 | 1920×1080 | 演示文稿、产品展示（横版） |
| 2:3 | 1080×1620 | 画册、独立出版物（竖版） |
| 3:4 | 1080×1440 | 小红书 (Xiaohongshu)、双语精读出版物（竖版） |
| A4 | 1240×1754 | 专业简历与求职文档（专业文档） |
| 1:1 | 1080×1080 | 社交媒体、方形画册出版物 |

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

# 运行测试（Vitest 单元测试 + Playwright 端到端测试联合执行）
pnpm test

# 仅运行单元测试
pnpm test:unit:run

# 仅运行 E2E 端到端测试
pnpm test:e2e

# 构建生产版本
pnpm build
```

## 开发新模板

参见 [贡献者指南 (Contributor Guide)](docs/guides/contributor.md)，核心流程：

1. 在 `src/templates/definitions/<Category>/` 下创建 JSON 文件（定义 24×24 网格布局与字段映射）
2. 无需修改注册代码 — `src/templates/registry.ts` 通过 `import.meta.glob` 自动加载并注册新模板
3. 启动开发服务器，在编辑器中验证 Schema 是否自动生成正确的编辑表单

**无需编写任何编辑器 UI 代码** — 右侧编辑面板会根据你定义的 `fields` 自动生成。

## 文档索引

| 文档 | 内容 |
|:---|:---|
| [docs/README.md](docs/README.md) | 文档中心全目录导航 |
| [docs/guides/contributor.md](docs/guides/contributor.md) | 贡献者指南与模板开发规范 |
| [docs/architecture/overview.md](docs/architecture/overview.md) | 架构总览（进程模型、渲染管线、持久化） |
| [docs/architecture/data-model/index.md](docs/architecture/data-model/index.md) | 数据模型与类型系统完整参考 |
| [docs/architecture/state.md](docs/architecture/state.md) | Zustand 状态管理、Undo/Redo、同步算法 |
| [docs/architecture/template-engine/index.md](docs/architecture/template-engine/index.md) | 模板引擎与解耦渲染子管线机制 |
| [docs/architecture/native.md](docs/architecture/native.md) | Electron 原生集成（资产协议、归档、沙箱安全） |
| [docs/guides/typography.md](docs/guides/typography.md) | 语义化排版与 8px 基线字阶指南 |
| [docs/guides/dynamic-components.md](docs/guides/dynamic-components.md) | 动态组件（Repeater / VocabList）开发 |
| [docs/design.md](docs/design.md) | Zine 设计规范（24×24 网格、8px 基线、Token 系统） |

## License

GNU GPL v3 — 保持开放，保持自由。