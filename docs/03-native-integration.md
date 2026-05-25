# 原生持久化与资产管线深度解析

SlideGrid Studio 将 Electron 的 Node.js 运行时视为强大的后端，构建了一套在 Web 环境下无法实现的资产管理方案。

## 1. 资产协议：`asset://` 虚拟文件系统

为了解决 Chromium 无法直接加载本地文件路径 (`file://`) 的限制，我们实现了一个自定义协议。

### 1.1 拦截与解析流程 (`main.ts`)
当渲染进程请求 `asset://res_a1b2c3d4.webp` 时：
1. **主进程截获**: `protocol.handle('asset', ...)` 触发。
2. **根目录识别**: `archiveManager` 根据当前的 `activeProjectId` 确定该项目在 `userData/projects/{id}/assets` 下的真实路径。
3. **流式读取**: 使用 `fs.readFile` 读取 Buffer。
4. **MIME 注入**: 根据扩展名自动注入正确的 `Content-Type`。

---

## 2. 归档架构：`.slgrid` 物理封装

`.slgrid` 是一个结构化的 ZIP 数据包，确保了工程的便携性。

### 2.1 归档文件结构
```text
project.slgrid (ZIP)
├── project.json          # 项目元数据、页面数据、主题配置
├── assets/               # 资源文件夹
│   ├── res_6a7b8c...webp # 经过 Sharp 处理的优化图像
│   └── logo_custom.svg   # 原始矢量素材
└── previews/             # 页面缩略图缓存
```

### 2.2 资产去重 (Deduplication)
每个资产文件名都包含其内容的 MD5 哈希。如果用户在多个页面使用同一张图片，物理磁盘上只会存储一份文件，显著减小工程体积。

---

## 3. 图像管线：Sharp 驱动的高性能处理

应用在主进程集成了 `sharp` 库，作为其图形处理引擎。

### 3.1 资产上传流程
1. **采样**: 用户选择图片后，渲染进程将其转换为 Base64。
2. **预处理**: Sharp 对位图执行 `resize`（宽度限高 2000px，保持比例）。
3. **格式转换**: 强制转换为 `webp` 格式并设置 `quality: 85`，以平衡画质与体积。
4. **入库**: 将处理后的 Buffer 写入项目的资产目录，并返回 `asset://` 路径。

---

## 4. 工作区同步 (Workspace Sync)

SlideGrid Studio 支持“零负担”的项目迁移：
- **解压态运行**: 当项目打开时，它会被静默解压到 `userData` 临时目录。
- **实时同步**: 每次 `Ctrl+S` 不仅保存 ZIP，还会同步物理文件夹内的文件。
- **外部工作区**: 用户可以关联一个外部目录作为“工作区”，应用会自动将该目录下的文件变动映射到 Store 中。

---

## 5. 迁移与兼容性逻辑 (`v2-to-v3.ts`)

随着 Zine Mode 的引入，资产管理还负责旧版本数据的“平滑降级”：
- **提取器**: 自动扫描旧 JSON，将所有 DataURL 提取出来存入磁盘，并将 JSON 中的引用改为 `asset://`。
- **瘦身**: 该过程可将原本 50MB+ 的 JSON 文件缩小至 500KB 以内，极大提升了 UI 响应灵敏度。
