# 基础逻辑与通用工具 (Common Utilities)

本章记录了 SlideGrid Studio 中负责数据流、性能优化与日志监控的基础工具。

---

## 1. 数据逻辑

### 1.1 `migrations/v2-to-v3.ts`
负责将旧版扁平化数据升级为 V3 Zine 规范结构。

**核心函数**: `migrateToV3(data)` 

- 自动跳过已升级的数据（检测 `version >= 3.0 && designSystem` 存在）。
- 递归迁移字段：
  - 字段重命名：`desc` → `description`，`quote` → `content`，`name` → `author`（仅当与现有 `author` 冲突时覆盖）
  - 布局 ID 映射：`layout` → `layoutId`（映射表：`TwoColumnLayout → modern-feature`, `GalleryLayout → floating-gallery`, `HeroLayout → typography-hero`）
  - 跳过已存在的目标字段（防止覆盖）
- 补全 `theme` 结构（`colors` + `typography` 的默认值填充）
- 注入 `DesignSystem` 令牌（使用 `DEFAULT_DESIGN_SYSTEM` 常量）
- 设置版本号 `'3.0.0'`

### 1.2 `typeGuards.ts`
运行时类型守卫，用于在 TypeScript 中安全收窄 `PageData` 的子类型。

共提供 **9 个** 类型守卫函数，每个函数通过 `layoutId` 字段进行精确匹配：

| 函数 | 对应 `layoutId` |
| :--- | :--- |
| `isAgendaPage` | `table-of-contents` |
| `isPlatformHeroPage` | `platform-hero` |
| `isStepTimelinePage` | `step-timeline` |
| `isTestimonialCardPage` | `testimonial-card` |
| `isCommunityHubPage` | `community-hub` |
| `isComponentMosaicPage` | `component-mosaic` |
| `isGalleryCapsulePage` | `gallery-capsule` |
| `isEditorialSplitPage` | `editorial-split` |

### 1.3 `comparison.ts`
导出 `shallowEqual(objA, objB)` — 基于 `Object.is` 的对象浅比较器，用于 `React.memo` 优化。

- 先通过 `Object.is` 进行引用相等判断。
- 再逐 key 比较：长度不同则跳过，`hasOwnProperty` 检查后逐个值进行 `Object.is` 比较。

---

## 2. 性能与监控

### 2.1 `logger.ts`
全局日志系统 (`Logger` 类)，支持 DEBUG/INFO/WARN/ERROR 四个级别。

- 导出单例 `logger`，提供 `debug()` / `info()` / `warn()` / `error()` 方法。
- `setLevel()` 动态调节日志级别。
- 开发环境 (`import.meta.env.DEV`) 自动设为 DEBUG 级别；生产环境默认 INFO。
- **生产控制台覆盖**: 自动调用 `applyProdOverrides()` 在 `import.meta.env.PROD` 时执行。
  - `console.log` / `console.debug` / `console.info` 静默。
  - `console.warn` 过滤包含 `AutoSave` 或 `Thumbnail` 的消息。
  - `console.error` 保留全部输出。
  - 注册 `window.addEventListener('unhandledrejection')` 捕获未处理的 Promise 拒绝。
- 辅助函数 `handleAsync<T>(promise, context)`: 统一异步错误处理，返回 `[data, error]` 元组。发生错误时自动通过 `logger.error()` 输出上下文信息。

### 2.2 `lruCache.ts`
泛型 `LRUCache<K, V>` 类实现，基于原生 `Map`，默认容量 100。

- `get(key)`: 读取并自动提升为最近使用（删除后重新插入）。
- `set(key, value)`: 插入新值；达到容量上限时淘汰最久未使用的条目（Map 首个 key）。
- `has(key)`, `delete(key)`, `clear()`: 标准操作方法。
- `size` (getter): 返回当前缓存条目数。
- `keys` / `values` (getters): 分别返回键数组和值数组。

---

## 3. 数据持久化 (`db.ts`)
IndexedDB 的封装层 (原生 API，无第三方依赖)，数据库名 `slidegrid_studio_db`，版本号 3。

- **存储结构**: `projects` (JSON) 和 `assets` (Base64 与 DataURL) 两个对象仓库。
- **核心函数**:
  - `initDB()`: 初始化并返回 `IDBDatabase` 实例，自动创建缺失的仓库。
  - `saveProject(id, data)`: 按 `id` 存储 `ProjectData` 对象。
  - `getProject(id)`: 按 `id` 读取指定项目，返回 `ProjectData | null`。
  - `deleteProject(id)`: 按 `id` 删除指定项目。
  - `saveAsset(dataUrl)`: 将 DataURL 存储至 assets 仓库。先通过 Web Crypto API (SHA-256) 生成 16 位哈希 ID；若 Crypto 不可用则回退时间戳+随机数。在 Electron 环境中优先通过 `nativeFs.uploadAsset()` 存储到物理文件系统，成功则返回 `asset://` 协议 URL。
  - `getAsset(assetId)`: 从 assets 仓库读取 DataURL。Electron 环境优先尝试 `nativeFs.readAssetFile()` 读取物理文件，失败时回退 IndexedDB。
  - `compressImage(file, quality)`: 浏览器端图片压缩。Canvas 绘制后以 WebP 格式输出，默认质量 `0.9`。

---

## 4. 高性能计算与 Worker

### 4.1 `fontCalculator.ts`
位于 `src/workers/`，通过 Web Worker 异步计算标题最佳字号，避免阻塞主线程。

- **算法**: 基于字符权重的二分查找。
- **精度**: 0.5px。
- **用途**: `AutoFitHeadline` 组件的核心计算逻辑。
