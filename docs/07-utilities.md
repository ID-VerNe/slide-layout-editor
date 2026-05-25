# 工具函数库参考 (Utilities)

SlideGrid Studio 将复杂的底层逻辑封装在 `src/utils/` 目录下，本章记录了所有关键 Utility 的功能与 API。

---

## 1. 原生桥接 (Native & FS)

### 1.1 `native-fs.ts`
渲染进程与 Electron 主进程通信的统一代理层。

- **文件**: `src/utils/native-fs.ts`
- **模式**: 单例模式，导出 `nativeFs` 实例

**API 参考**:

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `isElectron()` | `boolean` | 检测当前运行环境是否为 Electron |
| `setActiveWorkspace(path)` | `Promise<void>` | 同步工作区路径到主进程 |
| `setCurrentProject(id, name)` | `Promise<void>` | 同步当前项目上下文到主进程 (用于资产路径解析) |
| `openExternal(url)` | `Promise<void>` | 外部链接打开 (Electron 下用 shell.openExternal，Web 下用 window.open) |
| `selectDirectory()` | `Promise<NativeResponse>` | 打开原生文件夹选择对话框 |
| `saveFileBuffer(filePath, base64Data)` | `Promise<NativeResponse>` | 将 Base64 数据写入指定路径 |
| `saveProject(projectData, filePath?, defaultName?)` | `Promise<NativeResponse>` | 触发主进程保存项目 |
| `openProject()` | `Promise<NativeResponse>` | 触发主进程打开 .slgrid 文件 |
| `uploadAsset(filename, base64Data)` | `Promise<NativeResponse>` | 将原始图片数据通过 IPC 发送至 Sharp 流水线 |

**接口类型**:

```typescript
interface NativeResponse {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
  canceled?: boolean;
  path?: string;
  url?: string;  // asset:// 路径
}

interface ElectronAPI {
  getAppPaths, captureThumbnail, saveProject, openProject,
  uploadAsset, selectDirectory, saveFileBuffer, openExternal,
  setActiveWorkspace, setCurrentProject, readAssetFile, processResponsiveImages
}
```

**通信链路**: `nativeFs` -> `window.electronAPI` (ContextBridge) -> `ipcRenderer.invoke` -> 主进程 IPC handler

---

## 2. 图像处理 (Image Processing)

### 2.1 `imageUtils.ts`
图像工具集，提供响应式图片生成与 `srcset` 构建。

- **文件**: `src/utils/imageUtils.ts`

**API 参考**:

| 函数 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `generateResponsiveImages(assetUrlOrData, formats)` | `Promise<ImageVariant[]>` | 通过 IPC 调用主进程 sharp 生成多尺寸变体 |
| `generateSrcSet(variants)` | `string` | 根据变体列表构建 HTML `srcset` 属性 |
| `generateSizes(config)` | `string` | 根据响应式断点配置构建 HTML `sizes` 属性 |

**ImageVariant 类型**:

```typescript
interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpg' | 'png' | 'jpeg';
}
```

**生成尺寸**: [320, 640, 1280, 1920] px × [webp, jpg] (默认格式组合)

### 2.2 `blobManager.ts`
管理内存中 Blob URL 的生命周期，防止内存泄漏。

- **文件**: `src/utils/blobManager.ts`
- **模式**: 引用计数模式

**API 参考**:

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `create(blob, key)` | `string` | 创建 Blob URL，若 key 已存在则增加引用计数 |
| `release(key)` | `void` | 减少引用计数，计数归零时释放 URL |
| `clear()` | `void` | 释放所有 Blob URL |
| `size` (getter) | `number` | 当前管理的 Blob 数量 |

### 2.3 `lqip.ts` (Low Quality Image Placeholder)
生成极小体积的模糊占位图 (LQIP)，提升首屏加载的视觉感知度。

- **文件**: `src/utils/lqip.ts`

**API 参考**:

| 函数 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `generateLQIP(imageUrl, width?, height?, quality?)` | `Promise<string>` | 生成 20x20 超低保真 JPEG DataURL |
| `blurDataURL(dataUrl, blurAmount?)` | `string` | 返回原 DataURL (实际模糊效果由 CSS filter 控制) |

**实现原理**:
1. 创建隐藏 `Image` 元素加载原始图
2. 绘制到 20x20 px 的 Canvas 上
3. 以 `quality: 0.1` 导出为 JPEG DataURL
4. 仅对 `http` 开头的 URL 启用 `crossOrigin`

### 2.4 `imagePreloader.ts`
图片预加载管理器，支持优先级调度与并发控制。

- **文件**: `src/utils/imagePreloader.ts`

**API 参考**:

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `preload(url, priority?)` | `Promise<void>` | 预加载单张图片 |
| `preloadMultiple(urls, priority?)` | `Promise<void[]>` | 批量预加载 |
| `clear()` | `void` | 清空所有进行中的加载任务 |

**特性**:
- **最大并发**: 3 张同时加载
- **优先级**: `'high'` (立即), `'normal'` (100ms 延迟), `'low'` (100ms 延迟)
- **去重**: 相同 URL 不会重复发起请求
- **自动 crossOrigin**: HTTP/HTTPS 图片自动设置 `crossOrigin = 'anonymous'`

---

## 3. 数据持久化 (Persistence)

### 3.1 `db.ts`
IndexedDB 的封装层 (原生 API，无第三方依赖)。

- **文件**: `src/utils/db.ts`
- **数据库名**: `slidegrid_studio_db`
- **DB Version**: 3

**存储结构 (Object Stores)**:

| Store 名 | Key | Value | 说明 |
| :--- | :--- | :--- | :--- |
| `projects` | `projectId` (string) | `ProjectData` (JSON) | 项目完整数据 |
| `assets` | `assetId` (string, `asset://...`) | Base64 DataURL (string) | 图片资产原始数据 |

**API 参考**:

| 函数 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `initDB()` | `Promise<IDBDatabase>` | 初始化/升级数据库 |
| `saveAsset(dataUrl)` | `Promise<string>` | 保存图片资产，Electron 下发布到主进程，Web 下存入 IndexedDB |
| `getAsset(assetId)` | `Promise<string \| null>` | 读取资产，Electron 下返回 ID (由 protocol 处理)，Web 下从 IndexedDB 读取 |
| `saveProject(id, data)` | `Promise<void>` | 保存项目数据到 IndexedDB |
| `getProject(id)` | `Promise<ProjectData \| null>` | 从 IndexedDB 读取项目 |
| `deleteProject(id)` | `Promise<void>` | 从 IndexedDB 删除项目 |
| `compressImage(file, quality?)` | `Promise<string>` | 通过 Canvas 压缩图片为 WebP DataURL |

**资产处理分流逻辑** (`saveAsset`):
1. 基于 DataURL 内容生成简单 Hash ID
2. 检查 `window.electronAPI` 是否存在
3. **Electron 环境**: 调用 `electronAPI.uploadAsset` 发布到主进程 sharp 流水线
4. **Web 环境**: 存入 IndexedDB `assets` store

### 3.2 `blobManager.ts`
(见上文 2.2 节)

---

## 4. 数据迁移与校验 (Data Logic)

### 4.1 `migrations/v2-to-v3.ts`
核心迁移逻辑，负责将旧版本的扁平化 JSON 转化为符合 Zine V3 规范的结构。

- **文件**: `src/utils/migrations/v2-to-v3.ts`
- **执行时机**: `useStore.loadProject` 期间自动触发
- **迁移内容**:
  1. 检查版本号，若 `< 3.0` 则注入 `DesignSystem`
  2. 升级 `ProjectTheme.typography` 以支持中文字体 (headingFontZH, bodyFontZH)
  3. 注入默认字体: `'Noto Serif SC'`
  4. 已为 V3+ 且有 `designSystem` 的数据直接跳过

**迁移函数**:

| 函数 | 说明 |
| :--- | :--- |
| `migrateToV3(data)` | 入口函数，接收原始数据，返回符合 V3 规范的 `ProjectData` |

### 4.2 `comparison.ts`
浅层对象比较器，用于 React.memo 性能优化。

- **文件**: `src/utils/comparison.ts`

| 函数 | 说明 |
| :--- | :--- |
| `shallowEqual(objA, objB)` | 浅比较两个对象的所有自有属性 |

**特性**: 使用 `Object.is` 进行严格比较，先检查引用相等，再逐 key 比较值

### 4.3 `typeGuards.ts`
运行时类型守卫函数，用于安全地类型收窄 (Type Narrowing)。

- **文件**: `src/utils/typeGuards.ts`

**可用守卫** (每个根据 `page.layoutId` 判断):

| 函数 | 收窄至类型 |
| :--- | :--- |
| `isAgendaPage(page)` | `TableOfContentsData` |
| `isPlatformHeroPage(page)` | `PlatformHeroData` |
| `isStepTimelinePage(page)` | `StepTimelineData` |
| `isTestimonialCardPage(page)` | `TestimonialCardData` |
| `isCommunityHubPage(page)` | `CommunityHubData` |
| `isComponentMosaicPage(page)` | `ComponentMosaicData` |
| `isGalleryCapsulePage(page)` | `GalleryCapsuleData` |
| `isEditorialSplitPage(page)` | `EditorialSplitData` |

---

## 5. 日志与调试 (Logging)

### 5.1 `logger.ts`
全局日志系统，支持分级输出与上下文追踪。

- **文件**: `src/utils/logger.ts`

**日志级别** (枚举 `LogLevel`):

| 级别 | 数值 | 说明 |
| :--- | :--- | :--- |
| `DEBUG` | 0 | 开发环境默认启用 |
| `INFO` | 1 | 生产环境默认级别 |
| `WARN` | 2 | 警告信息 |
| `ERROR` | 3 | 错误信息 |

**API 参考**:

| 方法 | 说明 |
| :--- | :--- |
| `logger.debug(message, ...args)` | 调试信息 (DEV 环境) |
| `logger.info(message, ...args)` | 常规信息 |
| `logger.warn(message, ...args)` | 警告 |
| `logger.error(message, ...args)` | 错误 |
| `logger.setLevel(level)` | 运行时修改日志级别 |

**日志格式**: `[HH:mm:ss] [LEVEL] message ...args`

**辅助函数**:

| 函数 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `handleAsync(promise, context)` | `Promise<[T \| null, Error \| null]>` | 统一异步错误处理，返回 `[data, error]` 元组 |

---

## 6. 缓存与性能 (Caching)

### 6.1 `lruCache.ts`
泛型 LRU (Least Recently Used) 缓存实现。

- **文件**: `src/utils/lruCache.ts`

**API 参考**:

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `get(key)` | `V \| undefined` | 获取缓存项，命中时提升为最近使用 |
| `set(key, value)` | `void` | 存入缓存，容量满时淘汰最久未使用项 |
| `has(key)` | `boolean` | 检查 key 是否存在 |
| `delete(key)` | `boolean` | 删除指定项 |
| `clear()` | `void` | 清空全部缓存 |
| `size` (getter) | `number` | 当前缓存数量 |
| `keys` (getter) | `K[]` | 所有 key 列表 |
| `values` (getter) | `V[]` | 所有 value 列表 |

**特性**:
- 基于原生 `Map` (有序)
- 默认最大容量: 100
- `get` 操作自动将项提升到 MRU (Most Recently Used) 位置

---

## 7. Web Worker

### 7.1 `fontCalculator.ts`
字体大小计算的 Web Worker，用于 `AutoFitHeadline` 组件。

- **文件**: `src/workers/fontCalculator.ts`

**消息协议**:

| 输入消息 | 类型 | 说明 |
| :--- | :--- | :--- |
| `text` | `string` | 待渲染文本 |
| `maxSize` | `number` | 最大字号 (px) |
| `lineHeight` | `number` | 行高比率 |
| `maxLines` | `number` | 最大行数 |
| `minSize` | `number` | 最小字号 (px) |
| `containerWidth` | `number` | 容器宽度 (px) |

| 输出消息 | 类型 | 说明 |
| :--- | :--- | :--- |
| `fontSize` | `number` | 计算得到的最佳字号 (向下取整) |

**算法**: 二分查找，基于字符宽度估算：
- 中文字符: 1.0 × fontSize
- ASCII 字符: 0.6 × fontSize
- 最大 12 次迭代，精度 0.5px

---

## 8. 文件结构总览

```text
src/utils/
├── native-fs.ts          # Electron IPC 桥接
├── db.ts                 # IndexedDB 封装
├── blobManager.ts        # Blob URL 生命周期管理
├── imageUtils.ts         # 响应式图片工具
├── imagePreloader.ts     # 图片预加载管理器
├── lqip.ts               # 低质量图片占位符
├── comparison.ts         # 对象浅比较
├── typeGuards.ts         # 类型守卫函数
├── logger.ts             # 全局日志系统
├── lruCache.ts           # LRU 缓存
└── migrations/
    └── v2-to-v3.ts       # V2→V3 数据迁移

src/workers/
└── fontCalculator.ts     # 字体大小计算 Worker
```