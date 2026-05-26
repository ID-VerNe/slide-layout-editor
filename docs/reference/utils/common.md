# 基础逻辑与通用工具 (Common Utilities)

本章记录了 SlideGrid Studio 中负责数据流、性能优化与日志监控的基础工具。

---

## 1. 数据逻辑

### 1.1 `migrations/v2-to-v3.ts`
负责将旧版扁平化数据升级为 V3 Zine 规范结构。
- 注入 `DesignSystem` 令牌。
- 升级中文字体配置。

### 1.2 `typeGuards.ts`
运行时类型守卫，用于在 TypeScript 中安全收窄 PageData 的子类型。

### 1.3 `comparison.ts`
基于 `Object.is` 的对象浅比较器，用于 `React.memo` 优化。

---

## 2. 性能与监控

### 2.1 `logger.ts`
全局日志系统，支持 DEBUG/INFO/WARN/ERROR 级别。
- 辅助函数 `handleAsync`: 统一异步错误处理，返回 `[data, error]`。

### 2.2 `lruCache.ts`
泛型 LRU 缓存实现，基于原生 `Map`，默认容量 100。命中的缓存会自动提升为最近使用。

---

## 3. 数据持久化 (`db.ts`)
IndexedDB 的封装层 (原生 API，无第三方依赖)。

- **存储结构**: `projects` (JSON) 和 `assets` (Base64) 存储。
- **职责**: 负责 Web 环境下的数据保存、读取与图片自动压缩。

---

## 4. 高性能计算与 Worker

### 4.1 `fontCalculator.ts`
位于 `src/workers/`，通过 Web Worker 异步计算标题最佳字号，避免阻塞主线程。

- **算法**: 基于字符权重的二分查找。
- **精度**: 0.5px。
- **用途**: `AutoFitHeadline` 组件的核心计算逻辑。
