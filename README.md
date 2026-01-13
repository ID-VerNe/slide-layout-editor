# SlideGrid Studio 🎨
### 专业级多比例视觉排版与桌面幻灯片编辑器

SlideGrid Studio 是一款为摄影师、独立出版人及设计师量身定制的专业排版套件。它成功将现代 Web 技术的灵活性与传统纸媒的严谨视觉美学融合，现已全面进化为支持原生文件系统操作的 **Electron 桌面应用**。

---

## 🌟 核心特性

### 1. 桌面级原生体验 (Desktop Experience)
*   **本地文件系统集成**：直接读写 `.slgrid` 工程文件，支持真正的"保存到磁盘"与"本地打开"，彻底摆脱浏览器存储限制。
*   **物理性能加固**：全面开启 **GPU 硬件加速**，确保数百层 Framer Motion 动画与高分位移滤镜在 4K 屏幕下依然丝滑。
*   **安全渲染旁路**：原生环境绕过 Web 端的 CORS 跨域限制，支持直接加载并采样本地及外部高清素材。

### 2. Schema 驱动的配置化编辑器 (Schema-Driven Engine)
*   **协议化 UI 生成**：编辑器控件完全由 JSON Schema 驱动。新增模板仅需修改元数据，无需编写重复代码。
*   **原子化分发**：内置 `FieldRenderer` 动态分发引擎，支持从基础文本到复杂 Bento 网格、艺术签名等 24+ 种专业控件。

### 3. 全局设计系统与 Token 引擎 (Design Tokens)
*   **语义化调色盘**：定义了 Primary (主色)、Secondary (辅色)、Accent (强调色) 等语义化 Token，支持"一键换肤"。
*   **全局同步 (Global Sync)**：在 Brand 管理中心修改 Token，全篇所有页面及原子组件将瞬间完成视觉对齐。
*   **字体配对系统**：预设以 **Playfair Display** 与 **Inter** 为核心的经典字体排版，支持本地 `.woff2` 字体资产池化管理。

### 4. 稳健的状态管理与撤销系统 (Undo/Redo)
*   **Store 大一统**：基于 Zustand 构建了全局单向数据流，实现数据、索引、加载状态的原子化同步。
*   **手动快照技术**：内置 50 步深度历史记录栈，支持 Ctrl+Z/Y 精准回溯，杜绝了大工程下的内存溢出风险。

### 5. 资源管理池化 (Asset Pipeline)
*   **二进制解耦**：庞大的图片数据已从 `PageData` 剥离，存入 IndexedDB 独立资产池。
*   **asset:// 协议**：采用虚拟协议 ID 引用图片，显著提升工程加载速度与 UI 响应灵敏度。

### 6. 顶层元数据图层 (Metadata Overlay)
*   **解耦渲染**：页码、页脚及背景纹理已重构为独立的 Overlay 悬浮层，不受底层模板布局干扰。
*   **Minimal UI 模式**：一键开启"极简模式"，物理移除所有 UI 边框与阴影，还原最纯净的印刷观感。

### 7. 多比例支持与自由布局
*   **四种标准比例**：16:9 (横屏)、2:3 (竖屏)、A4 (文档)、1:1 (方形)，满足不同场景需求。
*   **自由画布模式**：提供完全自由的拖拽布局，支持文本、图片、形状、图标的自由组合。
*   **智能对齐与网格**：内置对齐辅助线和网格系统，确保元素精确定位。

### 8. 专业简历系统
*   **动态简历模板**：基于块的简历结构，支持教育经历、工作经历、技能等模块的动态管理。
*   **智能排版**：自动处理简历内容的布局与间距，确保专业呈现。

---

## 🛠️ 技术栈

### 核心框架
*   **运行时**: Electron 39 (Node.js 驱动)
*   **前端框架**: React 19 + TypeScript 5.8
*   **构建工具**: Vite 6 + `vite-plugin-electron`
*   **状态管理**: Zustand (原子化同步加载逻辑)
*   **样式方案**: Tailwind CSS 3.4
*   **动画引擎**: Framer Motion 12

### 图像与导出
*   **图像处理**: Sharp (Electron 主进程，高性能图像处理)
*   **导出引擎**: html-to-image (2x 采样) + jsPDF (多比例混排自动旋转)
*   **响应式图像**: 自定义响应式图像处理流水线

### 开发工具
*   **测试框架**: Vitest 4 + @testing-library/react
*   **类型系统**: TypeScript (ES2022)
*   **代码分割**: Rollup (手动分包优化)
*   **包管理**: pnpm (workspace 支持)

### UI 组件库
*   **图标系统**: Lucide React
*   **数学公式**: KaTeX (支持 LaTeX 公式渲染)
*   **安全清理**: DOMPurify (XSS 防护)
*   **样式工具**: clsx + tailwind-merge

### 数据持久化
*   **IndexedDB**: 本地项目与资源存储 (DB Version 3)
*   **文件系统**: Electron fs/promises (原生文件读写)
*   **压缩归档**: adm-zip (.slgrid 工程文件打包)

---

## 🚀 开发与运行

### 环境要求
*   Node.js 22+
*   pnpm 9+

### 快速开始

1.  **安装依赖**：
    ```bash
    pnpm install
    ```

2.  **启动桌面端开发模式**：
    ```bash
    pnpm dev
    ```
    *系统将自动编译 Electron 主进程并开启桌面窗口。*

3.  **运行测试**：
    ```bash
    pnpm test
    ```

4.  **构建生产环境包**：
    ```bash
    pnpm build
    ```

### 开发命令说明

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 + Electron |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行 Vitest 测试套件 |

---

## 📐 项目结构

```
slide-layout-editor/
├── electron/                    # Electron 主进程代码
│   ├── main.ts                 # 主进程入口，窗口管理
│   ├── preload.ts              # 预加载脚本，IPC 桥接
│   ├── archive-manager.ts      # .slgrid 工程文件管理
│   └── image-processor.ts      # 图像处理流水线
├── src/
│   ├── components/
│   │   ├── editor/             # 编辑器核心组件
│   │   │   ├── fields/         # 24+ 种字段组件
│   │   │   ├── FieldRenderer.tsx  # 字段动态分发器
│   │   │   ├── Sidebar.tsx     # 侧边栏
│   │   │   └── PreviewArea.tsx  # 预览区域
│   │   ├── freeform/           # 自由布局模块
│   │   │   ├── FreeformCanvas.tsx
│   │   │   ├── AlignmentGuides.tsx
│   │   │   └── GridOverlay.tsx
│   │   ├── templates/          # 24+ 种模板组件
│   │   │   ├── AcademicHybridResume.tsx
│   │   │   ├── Freeform.tsx
│   │   │   ├── CinematicFullBleed.tsx
│   │   │   └── ...
│   │   └── ui/                 # 原子 UI 组件
│   │       └── slide/          # 幻灯片专用组件
│   │           ├── SlideHeadline.tsx
│   │           ├── SlideImage.tsx
│   │           └── MetadataOverlay.tsx
│   ├── store/
│   │   ├── useStore.ts         # Zustand 全局状态管理
│   │   └── freeformStore.ts    # 自由布局专用状态
│   ├── templates/
│   │   └── registry.ts         # 模板注册表与 Schema 定义
│   ├── utils/
│   │   ├── db.ts               # IndexedDB 操作封装
│   │   ├── imageUtils.ts       # 图像工具函数
│   │   └── native-fs.ts        # Electron 文件系统桥接
│   ├── types.ts                # 核心类型定义
│   ├── constants/              # 常量配置
│   │   ├── theme.ts            # 主题 Token 定义
│   │   ├── layout.ts           # 布局常量
│   │   └── fields.ts           # 字段类型常量
│   └── App.tsx                 # 应用入口
├── public/
│   ├── fonts/                  # 本地字体资源
│   │   ├── playfair-display/
│   │   ├── inter/
│   │   ├── noto-serif-sc/
│   │   └── material-symbols/
│   └── logo.svg
└── 优化/                       # 性能优化文档
    ├── performance-optimization/
    ├── freeform-feasibility/
    └── ...
```

---

## 📄 开发者指南 (Developer Guide)

如果你想为 SlideGrid Studio 贡献代码或添加新的排版模板，请务必遵循以下指南：

*   **[模板开发标准作业程序 (SOP)](STANDARD_OPERATING_PROCEDURE.md)**：这是创建新模板的**必读文档**。它详细介绍了如何利用 **Schema-Driven Engine** 快速构建、注册并集成新模板，以及原子组件的使用规范。

### 架构规范

#### 配置优先原则
*   新增字段时应修改 `src/types.ts` 和注册表 `src/templates/registry.ts`
*   避免在模板组件中硬编码 UI 逻辑
*   利用 `FieldRenderer` 实现编辑器控件的自动生成

#### 状态隔离原则
*   禁止在模板内使用本地 `useState` 管理持久化数据
*   所有持久化状态必须通过 Zustand Store (`useStore`) 更新
*   使用 `updatePage` 方法更新页面数据，自动触发历史记录

#### 视觉一致性原则
*   强制使用 `theme.colors` 中的 Token，严禁在模板中硬编码 Hex 色值
*   使用原子组件 (`SlideHeadline`, `SlideImage` 等) 确保自动同步 Design Tokens
*   字体使用 `theme.typography.headingFont` 和 `theme.typography.bodyFont`

#### 性能优化原则
*   使用 `@tanstack/react-virtual` 实现虚拟滚动，支持大型项目
*   图像资源通过 `asset://` 协议引用，避免 Base64 内联
*   使用 `useAssetUrl` Hook 实现图像懒加载与预加载

### 模板开发流程

1. **创建渲染组件**：在 `src/components/templates/` 创建新的 `.tsx` 文件
2. **定义字段协议**：在 `src/templates/registry.ts` 中添加模板配置
3. **使用原子组件**：确保所有视觉元素使用 `src/components/ui/slide/` 下的组件
4. **注册模板**：将模板添加到 `TEMPLATES` 数组，指定支持的宽高比
5. **测试验证**：运行 `pnpm dev`，在编辑器中验证 Schema 生成的编辑表单

### 测试规范

*   使用 Vitest + @testing-library/react 编写单元测试
*   测试文件放在 `__tests__/` 目录下，与源文件同级
*   运行 `pnpm test` 执行所有测试
*   关键组件必须包含测试用例（如 `AutoFitHeadline`, `SlideImage` 等）

---

## 🎨 模板库

SlideGrid Studio 内置 **24+ 种专业模板**，涵盖多个使用场景：

### 封面系列 (Cover)
*   **Cinematic Bleed** - 全屏电影感封面
*   **Editorial Classic** - Kinfolk 风格杂志封面
*   **Editorial Back** - 杂志封底

### 产品展示 (Product)
*   **Bento Showcase** - Apple 风格模块化网格
*   **Modern Feature** - 粗体文字与大视觉
*   **Component Mosaic** - 图标网格展示

### 营销推广 (Marketing)
*   **Platform Hero** - 居中英雄与功能网格
*   **Testimonial Card** - 个人资料与引用
*   **Community Hub** - 行动号召与用户评价

### 画廊展示 (Gallery)
*   **Gravity Anchor** - 专业介绍页，底部大图
*   **Editorial Feature** - 垂直排版与图像
*   **Art Montage** - 交错双图拼贴
*   **Film Diptych** - 并排双图序列
*   **Micro Anchor** - 极致负空间
*   **Future Focus** - 金色点缀与背景数字
*   **Back Cover Movie** - 电影演职员表风格
*   **Capsule Mosaic** - 垂直胶囊画廊
*   **Editorial Split** - 极简分割布局

### 通用模板 (General)
*   **Editorial Essay** - 文字密集型叙事布局
*   **Typography Hero** - 排版聚焦分隔页
*   **Big Statement** - 居中极简口号
*   **Step Timeline** - 垂直流程图
*   **Table of Contents** - 卡片式概览

### 专业工具 (Professional Tools)
*   **Dynamic Resume Pro** - 基于块的技术简历，支持智能列表
*   **Freeform Canvas** - 完全创意自由的拖拽画布

---

## 🔧 配置说明

### Design Tokens 配置

全局主题配置位于 `src/constants/theme.ts`，支持以下 Token：

```typescript
{
  colors: {
    primary: '#0F172A',      // 主色调
    secondary: '#64748B',    // 辅助色
    accent: '#264376',       // 强调色
    background: '#ffffff',   // 背景色
    surface: '#F1F3F5'       // 表面色
  },
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Playfair Display', serif"
  }
}
```

### 字体资源

项目内置多种专业字体，位于 `public/fonts/`：

*   **Playfair Display** - 经典衬线字体，适合标题
*   **Inter** - 现代无衬线字体，适合正文
*   **Noto Serif SC** - 中文字体，支持中文排版
*   **Material Symbols** - Material Design 图标字体
*   **Crimson Pro** - 优雅的衬线字体
*   **Lora** - 文学风格衬线字体

### 支持的宽高比

| 比例 | 用途 | 尺寸 (mm) |
|------|------|-----------|
| 16:9 | 横屏演示 | 100 x 145 |
| 2:3 | 竖屏画廊 | 100 x 150 |
| A4 | 文档打印 | 210 x 297 |
| 1:1 | 方形展示 | 100 x 100 |

---

## 📊 性能优化

项目已实施多项性能优化措施：

### 构建优化
*   **代码分割**：手动分包 React、Motion、Utils、KaTeX 等依赖
*   **Tree Shaking**：Vite 自动移除未使用的代码
*   **Bundle 分析**：使用 `rollup-plugin-visualizer` 可视化包大小

### 运行时优化
*   **虚拟滚动**：`@tanstack/react-virtual` 支持大型项目
*   **图像懒加载**：`useImagePreload` Hook 实现智能预加载
*   **LRU 缓存**：图像资源使用 LRU 策略缓存
*   **GPU 加速**：Electron 启用 GPU 光栅化与零拷贝

### 内存优化
*   **资源池化**：图像数据与页面数据分离
*   **历史记录限制**：50 步深度历史栈，防止内存溢出
*   **缩略图缓存**：定期清理，最大 100 条缓存

详细的优化文档请参考 `优化/performance-optimization/` 目录。

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

*   遵循 ESLint 和 Prettier 配置
*   使用 TypeScript 严格模式
*   编写单元测试覆盖关键功能
*   提交前运行 `pnpm test` 确保测试通过
*   遵循 [模板开发 SOP](STANDARD_OPERATING_PROCEDURE.md) 添加新模板

---

## 📝 更新日志

### v0.0.0 (当前版本)
*   ✨ 初始版本发布
*   🎨 24+ 种专业模板
*   🖥️ Electron 桌面应用支持
*   📐 多比例布局支持
*   🎯 Schema 驱动的编辑器
*   🎨 Design Tokens 系统
*   ↩️ 撤销/重做功能
*   🖼️ 资源管理与优化
*   📄 动态简历系统
*   🎨 自由画布模式

---

## 📄 开源协议

本项目基于 **MIT License** 协议开源。详情请参阅 [LICENSE](LICENSE) 文件。

© 2026 **SlideGrid Studio**. 由 **ID-VerNe** 驱动。
