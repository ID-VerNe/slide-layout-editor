# 图像处理与资源管理 (Image & Asset Management)

SlideGrid Studio 针对高精度排版与高性能预览，在 `src/utils/` 下提供了一系列图像处理工具。

---

## 1. 核心工具

### 1.1 `imageUtils.ts`
响应式图片生成与 `srcset`／`sizes` 构建。

**类型**:
- `ImageVariant`: `{ url, width, height, format }`，format 支持 `'webp' | 'avif' | 'jpg' | 'png' | 'jpeg'`
- `ResponsiveImageConfig`: `{ variants, defaultVariant, breakpoints: { mobile, tablet, desktop } }`

**函数**:
- `generateResponsiveImages(assetUrlOrData, formats?)`: 通过 IPC 调用 Electron 主进程的 Sharp 处理图片。
  - 如果 `assetUrlOrData` 以 `data:` 开头，提取 Base64 部分传给主进程。
  - 如果以 `asset://` 开头，直接将 asset 协议 URL 传给主进程（主进程可直接读取物理文件）。
  - 非 Electron 环境返回空数组并打印警告。
  - 默认格式 `['webp', 'jpg']`。
- `generateSrcSet(variants)`: 从 `ImageVariant[]` 构建 HTML `srcset`（格式：`url widthW`）。
- `generateSizes(config)`: 从 `ResponsiveImageConfig` 构建 HTML `sizes` 属性。

### 1.2 `imageUrl.ts`
去重化的图片 URL 检测与 ID 生成工具。

**函数**:
- `isImageUrl(value: string): boolean`: 检测字符串是否为图片 URL。
  - 支持 DataURI (`data:image`)、HTTP/HTTPS URL、常见图片扩展名（`.png|jpg|jpeg|webp|svg|gif|avif`）、`asset://` 协议。
- `generateId(prefix: string): string`: 生成唯一 ID，格式 `{prefix}-{timestamp}-{random9}`。

### 1.3 `lqip.ts` (Low Quality Image Placeholder)
生成 20x20 超低保真 JPEG DataURL 作为加载占位图。

**函数**:
- `generateLQIP(imageUrl, width=20, height=20, quality=0.1)`: Canvas 绘制缩略图后以 JPEG 格式导出 DataURL。
  - 仅对 `http`/`https` 链接启用 `crossOrigin: 'anonymous'`；本地协议 (asset:/data:/blob:) 无需跨域。
- `blurDataURL(dataUrl, _blurAmount=10)`: 占位函数（实际 blur 效果由 CSS `filter: blur()` 提供）。

### 1.4 `imagePreloader.ts`
`ImagePreloader` 单例类（导出 `imagePreloader` 实例），支持优先级调度的图片预加载管理器（最大并发：3）。

**方法**:
- `preload(url, priority?)`: 预加载单张图片。优先级 `'high'` 时插入队列头部，否则追加到尾部。已缓存的 URL 自动去重。
- `preloadMultiple(urls, priority?)`: 批量预加载多张图片，返回 `Promise<void[]>`。
- `clear()`: 取消所有进行中的加载并清空队列（清空源 `src`，解绑 `onload`/`onerror`）。
- `clearUrls(urls)`: 仅取消指定 URL 的加载，保留其他任务。
- **自动 crossOrigin**: 对外部 HTTP/HTTPS 图片自动设置 `crossOrigin = 'anonymous'`。
- **去重**: 相同 URL 不会重复发起请求（内部通过 `loadingPromises` Map 跟踪）。
- **调度**: 内部使用 `setTimeout(50ms)` 延迟批量处理，避免同步突发大量请求。
