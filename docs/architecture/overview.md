# 项目架构深度解析

SlideGrid Studio 并非一个传统的浏览器应用，而是一个深度融合原生能力的“混合态”桌面应用。本章将从进程模型、生命周期及通信链路三个维度深入探讨其架构实现。

## 1. 进程架构：双核心隔离与协作

应用采用标准的 Electron 多进程架构，但通过 IPC (Inter-Process Communication) 建立了紧密的数据反馈环。

### 1.1 主进程 (Main Process - Node.js 环境)
主进程是应用的“操盘手”，拥有完全的系统访问权限：
- **内核驱动**: 管理原生窗口 (BrowserWindow) 的创建与销毁。
- **资产守卫**: 通过 `protocol.handle('asset', ...)` 劫持文件请求。它是唯一能直接操作 `sharp` 图像库和物理磁盘的进程。
- **归档中枢**: `ProjectArchiveManager` 实现了内存数据向物理 ZIP 的流式转化。

### 1.2 渲染进程 (Renderer Process - Chromium 环境)
渲染进程是“表演者”，专注于高频率的 UI 渲染与数据流驱动：
- **解耦渲染管线**: 由 `LayoutRenderer` 作为调度中心，下设 `basePropsResolver`（网格与属性归一化）、`containerRenderer`（Flex/Grid/Modular 容器）、`componentRenderer`（原子组件桥接与 ErrorBoundary）、`repeaterRenderer`（数据驱动循环）以及 `styleWhitelist`（安全样式过滤）。
- **计算引擎**: 负责 24x24 网格的样式计算与表达式解析（防原型链污染）；文本自适应字号通过 `fontCalculatorManager` 全局 Worker 单例以 $O(1)$ 闭式代数公式异步计算，避免线程激增。
- **状态树**: Zustand 维护着完整的项目快照，包括 50 步深度快照隔离的 undo/redo 栈。
- **持久化中枢**: `services/recentProjects.ts` 统一管理近期工程列表，具备 LocalStorage 超额分级裁剪与降级保全能力。
- **隔离沙盒**: 为了安全，禁用了 Node.js 集成，所有原生请求必须通过 `ContextBridge` 转发。

---

## 2. 通信链路：IPC 协议设计

应用中绝大多数通信采用 `ipcRenderer.invoke`。这种模式确保了渲染进程不会因原生操作（如磁盘写入）而阻塞。

### 2.1 核心 IPC 通道参考
| 通道名称 | 职责 | 输入 | 输出 |
| :--- | :--- | :--- | :--- |
| `get-app-paths` | 获取系统路径 | - | `{ userData, thumbnails }` |
| `save-project` | 归档工程文件 | `content`, `filePath`, `defaultName` | `{ success, filePath }` |
| `open-project` | 打开 .slgrid 文件 | - | `{ success, content, filePath }` |
| `read-project` | 按路径读取项目 | `filePath` | `{ success, content }` |
| `upload-asset` | 处理并保存图像资产 | `filename`, `base64Data` | `{ success, url }` |
| `capture-page-to-thumbnail` | 生成页面缩略图 | `projectId`, `rect` | `dataUrl (base64)` |
| `select-directory` | 打开系统目录选择器 | - | `{ success, path }` |
| `save-file-buffer` | 将 Base64 写入文件（严格限制文件后缀） | `filePath`, `base64Data` | `{ success }` |
| `open-external` | 在系统浏览器打开 HTTPS 链接 | `url` | - |
| `setActiveWorkspace` | 设置工作区根目录 | `path` | - |
| `list-projects` | 扫描工作区下的所有项目（多源合并） | - | `Array<project>` |
| `setCurrentProject` | 设置当前活跃项目上下文 | `{ id, name }` | - |
| `read-asset-file` | 读取资产文件返回 Base64（防越界） | `filename` | `base64 string | null` |
| `process-responsive-images` | 多尺寸多格式响应式图像处理 | `{ input, formats }` | `{ success, result }` |
| `delete-project` | 删除项目目录与工程文件 | `projectPath` | `{ success }` |

### 2.2 预加载脚本 (Preload Script)
`electron/preload.ts` 将以上通道封装为 `window.electronAPI` 挂载到渲染进程。它严格执行路径参数校验（支持 Windows 盘符与标准分隔符，拒绝 `..` 路径遍历、Windows 保留设备名及非法字符），确保了 API 的类型安全与沙盒隔离。渲染侧通过 `src/utils/native-fs.ts` 的 `nativeFs` 对象访问，非 Electron 环境自动优雅降级。

---

## 3. 持久化策略：三级缓存模型

SlideGrid Studio 解决了“Web 应用数据易失”与“传统桌面应用保存繁琐”的矛盾：

1.  **L1 - 内存状态 (Zustand)**: 响应毫秒级的 UI 变更，提供极致的编辑流畅度。`hasUnsavedChanges` 标志在每次修改时置为 `true`，保存后通过 `markAsSaved` 置回 `false`。支持 `silent` 瞬态更新跳过撤销快照记录。
2.  **L2 - 浏览器缓存 (IndexedDB + LocalStorage)**: 
    - `utils/db.ts` 封装了 IndexedDB 存取操作，并拥有独立的 `projectThumbnails` 缩略图表防止主记录体积膨胀；`useProject` 和 `EditorPage` 在内容变更后自动防抖写入。
    - `services/recentProjects.ts` 集中管理近期工程列表，提供“完整存储 → 仅保留最近 6 项缩略图 → 剥离缩略图仅保全元数据”的三级配额防御机制，彻底消除 `QuotaExceededError` 导致工程丢失的隐患。
3.  **L3 - 物理归档 (.slgrid)**: 只有在触发 `Ctrl+S` 或手动保存时，才会调用 `ProjectArchiveManager`（位于 `electron/archive-manager.ts`）将数据打包为 ZIP 写入磁盘。在 ZIP 解压与写入过程中实施严格的相对路径越界拦截与 ADS（备用数据流）拦截。

---

## 4. 关键路径性能优化

- **分包加载**: `vite.config.ts` 中手动定义了 `manualChunks`，将 `react`/`react-dom`/`react-router-dom`（`vendor-react`）、`framer-motion`（`vendor-motion`）、`zustand`/`lucide-react`（`vendor-utils`）、`katex`（`vendor-katex`）等分离为独立 chunk，利用浏览器缓存。
- **离屏无感导出 (OffscreenExportRenderer)**: 多页导出时，应用在离屏专用 DOM 节点中挂载待导出的目标页面，静默等待字体与图片加载就绪后调用 `toPng` 捕获，彻底避免了导出过程中用户可视画面的剧烈翻页、闪烁以及 Framer Motion 淡入动画半透明问题。
- **闭式字号计算**: Web Worker 字体自适应从传统的二分查找循环重构为 $O(1)$ 闭式代数公式推导，且通过 `fontCalculatorManager` 实现全局共享 Worker 实例，消除每个组件实例重复创建 Worker 导致的内存与句柄暴涨。
- **GPU 加速**: 全面开启硬件加速，确保数百层 Framer Motion 动画在 4K 屏幕下依然丝滑。
- **零拷贝资产协议**: `asset://` 协议直接从磁盘读取 Buffer 流入渲染进程，避免了 Base64 带来的 33% 内存额外开销。
