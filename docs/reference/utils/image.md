# 图像处理与资源管理 (Image & Asset Management)

SlideGrid Studio 针对高精度排版与高性能预览，在 `src/utils/` 下提供了一系列图像处理工具。

---

## 1. 核心工具

### 1.1 `imageUtils.ts`
响应式图片生成与 `srcset` 构建。
- `generateResponsiveImages()`: 调用主进程 Sharp 生成 WebP/JPG 多尺寸变体。
- `generateSrcSet()`: 构建 HTML `srcset`。

### 1.2 `blobManager.ts`
引用计数式的内存 Blob URL 生命周期管理，防止内存泄漏。
- `create(blob, key)`: 创建并跟踪。
- `release(key)`: 释放并回收。

### 1.3 `lqip.ts` (Low Quality Image Placeholder)
生成 20x20 超低保真 JPEG DataURL 作为加载占位图。

### 1.4 `imagePreloader.ts`
支持优先级调度的图片预加载管理器（最大并发：3）。

---

## 2. 图像预加载与并发 (`imagePreloader.ts`)
支持优先级调度的图片预加载管理器（最大并发：3）。
- **去重**: 相同 URL 不会重复发起请求。
- **自动 crossOrigin**: 自动处理跨域资源。
