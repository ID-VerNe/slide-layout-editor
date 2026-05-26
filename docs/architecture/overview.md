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
渲染进程是“表演者”，专注于高频率的 UI 渲染：
- **计算引擎**: 负责 24x24 网格的样式计算与表达式解析。
- **状态树**: Zustand 维护着完整的项目快照，包括 undo 栈。
- **隔离沙盒**: 为了安全，禁用了 Node.js 集成，所有原生请求必须通过 `ContextBridge` 转发。

---

## 2. 通信链路：IPC 协议设计

应用中绝大多数通信采用 `ipcRenderer.invoke`。这种模式确保了渲染进程不会因原生操作（如磁盘写入）而阻塞。

### 2.1 核心 IPC 通道参考
| 通道名称 | 职责 | 输入 | 输出 |
| :--- | :--- | :--- | :--- |
| `save-project` | 归档工程文件 | `content`, `filePath` | `{ success, filePath }` |
| `open-project` | 打开 .slgrid 文件 | - | `{ success, content, filePath }` |
| `upload-asset` | 处理并保存图像资产 | `filename`, `base64Data` | `{ success, url }` |
| `capture-page-to-thumbnail` | 生成页面缩略图 | `projectId`, `rect` | `dataUrl (base64)` |
| `get-app-paths` | 获取系统路径 | - | `{ userData, thumbnails }` |

### 2.2 预加载脚本 (Preload Script)
`electron/preload.ts` 将以上通道封装为 `window.electronAPI` 挂载到渲染进程，确保了 API 的类型安全与沙盒隔离。

---

## 3. 持久化策略：三级缓存模型

SlideGrid Studio 解决了“Web 应用数据易失”与“传统桌面应用保存繁琐”的矛盾：

1.  **L1 - 内存状态 (Zustand)**: 响应毫秒级的 UI 变更，提供极致的编辑流畅度。
2.  **L2 - 浏览器缓存 (IndexedDB)**: `utils/db.ts` 负责实时检查 `hasUnsavedChanges` 标志，并将其写入 IndexedDB。
3.  **L3 - 物理归档 (.slgrid)**: 只有在触发 `Ctrl+S` 或手动保存时，才会调用 `archiveManager` 将数据持久化到物理磁盘，并封装为压缩包。

---

## 4. 关键路径性能优化

- **分包加载**: `vite.config.ts` 中手动定义了 `manualChunks`。将 `react`、`framer-motion`、`katex` 等大型库分离，利用浏览器缓存。
- **离屏渲染 (Offscreen Rendering)**: 当导出高分辨率图片或生成缩略图时，应用会利用 `webContents.capturePage` 在后台进行渲染，避免干扰用户当前的编辑视图。
- **GPU 加速**: 全面开启硬件加速，确保数百层 Framer Motion 动画在 4K 屏幕下依然丝滑。
- **零拷贝资产协议**: `asset://` 协议直接从磁盘读取 Buffer 流入渲染进程，避免了 Base64 带来的 33% 内存额外开销。
