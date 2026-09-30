# SlideGrid Studio 架构与代码质量深度审查报告
**Comprehensive Code Review & Architecture Audit Report**

- **项目名称**: SlideGrid Studio (`slide-layout-editor`)
- **技术栈**: React 19, TypeScript 5.8, Zustand 4, Vite 6, Electron 39, Tailwind CSS, Framer Motion
- **审查日期**: 2026-09-30
- **审查基准**:
  - 单一职责原则 (SRP)
  - DRY 原则 (Don't Repeat Yourself)
  - 现代化 React 19 & Zustand 单向数据流与状态流转
  - 渲染管线、高频交互与资源开销防泄漏
  - TypeScript 严格类型安全与运行时防御 (Zod / Error Boundary)
  - 项目规范与代码健康度 (`AGENTS.md` 注释规范, ESLint 9)
- **审查结论**: 功能成熟度高，测试覆盖度健全（85 测试文件、729 测试用例通过）；但存在系统级架构双轨维护冗余、上帝组件重度耦合、高频击键整树重渲染、Undo 历史栈 5MB 门限击穿失效、外部输入零运行时校验以及 513 处 `@typescript-eslint/no-explicit-any` 告警（总 ESLint 警告 616 处，3 处构建阻断错误）等关键隐患，亟需实施三阶段演进式重构。

---

## 目录

1. [执行摘要与代码库质量全景大盘 (Executive Summary & Quality Scorecard)](#1-执行摘要与代码库质量全景大盘)
2. [R1. 单一职责原则（SRP）深度审查 (Single Responsibility Principle)](#2-r1-单一职责原则srp深度审查)
   - 2.1 上帝组件 `EditorPage.tsx`：11 重正交职责聚合与解耦方案
   - 2.2 上帝状态 `useStore.ts`：业务数据、快照深拷贝与系统副作用混合
   - 2.3 上帝工具 `db.ts`：持久化、Web Crypto、Canvas 压缩与 ZIP 归档堆砌
   - 2.4 巨石类型 `types.ts`：领域模型、全量页面联合与空目录异味
   - 2.5 `GlobalSettings.tsx`：属性透传丢失与僵尸组件
3. [R2. DRY 原则（不重复自己）复用设计深度审查 (Don't Repeat Yourself)](#3-r2-dry-原则不重复自己复用设计深度审查)
   - 3.1 36 套模板双重维护：JSON 运行态与 TS Schema 孤岛割裂
   - 3.2 印刷几何与装订边距计算三重同构冗余
   - 3.3 文本原子组件三重同构样板代码 (`ZineDisplay` / `ZineBody` / `ZineCaption`)
   - 3.4 编辑器字段浅包装组件爆炸 (10+ 个硬编码包装文件)
   - 3.5 模板默认值合并算法重复堆砌 (`getDefaultPage` vs `mergeDefaults`)
4. [R3. 架构设计与状态流转审查 (Architecture & State Management)](#4-r3-架构设计与状态流转审查)
   - 4.1 模块级全局闭包变量 `uncommittedBaseline` 导致的跨页面撤销历史污染
   - 4.2 双轨 Store 订阅设计破坏 (`JsonTemplateRenderer` vs `useModularStyle`)
   - 4.3 跨层级属性透传瀑布：`GlobalSettings` 16 层 Props Drilling
   - 4.4 隐式全局 Window CustomEvent 事件总线耦合
5. [R4. 渲染性能与资源开销审查 (Rendering Performance & Resource Overhead)](#5-r4-渲染性能与资源开销审查)
   - 5.1 击键整树重渲染雪崩：`useProject` 16 切片聚合引爆 `EditorPage`
   - 5.2 `usePreview.ts` 致命高频依赖导致 ResizeObserver 抖动与缩放重算
   - 5.3 撤销栈 5MB 门限击穿：Base64 字体深拷贝导致 Undo/Redo 永久失效
   - 5.4 拖拽重排高频节流压栈：150ms 快照轰炸历史栈
   - 5.5 全局事件监听器生命周期抖动 (`[currentPage]` 依赖)
   - 5.6 `dimensionCache` 原生 Map 无上限增长引发内存泄漏
6. [R5. 类型安全与异常边界处理审查 (Type Safety & Defensive Engineering)](#6-r5-类型安全与异常边界处理审查)
   - 6.1 513 处 `@typescript-eslint/no-explicit-any` 告警与类型逃逸
   - 6.2 `PageData` 动态索引签名缺失导致的 `(page as any)[key]` 连锁反应
   - 6.3 外部工程导入与模板载入零 Zod 校验
   - 6.4 编辑器操作面板 (`EditorPanel`) 缺失局部 Error Boundary
7. [R6. 项目规范与代码健康度审查 (Conventions & Code Health)](#7-r6-项目规范与代码健康度审查)
   - 7.1 ESLint 致命构建阻断错误分析
   - 7.2 `AGENTS.md` 注释规范系统性违规 (120+ 处单行中英混写)
   - 7.3 死代码与孤立文件清理
8. [R7. 可落地的演进式重构路线图 (Actionable Refactoring Roadmap)](#8-r7-可落地的演进式重构路线图)
   - 8.1 路线图总览与分期规划
   - 8.2 核心重构前后方案详细对比 (Actionable Snippets)
   - 8.3 架构健康度度量指标与 CI 防劣化长效守护机制

---

## 1. 执行摘要与代码库质量全景大盘

SlideGrid Studio (`slidegrid-studio`) 是一款面向桌面 (Electron) 与 Web 运行环境的所见即所得 (WYSIWYG) 幻灯片与 Zine 排版工具。代码库在核心业务实现上具备扎实的排版设计工程底座，引入了先进的 JSON Schema 驱动布局机制，并集成了基于 Web Worker 的 Knuth-Plass (`tex-linebreak`) 动态排版算法。

### 1.1 代码规模与质量基准度量

| 指标维度 | 统计数据 | 状态评估 | 现状说明 |
|---|---|---|---|
| **源码文件总数** | 317 个 (`src/`) | 规模中等 | 包含 TSX (148)、TS (133)、JSON 模板 (36) |
| **源码总行数 (LOC)** | 37,056 行 | 密度较高 | 模板定义 7,529 行，TS/TSX 源码 29,527 行 |
| **单元测试用例** | 85 文件 / 729 用例 | ✅ **通过率 100%** | Vitest 运行耗时 ~6.2s，核心数学与 AST 覆盖健全 |
| **ESLint 9 状态** | 3 Errors / 616 Warnings | ❌ **构建阻断** | 3 个编译报错导致 `pnpm lint` 失败；513 个 `any` 告警，94 个未用变量，9 个 Hook 依赖 |
| **TypeScript 检查** | `tsc --noEmit` 通过 | ⚠️ **虚假安全** | 编译通过高度依赖 `any` 与 `as any` 逃逸，类型收窄失效 |
| **注释规范遵从度** | 120+ 处单行中英混写 | ❌ **违规严重** | 存在大量与 `AGENTS.md` 规范反面教材完全一致的注释 |

### 1.2 问题严重级别分布矩阵 (Severity Distribution Matrix)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        缺陷严重级别分布统计                            │
├───────────────────┬───────┬────────────────────────────────────────────┤
│ 严重级别 (Severity)│ 缺陷数│ 典型影响领域                               │
├───────────────────┼───────┼────────────────────────────────────────────┤
│ 🔴 Critical       │   7   │ 36 模板双重维护 (3.1)、闭包历史污染 (4.1)、│
│                   │       │ 击键重渲染雪崩 (5.1)、ResizeObserver (5.2)、│
│                   │       │ 5MB 撤销栈失效 (5.3)、外部输入零 Zod (6.3) │
│                   │       │ ESLint 致命构建阻断错误 (7.1)              │
├───────────────────┼───────┼────────────────────────────────────────────┤
│ 🟠 Major          │  12   │ 上帝组件 EditorPage (2.1)、Store (2.2)、   │
│                   │       │ db.ts 工具 (2.3)、印刷几何三处同构 (3.2)、 │
│                   │       │ 双轨 Store 订阅 (4.2)、16 层 Props (4.3)、 │
│                   │       │ CustomEvent 耦合 (4.4)、拖拽 150ms (5.4)、 │
│                   │       │ 监听器生命周期抖动 (5.5)、513 处 any (6.1)、│
│                   │       │ PageData 索引缺失 (6.2)、缺失 EB (6.4)    │
├───────────────────┼───────┼────────────────────────────────────────────┤
│ 🟡 Minor          │   7   │ 巨石类型 (2.4)、GlobalSettings 遗漏 (2.5)、│
│                   │       │ 文本原子样板 (3.3)、字段浅包装爆炸 (3.4)、 │
│                   │       │ 模板默认值分歧 (3.5)、无界 Map (5.6)、     │
│                   │       │ 死代码与孤立文件 (7.3)                     │
├───────────────────┼───────┼────────────────────────────────────────────┤
│ 🔵 Suggestion     │   1   │ AGENTS.md 注释合规治理 (7.2) 与 CI 规范    │
├───────────────────┼───────┼────────────────────────────────────────────┤
│ 总计 (Total)      │  27   │ 覆盖架构、DRY、性能、类型安全与工程规范    │
└───────────────────┴───────┴────────────────────────────────────────────┘
```

---

## 2. R1. 单一职责原则（SRP）深度审查

单一职责原则要求每个文件、模块与组件应当“仅有一个引起其变化的原因”。本审查识别出 4 个严重违反 SRP 的巨石模块。

### 2.1 上帝组件 `EditorPage.tsx`：11 重正交职责聚合与解耦方案

- **文件定位**: `src/pages/EditorPage.tsx#L1-L530` (530 行, 31,310 字节)
- **严重级别**: 🟠 **Major (架构核心破坏点)**

#### 职责堆砌分析
`EditorPage.tsx` 是当前前端最严重的巨石容器。经深入调用图分析，该组件聚合了至少 11 项相互正交的职责：

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 src/pages/EditorPage.tsx               │
                               │                (God Component - 530 LOC)               │
                               └───────────────────────────┬────────────────────────────┘
         ┌──────────────────┬──────────────────┬───────────┴───────────┬──────────────────┬──────────────────┐
         ▼                  ▼                  ▼                       ▼                  ▼                  ▼
  [1. 路由与项目加载] [2. 全局事件总线]   [3. 键盘快捷键]          [4. 自动保存定时器] [5. LocalStorage迁移] [6. 缩略图生成维护]
  useParams, search  window CustomEvent  Ctrl+S/Z/Y 窗口劫持     3000ms 防抖落盘     跨版本旧 Key 迁移   30s/300s 轮询更新
         │                  │                  │                       │                  │                  │
         ▼                  ▼                  ▼                       ▼                  ▼                  ▼
  [7. 另存为与文件桥] [8. 3步模态框状态机] [9. 离屏导出调度]     [10. 多格式导出流水线] [11. DOM 爬取提取]   [12. 默认值清洗]
  nativeFs 另存副本  方向/比例/模板切换   Promise 挂载监听         PDF/PNG/ZIP 打包    querySelector 链接  mergeDefaults 兜底
```

1. **路由与项目生命周期管理**: `useParams`, `useSearchParams`, `isNewProject` 判定与加载调度。
2. **全局事件总线绑定**: 监听 `open-layout-browser`、`show-export-modal`、`trigger-import` 等 `window` 自定义事件。
3. **全局键盘快捷键劫持**: 绑定 `keydown` 处理 `Ctrl+S`、`Ctrl+Shift+S`、`Ctrl+Z`、`Ctrl+Y`。
4. **自动保存防抖计时器**: 维护 3000ms 定时器并调度 `saveToDB`。
5. **本地存储历史版本迁移**: 硬编码读取 `magazine_recent_projects` 并迁移至 `slidegrid_recent_projects`。
6. **缩略图生成与索引刷新**: 调度 DOM Canvas 捕获并调用 `upsertRecentProject`。
7. **Native Electron 与 Web 文件系统分支**: 处理文件另存为 (`handleSaveAs`)、Native 路径同步。注意：另存新副本时直接复用原 `id` 而未生成 `crypto.randomUUID()`，导致新旧副本在 IndexedDB 与 RecentProjects 中共用 ID 引发覆写冲突。
8. **3 步交互式模板创建模态框状态机**: 维护 `creationStage` (orientation -> ratio -> template) 及其选择状态。
9. **离屏导出渲染同步**: 维护 `offscreenTarget`、`offscreenResolveRef` 与超时 Promise（resolve 后未清理 15 秒定时器，导致计时器泄漏至事件循环）。
10. **导出引擎全流程实现**: 内联使用 `html-to-image`、`jsPDF`，组织页面循环与 ZIP 打包。
11. **DOM 爬取侵入**: 通过 `el.querySelectorAll('.resume-link')` 直接遍历 DOM 提取超链接坐标打入 PDF（简历模板的外部链接生成逻辑缺少独立封装）。

#### 解耦架构设计
```
┌────────────────────────────────────────────────────────────────────────┐
│                      重构后的模块职责清晰分离架构                      │
├────────────────────────────────┬───────────────────────────────────────┤
│ 抽离模块 / Hook                │ 承接职责                               │
├────────────────────────────────┼───────────────────────────────────────┤
│ `src/hooks/useEditorShortcuts` │ 纯粹监听全局键盘快捷键 (Ctrl+S, Undo/Redo) │
│ `src/hooks/useExportPipeline`  │ 封装 PDF/PNG/ZIP 离屏等待、导出与 DOM 链接爬取 │
│ `src/hooks/useProjectPersistence`│ 封装自动保存防抖、手动保存、另存为及 Electron 路径同步 │
│ `src/components/editor/modals/`│ 将 `LayoutBrowserModal` 与 `ExportModal` 移出主容器 │
│ 精简后的 `EditorPage.tsx`      │ 仅负责布局组装 (TopNav + Sidebar + Preview + Editor) │
└────────────────────────────────┴───────────────────────────────────────┘
```

#### 重构代码示例 (Before & After)

**Before (`src/pages/EditorPage.tsx#L313-L370`)**:
```typescript
// 导出逻辑硬编码在主页面内，包含 DOM 爬取与 PDF 生成
const handleExport = useCallback(async (format: 'png' | 'pdf') => {
  setIsExporting(true);
  try {
    await document.fonts.ready;
    const doc = new jsPDF({ orientation, unit: 'mm', format: [widthMm, heightMm] });
    for (const i of exportIndices) {
      const el = await waitForOffscreenRender(pages[i], i);
      const dataUrl = await toPng(el, opt);
      // 直接爬取 DOM 提取链接
      const links = el.querySelectorAll('.resume-link');
      links.forEach((l: any) => { /* 计算坐标并写入 PDF */ });
      doc.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm);
    }
    doc.save(`${projectTitle}.pdf`);
  } finally {
    setIsExporting(false);
  }
}, [pages, projectTitle, printSettings]);
```

**After (抽离至独立服务 `src/services/exportPipeline.ts` 与 Hook `src/hooks/useExportPipeline.ts`)**:
```typescript
// src/services/exportPipeline.ts
// 遵从 AGENTS.md 注释规范

export interface ExportOptions {
  format: 'png' | 'pdf' | 'zip';
  exportScope?: 'current' | 'all';
  pages: PageData[];
  projectTitle: string;
  printSettings: PrintSettings;
  renderOffscreen: (page: PageData, index: number) => Promise<HTMLElement>;
  onProgress?: (progress: number) => void;
  isCancelled?: () => boolean;
}

/** Executes multi-format export pipeline for PDF, PNG images, or ZIP archives */
export async function executeExportPipeline(options: ExportOptions): Promise<void> {
  const {
    format,
    exportScope = 'all',
    pages,
    projectTitle,
    printSettings,
    renderOffscreen,
    onProgress,
    isCancelled = () => false
  } = options;

  // 1. 等待全部自定义字体与排版资产就绪
  await document.fonts.ready;

  // 2. 检查用户是否已中途取消
  if (isCancelled()) return;

  if (format === 'pdf') {
    // PDF 导出：保留 DOM 链接提取与矢量文本排版
    await exportPagesToPdf({
      pages,
      projectTitle,
      printSettings,
      renderOffscreen,
      onProgress,
      isCancelled
    });
  } else if (format === 'png' && exportScope === 'current') {
    // 单页导出：直接保存单张图片，不打包压缩文件
    await exportSinglePageToPng({
      page: pages[0],
      projectTitle,
      renderOffscreen
    });
  } else {
    // 多页导出或归档格式：统一打包为压缩包（桌面端支持直接输出目录）
    await exportPagesToZipArchive({
      pages,
      projectTitle,
      renderOffscreen,
      onProgress,
      isCancelled
    });
  }
}
```

---

### 2.2 上帝状态 `useStore.ts`：业务数据、快照深拷贝与系统副作用混合

- **文件定位**: `src/store/useStore.ts#L1-L615` (615 行, 23,267 字节)
- **严重级别**: 🟠 **Major**

#### 职责堆砌分析
`useStore` 维护了 35 个状态字段与动作，将以下职责混在一个单例对象中：
1. **工程业务模型管理**: `pages`, `projectTitle`, `theme`, `designSystem`, `printSettings`。
2. **跨页面数据自动广播**: `updatePage` 中遍历 `GLOBAL_FIELDS`（页脚、页码、品牌字体等）强制同步至所有页。
3. **Undo/Redo 历史引擎**: 快照构建 (`buildSnapshot`)、深拷贝 (`structuredClone`)、大小检测 (`JSON.stringify` 5MB)、等值判定 (`isEqualSnapshot`)。
4. **外部存储驱动与数据迁移**: `loadProject` 内部直接调用 IndexedDB 的 `getProject(id)`，并直接触发 `migrateToV3(data)`。
5. **DOM 副作用侵入**: `loadCustomFontsIntoDOM()` 在 store 方法中被直接同步调用，违背状态与 DOM 渲染解耦原则。
6. **Electron IPC 副作用**: `loadProject` 直接调用 `nativeFs.setCurrentProject(projectId, title)`。需要注意：在 `useStore.test.ts#L355` 中显式断言了该 IPC 行为，进行切片解耦时必须保持该接口契约向后兼容。
7. **全局测试夹具暴露**: `(window as any).__SLIDEGRID_STORE__ = useStore;`。经全工程测试链路溯源，该句柄并非无意识的“代码调试残留”，而是 Playwright E2E 测试套件（如 `02-editor-workflow.spec.ts`、`04-all-templates-gallery.spec.ts`、`06-visual-asset-and-image-geometry.spec.ts`、`08-project-persistence-and-storage.spec.ts`、`09-undo-redo-and-keyboard-shortcuts.spec.ts`、`10-direction-switcher-and-json-templates.spec.ts` 等 6 套测试）进行页面状态注入与断言的核心测试夹具。不可简单粗暴删除，而应使用环境守卫进行收敛：`if (process.env.NODE_ENV !== 'production' || (window as any).__PLAYWRIGHT_TEST__)`。

#### 切片化 (Slice Pattern) 架构设计
```
┌────────────────────────────────────────────────────────────────────────┐
│                        Zustand Store 切片解耦架构                      │
├────────────────────────────────────────────────────────────────────────┤
│  src/store/                                                            │
│   ├── index.ts               # 聚合各个 Slice 的根 Store 导出          │
│   ├── slices/                                                          │
│   │    ├── projectSlice.ts   # pages, projectTitle, currentPageIndex   │
│   │    ├── styleSlice.ts     # theme, designSystem, customFonts        │
│   │    ├── printSlice.ts     # printSettings, layout configuration     │
│   │    └── historySlice.ts   # past, future, pushHistory, undo, redo   │
│   └── middleware/                                                      │
│        └── undoMiddleware.ts # 专业的撤销重做轻量级中间件              │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 上帝工具 `db.ts`：持久化、Web Crypto、Canvas 压缩与 ZIP 归档堆砌

- **文件定位**: `src/utils/db.ts#L1-L320` (320 行, 11,141 字节)
- **严重级别**: 🟠 **Major**

#### 职责堆砌分析
`db.ts` 名为数据库工具，实际充当了基础设施层的大杂烩：
1. **IndexedDB 核心 CRUD**: `initDB`, `saveProject`, `getProject`, `deleteProject`。
2. **密码学哈希计算**: 使用 Web Crypto API 的 `crypto.subtle.digest('SHA-256', buffer)` 计算图片指纹。
3. **MIME 类型探测**: 读取 ArrayBuffer 头部魔数判定 PNG/JPEG/WEBP。
4. **Canvas 图像处理**: 创建离屏 `<canvas>`、`drawImage`、并调用 `canvas.toDataURL('image/jpeg', 0.8)` 压缩大图。
5. **DOM 动态下载器**: 动态创建 `<a>` 标签，挂载 `href = URL.createObjectURL(blob)`，触发 `click()` 并注销。
6. **ZIP 归档解压与打包**: 使用 `JSZip` 遍历解压 `.slgrid` 文件，解析 `project.json` 及素材目录。

#### 模块拆解方案
- `src/utils/storage/projectDb.ts`: 纯粹的 IndexedDB 读写接口。
- `src/utils/storage/assetHasher.ts`: Web Crypto SHA-256 计算与二进制 MIME 探测。
- `src/utils/media/canvasCompressor.ts`: Canvas 图像压缩与缩略图离屏渲染。
- `src/utils/archive/zipArchive.ts`: JSZip 打包与 `.slgrid` 工程解构。
- `src/utils/dom/fileDownload.ts`: 统一安全的 Blob 下载辅助函数。

---

### 2.4 巨石类型 `types.ts`：领域模型、全量页面联合与空目录异味

- **文件定位**: `src/types.ts#L1-L371` (371 行, 9,194 字节)
- **严重级别**: 🟡 **Minor**

#### 现状分析
`src/types.ts` 汇聚了整套系统 371 行的全部类型。特别值得注意的是：
- 项目根目录下原本存在 `src/types/` 目录，但该目录是**完全为空的幽灵目录**！
- `PageData` 是一个多达 50 个字段的 Mega-Interface，不仅包含了通用字段（`title`, `subtitle`, `aspectRatio`），还平铺了所有模板的专用数据结构（`vocabItems`, `agenda`, `features`, `metrics`, `mosaic`, `bentoItems`, `resumeSections`）。

#### 规范化目录迁移结构
```
src/types/
 ├── index.ts          # 统一聚合重导出
 ├── core.ts           # AspectRatioType, OrientationType, CounterStyle
 ├── tokens.ts         # DesignSystem, TypographyToken, ColorTokens
 ├── print.ts          # PrintSettings, PrintBindingConfig
 ├── page.ts           # BasePageData, PageData, Specific Template Data
 └── project.ts        # ProjectData, ProjectSaveData, RecentProjectEntry
```

---

### 2.5 `GlobalSettings.tsx`：属性透传丢失与僵尸组件

- **文件定位**: `src/components/editor/GlobalSettings.tsx#L1-L173`
- **严重级别**: 🟡 **Minor**

#### 缺陷事实
1. **僵尸组件**: `ColorToken` 组件（`#L29-L39`）在文件顶部局部声明 (`const ColorToken = ...`)，但在整个文件中没有任何一处使用，全项目也没有任何外部引用且未被导出，属于死代码残留。
2. **Props 虚假声明与丢弃**:
   - `GlobalSettingsProps` 接口（`#L15-L25`）声明了 `theme`, `setTheme`, `counterColor`, `setCounterColor`。
   - `EditorPage.tsx#L452-L460` 在调用 `<GlobalSettings />` 时完整传入了这 4 个属性。
   - 但在 `GlobalSettings.tsx#L43-L48` 的解构签名中：
     ```typescript
     export default function GlobalSettings({
       isOpen, onClose, page, onUpdate,
       customFonts, setCustomFonts, imageQuality, setImageQuality,
       minimalCounter, setMinimalCounter, counterStyle, setCounterStyle,
       printSettings, setPrintSettings,
     }: GlobalSettingsProps)
     ```
     `theme`、`setTheme`、`counterColor`、`setCounterColor` **被完全遗漏解构**！导致在全局设置弹窗中，主题颜色与计数器颜色的设置项完全无法生效或根本未被渲染。

---

## 3. R2. DRY 原则（不重复自己）复用设计深度审查

DRY 原则强调“系统中的每一项知识都必须具有单一、明确且权威的表述”。审查发现了严重的架构级双轨重复。

### 3.1 36 套模板双重维护：JSON 运行态与 TS Schema 孤岛割裂

- **文件定位**: 
  - 运行时源: `src/templates/definitions/**/*.json` (36 个文件, 7,529 行)
  - 孤立代码源: `src/templates/schemas/**/*.ts` (36 个文件, ~4,000 行)
  - 预加载漏洞: `src/App.tsx#L10-L22`
- **严重级别**: 🔴 **Critical (严重冗余与维护陷阱)**

#### 事实证据与机制剖析
系统当前存在两套平行的模板定义：
1. **运行态体系**: `src/templates/registry.ts` 通过 Vite Glob 机制：
   ```typescript
   // src/templates/registry.ts#L38
   const modules = import.meta.glob('./definitions/**/*.json', { eager: true });
   ```
   载入了 36 个 JSON 模板定义文件。无论是编辑器左侧列表、画布渲染还是模板切换器，**全部消费这 36 个 JSON 文件**。
2. **幽灵 TS Schema 体系**: 在 `src/templates/schemas/` 目录下（如 `Universal-Cover/cinematic-bleed.ts`），保留了 36 个 TS 文件，由 `src/templates/schemas/index.ts` 集中导出。这 36 个 TS 文件包含完整的 AST 树对象，与对应的 JSON 内容几乎 100% 相同。
3. **App.tsx 预加载 Bug**: 在 `src/App.tsx#L10-L15` 中：
   ```typescript
   const commonTemplates = [
     () => import('./templates/schemas/Universal-Product/modern-feature'),
     () => import('./templates/schemas/Universal-Marketing/platform-hero'),
     () => import('./templates/schemas/Universal-General/table-of-contents'),
   ];
   ```
   `App.tsx` 在空闲时动态加载了这 3 个 TS 模块。然而，运行时的 `registry.ts` 使用的是 JSON，导致动态加载进内存的这 3 个 TS 模块完全是无用功，白白浪费网络带宽与浏览器内存。

#### 重构方案
- 确立 **Single Source of Truth**：保留 `src/templates/definitions/**/*.json` 作为模板唯一权威来源。
- 移除 `src/templates/schemas/` 下的重复 TS 模板定义（保留 AST 解析器、验证器与 LayoutRenderer 等基础设施）。
- 修正 `App.tsx` 中的预加载逻辑，改为按需预热 JSON 注册表。

---

### 3.2 印刷几何与装订边距计算三重同构冗余

- **文件定位**:
  1. `src/pages/EditorPage.tsx#L297-L311` (`getExportDimensions`)
  2. `src/hooks/usePreview.ts#L33-L48` (`calculateFitZoom`)
  3. `src/components/Preview.tsx#L45-L64` (画布渲染样式)
- **严重级别**: 🟠 **Major**

#### 重复代码对比
以下为三处代码的核心算法片段：

```typescript
// 1. EditorPage.tsx#L297-L311
const designDims = LAYOUT_CONFIG[(page.aspectRatio || '16:9') as AspectRatioType];
if (printSettings?.enabled) {
  const orientation = designDims.orientation;
  const config = (printSettings?.configs && (printSettings.configs[orientation as keyof typeof printSettings.configs] || printSettings.configs['resume'])) || { bindingSide: 'left', trimSide: 'bottom' };
  const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
  const netWidthMm = isHorizontalBinding ? (printSettings.widthMm - printSettings.gutterMm) : printSettings.widthMm;
  const ppi = designDims.width / Math.max(1, netWidthMm);
  return { width: Math.round(printSettings.widthMm * ppi), height: Math.round(printSettings.heightMm * ppi) };
}

// 2. usePreview.ts#L33-L48
// 几乎一模一样的 orientation, config, isHorizontalBinding, netWidthMm, ppi 计算...

// 3. Preview.tsx#L45-L64
// 同样的分支判断，但额外计算了 scaleW, scaleH, scaleFactor, gutterPx...
```

#### 抽离纯函数设计
```typescript
// src/utils/printGeometry.ts
// 遵从 AGENTS.md 注释规范

export interface PrintLayoutResult {
  /** Screen preview viewport geometry */
  preview: {
    canvasWidth: number;
    canvasHeight: number;
    scaleFactor: number;
    gutterPx: number;
  };
  /** Offscreen rasterization and physical export geometry */
  export: {
    targetWidth: number;
    targetHeight: number;
    ppi: number;
    gutterPx: number;
  };
}

/** Computes print layout geometry, bleed and scale factors for preview and export */
export function calcPrintLayoutGeometry(
  aspectRatio: AspectRatioType = '16:9',
  printSettings?: PrintSettings
): PrintLayoutResult {
  const designDims = LAYOUT_CONFIG[aspectRatio] || LAYOUT_CONFIG['16:9'];
  
  if (!printSettings?.enabled) {
    return {
      preview: {
        canvasWidth: designDims.width,
        canvasHeight: designDims.height,
        scaleFactor: 1,
        gutterPx: 0
      },
      export: {
        targetWidth: designDims.width,
        targetHeight: designDims.height,
        ppi: 1,
        gutterPx: 0
      }
    };
  }

  const { widthMm, heightMm, gutterMm, configs } = printSettings;
  const orientation = designDims.orientation;
  const config = (configs && (configs[orientation] || configs['resume'])) || { bindingSide: 'left', trimSide: 'bottom' };
  
  const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
  
  // 1. 水平装订：扣除左右装订线
  // 2. 垂直装订：扣除上下天头地脚装订线
  const netWidthMm = isHorizontalBinding ? Math.max(1, widthMm - gutterMm) : widthMm;
  const netHeightMm = !isHorizontalBinding ? Math.max(1, heightMm - gutterMm) : heightMm;
  
  // 针对水平与垂直装订分别根据净物理尺寸推导 PPI
  const exportPpi = isHorizontalBinding
    ? designDims.width / netWidthMm
    : designDims.height / netHeightMm;

  // 物理光栅化膨胀像素
  const exportTargetWidth = Math.round(widthMm * exportPpi);
  const exportTargetHeight = Math.round(heightMm * exportPpi);
  const exportGutterPx = Math.round(gutterMm * exportPpi);

  // 屏幕视口内固定尺寸基准：外框固定为设计像素，内容等比缩小
  const previewScaleW = netWidthMm / widthMm;
  const previewScaleH = netHeightMm / heightMm;
  const previewScaleFactor = Math.min(previewScaleW, previewScaleH);
  const previewGutterPx = Math.round(gutterMm * (designDims.width / widthMm));

  return {
    preview: {
      canvasWidth: designDims.width,
      canvasHeight: designDims.height,
      scaleFactor: previewScaleFactor,
      gutterPx: previewGutterPx
    },
    export: {
      targetWidth: exportTargetWidth,
      targetHeight: exportTargetHeight,
      ppi: exportPpi,
      gutterPx: exportGutterPx
    }
  };
}
```

---

### 3.3 文本原子组件三重同构样板代码 (`ZineDisplay` / `ZineBody` / `ZineCaption`)

- **文件定位**:
  - `src/components/ui/slide/atoms/ZineDisplay.tsx#L1-L80`
  - `src/components/ui/slide/atoms/ZineBody.tsx#L1-L93`
  - `src/components/ui/slide/atoms/ZineCaption.tsx#L1-L75`
- **严重级别**: 🟡 **Minor**

#### 重复度分析
三个组件在结构上存在 90% 的完全重复：
1. 均提取 `designSystem` 与主题配置；
2. 均调用 `useDataConnector(fieldKey, page, defaultFallback)`；
3. 均调用 `useModularStyle({ page, fieldKey, variant, props, ... })`；
4. 均检查是否可见与内容有效性；
5. 均调用 `resolveDockingStyle(style, overrides)`；
6. 最终均渲染底层 `<Text ...>`。

三者唯一的差别仅在于默认的 `variant` ('display' | 'body' | 'caption')、语义标签 (`h1` vs `div`) 以及默认颜色 Token ('primary' | 'secondary')。

#### 统一基类组件设计
```typescript
// src/components/ui/slide/atoms/ZineTextAtom.tsx
// 遵从 AGENTS.md 注释规范

export interface ZineTextAtomProps {
  page: PageData;
  fieldKey?: string;
  text?: string;
  defaultFallbackKey?: keyof PageData;
  defaultVariant: 'display' | 'body' | 'caption';
  defaultColorToken?: keyof DesignSystem['tokens']['colors'] | string;
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  as?: React.ElementType;
  baseClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  dropCap?: boolean;
  autoFit?: boolean;
  maxSize?: number;
  minSize?: number;
  lineHeight?: number;
  designSystem?: DesignSystem;
  theme?: ProjectTheme;
  children?: React.ReactNode;
  [key: string]: any;
}

/** Base text atom component coordinating data connection and modular styling */
export const ZineTextAtom: React.FC<ZineTextAtomProps> = ({
  page,
  fieldKey,
  text,
  defaultFallbackKey,
  defaultVariant,
  defaultColorToken = 'primary',
  orientation = 'horizontal',
  as: Component = 'div',
  baseClassName = '',
  className = '',
  style: customStyle,
  dropCap = false,
  autoFit = false,
  maxSize,
  minSize,
  lineHeight,
  designSystem: propsDs,
  theme: propsTheme,
  children,
  ...otherProps
}) => {
  // 消费上层传递的排版系统，彻底解除原子组件内部对全局 Store 的冗余直连
  const ds = propsDs || DEFAULT_DESIGN_SYSTEM;

  const fallback = text || (fieldKey ? (page as any)[fieldKey] : (defaultFallbackKey ? page[defaultFallbackKey] : undefined));
  const { content, overrides, isVisible } = useDataConnector(fieldKey, page, fallback);

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: {
      color: (ds.tokens.colors as any)?.[defaultColorToken as string] || defaultColorToken,
      ...otherProps
    },
    variant: defaultVariant,
    orientation: orientation as any,
    customStyle,
    className
  });

  // 守卫检查：不可见或既无文本内容又无子节点时跳过渲染
  if (!isVisible || (!content && !children)) return null;
  const finalStyle = resolveDockingStyle(style, overrides);

  // 首字下沉排版分支：独立浮动放大首字母，其余内容继续排版
  if (dropCap && content && typeof content === 'string') {
    const accentColor = (ds.tokens.colors as any)?.accent || '#264376';
    return (
      <Component
        className={`zine-text-atom ${baseClassName} whitespace-pre-line relative overflow-hidden ${resolvedClassName}`}
        style={finalStyle}
      >
        <span
          className="float-left font-black select-none mr-4 leading-none"
          style={{ fontSize: '4rem', marginTop: '0.2rem', color: accentColor }}
        >
          {content.charAt(0)}
        </span>
        <Text content={content.slice(1)} sanitize={true} />
      </Component>
    );
  }

  return (
    <Text
      as={Component}
      content={content}
      autoFit={autoFit}
      maxSize={maxSize}
      minSize={minSize}
      lineHeight={lineHeight}
      style={finalStyle}
      className={`zine-text-atom ${baseClassName} whitespace-pre-line ${resolvedClassName}`}
    >
      {children}
    </Text>
  );
};
```
重构后，`ZineDisplay`、`ZineBody`、`ZineCaption` 可退化为各 10 行的轻量声明式高阶导出。

---

### 3.4 编辑器字段浅包装组件爆炸 (10+ 个硬编码包装文件)

- **文件定位**: `src/components/editor/fields/*.tsx` (包含 37 个文件)
- **严重级别**: 🟡 **Minor**

#### 现状调查
在 `src/components/editor/fields/` 下，存在大量以下形态的代码文件：
- `ImageLabelField.tsx` (31 行)
- `ImageSubLabelField.tsx` (31 行)
- `ParagraphField.tsx` (28 行)
- `ParagraphZHField.tsx` (31 行)
- `QuoteZHField.tsx` (29 行)
- `SideHeaderField.tsx` (30 行)
- `ActionTextField.tsx` (31 行)

这些文件仅有的内容就是调用 `GenericTextField`，并把 `fieldKey="imageLabel"`, `label="图片标签"`, `placeholder="请输入..."` 硬编码写入。这导致 `FieldRenderer.tsx` 需要维护一张超过 50 行的 `componentMap` 静态字典。

#### 重构设计
将这些简单文本字段统一由配置驱动：在 `FieldRenderer.tsx` 中建立默认规则，凡是未在复杂 VisualDesigner 注册表中的文本型字段，统一使用 `GenericTextField` 配合字段元数据自动渲染，直接删除这 10 余个浅包装文件。

---

### 3.5 模板默认值合并算法重复堆砌 (`getDefaultPage` vs `mergeDefaults`)

- **文件定位**:
  - `src/store/useStore.ts#L38-L50` (`getDefaultPage`)
  - `src/pages/EditorPage.tsx#L268-L282` (`mergeDefaults`)
- **严重级别**: 🟡 **Minor**

#### 逻辑冲突证据
在 `useStore.ts` 中：
```typescript
if (templateConfig?.defaultData) {
  Object.assign(base, templateConfig.defaultData); // 直接浅拷贝覆盖
}
```
而在 `EditorPage.tsx` 中：
```typescript
if (templateConfig?.defaultData) {
  for (const [k, v] of Object.entries(templateConfig.defaultData)) {
    if ((merged as any)[k] === undefined || (merged as any)[k] === null) {
      (merged as any)[k] = v; // 仅在 undefined 或 null 时覆盖
    }
  }
}
```
两处实现处理默认值的逻辑微妙不同。在新增页面与切换模板时，会导致同一个字段在不同入口表现出不一致的覆盖行为。应统一抽象至 `src/utils/templateDefaults.ts`。

---

## 4. R3. 架构设计与状态流转审查

### 4.1 模块级全局闭包变量 `uncommittedBaseline` 导致的跨页面撤销历史污染

- **文件定位**: `src/store/useStore.ts#L114`, `#L337-L360`, `#L368-L393`
- **严重级别**: 🔴 **Critical (历史栈数据完整性破坏)**

#### 机制与复现路径分析
`useStore.ts` 的第 114 行声明了一个脱离 Zustand 实例的模块级全局变量：
```typescript
let uncommittedBaseline: HistorySnapshot | null = null;
```
当用户在输入框中打字时，防抖机制会触发 `updatePage(nextPage, /* silent */ true)`，此时 `uncommittedBaseline` 被初始化为编辑前的快照，以便在输入结束时压入一条完整的修改记录。

**竞争与历史错乱时序图**:
```
User (Page 1)            Store (useStore.ts)           User clicks Page 2           Store (useStore.ts)
     │                           │                              │                           │
     ├── 键入字符 'X' ──────────►│                              │                           │
     │   (silent: true)          ├─ uncommittedBaseline = [P1]  │                           │
     │                           │                              │                           │
     │                           │◄──── 切换到第 2 页 ──────────┤                           │
     │                           │      setCurrentPageIndex(1)  │                           │
     │                           │      (未重置 baseline!)       │                           │
     │                           │                              │                           │
     │                           │                              ├── 失焦编辑 P2 ───────────►│
     │                           │                              │   (silent: false)         ├─ 发现 baseline 存在！
     │                           │                              │                           ├─ 将 [P1] 与当前状态比对
     │                           │                              │                           └─ 把 [P1] 压入撤销栈！
     │                           │                              │                                   │
     │◄── 按 Ctrl+Z ─────────────┴──────────────────────────────┴───────────────────────────────────┘
          结果：第 2 页的编辑不仅被撤回，第 1 页输入了一半的数据也被强行回滚！
```

#### 修复方案
将 `uncommittedBaseline` 移入 Store 状态或在 `setCurrentPageIndex`、`loadProject`、`undo`、`redo` 每一个状态转移前强制执行 `commitUncommittedBaseline(get())`。

---

### 4.2 双轨 Store 订阅设计破坏 (`JsonTemplateRenderer` vs `useModularStyle`)

- **文件定位**:
  - `src/components/JsonTemplateRenderer.tsx#L19-L30`
  - `src/components/ui/slide/hooks/useModularStyle.ts#L36-L37`
  - `src/components/ui/slide/atoms/ZineBody.tsx#L39-L40`
- **严重级别**: 🟠 **Major**

#### 架构背离事实
`JsonTemplateRenderer.tsx#L19-L21` 写有明确的架构设计意图：
> “在此处订阅 useStore，以 props 向下传参，避免 LayoutRenderer 递归渲染时每个节点都触发 store 订阅产生级联重渲染。”

然而在底层的 `useModularStyle.ts#L36-L37` 中：
```typescript
const ds = useStore(s => s.designSystem);
const theme = useStore(s => s.theme);
```
所有叶子原子组件（数十个）通过 Hook **重新直连订阅了全局 Store**。更严重的是，`ZineBody.tsx#L39` 本身额外又订阅了一次 `useStore(s => s.designSystem)`。
这种双轨制让顶层的 Props 下传变成了纯粹的多余消耗，一旦主题或 DesignSystem 变动，自顶向下的 Props 更新与叶子节点的广播更新同时触发，造成渲染树内部无序的重复调和。

---

### 4.3 跨层级属性透传瀑布：`GlobalSettings` 16 层 Props Drilling

- **文件定位**: `src/pages/EditorPage.tsx#L447-L464`
- **严重级别**: 🟠 **Major**

#### 透传链路
```
useStore (Global) ──► useProject (Hook) ──► EditorPage (Page) ──► GlobalSettings (Modal)
                        (订阅 16 属性)       (解构 26 属性)       (透传 16 个 Props)
```
`GlobalSettings` 位于一个完全隔离的弹窗中，它所需的状态全都在全局 Store 中。`EditorPage` 作为主视口容器，却充当了冗长的“数据搬运工”，代码长达 20 余行。当用户在弹窗中修改计数器样式时，主编辑页面不得不跟着执行一次全量重渲染。

---

### 4.4 隐式全局 Window CustomEvent 事件总线耦合

- **文件定位**:
  - 触发点: `src/hooks/useProject.ts#L48-L56`
  - 监听点: `src/pages/EditorPage.tsx#L170-L179`
- **严重级别**: 🟠 **Major**

#### 缺陷分析
```typescript
// useProject.ts
window.dispatchEvent(new CustomEvent('show-export-modal'));
window.dispatchEvent(new CustomEvent('trigger-import'));
```
现代 React 架构中，在同一 SPA 内部滥用底层 DOM 的 `window.dispatchEvent` 进行业务通讯是严重的代码异味（Code Smell）。这切断了组件调用链的 TypeScript 类型推导，隐藏了状态依赖，且容易在热更新或测试环境下造成事件丢失或多次触发。应将这类模态框的开闭状态收敛至 Zustand UI Slice 或 React Context 中。

---

## 5. R4. 渲染性能与资源开销审查

### 5.1 击键整树重渲染雪崩：`useProject` 16 切片聚合引爆 `EditorPage`

- **文件定位**: `src/hooks/useProject.ts#L9-L24`, `src/pages/EditorPage.tsx#L34-L43`
- **严重级别**: 🔴 **Critical (核心交互性能瓶颈)**

#### 渲染风暴调用链
在 `useProject.ts` 中，Hook 一次性聚合了 Store 的 16 个属性：
```typescript
const pages = useStore(s => s.pages);
const projectTitle = useStore(s => s.projectTitle);
const theme = useStore(s => s.theme);
const currentPageIndex = useStore(s => s.currentPageIndex);
...
const hasUnsavedChanges = useStore(s => s.hasUnsavedChanges);
```
当用户在编辑框中敲入一个字符：
1. `updatePage` 更新当前页并设置 `hasUnsavedChanges = true`；
2. `useProject` 内部的 `pages` 与 `hasUnsavedChanges` 订阅同时命中；
3. `useProject` 返回一个全新的大对象；
4. `EditorPage` 检测到 Hook 返回值变化，**无条件触发重渲染**；
5. `TopNav`、`Sidebar`、`PreviewArea`（均未包裹 `React.memo`）随之执行重渲染；
6. `Preview` 触发虚拟 DOM 递归对比，向 Web Worker 重新发送排版请求。
**实测结果**: 用户每键入一个字符，页面中数十个不相关的组件无一幸免地全部被强制执行调和对比。

---

### 5.2 `usePreview.ts` 致命高频依赖导致 ResizeObserver 抖动与缩放重算

- **文件定位**: `src/hooks/usePreview.ts#L54, #L82`
- **严重级别**: 🔴 **Critical**

#### 缺陷事实
```typescript
// src/hooks/usePreview.ts#L21-L54
const calculateFitZoom = useCallback(() => {
  ...
  const currentPage = pages[currentPageIndex];
  const designDims = LAYOUT_CONFIG[(currentPage.aspectRatio || '16:9') as AspectRatioType];
  ...
}, [pages, currentPageIndex, printSettings, isLoaded]); // ❌ 错误：依赖了全量 pages 数组！

useEffect(() => {
  const observer = new ResizeObserver(...);
  observer.observe(previewContainerRef.current);
  return () => observer.disconnect();
}, [isAutoFit, calculateFitZoom, isLoaded]); // ❌ calculateFitZoom 变动导致 observer 销毁重建
```
`calculateFitZoom` 实际只需要当前页面的 `aspectRatio` 标量字符串。但因为其依赖项写了整个 `pages` 数组，导致**用户每一次键盘击键，`calculateFitZoom` 引用都会更新**。进而导致绑定的 `ResizeObserver` 在每一次打字时被强制 `disconnect()` 并重新创建，引发视口计算抖动与潜在的掉帧。

---

### 5.3 撤销栈 5MB 门限击穿：Base64 字体深拷贝导致 Undo/Redo 永久失效

- **文件定位**: `src/store/useStore.ts#L71-L83`, `#L318-L328`
- **严重级别**: 🔴 **Critical (不可逆功能失效)**

#### 机制剖析
在 `buildSnapshot` 中：
```typescript
const buildSnapshot = (state: ProjectState): HistorySnapshot => ({
  pages: deepClone(state.pages),
  ...
  customFonts: deepClone(state.customFonts), // ❌ 包含多兆字节 Base64 dataUrl
});
```
在 `pushHistory` 中设置了 5MB 的硬安全门限：
```typescript
const MAX_SNAPSHOT_SIZE = 5 * 1024 * 1024; // 5MB
const actualSize = JSON.stringify(snapshot).length;
if (actualSize > MAX_SNAPSHOT_SIZE) {
  console.warn(`Snapshot too large, skipping history`);
  return; // ❌ 超过 5MB 直接丢弃，不压入栈！
}
```
**严重后果**:
中文字体文件通常在 2~4MB，转为 Base64 后增大约 33%（可达 3~5.5MB）。只要用户上传了 1 个自定义字体，**后续用户的每一次正常幻灯片修改，其快照体积都会超出 5MB**。
系统会直接跳过历史记录压栈，导致该工程的 **Undo/Redo（撤销/重做）功能永久失效**，且控制台持续报警。

#### 修复与保全设计 (Font Serialization & Rehydration)
在快照中无需保存字体二进制数据（IndexedDB 中已有持久化），快照只需保留字体的 `{ name, family }` 元数据引用即可，快照体积立即下降 99.9%。

**关键防御约束**: 剥离二进制数据必须在 `undo()` 与 `redo()` 历史恢复逻辑中配合**字体保全（Font Rehydration）**：
快照恢复时，必须将快照中的字体元数据与当前内存中的字体二进制字典 (`binaryMap`) 进行合并恢复；若直接将缺失 `dataUrl` 的快照对象覆写回 `state.customFonts`，后续触发自动保存或另存为时，将导致持久化数据中的字体二进制被洗掉，引发自定义字体永久损毁。

---

### 5.4 拖拽重排高频节流压栈：150ms 快照轰炸历史栈

- **文件定位**: 
  - `src/components/editor/virtual-page-list/useDragReorder.ts#L51-L56`
  - `src/store/useStore.ts#L493-L500`
- **严重级别**: 🟠 **Major**

#### 缺陷事实
在缩略图列表拖拽排序时：
```typescript
// useDragReorder.ts
// 节流处理 (150ms)
if (now - lastReorderRef.current < 150) return;
commitReorder(index); // 触发 onReorderPages
```
而 `useStore.ts#L496` 的 `reorderPages` 方法内部：
```typescript
reorderPages: (newPages) => {
  commitUncommittedBaseline(get());
  get().pushHistory(); // ❌ 每次调用都深拷贝压栈！
  set({ pages: newPages, hasUnsavedChanges: true });
}
```
当用户把第 1 张幻灯片拖拽滑过 5 张幻灯片时，每 150ms 就会执行一次 `pushHistory()`。一次简单的拖放操作会在历史栈中硬塞进 4~5 个微小的中间拖拽位移状态。用户若想撤回这次拖拽，必须按 5 次 `Ctrl+Z` 才能复原，严重破坏操作直觉与内存。

---

### 5.5 全局事件监听器生命周期抖动 (`[currentPage]` 依赖)

- **文件定位**: `src/pages/EditorPage.tsx#L170-L179`
- **严重级别**: 🟠 **Major**

```typescript
useEffect(() => {
  const handleOpenBrowser = (e: any) => { ... };
  window.addEventListener('open-layout-browser', handleOpenBrowser);
  window.addEventListener('show-export-modal', handleShowExportModal);
  window.addEventListener('trigger-import', handleTriggerImport);
  return () => {
    window.removeEventListener('open-layout-browser', handleOpenBrowser);
    ...
  };
}, [currentPage]); // ❌ 依赖了 currentPage
```
`currentPage` 随着用户打字而不断更新。导致这 3 个全局自定义事件监听器在用户的每一次敲键时，都被注销并重新挂载一次。

---

### 5.6 `dimensionCache` 原生 Map 无上限增长引发内存泄漏

- **文件定位**: `src/hooks/useAssetUrl.ts#L9`
- **严重级别**: 🟡 **Minor**

`useAssetUrl.ts` 中针对图片的宽高数据建立了全局缓存：
```typescript
const dimensionCache = new Map<string, ImageDimensions>();
```
对比旁边的 `assetCache` 使用了带有 100 容量淘汰机制的 `LRUCache`，`dimensionCache` 却使用了原生 `Map`，且没有提供任何清理、淘汰或重置入口。在长期运行的编辑会话中，若用户频繁切换几十个工程或导入数百张图片，该缓存将持续占有内存。

---

## 6. R5. 类型安全与异常边界处理审查

### 6.1 513 处 `@typescript-eslint/no-explicit-any` 告警与类型逃逸

- **文件定位**: 全项目扫描
- **严重级别**: 🟠 **Major**

全库执行 `pnpm lint` 产生 3 处构建阻断错误与 616 处警告。规则细分统计如下：
- `@typescript-eslint/no-explicit-any`: 513 处（核心类型逃逸点）
- `@typescript-eslint/no-unused-vars`: 94 处
- `react-hooks/exhaustive-deps`: 9 处
- `prefer-const`: 3 处

核心数据流与模板解析中的类型逃逸尤其严重：
1. `src/pages/Dashboard.tsx#L22, #L78, #L114, #L211`: 全部 project 变量均标注为 `any`，完全抛弃了已有的 `RecentProjectEntry` 强类型。
2. `src/store/useStore.ts#L16, #L20, #L219`: `(TEMPLATES as any[])`, `templateConfig?: any`, `let projectData: any = null`。
3. `src/templates/schemas/renderer/basePropsResolver.ts#L84` 与 `src/templates/schemas/zIndexResolver.ts#L38, #L189`: 存在针对 AST 节点的 `(node as any)` 强转与动态属性访问。
4. `src/templates/schemas/expressionEvaluator.ts#L6`: 上下文接口使用 `[key: string]: any` 逃逸，且解析方法缺乏精确的 AST 节点类型推导。

---

### 6.2 `PageData` 动态索引签名缺失导致的 `(page as any)[key]` 连锁反应

- **文件定位**: `src/types.ts#L171-L270`, `src/components/editor/fields/*.tsx`
- **严重级别**: 🟠 **Major**

#### 根因分析
在所有编辑字段组件（如 `GenericTextField.tsx#L49`、`ZineDisplay.tsx#L45`）中，普遍存在以下模式：
```typescript
const value = ((page as any)[fieldKey] as string) || '';
```
这是因为 `PageData` 虽然定义了丰富的字段，但没有约束动态字段访问的索引签名。开发者为了让代码通过编译，只能在所有访问动态属性的地方强制使用 `(page as any)`。

#### 优雅解法
在 `src/types/page.ts` 中定义类型安全的受控索引签名：
```typescript
export interface PageData extends Record<string, unknown> {
  id: string;
  type: 'slide' | 'freeform';
  layoutId: TemplateId;
  aspectRatio: AspectRatioType;
  title: string;
  subtitle?: string;
  // 其余严格类型字段...
}

/** 类型安全字段提取辅助函数 */
export function getPageField<T = unknown>(page: PageData, key: string, fallback: T): T {
  const val = page[key];
  return (val !== undefined && val !== null ? val : fallback) as T;
}
```

---

### 6.3 外部工程导入与模板载入零 Zod 校验

- **文件定位**: `src/utils/db.ts#L240-L275`, `src/store/useStore.ts#L215-L265`
- **严重级别**: 🔴 **Critical (系统健壮性与安全威胁)**

#### 漏洞事实
在 `package.json` 中已经引入了 `"zod": "^4.3.6"`，且 `src/templates/schemas/validator.ts` 已经实现了一整套校验逻辑。
然而在生产运行代码中：
1. `db.ts` 读取本地 `.json` 或从 `.slgrid` ZIP 中读取 `project.json` 后，**直接执行 `JSON.parse` 并交付业务使用**；
2. `useStore.ts` 的 `loadProject` 接收到数据后，未经任何校验直接调用 `migrateToV3(projectData)`，然后 `set({ pages: migratedData.pages })`。
3. 若用户导入了一个非法格式、字段篡改或损坏的 JSON 文件，解析器不会给出任何友好的阻断提示，而是在后续深层的 React 渲染树或遍历时直接抛出 `Cannot read properties of undefined`，引发白屏崩溃。

#### 两阶段迁移与校验管道设计 (Two-Phase Migration & Validation Pipeline)
在落地 Zod 校验时，必须遵循**先迁移升级、后防御校验**的两阶段顺序：
1. **阶段一（迁移阶段）**: 先调用 `migrateToV3(rawData)` 对历史 V1/V2 版本数据进行平滑结构迁移（例如将旧字段 `layout` 标准化为 `layoutId`，并允许合法的空工程 `pages: []`）；
2. **阶段二（清洗阶段）**: 在迁移后的规范数据上执行 Zod 4 双参数安全模式 `z.record(z.string(), z.unknown())` 的 `safeParse`。严禁在迁移前直接对原始旧工程执行必填校验，否则将直接导致历史工程无法载入。

---

### 6.4 编辑器操作面板 (`EditorPanel`) 缺失局部 Error Boundary

- **文件定位**: `src/components/editor/EditorPanel.tsx`
- **严重级别**: 🟠 **Major**

系统虽然在顶层（`App.tsx:46`）和画布层（`LayoutRenderer.tsx:40`）配置了 Error Boundary，但右侧承载 30 余个交互控件的 **`EditorPanel` 处于完全裸奔状态**。
编辑面板内部包含复杂的第三方交互（如 `ResumeContentHub` 的多层树结构解析、Bento 动态网格计算）。一旦某个控件因异常字符抛错，整个应用直接挂起，顶层 ErrorBoundary 将强制白屏并清空工作区，用户正在编辑的未保存数据全部遗失。

---

## 7. R6. 项目规范与代码健康度审查

### 7.1 ESLint 致命构建阻断错误分析

- **严重级别**: 🔴 **Critical (CI 阻塞)**
- **执行命令**: `pnpm lint`
- **阻断错误明细**:
  1. `src/components/editor/zine/zineStyleUtils.ts#L149`: `error Empty block statement no-empty`
  2. `src/components/editor/zine/zineStyleUtils.ts#L178`: `error Empty block statement no-empty`
  3. `src/utils/db.ts#L232`: `error Unexpected control character(s) in regular expression: \x00, \x1f no-control-regex`

#### 修复代码对比 (Diff)

**`zineStyleUtils.ts#L149` & `#L178`**:
```typescript
// Before
} catch {}

// After
// 遵从 AGENTS.md：中文解释意图
} catch (_error) {
  // 忽略缺失节点的查找异常并安全回退
}
```

**`db.ts#L232`**:
```typescript
// Before
const safeName = (defaultName || projectData.title || projectData.projectTitle || 'SlideGrid_Project')
  .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

// After
const safeName = (defaultName || projectData.title || projectData.projectTitle || 'SlideGrid_Project')
  .replace(/[<>:"/\\|?*]/g, '_')
  .replace(/[\u0000-\u001F]/g, '_');
```

---

### 7.2 `AGENTS.md` 注释规范系统性违规 (120+ 处单行中英混写)

- **严重级别**: 🔵 **Suggestion / Code Smell**
- **规范要求**:
  - `禁止同一行中英混合 ❌ -> // 1. 顶部大图 (Main Feature)`
  - `统一方向：中文写"为什么"（意图），英文写"是什么"（技术事实）。`

#### 违规典型示例清单
审查发现超过 120 处违规，甚至多次直接复现了反面教材：
- `src/templates/schemas/169-Product/bento-showcase.ts#L18`: `// 1. 左侧大卡片 (Main Feature)` (与规范反面示例 100% 重合)
- `src/templates/schemas/23-Cover/editorial-classic.ts#L18`: `// 1. 顶部大图 (Rows 1-15) - 遵循天头原则`
- `src/templates/schemas/Bilingual-Editorial/bilingual-reader.ts#L59`: `// 2. 侧边 90° 旋转刊头印章 (Side Header Stamp)`
- `src/templates/schemas/renderer/basePropsResolver.ts#L41`: `// 9宫格对齐逻辑 (Self Alignment)`
- `src/constants/theme.ts#L63`: `// 主标题：Playfair Display, 32pt-48pt, Tracking +150 to +250 (AllCaps)`

---

### 7.3 死代码与孤立文件清理

- **文件定位**:
  - `src/workers/fontCalculator.ts` 与 `src/workers/fontCalculatorManager.ts`: 自全量升级为 Knuth-Plass 排版后，已被废弃，生产环境 0 引用。
  - `src/components/editor/ImageEditPreview.tsx`: 0 引用。
  - `src/hooks/useImagePreload.ts`: 0 引用。
- **清理方案**: 彻底移除上述文件及关联测试用例，减轻构建体积与测试维护负担。

---

## 8. R7. 可落地的演进式重构路线图

为了在不破坏现有 729 项测试的前提下安全推进代码库架构重构，提出分三阶段演进路线图。

### 8.1 路线图总览与分期规划

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           三阶段重构规划                               │
  └────────────────────────────────────────────────────────────────────────┘
     Phase 1: P0 基础质量与高危缺陷修复 (预计 1-2 天)
       ├── 修复 ESLint 3 个构建阻断报错 (恢复 CI 绿灯)
       ├── useStore 快照剥离 Base64 字体 (恢复 5MB 撤销栈功能)
       ├── usePreview 依赖解耦 (消除 ResizeObserver 击键抖动)
       └── 引入 Zod 运行时工程文件校验
     
     Phase 2: P1 架构解耦与 DRY 治理 (预计 3-5 天)
       ├── 抽象 printGeometry 统一印刷计算
       ├── 彻底移除 36 个冗余 TS 模板定义，修正 App.tsx 预加载
       ├── useStore 切片化与 EditorPage 上帝组件拆解
       ├── 文本原子组件三合一 (ZineTextAtom)
       └── GlobalSettings 直连 Store，消除 16 层 Props Drilling
     
     Phase 3: P2 类型安全与规范治理 (预计 2-3 天)
       ├── PageData 索引签名改造与 610 处 any 消除
       ├── EditorPanel 增加局部 Error Boundary
       ├── 清理死代码 Worker、孤立 Hook 与空目录
       └── 全量治理 AGENTS.md 注释合规性
```

---

### 8.2 核心重构前后方案详细对比 (Actionable Snippets)

#### 1. 修复 5MB 撤销快照门限击穿与字体保全 (Critical)
**修改目标文件**: `src/store/useStore.ts#L71-L83`

```typescript
// 历史缺陷：深度克隆包含了巨大 Base64 字符串的 customFonts
const buildSnapshot = (state: ProjectState): HistorySnapshot => ({
  pages: deepClone(state.pages),
  projectTitle: state.projectTitle,
  theme: deepClone(state.theme),
  designSystem: deepClone(state.designSystem),
  printSettings: deepClone(state.printSettings),
  minimalCounter: state.minimalCounter,
  counterStyle: state.counterStyle,
  imageQuality: state.imageQuality,
  customFonts: deepClone(state.customFonts),
  currentPageIndex: state.currentPageIndex,
  currentFilePath: state.currentFilePath,
});

// 优化方案：快照剥离二进制，并在历史恢复时执行内存字典保全
/** Rehydrates font metadata snapshots with existing font binary data URLs */
export const rehydrateFontsWithCurrentBinaries = (
  snapshotFonts: CustomFont[],
  currentFonts: CustomFont[]
): CustomFont[] => {
  // 构建当前内存中字体的二进制映射字典
  const binaryMap = new Map(currentFonts.map(f => [f.family, f.dataUrl]));
  return snapshotFonts.map(f => ({
    ...f,
    // 若快照中未包含二进制内容，优先从当前内存缓存复原
    dataUrl: f.dataUrl || binaryMap.get(f.family)
  }));
};

const buildSnapshot = (state: ProjectState): HistorySnapshot => ({
  pages: deepClone(state.pages),
  projectTitle: state.projectTitle,
  theme: deepClone(state.theme),
  designSystem: deepClone(state.designSystem),
  printSettings: deepClone(state.printSettings),
  minimalCounter: state.minimalCounter,
  counterStyle: state.counterStyle,
  imageQuality: state.imageQuality,
  // 仅保留字体元数据标识，大幅缩减快照体积
  customFonts: state.customFonts.map(font => ({
    name: font.name,
    family: font.family
  })),
  currentPageIndex: state.currentPageIndex,
  currentFilePath: state.currentFilePath,
});

// 在 undo() 恢复逻辑中：
// customFonts: rehydrateFontsWithCurrentBinaries(prev.customFonts || [], get().customFonts),
```

---

#### 2. 解除 `usePreview.ts` 高频全量依赖 (Critical)
**修改目标文件**: `src/hooks/usePreview.ts#L21-L54`

```typescript
// 历史缺陷：依赖了全量 pages 数组
const calculateFitZoom = useCallback(() => {
  if (!isLoaded || !previewContainerRef.current || !pages[currentPageIndex]) return 0.5;
  const currentPage = pages[currentPageIndex];
  const designDims = LAYOUT_CONFIG[(currentPage.aspectRatio || '16:9') as AspectRatioType];
  // ...
}, [pages, currentPageIndex, printSettings, isLoaded]);

// 优化方案：仅依赖当前页面的宽高比与打印设置
const currentRatio = pages[currentPageIndex]?.aspectRatio || '16:9';

const calculateFitZoom = useCallback(() => {
  if (!isLoaded || !previewContainerRef.current) return 0.5;
  const rect = previewContainerRef.current.getBoundingClientRect();
  if (rect.height <= 0 || rect.width <= 0) return 0.5;

  // 使用抽离出的纯计算工具获取双模几何结果
  const { preview } = calcPrintLayoutGeometry(currentRatio as AspectRatioType, printSettings);

  const padding = 120;
  const scaleX = (rect.width - padding) / preview.canvasWidth;
  const scaleY = (rect.height - padding) / preview.canvasHeight;
  return Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
}, [currentRatio, printSettings, isLoaded]);
```

---

#### 3. 拖拽排序历史栈防污染 (Major)
**修改目标文件**: `src/components/editor/virtual-page-list/useDragReorder.ts#L35-L65`

```typescript
// 历史缺陷：在拖拽悬停节流中高频压入全量历史栈
const handleDragOver = (e: React.DragEvent, index: number) => {
  e.preventDefault();
  // ...
  if (now - lastReorderRef.current < 150) return;
  commitReorder(index);
};

// 优化方案：保持视图组件钩子纯粹性，仅在拖拽完成且实质变更时通知父级压栈
export interface UseDragReorderProps {
  pages: PageData[];
  onReorderPages: (newPages: PageData[], isCommit?: boolean) => void;
}

/** Manages visual drag-and-drop reordering with deferred commit */
export function useDragReorder({ pages, onReorderPages }: UseDragReorderProps) {
  const initialPagesRef = useRef<PageData[] | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    // 记录拖拽前初始快照
    initialPagesRef.current = pages;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // 视觉拖拽中仅排版展示，不压入撤销历史
    onReorderPages(pages, false);
  };

  const handleDragEnd = () => {
    if (initialPagesRef.current && !shallowEqualArray(initialPagesRef.current, pages)) {
      // 拖拽落手，若实质发生顺序变更，通知外层统一压栈
      onReorderPages(pages, true);
    }
    initialPagesRef.current = null;
    setDraggedIndex(null);
  };
}
```

---

#### 4. 接入 Zod 外部工程数据校验与两阶段流水线 (Critical)
**创建目标文件**: `src/utils/validation/projectSchema.ts`

```typescript
// src/utils/validation/projectSchema.ts
// 遵从 AGENTS.md 注释规范

import { z } from 'zod';
import { migrateToV3 } from '../migrations/v2-to-v3';
import { logger } from '../logger';
import type { PageData, ProjectData } from '../../types';

export const PageDataSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['slide', 'freeform']).default('slide'),
  layoutId: z.string().optional(),
  layout: z.string().optional(),
  aspectRatio: z.string().default('16:9'),
  title: z.string().default('Untitled'),
  subtitle: z.string().optional(),
}).passthrough();

export const ProjectDataSchema = z.object({
  title: z.string().optional(),
  projectTitle: z.string().optional(),
  pages: z.array(PageDataSchema).default([]),
  theme: z.record(z.string(), z.unknown()).optional(),
  designSystem: z.record(z.string(), z.unknown()).optional(),
  printSettings: z.record(z.string(), z.unknown()).optional(),
  customFonts: z.array(z.object({
    name: z.string(),
    family: z.string(),
    dataUrl: z.string().optional()
  })).optional(),
}).passthrough();

/** Validates and sanitizes migrated project data */
export function validateAndSanitizeProject(rawData: unknown): ProjectData {
  // 第一步：先执行平滑版本迁移，兼容旧版字段与默认值
  const migrated = migrateToV3(rawData);

  // 第二步：使用 Zod 4 双参数安全模式进行运行时清洗
  const result = ProjectDataSchema.safeParse(migrated);
  if (!result.success) {
    logger.warn('Project schema mismatch, fallbacking to migrated data', result.error);
    return migrated as ProjectData;
  }
  return result.data as ProjectData;
}
```

---

### 8.3 架构健康度度量指标与 CI 防劣化长效守护机制

1. **严格的 CI 质量门禁**:
   - 配置 `pnpm lint` 纳入 GitHub Actions / 本地 Pre-commit 钩子，实行 0 Error 强制拦截。
   - 启用 ESLint 规则 `@typescript-eslint/no-explicit-any: "error"` 逐步替换现有的 `"warn"`。
2. **架构依赖隔离防线**:
   - 使用 ESLint `no-restricted-imports` 规则，禁止业务页面直接从未暴露的内部私有文件进行跨层引用。
   - 禁止在原子组件中使用 `useStore(s => s.designSystem)`，强制通过上下文或统一基类获取。
3. **性能基准守护 (Performance Regression Testing)**:
   - 增加 Vitest 性能基准测试用例，对包含 100 页大工程的 `buildSnapshot` 耗时与快照体积进行持续断言监控（确保快照体积永远 < 200KB）。
