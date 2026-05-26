# 核心 Hooks 参考 (Hooks API)

SlideGrid Studio 的业务逻辑主要封装在自定义 Hooks 中，本章记录了驱动应用运行的关键逻辑钩子。

---

## 1. `useStore` (Zustand)
应用级全局状态存储的核心。

- **文件**: [src/store/useStore.ts](src/store/useStore.ts)

### 1.1 状态读取
```typescript
const pages = useStore(s => s.pages);
const currentPageIndex = useStore(s => s.currentPageIndex);
const hasUnsavedChanges = useStore(s => s.hasUnsavedChanges);
const designSystem = useStore(s => s.designSystem);
```

### 1.2 核心 Actions

| Action | 签名 | 说明 |
| :--- | :--- | :--- |
| `createProject` | `(title, templateId?) => string` | 创建新项目，返回 UUID |
| `loadProject` | `(idOrData, templateId?, filePath?) => Promise<void>` | 加载项目（含 V3 迁移） |
| `updatePage` | `(page: PageData, silent?: boolean) => void` | 更新页面，silent 跳过历史 |
| `addPage` | `(ratio: AspectRatioType, layoutId: string) => void` | 追加新页 |
| `removePage` | `(id: string) => void` | 删除页面 |
| `reorderPages` | `(newPages: PageData[]) => void` | 页面重排序 |
| `setTheme` | `(update: Partial<ProjectTheme>, applyToAll?: boolean) => void` | 更新主题 |
| `setDesignSystem` | `(ds: DesignSystem) => void` | 更新设计令牌 |
| `setPrintSettings` | `(settings: PrintSettings) => void` | 更新打印设置 |
| `setCounterStyle` | `(style: CounterStyle) => void` | 页码样式 (全局同步) |
| `undo` / `redo` | `() => void` | 撤销/重做 |
| `pushHistory` | `() => void` | 快照当前状态到撤销栈 |
| `markAsSaved` | `() => void` | 清除脏标记 |

### 1.3 全局同步行为

- `updatePage` 自动检测 `GLOBAL_FIELDS` 集合变更并同步到所有页面
- `setCounterStyle` 自动同步到所有页面的 `counterStyle` 字段
- `setTheme(update, applyToAll=true)` 同步 `backgroundColor`/`accentColor`/`titleFont`/`bodyFont` 到所有页面

---

## 2. `useProject`
项目生命周期与状态管理的核心钩子。

- **文件**: [src/hooks/useProject.ts](src/hooks/useProject.ts)

### 2.1 主要接口

```typescript
const {
  // 状态
  pages, projectTitle, theme, designSystem,
  currentPageIndex, currentPage, isLoaded,
  hasUnsavedChanges, past, future,
  printSettings, imageQuality, minimalCounter,
  counterStyle, customFonts, currentFilePath,

  // 操作
  loadProject, updatePage, addPage, removePage, reorderPages,
  setTheme, setProjectTitle, setCurrentPageIndex,
  setPrintSettings, setImageQuality, setMinimalCounter,
  setCounterStyle, setCustomFonts, setCurrentFilePath,
  undo, redo, markAsSaved,
  canUndo, canRedo,

  // 保存
  saveToDB,
} = useProject(projectId, templateId);
```

### 2.2 `saveToDB` 详解

`saveToDB(previewRef, forceThumbnail?)` 执行：
1. 检查项目 ID、加载状态、页面数量
2. 将 `ProjectData` (version, title, pages, theme, designSystem, ...) 写入 IndexedDB
3. 更新 localStorage 中 `magazine_recent_projects` 索引 (保留原缩略图)

### 2.3 后台缩略图生成

`useProject` 内部注册两个定时器：
- **首次**: 30 秒后生成微型缩略图
- **定期**: 每 5 分钟更新缩略图
- Electron 环境: `webContents.capturePage` 快速截图 (240px)
- Web 环境: `html-to-image` 超低保真截图 (`pixelRatio: 0.1, quality: 0.1`)

---

## 3. `usePreview`
负责编辑器中央预览区域的适配、缩放与溢出检测。

- **文件**: [src/hooks/usePreview.ts](src/hooks/usePreview.ts)

### 3.1 主要接口

```typescript
const {
  previewRef, previewContainerRef,   // DOM refs
  previewZoom, setPreviewZoom,       // 缩放倍率 (0.25 ~ 3.0)
  isAutoFit, setIsAutoFit,           // 自适应模式
  pagesOverflow,                     // 溢出检测映射
  handleManualZoom,                  // 手动缩放 (±0.1)
  toggleFit,                         // 切换自适应
  handleOverflowChange,             // 溢出回调
} = usePreview({ pages, currentPageIndex, printSettings, isLoaded });
```

### 3.2 自适应缩放算法

`calculateFitZoom()`:
1. 获取 `previewContainerRef` 的可视宽高
2. 减去 120px 内边距
3. 根据当前页面 `aspectRatio` 获取设计尺寸
4. 如有 `printSettings.enabled`，按 PPI 计算目标尺寸
5. 返回 `min(scaleX, scaleY)`，限制在 `0.1 ~ 1.5` 之间

### 3.3 防抖策略

- ResizeObserver 回调使用 100ms 防抖，防止与子组件布局计算竞争
- 初次挂载 200ms 延迟执行

---

## 4. `useAssetUrl`
处理资源路径转换的混合架构 Hook（支持 Web 与 Electron）。

- **文件**: [src/hooks/useAssetUrl.ts](src/hooks/useAssetUrl.ts)

**协议**: 处理 `asset://` 自定义协议。
**分流逻辑**:
- **Electron**: 调用主进程 `readAssetFile` 读取本地物理文件并转为 Base64/DataURL。
- **Web**: 从 IndexedDB `assets` 存储获取。
**缓存**: 内置 LRU 缓存以优化高频渲染性能。

---

## 5. 其他 Hooks

| Hook | 文件 | 说明 |
| :--- | :--- | :--- |
| `useResponsiveImage` | [hooks/useResponsiveImage.ts](src/hooks/useResponsiveImage.ts) | 处理 `srcset` 与多尺寸图片的按需加载 |
| `useImagePreload` | [hooks/useImagePreload.ts](src/hooks/useImagePreload.ts) | 针对模板预览图的批量预加载 |
| `useModularStyle` | [ui/slide/hooks/useModularStyle.ts](src/components/ui/slide/hooks/useModularStyle.ts) | Zine 原子组件专用样式 Hook，处理 8px 基线对齐和 Token 映射 |
| `useDataConnector` | [ui/slide/hooks/useDataConnector.ts](src/components/ui/slide/hooks/useDataConnector.ts) | 数据连接器 Hook，连接 PageData 字段与渲染组件 |