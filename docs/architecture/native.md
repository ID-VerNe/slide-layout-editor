# 原生持久化与资产管线深度解析

SlideGrid Studio 将 Electron 的 Node.js 运行时视为强大的后端，构建了一套在 Web 环境下无法实现的资产管理方案。

## 1. 资产协议：`asset://` 虚拟文件系统

为了解决 Chromium 无法直接加载本地文件路径 (`file://`) 的限制，我们实现了一个自定义协议。

### 1.1 拦截与解析流程 (`electron/main.ts`)
当渲染进程请求 `asset://res_a1b2c3d4.webp` 时：
1. **主进程截获**: `protocol.handle('asset', ...)` 触发。
2. **路径清洗与安全检查**: 从 URL 中提取文件名，执行 `path.basename` 清理、路径遍历攻击检查（拒绝 `..` 及绝对路径），并二次验证最终路径落在 `assetRoot` 之下。
3. **根目录识别**: `archiveManager.getAssetRoot()` 获取当前项目在 `userData/DefaultWorkspace/{SafeName}_{idSuffix}/assets/` 下的真实路径。
4. **流式读取**: 使用 `fs.readFile` 读取 Buffer。
5. **MIME 注入**: 根据扩展名自动注入正确的 `Content-Type`（支持 `.jpg`、`.jpeg`、`.png`、`.webp`、`.svg`）。

---

## 2. 归档架构：`.slgrid` 物理封装

`.slgrid` 是一个结构化的 ZIP 数据包，确保了工程的便携性。

### 2.1 归档文件结构
```text
project.slgrid (ZIP)
├── project.json          # 项目元数据、页面数据、主题配置
└── assets/               # 资源文件夹（Sharp 处理的 WebP 图像、原始 SVG）
```

项目在磁盘上运行时使用展开的文件夹结构：
```text
userData/DefaultWorkspace/
├── {SafeName}_{idSuffix}/
│   ├── project.json
│   └── assets/
│       ├── res_a1b2c3d4.webp
│       └── logo_custom.svg
```

> 注意：`.slgrid` 文件是 ZIP 格式，其 `assets/` 目录结构与运行时文件夹一致。

### 2.2 资产去重 (Deduplication)
每个资产文件名使用 `res_{MD5前8位}.webp` 格式（压缩为 WebP 时），MD5 哈希基于文件内容的 Buffer 生成。如果用户在多个页面使用同一张图片，物理磁盘上只会存储一份文件，显著减小工程体积。SVG 文件保留原始格式和 `.svg` 后缀。

---

## 3. 图像管线：Sharp 驱动的高性能处理

应用在主进程集成了 `sharp` 库，作为其图形处理引擎。图像处理分为两个模块：`ProjectArchiveManager.compressImage()` 处理资产上传时的单图压缩与格式转换；`electron/image-processor.ts` 中的 `processResponsiveImages()` 负责生成多尺寸多格式响应式变体。

### 3.1 资产上传流程
1. **采样**: 用户选择图片后，渲染进程将其转换为 Base64。
2. **预处理**: 通过 IPC `upload-asset` 传递至主进程的 `archiveManager.saveAsset()`。
3. **MD5 去重**: 对 Buffer 计算 MD5 哈希，生成 `res_{哈希前8位}.webp` 文件名。
4. **Sharp 压缩**: 调用 `compressImage()` 内部方法：检测 SVG（按文本签名保留原样），对位图执行 `resize`（宽度限高 2000px，`withoutEnlargement`），输出 WebP 格式 (`quality: 85`)。
5. **入库**: 将处理后的 Buffer 写入项目的 `assets/` 目录，返回 `asset://res_xxxx.webp` 路径。

### 3.2 响应式图像管线 (`image-processor.ts`)
除了单图压缩，主进程还通过 `processResponsiveImages(input, formats)` 支持多尺寸/多格式批量生成。该函数对每张图片生成 320/640/1280/1920 四档宽度变体，每种变体可输出 WebP (`quality: 80`)、AVIF (`quality: 65`)、JPEG (`quality: 85`)、PNG 格式，用于 Zine Mode 中的响应式图片 `<picture>` 元素。

---

## 4. 工作区模型 (Workspace Model)

SlideGrid Studio 使用工作区来管理项目在磁盘上的布局：

- **展开态运行**: 项目被打开或创建后，其内容以文件夹形式存在于工作区目录下。工作区默认为 `userData/DefaultWorkspace`，也可通过 `setActiveWorkspace(path)` 指向外部目录。
- **保存机制**: 每次 `Ctrl+S` 均先更新工作区文件夹内的 `project.json`；如果目标是 `.slgrid` 文件路径，还会额外打包一个 ZIP 归档。
- **项目扫描**: `listProjects()` 扫描工作区目录下所有包含 `project.json` 的子目录，返回按最后修改时间排序的项目列表。

---
## 5. ProjectArchiveManager 核心类

`electron/archive-manager.ts` 中的 `ProjectArchiveManager` 是所有文件 I/O 操作的中枢控制器。

### 5.1 核心方法

| 方法 | 可见性 | 说明 |
| :--- | :--- | :--- |
| `setActiveWorkspace(path)` | 公开 | 设置当前工作区根目录路径 |
| `setCurrentProject(id, name)` | 公开 | 设置当前活跃项目的 ID 和名称 |
| `getProjectFolder()` | 私有 | 获取/创建项目的物理存储文件夹。通过 ID 后缀匹配已有文件夹，支持标题变更时自动重命名；带有锁机制防止竞态 |
| `getAssetRoot()` | 公开 | 获取项目资产目录 (`assets/`)，不存在则自动创建 |
| `listProjects()` | 公开 | 扫描工作区目录下的所有项目文件夹，读取 `project.json` 并返回项目列表 |
| `openProject(filePath)` | 公开 | 打开项目。支持 ZIP (`.slgrid`)、文件夹、旧版 JSON 三种格式。ZIP 模式下含 zip bomb 安全检查（最大 100MB、1000 条目、路径遍历防护） |
| `saveProject(filePath, data)` | 公开 | 保存项目。文件夹模式仅更新 `project.json`；文件模式打包为 ZIP |
| `saveAsset(filename, buffer)` | 公开 | 保存资产文件。经 Sharp 压缩为 WebP，MD5 哈希命名去重 |
| `compressImage(buffer)` | 私有 | Sharp 驱动图片压缩：宽度限制 2000px (`withoutEnlargement`)，输出 WebP (`quality: 85`)，SVG 按文本签名保留 |
| `migrateLegacyAssets(projectData)` | 私有 | 递归扫描旧版 JSON 中的 `data:image` 前缀引用，提取为磁盘文件并替换为 `asset://` 路径 |

### 5.2 文件夹命名规则

项目物理文件夹命名格式为 `{SafeName}_{idSuffix}`，其中：
- `SafeName`: 项目标题经路径安全清洗后替换空格为下划线
- `idSuffix`: 项目 UUID 前 8 位
- 路径变更时通过 ID 后缀匹配已有文件夹，避免资产丢失

### 5.3 旧版资产迁移

`migrateLegacyAssets(projectData)` 递归扫描项目 JSON 中的 `data:image` 前缀引用，将其提取为物理文件 (`asset://` 协议)，将原本 50MB+ 的 JSON 缩小至 500KB 以内。

---
## 6. 迁移与兼容性逻辑 (`v2-to-v3.ts`)

`src/utils/migrations/v2-to-v3.ts` 中的 `migrateToV3()` 负责旧版项目数据的字段升级，属于纯渲染进程的转换逻辑：

- **字段重命名**: `desc -> description`、`quote -> content`
- **布局 ID 映射**: V2 布局名（如 `TwoColumnLayout`）映射为 V3 的 `layoutId`（如 `modern-feature`）
- **Theme 补全**: 确保 `colors` 和 `typography` 结构完整
- **DesignSystem 注入**: 缺少 `designSystem` 字段时注入 `DEFAULT_DESIGN_SYSTEM`
- **版本号升级**: 将 `version` 设为 `3.0.0`

> 注意：旧版 JSON 中 `data:image` 引用的提取与瘦身由 `ProjectArchiveManager.migrateLegacyAssets()` 在打开旧 JSON 时于主进程中完成，与 `v2-to-v3.ts` 是独立的两个阶段。
