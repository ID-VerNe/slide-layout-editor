# 2.1 上帝组件 EditorPage.tsx 解耦

> 对应 `docs/code-review-report.md` 第 113-253 行 2.1 节。
> 关联 4.4(`docs/solutions/14-custom-event-bus.md`)、5.5(`docs/solutions/19-event-listener-lifecycle.md`)、4.3(`docs/solutions/13-props-drilling-globalsettings.md`)、3.5(`docs/solutions/10-template-defaults-merge.md`)、2.2(`docs/solutions/02-use-store-slice.md`)。

## 事实核对

逐条核对报告对 `src/pages/EditorPage.tsx` 的职责枚举,结论分三类:属实、误述、夸大。

### 属实部分

| 报告描述 | 实际核对 | 结论 |
|---|---|---|
| 文件 `EditorPage.tsx#L1-L530` (530 行, 31,310 字节) | `wc -l` 实测 529 行、`wc -c` 实测 31,310 字节 | 字节一致;行数差 1(末行换行计数),可忽略 |
| 路由与项目生命周期(`useParams`/`useSearchParams`/`isNewProject`) | `EditorPage.tsx#L28-L51` | 属实 |
| 全局键盘快捷键 `Ctrl+S`/`Ctrl+Shift+S`/`Ctrl+Z`/`Ctrl+Y` | `EditorPage.tsx#L403-L417` | 属实 |
| 自动保存 3000ms 防抖 | `EditorPage.tsx#L109-L120`,门控 `isLoaded && projectId && hasUnsavedChanges` | 属实 |
| localStorage 键名迁移 `magazine_recent_projects` → `slidegrid_recent_projects` | `EditorPage.tsx#L123-L138` | 属实,但系重复实现(见误述 4) |
| 3 步模态框状态机 `creationStage`(orientation → ratio → template) | `EditorPage.tsx#L65-L67`、`L419-L423`、`L467-L511` | 属实 |
| 离屏导出渲染同步 `offscreenTarget`/`offscreenResolveRef`/15 秒超时 Promise | `EditorPage.tsx#L73-L95` | 属实 |
| 导出引擎内联 `html-to-image`/`jsPDF`/ZIP 打包 | `EditorPage.tsx#L313-L397` | 属实 |
| DOM 爬取 `el.querySelectorAll('.resume-link')` 提取链接坐标写入 PDF | `EditorPage.tsx#L351` | 属实 |
| `handleExportProject` 从 `useProject` 解构后无引用 | `EditorPage.tsx#L38` 解构,全文件无消费 | 属实,系死代码(14 号方案一并清理) |
| `waitForOffscreenRender` resolve 后未清理 15 秒定时器 | `L80-L86` 的 `timer` 句柄未保存;`handleOffscreenReady`(`L89-L95`)resolve 路径未 `clearTimeout` | 属实,定时器泄漏至 15 秒超时窗口 |
| 监听 `open-layout-browser`/`show-export-modal`/`trigger-import` | `L170-L172` 三个 `addEventListener` | 属实(由 14 号方案处理) |

### 误述部分

1. **"30s/300s 缩略图轮询"不在 EditorPage**。报告 L128/L141 把缩略图轮询列为 EditorPage 职责。实际该定时器位于 `src/hooks/useProject.ts#L90-L91`(`initialTimer = setTimeout(generateThumbnail, 30000)`、`intervalTimer = setInterval(generateThumbnail, 300000)`),且其清理逻辑(`L93-L96`)正确。EditorPage 内不存在 30s/300s 定时器。报告把 `useProject` 的职责误记到 `EditorPage` 账上。

2. **"另存新副本复用原 id 导致 IndexedDB 覆写冲突"不成立**。报告 L142 称另存新副本时直接复用原 `id` 而未生成 `crypto.randomUUID()`,导致新旧副本在 IndexedDB 与 RecentProjects 中共用 ID 引发覆写冲突。核对 `handleSaveAs`(`EditorPage.tsx#L218-L235`):
   - Web 分支:`exportProjectAsJson(content, ...)`(`L228`)仅触发浏览器下载 JSON 文件,**不写 IndexedDB**。`exportProjectAsJson`(`src/utils/db.ts#L230-L237`)只构造 Blob 触发 `<a>` 下载,无 IDB 写入。
   - Electron 分支:`nativeFs.saveProject(content, undefined, ...)`(`L224`)写到新文件路径,**不写 IndexedDB**。
   - `saveToDB`(来自 `useProject`)始终用当前编辑中的 `projectId` 写 IndexedDB,与另存为的文件路径无关。

   即 IndexedDB 中一个 `projectId` 永远只对应一份工程数据,"新旧副本覆写"场景不存在。`upsertRecentProject`(`L225`/`L230`)确实用原 `projectId` 更新 RecentProjects 索引,但这是"更新当前工程的最近访问记录"(同一工程的新文件路径),不是"新建副本索引"。报告此处夸大了影响。**本方案不为这个不存在的 bug 设计修复,避免引入无依据的行为变更。**

3. **"resolve 后未清理 15 秒定时器导致计时器泄漏至事件循环"属实,需精确定位**。核对 `waitForOffscreenRender`(`EditorPage.tsx#L76-L87`):

   ```typescript
   return new Promise<HTMLElement>((resolve, reject) => {
     offscreenResolveRef.current = resolve;
     setOffscreenTarget({ page: targetPage, index: targetIndex });
     const timer = setTimeout(() => {
       if (offscreenResolveRef.current === resolve) {
         offscreenResolveRef.current = null;
         reject(new Error(`Offscreen render timeout for page ${targetIndex + 1}`));
       }
     }, 15000);
   });
   ```

   `timer` 句柄未保存到任何 ref,`handleOffscreenReady`(`L89-L95`)resolve 后未 `clearTimeout(timer)`。正常路径(离屏渲染成功)下,15 秒定时器会一直挂起到期,届时 `offscreenResolveRef.current === resolve` 为 false(`handleOffscreenReady` 已置 null),不 reject,但定时器资源已浪费。导出 N 页时累积 N 个未清理定时器。**属实,需修复。**

### 夸大部分

4. **localStorage 迁移 effect 是重复实现**。`EditorPage.tsx#L123-L138` 的迁移逻辑与 `src/services/recentProjects.ts#L17-L42` 的 `getRecentProjects()` 内置迁移(LEGACY_RECENT_KEY → PRIMARY_RECENT_KEY)功能完全重叠。`recentProjects` 服务的 `getRecentProjects()`(`L17`)在每次读路径都会:`L28-L36` 检测 legacy key、迁移数据到 primary、`localStorage.removeItem(LEGACY_RECENT_KEY)` 清理旧键。而 `upsertRecentProject`/`updateRecentProjectThumbnail`/`removeRecentProject` 都先调 `getRecentProjects()`,即每次写路径也会清理旧键。Dashboard 首屏同样调 `getRecentProjects()`。因此 legacy key 在应用首次任一读写 RecentProjects 时就会被清理,EditorPage 的 effect 是冗余的。报告将其列为"职责堆砌"的第 5 项,但未指出它本不该存在。**本方案直接删除,不属于"抽离",属于"清理"。**

5. **报告的 11 项职责里有 1 项不属 EditorPage**(缩略图轮询,见误述 1)、**1 项是重复实现**(localStorage 迁移,见夸大 4)、**1 项是死代码**(`handleExportProject` 解构)。剔除后,EditorPage 真实承载的职责为 8 项,仍是上帝组件,但报告的"11 项"数字偏高。

### 与既有方案的关系

- **14 号方案**已计划删除 `open-layout-browser`/`show-export-modal`/`trigger-import` 三个 CustomEvent 通道,把 `handleOpenLayoutBrowser` 改为 callback prop 下发给 `EditorPanel`/`Editor`。本方案不重复处理事件总线,但精简后的 EditorPage 在 14 号方案落地后即可直接接收 callback;14 号未落地时保留现有监听块(见 Step 8 衔接说明)。
- **19 号方案**用 `currentPageRef` 稳定监听器,被 14 号方案取代。本方案不涉及。
- **13 号方案**让 `GlobalSettings` 直连 store,消除 `EditorPage` 的 12 路 props 透传。本方案不处理 `GlobalSettings` 透传,但精简后的 EditorPage 渲染区保留 `<GlobalSettings />` 调用点(13 号方案落地后该调用点简化为无 props)。
- **10 号方案**统一模板默认值合并,把 `mergeDefaults` 提取为独立函数。本方案在抽离 3 步模态框状态机时,`handleFinalAction` 内的 `mergeDefaults` 调用改为调用 10 号方案提供的统一函数,不在本方案内重复定义。

## 根因

`EditorPage.tsx` 的膨胀是三个结构性诱因叠加:

1. **页面容器被当作"功能收容所"**。组件命名为 `EditorPage`,本应只承担路由解析与布局组装。但项目演进中,凡是"需要一个全局挂载点"的功能(键盘快捷键、自动保存、导出流水线、离屏渲染、模态框状态机)都往这里塞,边界从未被守住。529 行里真正的布局组装只占 `L435-L523` 约 90 行,其余 440 行是 8 个正交职责的内联实现。

2. **副作用与 UI 状态混杂在同一函数组件闭包**。`handleExport`(`L313-L397`)既管理离屏渲染协调(副作用)、又管理 PDF 生成(纯逻辑)、又管理进度 state(`setExportProgress`)、又管理取消(`exportCancelledRef`)。这些关注点本可分离,但被塞进一个 `useCallback`,依赖数组膨胀到 7 项(`L397`),任一变动都触发整个闭包重建。

3. **重复实现而非复用**。localStorage 迁移 effect(`L123-L138`)与 `recentProjects` 服务的迁移逻辑重复;`mergeDefaults`(`L262-L283`)与 `useStore.getDefaultPage` 的默认值合并重复(10 号方案处理)。这反映作者在写 EditorPage 时未先检查既有服务层,默认在页面内重写。

次要因素:

- 报告建议的 4 个抽离 hook(`useEditorShortcuts`/`useExportPipeline`/`useProjectPersistence` + 模态框组件外移)方向正确,但漏了离屏渲染协调(`waitForOffscreenRender`/`offscreenTarget`/`handleOffscreenReady`)这一独立关注点,且未点明 localStorage 迁移 effect 应直接删除而非抽离。本方案补齐。
- 报告建议的导出流水线拆分偏粗(只给一个 `useExportPipeline` hook)。导出的纯逻辑(PDF/PNG/ZIP 分派、DOM 链接提取、几何计算)应下沉为纯服务,Hook 只负责"把 React 状态喂给服务、把进度写回 state"。本方案进一步分离。

## 解决方案

按"纯服务 + 薄 Hook + 精简容器"三层拆解。**不保留 `EditorPage.tsx` 作为聚合入口**:抽离后的逻辑通过 hook 调用组合,EditorPage 只负责布局组装。

### 设计原则(遵从 `~/.claude/CLAUDE.md`)

- **不保留向后兼容**:删除 localStorage 迁移 effect、删除 `handleExportProject` 解构项、删除 `handleOpenAddPageModal`/`handleOpenExportModal` 等内联包装函数(改用 hook 返回值)。不保留任何 fallback 分支或 re-export 垫片。
- **最简实现**:用 `useCallback` + `useRef` 组合,不引入 `useEventCallback`/`useLatest` 等抽象。导出流水线用纯函数 + 注入 `renderOffscreen` callback,不引入策略模式或工厂。
- **不投机抽象**:4 个 hook + 2 个服务是当前职责的真实边界,不为"未来可能拆分的 hook"预留子目录。
- **不破坏现有测试**:`EditorPage.test.tsx` 6 个用例(`L256-L304`)mock 了 `Sidebar`/`TopNav`/`PreviewArea`/`EditorPanel`/`GlobalSettings`/`Modal`/`usePreview`/`useProject`/`useStore`/`native-fs` 等依赖,不断言导出/快捷键/模态框内部行为。抽离 hook 后,这些 mock 仍生效,测试用例行为不变。`useProject.test.ts` 9 个用例不涉及本方案抽离的函数。
- **注释规范**:遵从 `AGENTS.md`,中文写意图,英文写技术标识,禁单行中英混写。

### 目录结构

```
src/
├── services/
│   ├── recentProjects.ts           # 已存在,不动
│   ├── exportGeometry.ts          # 新增,纯函数:printSettings → 导出像素尺寸
│   └── exportPipeline.ts           # 新增,纯函数:PDF/PNG/ZIP 导出编排
├── hooks/
│   ├── useProject.ts               # 已存在,本节只消费其返回值
│   ├── useOffscreenExport.ts       # 新增,Hook:离屏渲染协调 + 定时器清理
│   ├── useProjectPersistence.ts    # 新增,Hook:自动保存 + 保存/另存为/打开
│   ├── useExportPipeline.ts        # 新增,Hook:导出 state + 调用 exportPipeline
│   └── useEditorShortcuts.ts       # 新增,Hook:键盘绑定
├── components/editor/modals/
│   ├── LayoutBrowserModal.tsx      # 新增,3 步模板创建弹窗 UI
│   └── ExportModal.tsx             # 新增,导出格式选择弹窗 UI
└── pages/
    └── EditorPage.tsx              # 精简为布局组装,目标 < 200 行
```

### 函数迁移映射

| 原 EditorPage 符号 | 目标文件 | 目标符号 | 备注 |
|---|---|---|---|
| `getExportDimensions`(`L297-L311`) | `src/services/exportGeometry.ts` | `getExportDimensions` | 纯函数,无 React 依赖 |
| `handleExport` 4 分支(`L313-L397`) | `src/services/exportPipeline.ts` | `runExportPipeline` | DOM 链接爬取封装为内部 `attachResumeLinks` |
| `waitForOffscreenRender`/`handleOffscreenReady`/`offscreenTarget`/`offscreenResolveRef`(`L73-L95`) | `src/hooks/useOffscreenExport.ts` | `useOffscreenExport` 返回 `{ offscreenTarget, waitForOffscreenRender, handleOffscreenReady, resetOffscreen }` | 修复 15 秒定时器泄漏 |
| 自动保存 effect(`L109-L120`) + `handleSmartSave`/`handleSaveAs`/`handleNativeOpen`/`generateThumb`/`updateIndex`(`L181-L258`) | `src/hooks/useProjectPersistence.ts` | `useProjectPersistence` 返回 `{ handleSmartSave, handleSaveAs, handleNativeOpen }` | 自动保存防抖 effect 一并入内 |
| `handleKeyDown` effect(`L403-L417`) | `src/hooks/useEditorShortcuts.ts` | `useEditorShortcuts({ onSave, onSaveAs, onUndo, onRedo })` | 依赖项收敛 |
| `showLayoutModal`/`modalMode`/`creationStage`/`selectedOrientation`/`selectedRatio`/`handleSelectOrientation`/`handleFinalAction`/`handleOpenAddPageModal`(`L63-L67`、`L260-L295`、`L419-L429`、`L467-L511`) | `src/hooks/useLayoutCreationWizard.ts` + `LayoutBrowserModal.tsx` | hook 返回状态与回调,组件承接 UI | `handleFinalAction` 内 `mergeDefaults` 改调 10 号方案函数;`OrientationCard`(`L527-L529`)移入组件 |
| `showExportModal`/`exportScope`/`handleOpenExportModal`(`L57-L59`、`L431-L433`、`L512`) | `src/hooks/useExportPipeline.ts` + `ExportModal.tsx` | hook 返回 `{ isExporting, exportProgress, handleExport, cancelExport }`;组件承接格式选择 UI | `handleOpenExportModal` 删除,改用 `setShowExportModal` 直连 |
| localStorage 迁移 effect(`L123-L138`) | 删除 | — | `recentProjects` 服务已处理 |
| `handleExportProject` 解构(`L38`) | 删除 | — | 死代码,14 号方案一并清理 |

### 实施步骤

**Step 1:新增 `src/services/exportGeometry.ts`(纯函数)**

把 `EditorPage.tsx#L297-L311` 的 `getExportDimensions` 抽为纯函数,不带任何 React 依赖。

```typescript
import { LAYOUT_CONFIG, AspectRatioType } from '../constants/layout';
import { PageData, PrintSettings } from '../types';

/** 计算 PageData 在导出时的像素尺寸,考虑印刷出血与装订侧净宽 */
export function getExportDimensions(
  page: PageData,
  printSettings: PrintSettings | undefined,
): { width: number; height: number } {
  const designDims = LAYOUT_CONFIG[(page.aspectRatio || '16:9') as AspectRatioType];
  if (printSettings?.enabled) {
    const orientation = designDims.orientation;
    const config =
      (printSettings.configs &&
        (printSettings.configs[orientation as keyof typeof printSettings.configs] ||
          printSettings.configs.resume)) ||
      { bindingSide: 'left', trimSide: 'bottom' };
    const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
    const netWidthMm = isHorizontalBinding
      ? printSettings.widthMm - printSettings.gutterMm
      : printSettings.widthMm;
    const ppi = designDims.width / Math.max(1, netWidthMm);
    return {
      width: Math.round(printSettings.widthMm * ppi),
      height: Math.round(printSettings.heightMm * ppi),
    };
  }
  return { width: designDims.width, height: designDims.height };
}
```

**Step 2:新增 `src/services/exportPipeline.ts`(导出流水线纯函数)**

把 `EditorPage.tsx#L313-L397` 的 `handleExport` 四分支抽为单一入口函数,DOM 链接爬取封装为内部 `attachResumeLinks`。

```typescript
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { nativeFs } from '../utils/native-fs';
import { exportPagesToZip } from '../utils/db';
import { getExportDimensions } from './exportGeometry';
import { PageData, PrintSettings } from '../types';

export type ExportFormat = 'png' | 'pdf';
export type ExportScope = 'current' | 'all';

export interface ExportPipelineOptions {
  format: ExportFormat;
  scope: ExportScope;
  pages: PageData[];
  currentPageIndex: number;
  projectTitle: string;
  fallbackTitle: string;
  printSettings: PrintSettings | undefined;
  // 由 Hook 提供:把指定页离屏渲染为 HTMLElement 并返回
  renderOffscreen: (page: PageData, index: number) => Promise<HTMLElement>;
  onProgress: (percent: number) => void;
  isCancelled: () => boolean;
}

// 提取简历模板超链接坐标并写入 PDF
function attachResumeLinks(doc: jsPDF, el: HTMLElement) {
  const pageRect = el.getBoundingClientRect();
  el.querySelectorAll('.resume-link').forEach((linkEl: Element) => {
    const rect = (linkEl as HTMLElement).getBoundingClientRect();
    const url = linkEl.getAttribute('data-url');
    if (url) {
      doc.link(rect.left - pageRect.left, rect.top - pageRect.top, rect.width, rect.height, { url });
    }
  });
}

// Executes multi-format export pipeline: PDF, PNG directory (Electron), PNG/ZIP
export async function runExportPipeline(options: ExportPipelineOptions): Promise<void> {
  await document.fonts.ready;
  if (options.isCancelled()) return;

  const indices = options.scope === 'all'
    ? options.pages.map((_, i) => i)
    : [options.currentPageIndex];

  // filter: 排除跨域样式表链接,避免 html-to-image 报 tainted canvas
  const opt = {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    filter: (n: any) =>
      !(n.tagName === 'LINK' && n.rel === 'stylesheet' && n.href && !n.href.includes(window.location.origin)),
  };

  // Electron 桌面端:多页 PNG 直接写入用户选择的目录
  if (nativeFs.isElectron() && options.format === 'png' && options.scope === 'all') {
    const dirResult = await nativeFs.selectDirectory();
    if (options.isCancelled() || dirResult.canceled) return;
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const fileName = `${options.projectTitle || 'Export'}_Page_${String(idx + 1).padStart(2, '0')}.png`;
      await nativeFs.saveFileBuffer(`${dirResult.path}/${fileName}`, dataUrl);
      options.onProgress(Math.round(((i + 1) / indices.length) * 100));
    }
    return;
  }

  // PDF: 矢量文本 + 光栅页面图 + 简历链接坐标
  if (options.format === 'pdf') {
    const firstDims = getExportDimensions(options.pages[indices[0]], options.printSettings);
    const doc = new jsPDF({ unit: 'px', format: [firstDims.width, firstDims.height], hotfixes: ['px_scaling'] });
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const currentDims = getExportDimensions(options.pages[idx], options.printSettings);
      if (i > 0) doc.addPage([currentDims.width, currentDims.height]);
      doc.addImage(dataUrl, 'PNG', 0, 0, currentDims.width, currentDims.height);
      attachResumeLinks(doc, el);
      options.onProgress(Math.round(((i + 1) / indices.length) * 100));
    }
    if (!options.isCancelled()) doc.save(`${options.projectTitle || options.fallbackTitle}.pdf`);
    return;
  }

  // PNG: 多页打包 ZIP,单页直接下载
  if (indices.length > 1) {
    const renderedSlides: { dataUrl: string; filename: string }[] = [];
    for (let i = 0; i < indices.length; i++) {
      if (options.isCancelled()) return;
      const idx = indices[i];
      const el = await options.renderOffscreen(options.pages[idx], idx);
      if (options.isCancelled()) return;
      const dataUrl = await toPng(el, opt);
      if (options.isCancelled()) return;
      const fileName = `${options.projectTitle || options.fallbackTitle}_Page_${String(idx + 1).padStart(2, '0')}.png`;
      renderedSlides.push({ dataUrl, filename: fileName });
      options.onProgress(Math.round(((i + 1) / (indices.length + 1)) * 100));
    }
    if (options.isCancelled()) return;
    await exportPagesToZip(renderedSlides, `${options.projectTitle || options.fallbackTitle}_Slides`, options.onProgress);
  } else {
    const idx = indices[0];
    const el = await options.renderOffscreen(options.pages[idx], idx);
    if (options.isCancelled()) return;
    const dataUrl = await toPng(el, opt);
    if (options.isCancelled()) return;
    const link = document.createElement('a');
    link.download = `${options.projectTitle || options.fallbackTitle}_${idx + 1}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    options.onProgress(100);
  }
}
```

**Step 3:新增 `src/hooks/useOffscreenExport.ts`(修复定时器泄漏)**

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { PageData } from '../types';

interface OffscreenTarget {
  page: PageData;
  index: number;
}

// 离屏渲染协调:挂起 Promise 等待 OffscreenExportRenderer 报告就绪
export function useOffscreenExport() {
  const [offscreenTarget, setOffscreenTarget] = useState<OffscreenTarget | null>(null);
  const offscreenResolveRef = useRef<((el: HTMLElement) => void) | null>(null);
  // 保存超时定时器句柄,resolve 或卸载时清理
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const waitForOffscreenRender = useCallback((targetPage: PageData, targetIndex: number) => {
    // 清理上一个未完成的等待,避免跨页导出时定时器叠加
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return new Promise<HTMLElement>((resolve, reject) => {
      offscreenResolveRef.current = resolve;
      setOffscreenTarget({ page: targetPage, index: targetIndex });
      timeoutRef.current = setTimeout(() => {
        if (offscreenResolveRef.current === resolve) {
          offscreenResolveRef.current = null;
          timeoutRef.current = null;
          reject(new Error(`Offscreen render timeout for page ${targetIndex + 1}`));
        }
      }, 15000);
    });
  }, []);

  const handleOffscreenReady = useCallback((element: HTMLElement) => {
    if (!offscreenResolveRef.current) return;
    const fn = offscreenResolveRef.current;
    offscreenResolveRef.current = null;
    // 渲染就绪后立即清理超时定时器,不再挂起 15 秒
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    fn(element);
  }, []);

  // 导出结束时重置,供 handleExport finally 调用
  const resetOffscreen = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    offscreenResolveRef.current = null;
    setOffscreenTarget(null);
  }, []);

  // 卸载时清理,防止组件销毁后定时器仍触发 setState
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { offscreenTarget, waitForOffscreenRender, handleOffscreenReady, resetOffscreen };
}
```

**Step 4:新增 `src/hooks/useExportPipeline.ts`**

承接导出 state(`isExporting`/`exportProgress`/`exportCancelledRef`),调用 `runExportPipeline`,内部组合 `useOffscreenExport`。

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { runExportPipeline, ExportFormat, ExportScope } from '../services/exportPipeline';
import { useOffscreenExport } from './useOffscreenExport';
import { PageData, PrintSettings } from '../types';

export function useExportPipeline() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportCancelledRef = useRef(false);
  const { offscreenTarget, waitForOffscreenRender, handleOffscreenReady, resetOffscreen } = useOffscreenExport();

  const handleExport = useCallback(async (
    format: ExportFormat,
    scope: ExportScope,
    pages: PageData[],
    currentPageIndex: number,
    projectTitle: string,
    fallbackTitle: string,
    printSettings: PrintSettings | undefined,
  ) => {
    exportCancelledRef.current = false;
    setIsExporting(true);
    setExportProgress(0);
    try {
      await runExportPipeline({
        format, scope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings,
        renderOffscreen: waitForOffscreenRender,
        onProgress: setExportProgress,
        isCancelled: () => exportCancelledRef.current,
      });
    } catch (e) {
      console.error('[Export] Export failed:', e);
    } finally {
      resetOffscreen();
      if (!exportCancelledRef.current) {
        setIsExporting(false);
        setExportProgress(0);
      }
    }
  }, [waitForOffscreenRender, resetOffscreen]);

  const cancelExport = useCallback(() => {
    exportCancelledRef.current = true;
  }, []);

  // 组件卸载时取消进行中的导出
  useEffect(() => {
    return () => { exportCancelledRef.current = true; };
  }, []);

  return { offscreenTarget, isExporting, exportProgress, handleOffscreenReady, handleExport, cancelExport };
}
```

**Step 5:新增 `src/hooks/useProjectPersistence.ts`**

承接自动保存防抖 effect 与 `handleSmartSave`/`handleSaveAs`/`handleNativeOpen`。参数为 `useProject` 的返回值,由 EditorPage 传入(不内部调 `useProject`,避免双重订阅)。

```typescript
import { useCallback, useEffect } from 'react';
import { nativeFs } from '../utils/native-fs';
import { capturePageThumbnail } from '../utils/thumbnailCapture';
import { upsertRecentProject } from '../services/recentProjects';
import { exportProjectAsJson, openProjectFromFilePicker } from '../utils/db';
import { PageData, ProjectTheme, PrintSettings, CustomFont, CounterStyle } from '../types';

interface UseProjectPersistenceParams {
  isLoaded: boolean;
  projectId: string | undefined;
  pages: PageData[];
  projectTitle: string;
  fallbackTitle: string;
  theme: ProjectTheme;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  customFonts: CustomFont[];
  imageQuality: number;
  printSettings: PrintSettings | undefined;
  currentFilePath: string | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  saveToDB: (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail?: boolean) => Promise<void>;
  loadProject: (idOrData: any, templateId?: string | null, filePath?: string | null) => Promise<void>;
  markAsSaved: () => void;
  setCurrentFilePath: (path: string | null) => void;
  hasUnsavedChanges: boolean;
}

// 工程持久化:自动保存防抖、手动保存、另存为、Native 打开
export function useProjectPersistence(params: UseProjectPersistenceParams) {
  const {
    isLoaded, projectId, pages, projectTitle, fallbackTitle,
    theme, minimalCounter, counterStyle, customFonts, imageQuality,
    printSettings, currentFilePath, previewRef, saveToDB, loadProject,
    markAsSaved, setCurrentFilePath, hasUnsavedChanges,
  } = params;

  // 自动保存:仅在存在未保存变更时启动 3s 防抖定时器
  useEffect(() => {
    if (!isLoaded || !projectId || !hasUnsavedChanges) return;
    const autoSaveTimer = setTimeout(() => {
      saveToDB(previewRef, false).catch((err) => {
        console.warn('[AutoSave] Background save failed:', err);
      });
    }, 3000);
    return () => clearTimeout(autoSaveTimer);
  }, [isLoaded, projectId, hasUnsavedChanges, pages, projectTitle, theme, saveToDB, previewRef]);

  const generateThumb = useCallback(async () => {
    if (!previewRef.current || !projectId) return null;
    return capturePageThumbnail(previewRef.current, projectId, { pixelRatio: 0.2, quality: 0.5 });
  }, [projectId, previewRef]);

  const updateIndex = useCallback((thumb: any, path: string | null) => {
    if (!projectId) return;
    upsertRecentProject({
      id: projectId,
      title: projectTitle || fallbackTitle,
      date: new Date().toLocaleDateString(),
      lastModified: Date.now(),
      type: pages[0]?.layoutId,
      aspectRatio: pages[0]?.aspectRatio,
      thumbnail: thumb,
      filePath: path,
    });
  }, [projectId, projectTitle, fallbackTitle, pages]);

  const handleSmartSave = useCallback(async () => {
    if (!isLoaded || !projectId) return;
    try {
      const thumb = await generateThumb();
      const content = {
        id: projectId, version: '3.0', title: projectTitle, pages, theme,
        minimalCounter, counterStyle, customFonts, imageQuality, printSettings,
        thumbnail: thumb || undefined, filePath: currentFilePath || undefined,
      };
      if (nativeFs.isElectron()) {
        const result = await nativeFs.saveProject(content, currentFilePath || undefined, projectTitle || fallbackTitle);
        if (result.success && result.filePath) {
          setCurrentFilePath(result.filePath);
          markAsSaved();
        }
      } else {
        markAsSaved();
      }
      updateIndex(thumb, currentFilePath);
      saveToDB(previewRef, true);
    } catch (e) {
      console.error('[Save] Smart save failed:', e);
    }
  }, [isLoaded, projectId, generateThumb, projectTitle, pages, theme, minimalCounter, counterStyle,
      customFonts, imageQuality, printSettings, currentFilePath, fallbackTitle, markAsSaved,
      setCurrentFilePath, updateIndex, saveToDB, previewRef]);

  // 另存为:不生成新 id。Web 端下载 JSON 备份,Electron 端写新文件路径
  // 两路径均不写 IndexedDB,因此不存在副本覆写原工程的场景
  const handleSaveAs = useCallback(async () => {
    if (!isLoaded || !projectId) return;
    try {
      const thumb = await generateThumb();
      const content = {
        id: projectId, version: '3.0', title: projectTitle, pages, theme,
        minimalCounter, counterStyle, customFonts, imageQuality, printSettings,
        thumbnail: thumb || undefined, filePath: undefined,
      };
      if (nativeFs.isElectron()) {
        const result = await nativeFs.saveProject(content, undefined, `${projectTitle || fallbackTitle}_Copy`);
        if (result.success && result.filePath) {
          setCurrentFilePath(result.filePath);
          markAsSaved();
          updateIndex(thumb, result.filePath);
        }
      } else {
        // Web 模式:下载完整的工程备份 JSON
        exportProjectAsJson(content, `${projectTitle || fallbackTitle}_Backup`);
        markAsSaved();
        updateIndex(thumb, currentFilePath);
      }
    } catch (e) {
      console.error('[Save] Save As failed:', e);
    }
  }, [isLoaded, projectId, generateThumb, projectTitle, pages, theme, minimalCounter,
      counterStyle, customFonts, imageQuality, printSettings, fallbackTitle, markAsSaved,
      setCurrentFilePath, updateIndex, currentFilePath]);

  const handleNativeOpen = useCallback(async () => {
    if (nativeFs.isElectron()) {
      const result = await nativeFs.openProject();
      if (result.success && result.content) {
        try {
          const project = JSON.parse(result.content);
          await loadProject(project, null, result.filePath);
          if (result.filePath) {
            setCurrentFilePath(result.filePath);
            markAsSaved();
          }
        } catch {
          alert('Invalid file');
        }
      }
    } else {
      try {
        const picked = await openProjectFromFilePicker();
        if (picked && picked.project) {
          await loadProject(picked.project, null, null);
          markAsSaved();
        }
      } catch {
        alert('Invalid file format');
      }
    }
  }, [loadProject, markAsSaved, setCurrentFilePath]);

  return { handleSmartSave, handleSaveAs, handleNativeOpen };
}
```

> 注:`handleSaveAs` **不**生成新 `id`(不调 `crypto.randomUUID()`)。原因见事实核对误述 2:报告所称的"IndexedDB 覆写冲突"不存在,Web 分支只下载 JSON、Electron 分支只写文件,均不触碰 IndexedDB 中当前工程的记录。生成新 id 反而会引入无依据的行为变更(切换 `activeProjectId`、RecentProjects 索引分裂),违背"最简实现"。`updateIndex` 用原 `projectId` 更新最近访问记录,反映"当前工程换了一个文件路径"的语义,符合 `markAsSaved` + `setCurrentFilePath` 的后续保存流向。

**Step 6:新增 `src/hooks/useEditorShortcuts.ts`**

```typescript
import { useEffect } from 'react';

export interface ShortcutHandlers {
  onSave: () => void;
  onSaveAs: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

// 全局键盘快捷键:Ctrl+S 保存、Ctrl+Shift+S 另存为、Ctrl+Z/Y 撤销重做
export function useEditorShortcuts(handlers: ShortcutHandlers): void {
  const { onSave, onSaveAs, onUndo, onRedo } = handlers;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) onSaveAs();
        else onSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSaveAs, onUndo, onRedo]);
}
```

**Step 7:新增 `src/hooks/useLayoutCreationWizard.ts` + `LayoutBrowserModal.tsx`**

hook 承接 3 步状态机(`creationStage`/`selectedOrientation`/`selectedRatio`)与 `handleSelectOrientation`/`handleFinalAction`/`openForCreate`/`openForChange`;组件承接 UI(`OrientationCard` 一并入内)。`handleFinalAction` 内的 `mergeDefaults` 调用改用 10 号方案提供的统一函数(若 10 号未落地,临时保留原内联实现并标注 TODO)。

`openForChange` 作为 callback 返回,即 14 号方案所需的 `onOpenLayoutBrowser`。14 号方案落地后,`EditorPanel` 通过 prop 接收并下发;未落地时,EditorPage 仍可通过 CustomEvent 监听调用(见 Step 9 衔接说明)。

**Step 8:新增 `src/components/editor/modals/ExportModal.tsx`**

承接 `EditorPage.tsx#L512` 的导出格式选择弹窗 UI。props:`isOpen`、`onClose`、`onExport(format: 'png' | 'pdf')`。

**Step 9:重写 `EditorPage.tsx` 为布局组装**

精简后的 EditorPage 仅保留:
- 路由参数解析(`useParams`/`useSearchParams`/`isNewProject`/`templateId`)
- `useProject` 调用与解构(已剔除 `handleExportProject`)
- `usePreview` 调用
- 4 个新 hook 调用(`useProjectPersistence`/`useExportPipeline`/`useEditorShortcuts`/`useLayoutCreationWizard`)
- 文档标题 effect(`L99-L107`,保留,因依赖 `currentFilePath`/`hasUnsavedChanges` 等本地变量)
- 新工程占位 effect(`L140-L149`,保留)
- 布局 JSX(`Sidebar`/`TopNav`/`PreviewArea`/`EditorPanel`/`GlobalSettings`/`LayoutBrowserModal`/`ExportModal`/`OffscreenExportRenderer`)

**衔接 14 号方案**:若 14 号方案已落地,`EditorPanel` 通过 `onOpenLayoutBrowser` prop 接收 `wizard.openForChange`;若未落地,EditorPage 保留 `open-layout-browser` 事件监听(对应 14 号方案的"未落地"分支),监听回调内调 `wizard.openForChange()`。本方案推荐 14 号方案与本方案同批落地,一次性消除事件总线。若必须分批,EditorPage 在过渡期保留监听块并标注 `// TODO: removed by 14-custom-event-bus`,14 号落地时清理。

**删除项**:
- localStorage 迁移 effect(`L123-L138`)。`recentProjects` 服务的 `getRecentProjects()` 已在每次读写时迁移并清理 legacy key(`L28-L36`),effect 冗余。
- `handleExportProject` 解构(`L38`)。
- `handleOpenExportModal`(`L431-L433`)、`handleOpenAddPageModal`(`L425-L429`)内联包装。
- `OrientationCard`(`L527-L529`,移入 `LayoutBrowserModal.tsx`)。
- `exportCancelledRef`(`L71`,移入 `useExportPipeline`)。

### 不做的事

- **不重写 `window` CustomEvent 总线**:报告 4.4 节(14 号方案)专门处理,本节保留 `addEventListener` 现状。5.5 节(19 号方案)修复 `currentPage` 重挂。本方案与两方案正交。
- **不动 `useProject` 内部**:5.1 节处理 `useProject` 的订阅抖动。本方案 `useProjectPersistence` 接收 `useProject` 返回值作为参数,不内部调 `useProject`,避免双重订阅。
- **不合并 `EditorPage` 的 `generateThumb` 与 `useProject` 的轮询缩略图**:两者触发时机不同(主动保存 vs 后台轮询),合并会引入"主动保存是否也走轮询路径"的语义分歧。保留双轨,仅在 `useProjectPersistence` 内部复用 `capturePageThumbnail` 服务。
- **不为 `handleSaveAs` 生成新 id**:报告所称的"IndexedDB 覆写冲突"不存在(见事实核对误述 2)。生成新 id 会引入无依据的行为变更,违背"最简实现"。
- **不删除 `useProject` 内的 `handleExportProject`/`handleImportProject` 派发器**:这两个死派发器由 14 号方案删除。本方案仅删 EditorPage 侧的 `handleExportProject` 解构(`handleImportProject` 本就未解构)。若 14 号方案未落地,`useProject` 仍返回这两项,EditorPage 不解构即可,不影响行为。

## Before / After

### Before(EditorPage.tsx 529 行)

```
EditorPage.tsx (529 行)
├── 路由解析                    L28-L32
├── useProject 解构(23 项)     L34-L43    ← handleExportProject 死解构
├── usePreview                  L53
├── 导出/模态框 state(8 个)    L55-L67
├── 离屏渲染协调                L73-L95    ← 15s 定时器泄漏
├── 文档标题 effect             L99-L107
├── 自动保存 effect             L109-L120
├── localStorage 迁移 effect    L123-L138  ← 重复实现,删除
├── 新工程占位 effect           L140-L149
├── CustomEvent 监听 effect     L151-L179  ← 14 号方案处理
├── generateThumb/updateIndex   L181-L198
├── handleSmartSave             L200-L216
├── handleSaveAs                L218-L235
├── handleNativeOpen            L237-L258
├── handleFinalAction+mergeDefaults L260-L295  ← 10 号方案处理
├── getExportDimensions         L297-L311
├── handleExport(85 行)         L313-L397  ← DOM 爬取 + PDF + ZIP 内联
├── 取消标记 effect             L399-L401
├── 键盘快捷键 effect           L403-L417
├── handleSelectOrientation     L419-L423
├── handleOpenAddPageModal      L425-L429
├── handleOpenExportModal       L431-L433
├── 布局 JSX                    L435-L523
└── OrientationCard             L527-L529
```

### After(EditorPage.tsx < 200 行 + 7 个新文件)

```
EditorPage.tsx (< 200 行)
├── 路由解析 + useProject + usePreview 调用
├── useProjectPersistence()     ← 自动保存/保存/另存为/打开
├── useExportPipeline()         ← 导出 state + offscreen 协调
├── useEditorShortcuts()        ← 键盘快捷键
├── useLayoutCreationWizard()   ← 3 步状态机
├── 文档标题 effect + 新工程占位 effect  保留
├── CustomEvent 监听 effect     ← 14 号方案未落地时保留过渡
└── 布局 JSX(Sidebar/TopNav/PreviewArea/EditorPanel/GlobalSettings
            + LayoutBrowserModal/ExportModal/OffscreenExportRenderer)

新增文件:
- src/services/exportGeometry.ts        ~35 行
- src/services/exportPipeline.ts        ~120 行
- src/hooks/useOffscreenExport.ts        ~55 行
- src/hooks/useExportPipeline.ts         ~50 行
- src/hooks/useProjectPersistence.ts     ~120 行
- src/hooks/useEditorShortcuts.ts        ~35 行
- src/hooks/useLayoutCreationWizard.ts   ~80 行
- src/components/editor/modals/LayoutBrowserModal.tsx  ~70 行
- src/components/editor/modals/ExportModal.tsx         ~20 行
```

### 关键 Before/After diff

**离屏渲染定时器清理(Before)**:

```typescript
const waitForOffscreenRender = useCallback((targetPage: PageData, targetIndex: number) => {
  return new Promise<HTMLElement>((resolve, reject) => {
    offscreenResolveRef.current = resolve;
    setOffscreenTarget({ page: targetPage, index: targetIndex });
    const timer = setTimeout(() => {                       // timer 句柄丢失
      if (offscreenResolveRef.current === resolve) {
        offscreenResolveRef.current = null;
        reject(new Error(`Offscreen render timeout for page ${targetIndex + 1}`));
      }
    }, 15000);
  });
}, []);

const handleOffscreenReady = useCallback((element: HTMLElement) => {
  if (offscreenResolveRef.current) {
    const fn = offscreenResolveRef.current;
    offscreenResolveRef.current = null;
    fn(element);                                            // 未 clearTimeout
  }
}, []);
```

**After**:见 Step 3,`timeoutRef` 保存句柄,`handleOffscreenReady` 与 `resetOffscreen`、卸载 effect 三处清理。

**导出调用(Before)**:

```typescript
const handleExport = useCallback(async (format: 'png' | 'pdf') => {
  exportCancelledRef.current = false;
  setIsExporting(true); setShowExportModal(false); setExportProgress(0);
  try {
    await document.fonts.ready;
    if (exportCancelledRef.current) return;
    // ... 85 行内联 PDF/PNG/ZIP 逻辑 + DOM 爬取 ...
  } catch (exportErr) {
    console.error('[Export] Export failed:', exportErr);
  } finally {
    setOffscreenTarget(null);
    offscreenResolveRef.current = null;
    if (!exportCancelledRef.current) {
      setIsExporting(false); setExportProgress(0);
    }
  }
}, [exportScope, pages, currentPageIndex, projectTitle, fallbackTitle, getExportDimensions, waitForOffscreenRender]);
```

**After**:

```typescript
const handleExport = useCallback(async (format: ExportFormat) => {
  await runExportPipeline({
    format, scope: exportScope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings,
    renderOffscreen: waitForOffscreenRender,
    onProgress: setExportProgress,
    isCancelled: () => exportCancelledRef.current,
  });
}, [exportScope, pages, currentPageIndex, projectTitle, fallbackTitle, printSettings, waitForOffscreenRender]);
```

### 行为差异

| 维度 | Before | After |
|------|--------|-------|
| EditorPage 行数 | 529 | < 200 |
| 离屏渲染定时器 | resolve 后挂起 15 秒,导出 N 页累积 N 个 | resolve 立即清理,卸载时清理 |
| localStorage 迁移 | EditorPage effect + recentProjects 服务双写 | 仅 recentProjects 服务 |
| `handleExportProject` 解构 | 存在,无引用(死代码) | 删除 |
| 导出逻辑测试性 | 内联在组件,需渲染 EditorPage 才能测 | `runExportPipeline` 纯函数,可独立测 |
| 键盘快捷键测试性 | 内联 effect,依赖组件挂载 | hook 可独立 `renderHook` 测 |
| `handleSaveAs` id | 复用原 `projectId` | 复用原 `projectId`(不变,报告所称 bug 不成立) |
| 与 14 号方案衔接 | CustomEvent 监听块待删 | `wizard.openForChange` 即 callback,直接下发 |

### 代码量变化

- `EditorPage.tsx`:`-349` 行(529 → < 200)。
- 新增 9 个文件:`+585` 行(含注释)。
- 净增约 236 行,但分散到 9 个职责单一的模块,每个文件可独立测试与演进。核心收益是 EditorPage 从"上帝组件"降级为布局组装器,且 15 秒定时器泄漏与重复迁移 effect 一并消除。

## 风险与回滚

### 风险

1. **`useProjectPersistence` 参数列表长(15 项)**:该 hook 需要 `useProject` 的多个返回值。参数过多可能让调用点臃肿。**缓解**:这是 `useProject` 聚合瓶颈的衍生问题(13 号方案已指出 `useProject` 一次性订阅 16 切片 + 13 action)。本方案不解决 `useProject` 聚合,仅在 persistence hook 入参收敛为单一 params 对象。**严重度:低。**

2. **`runExportPipeline` 的 `renderOffscreen` 注入点**:导出流水线依赖 EditorPage 提供 `waitForOffscreenRender`,而后者依赖 `OffscreenExportRenderer` 组件挂载。若 `offscreenTarget` state 未正确传递,导出会卡在 Promise 等待。**缓解**:Before 代码即此结构,本方案仅把逻辑搬到 hook,数据流不变。`useExportPipeline` 返回 `offscreenTarget`,EditorPage 仍渲染 `<OffscreenExportRenderer page={offscreenTarget.page} ... />`。**严重度:低。**

3. **`EditorPage.test.tsx` mock 完整性**:该测试 `vi.mock('../../hooks/usePreview', ...)`(`L198-L200`)、`vi.mock('../../store/useStore', ...)`(`L149-L151`)、`vi.mock('../../utils/native-fs', ...)`(`L73-L82`)但未 mock 新增的 4 个 hook 与 2 个服务。新增 hook 内部调用 `useProject`(已 mock store)、`nativeFs`(已 mock)、`capturePageThumbnail`(未 mock)。`capturePageThumbnail` 在 `previewRef.current` 为 null 时早返回,测试用例 `previewRef: { current: null }`(`L190`)即此情况,不触发真实 Canvas。`runExportPipeline` 在测试用例中不被调用(只渲染组件,不点导出按钮),模块加载时 `exportPipeline.ts` 会 `import { exportPagesToZip } from '../utils/db'`,但 `db.ts` 顶层仅函数声明无副作用,加载安全。**严重度:低,需验证。**

4. **自动保存 effect 依赖项变化**:Before 依赖 `[isLoaded, projectId, hasUnsavedChanges, pages, projectTitle, theme, saveToDB]`;After 移入 hook 后依赖项不变,但 `previewRef` 加入依赖(hook 内 `saveToDB(previewRef, false)`)。`previewRef` 是 `usePreview` 返回的稳定 ref 对象,引用不变,不引入额外触发。**严重度:无。**

5. **与 14 号方案的落地顺序**:若本方案先落地而 14 号未落地,`wizard.openForChange` 需暂接 CustomEvent 监听(保留原 `useEffect([currentPage])` 块,改为调 `wizard.openForChange()`)。这会产生临时过渡代码。**缓解**:推荐两方案同批落地。若必须分批,本方案在 EditorPage 保留过渡监听块并标注 `// TODO: removed by 14-custom-event-bus`,14 号落地时清理。**严重度:中。**

6. **`handleExportProject` 解构删除与 `useProject.test.ts` 的关系**:`useProject.test.ts` 9 个用例(`L102-L227`)未断言 `handleExportProject`/`handleImportProject` 的存在(14 号方案已核对)。删除 EditorPage 侧解构项不破坏 `useProject.test.ts`。但 `useProject` 的返回对象仍含 `handleExportProject`(14 号方案删除),本方案仅删 EditorPage 侧解构。**严重度:无。**

7. **不生成新 id 是否正确**:本方案保留 `handleSaveAs` 复用原 `projectId` 的行为。若产品方后续确认"另存为副本应为独立工程",则需重新评估。但当前报告所述"覆写冲突"不成立(见事实核对误述 2),无依据引入该变更。**严重度:无(基于事实核对)。**

### 回滚

本方案是纯重构,无数据迁移、无 store schema 变更、无路由变更、无 IPC 协议变更。回滚方式:

1. `git revert` 本次提交,恢复 `EditorPage.tsx` 原状。
2. 删除新增文件:`src/services/exportGeometry.ts`、`src/services/exportPipeline.ts`、`src/hooks/useOffscreenExport.ts`、`src/hooks/useExportPipeline.ts`、`src/hooks/useProjectPersistence.ts`、`src/hooks/useEditorShortcuts.ts`、`src/hooks/useLayoutCreationWizard.ts`、`src/components/editor/modals/LayoutBrowserModal.tsx`、`src/components/editor/modals/ExportModal.tsx`。

回滚是干净的文件级操作。

## 验证方式

1. **类型检查**:

   ```
   npx tsc --noEmit
   ```

   预期:4 个新 hook 与 2 个新服务的类型导出正确,`EditorPage.tsx` 重写后无 `noUnusedLocals` 报错(`handleExportProject` 解构删除后不残留)。

2. **单测(729 项不破坏)**:

   ```
   npm run test:unit:run
   ```

   预期:85 个测试文件、729 项全部通过。重点核对:
   - `src/pages/__tests__/EditorPage.test.tsx` 6 个用例(`renders without crashing`、`renders main layout sections`、`renders loading state`、`loads project when projectId differs`、`navigates to home`、`sets document title`、`shows unsaved changes indicator`)。拆解后 EditorPage 仍渲染 `sidebar`/`topnav`/`preview-area`/`editor-panel` 四个 `data-testid`,且 `document.title` 行为不变。
   - `src/hooks/__tests__/useProject.test.ts` 9 个用例(本方案不动 `useProject` 内部)。
   - `src/components/editor/__tests__/TopNav.test.tsx` 的 Save/Save As 按钮文案断言。

3. **新增单测(建议)**:
   - `src/services/__tests__/exportGeometry.test.ts`:覆盖 `printSettings.enabled` true/false、`bindingSide` 四方向、`gutterMm` 边界。
   - `src/services/__tests__/exportPipeline.test.ts`:mock `toPng`/`jsPDF`/`exportPagesToZip`/`nativeFs.isElectron`,验证四分支分派与 `isCancelled` 守卫、`attachResumeLinks` 调用。
   - `src/hooks/__tests__/useOffscreenExport.test.ts`:断言 `handleOffscreenReady` 调用后 `timeoutRef` 被清理(用 `vi.spyOn(global, 'clearTimeout')`);用 `vi.useFakeTimers` 验证 15 秒后无遗留 reject。
   - `src/hooks/__tests__/useEditorShortcuts.test.ts`:`renderHook` 后 `fireEvent.keyDown(window, { key: 's', ctrlKey: true })`,断言 `onSave` 被调用;`Shift+S` 断言 `onSaveAs`。

4. **静态核对:死代码与冗余应消失**:

   ```
   grep -rn "handleExportProject" src/pages/EditorPage.tsx
   grep -rn "magazine_recent_projects" src/pages/EditorPage.tsx
   ```

   预期:两条命令在 `EditorPage.tsx` 下命中数为 0。`magazine_recent_projects` 仅在 `src/services/recentProjects.ts` 与测试中保留。

5. **行为人工验证**(遵从项目 verify skill 精神,驱动真实流程):
   - 启动 `npm run dev`,打开任意项目,进入编辑器。
   - **导出**:点击导出按钮,选择 PNG(单页)、PNG(全部)、PDF 三种路径,验证文件生成且页数正确。在 Electron 环境下验证"多页 PNG 直接写入目录"。简历模板导出 PDF 后验证链接可点击。
   - **快捷键**:`Ctrl+S`(Web 端触发 IndexedDB 写入)、`Ctrl+Shift+S`(Web 端触发 JSON 下载)、`Ctrl+Z`/`Ctrl+Y` 撤销重做。
   - **自动保存**:修改任意字段,等待 3 秒,验证 IndexedDB 写入(DevTools Application 面板)。
   - **3 步模态框**:新建工程时验证 orientation → ratio → template 流程;`EditorPanel` 内点 "Change Layout" 验证弹窗初始比例与当前页一致。
   - **另存为**:Web 端 `Ctrl+Shift+S` 验证下载 JSON 备份;Electron 端验证副本文件生成、RecentProjects 索引更新当前工程的文件路径。
   - **定时器清理**:连续导出 5 页 PDF,导出结束后用 DevTools Performance 面板观察 15 秒内无遗留定时器回调。

6. **E2E 回归(6 套不破坏)**:

   ```
   npm run test:e2e
   ```

   预期:`05-native-ipc-and-export.spec.ts`(导出与 IPC,断言 `electronAPI` 含 `saveProject`/`openProject`/`selectDirectory`/`saveFileBuffer`/`setCurrentProject`)、`08-project-persistence-and-storage.spec.ts`(持久化)、`09-undo-redo-and-keyboard-shortcuts.spec.ts`(快捷键)全部通过。这三套直接覆盖本方案涉及的行为。

## 涉及文件

新增:
- `src/services/exportGeometry.ts`
- `src/services/exportPipeline.ts`
- `src/hooks/useOffscreenExport.ts`
- `src/hooks/useExportPipeline.ts`
- `src/hooks/useProjectPersistence.ts`
- `src/hooks/useEditorShortcuts.ts`
- `src/hooks/useLayoutCreationWizard.ts`
- `src/components/editor/modals/LayoutBrowserModal.tsx`
- `src/components/editor/modals/ExportModal.tsx`

修改:
- `src/pages/EditorPage.tsx`(重写为布局组装,< 200 行)

删除(在 EditorPage 内):
- localStorage 迁移 effect(`L123-L138`)
- `handleExportProject` 解构(`L38`)
- `handleOpenExportModal`(`L431-L433`)、`handleOpenAddPageModal`(`L425-L429`)内联包装
- `OrientationCard`(`L527-L529`,移入 `LayoutBrowserModal.tsx`)

不动(由对应方案处理):
- `src/hooks/useProject.ts`(`handleExportProject`/`handleImportProject` 派发器由 14 号方案删除)
- `src/components/Editor.tsx`(`onOpenLayoutBrowser` callback 由 14 号方案新增)
- `src/components/editor/EditorPanel.tsx`(透传由 14 号方案新增)
- `src/store/useStore.ts`(`mergeDefaults`/`getDefaultPage` 统一由 10 号方案处理)
- `src/services/recentProjects.ts`(localStorage 迁移已内置,无需改动)
- `src/components/editor/OffscreenExportRenderer.tsx`(挂载点不变,仅 props 由 `useExportPipeline` 提供)
