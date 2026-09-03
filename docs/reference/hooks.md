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

### 1.4 快照隔离历史机制 (`HistorySnapshot`)

撤销/重做栈使用不可变深度克隆 (`deepClone`) 记录完整的项目快照：
- 快照对象包含：`pages`, `projectTitle`, `theme`, `designSystem`, `printSettings`, `counterStyle`, `customFonts`, `imageQuality`, `minimalCounter`
- 支持 `silent: true` 参数（在拖拽滑块或高频连续变更时跳过快照生成，避免污染撤销栈）
- 快照栈深度上限为 30 层，先进先出自动截断。

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
3. 委派至 `src/services/recentProjects.ts` 更新最近项目索引，自动执行三级配额防御机制，防止 base64 缩略图溢出崩溃。

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

## 5. `useModularStyle` (Zine 样式 Hook)

Zine 原子组件的核心样式处理器，负责将语义化 Props 转换为精确的 CSS 样式。

- **文件**: [src/components/ui/slide/hooks/useModularStyle.ts](src/components/ui/slide/hooks/useModularStyle.ts)

### 5.1 输入参数

```typescript
interface ModularStyleProps {
  page: PageData;
  fieldKey?: string;
  size?: number | string; // 字号（8px 基线倍数，支持纯数字如 1.5、字符串如 "1.5"、单位如 "1.5rem" / "24px"）
  serif?: boolean;        // 衬线体开关
  sans?: boolean;         // 无衬线体开关
  bold?: boolean;         // 加粗开关
  italic?: boolean;       // 斜体开关
  align?: 'left' | 'center' | 'right' | 'justify';
  leading?: number;       // 行高倍数
  tracking?: number;      // 字距（em）
  color?: string;         // 颜色 Token 或 Hex
  variant?: 'display' | 'body' | 'caption'; // 令牌规模
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate'; // 方向支持
}
```

### 5.2 输出样式

```typescript
const { style, className } = useModularStyle(props);
// 返回解析后的 React.CSSProperties 与合规类名
```

### 5.3 核心逻辑

1. **Token 合并**: 从 `designSystem.tokens.typography[variant]` 读取基础样式
2. **字体解析**: 优先使用 `styleOverrides[fieldKey].fontFamily`，次之 Props 意图（`serif`/`sans`），最后回退到 Token
3. **字号与基线吸附**: 使用 `resolveModularFontSize` 解析 `size`（8px 基线换算），并将行高向上吸附对齐到 8px 网格
4. **颜色映射**: `color='primary'` → `theme.colors.primary` 或 `designSystem.tokens.colors.primary`
5. **覆盖优先级**: `styleOverrides > Props > Tokens > Defaults`

### 5.4 独立导出函数：`resolveModularFontSize`

```typescript
export function resolveModularFontSize(size: number | string | undefined | null): number | undefined
```
- **数字**: `size * 8`（如 `1.5` -> `12px`）
- **纯数字字符串**: `parseFloat(size) * 8`（如 `"1.5"` -> `12px`）
- **单位字符串**:
  - `"1.5rem"` / `"1.5em"` -> `24px`
  - `"24px"` -> `24px`
  - `"12pt"` -> `16px`

### 5.5 示例

```typescript
// 在 ZineDisplay 中使用
const { style } = useModularStyle({
  page,
  fieldKey: 'title',
  size: 6,            // 48px (6 * 8px)
  serif: true,        // 使用衬线体
  bold: true,         // 加粗
  leading: 1.1,       // 行高 1.1（向上吸附到 8px 的倍数）
  tracking: 0.05,     // 字距 +0.05em
  color: 'primary',   // 主色
  variant: 'display'
});
```

---

## 6. `useDataConnector` (数据连接器)

自动连接 `PageData` 字段与组件 Props 的桥接 Hook。

- **文件**: [src/components/ui/slide/hooks/useDataConnector.ts](src/components/ui/slide/hooks/useDataConnector.ts)

### 6.1 核心功能

```typescript
const { value, visibility } = useDataConnector(page, fieldKey);

// value: 字段的当前值（如 page.title）
// visibility: 可见性开关（如 page.visibility.logo）
```

### 6.2 使用场景

```typescript
// 在原子组件中使用
export const ZineLogo: React.FC<Props> = ({ page, fieldKey = 'logo' }) => {
  const { value, visibility } = useDataConnector(page, fieldKey);
  
  if (!visibility) return null;  // 可见性控制
  
  return <div>{value}</div>;
};
```

### 6.3 可见性字段映射

| fieldKey | visibility 路径 |
|----------|----------------|
| `logo` | `page.visibility.logo` |
| `image` | `page.visibility.image` |
| `footer` | `page.visibility.footer` |
| 其他 | `page.visibility[fieldKey]` |

---

---

## 7. `useDebouncedValue`

高频输入防抖与自动刷盘 Hook，保障流畅输入的同时杜绝数据丢失。

- **文件**: [src/hooks/useDebouncedValue.ts](src/hooks/useDebouncedValue.ts)

### 7.1 接口签名

```typescript
const [value, setValue, flush] = useDebouncedValue<T>(
  initialValue: T,
  onChange: (val: T) => void,
  debounceMs: number = 300,
  onImmediateChange?: (val: T) => void
);
```

### 7.2 核心特性与防丢机制

1. **Unmount 自动刷盘 (Flush on Unmount)**: 
   当输入组件因虚拟滚动（TanStack Virtual）滚出视口而卸载时，若内部存在尚未到期的 300ms 防抖计时器且当前值与初始值不一致，会在 `useEffect` 清理函数中**立即同步执行 `onChangeRef.current(currentValue)`**，彻底根除虚拟列表滚动导致的输入丢失。
2. **主动 `flush()` 刷盘**: 
   暴露第三个返回值 `flush`。在输入框 `onBlur` 或用户按快捷键保存时可主动调用，立即强制提交变更，无需等待防抖延迟。
3. **即时回调**: 支持 `onImmediateChange`，在每次按键触发 `setValue` 时同步通知轻量监听器（如字符计数器），不影响防抖落盘。

---

## 8. `useAssetUrl`

本地与网络资产加载适配器，管理协议解析、MIME 数据包装与图片尺寸缓存。

- **文件**: [src/hooks/useAssetUrl.ts](src/hooks/useAssetUrl.ts)

### 8.1 核心特性

1. **多格式 MIME 映射**:
   在 Electron 本地归档模式下，根据文件真实扩展名精准映射 MIME 类型：
   - `.webp` → `image/webp`
   - `.jpg` / `.jpeg` → `image/jpeg`
   - `.svg` → `image/svg+xml`
   - `.png` → `image/png`
2. **尺寸缓存锁 (Dimension Lock)**:
   针对先命中 URL 缓存但先前实例仍在异步加载尺寸的情况，后挂载组件会自动挂接 Image 探测，确保返回真实宽高而非残留的 `{ width: 0, height: 0 }`。

---

## 9. 其他 Hooks

| Hook | 文件 | 说明 |
| :--- | :--- | :--- |
| `useResponsiveImage` | [hooks/useResponsiveImage.ts](src/hooks/useResponsiveImage.ts) | 处理 `srcset` 与多尺寸图片的按需加载 |
| `useImagePreload` | [hooks/useImagePreload.ts](src/hooks/useImagePreload.ts) | 针对模板预览图的批量预加载 |

---

## 8. Hook 最佳实践

### 8.1 性能优化

**避免全量订阅**：
```typescript
// ❌ 错误：订阅整个 store
const store = useStore();

// ✅ 正确：仅订阅需要的字段
const pages = useStore(s => s.pages);
const currentPage = useStore(s => s.pages[s.currentPageIndex]);
```

**使用 shallow 比较**：
```typescript
import { shallow } from 'zustand/shallow';

// 对于对象/数组，使用 shallow 避免深度比较
const { pages, theme } = useStore(
  s => ({ pages: s.pages, theme: s.theme }),
  shallow
);
```

### 8.2 异步数据加载

```typescript
// 在组件中加载项目数据
useEffect(() => {
  const loadData = async () => {
    try {
      await store.loadProject(projectId);
    } catch (error) {
      console.error('加载失败:', error);
    }
  };
  loadData();
}, [projectId]);
```

### 8.3 防止内存泄漏

```typescript
// 清理定时器和事件监听
useEffect(() => {
  const timer = setInterval(() => {
    // 定期任务
  }, 3000);
  
  return () => clearInterval(timer);
}, []);
```

### 8.4 条件 Hook 调用

```typescript
// ❌ 错误：条件调用 Hook
if (needsAsset) {
  const url = useAssetUrl(assetId);
}

// ✅ 正确：始终调用，条件使用结果
const url = useAssetUrl(needsAsset ? assetId : null);
if (needsAsset && url) {
  // 使用 url
}
```