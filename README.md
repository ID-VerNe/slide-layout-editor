# SlideGrid Studio 🎨
### 专业级多比例视觉排版与桌面幻灯片编辑器

SlideGrid Studio 是一款为摄影师、独立出版人及设计师量身定制的专业排版套件。它成功将现代 Web 技术的灵活性与传统纸媒的严谨视觉美学融合，现已全面进化为支持原生文件系统操作的 **Electron 桌面应用**。

---

## 🌟 核心特性

### 1. 桌面级原生体验 (Desktop Experience)
*   **本地文件系统集成**：直接读写 `.slgrid` 工程文件，支持真正的“保存到磁盘”与“本地打开”，彻底摆脱浏览器存储限制。
*   **物理性能加固**：全面开启 **GPU 硬件加速**，确保数百层 Framer Motion 动画与高分位移滤镜在 4K 屏幕下依然丝滑。
*   **安全渲染旁路**：原生环境绕过 Web 端的 CORS 跨域限制，支持直接加载并采样本地及外部高清素材。

### 2. Schema 驱动的配置化编辑器 (Schema-Driven Engine)
*   **协议化 UI 生成**：采用 **Phase 4** 架构，编辑器控件完全由 JSON Schema 驱动。新增模板仅需修改元数据，无需编写重复代码。
*   **原子化分发**：内置 `FieldRenderer` 动态分发引擎，支持从基础文本到复杂 Bento 网格、艺术签名等 20+ 种专业控件。

### 3. 全局设计系统与 Token 引擎 (Design Tokens)
*   **语义化调色盘**：定义了 Primary (主色)、Secondary (辅色)、Accent (强调色) 等语义化 Token，支持“一键换肤”。
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
*   **Minimal UI 模式**：一键开启“极简模式”，物理移除所有 UI 边框与阴影，还原最纯净的印刷观感。

---

## 🛠️ 技术栈

*   **运行时**: Electron 39 (Node.js 驱动)
*   **核心框架**: React 19 + TypeScript + Vite 6
*   **状态管理**: Zustand (原子化同步加载逻辑)
*   **构建插件**: `vite-plugin-electron` (主进程与渲染进程同步构建)
*   **样式/动画**: Tailwind CSS + Framer Motion
*   **导出引擎**: html-to-image (2x 采样) + jsPDF (多比例混排自动旋转)

---

## 🚀 开发与运行

1.  **安装依赖**：
    ```bash
    pnpm install
    ```
2.  **启动桌面端开发模式**：
    ```bash
    pnpm dev
    ```
    *系统将自动编译 Electron 主进程并开启桌面窗口。*

3.  **构建生产环境包**：
    ```bash
    pnpm build
    ```

---

## 📄 开源协议

本项目基于 **MIT License** 协议开源。详情请参阅 [LICENSE](LICENSE) 文件。

© 2026 **SlideGrid Studio**. 由 **ID-VerNe** 驱动。