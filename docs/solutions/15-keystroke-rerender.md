# 5.1 击键重渲染雪崩修复

## 事实核对

报告对问题核心定位准确，以下逐一核对并校正三处细节。

1. **16 状态切片聚合属实**。`src/hooks/useProject.ts#L9-L24` 确有 16 个状态 selector：`pages`、`projectTitle`、`theme`、`currentPageIndex`、`isLoaded`、`activeProjectId`、`past`、`future`、`printSettings`、`imageQuality`、`minimalCounter`、`counterStyle`、`customFonts`、`currentFilePath`、`designSystem`、`hasUnsavedChanges`。另有 19 个 action selector（`L26-L46`），但 zustand action 引用稳定不触发重渲染——**真正引爆雪崩的是 16 个状态切片，不是 35 个**。

2. **一级子组件未包 React.memo 属实**。`TopNav`（`TopNav.tsx#L119`）、`Sidebar`（`Sidebar.tsx#L166`）、`PreviewArea`（`PreviewArea.tsx#L150`）、`EditorPanel`（`EditorPanel.tsx#L46`）均以 `export default` 裸导出，无 `React.memo`。`Preview`（`Preview.tsx#L21`）与 `VirtualPageListItem`（`VirtualPageListItem.tsx#L21`）已 memo——这两处是已做对的基线，本方案不动。

3. **每键触发 `pages` 新引用属实**。`src/store/useStore.ts#L406` `updatePage` 执行 `nextPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p)`，每次都生成新数组引用与被编辑页的新对象引用。无论 `silent` 是否为 `true`，`L414` 的 `set({ pages: nextPages, hasUnsavedChanges: true })` 都会执行。`pages` 引用每键必变，是雪崩的真正驱动源。

4. **`hasUnsavedChanges` 每键命中——需校正**。首次 `false → true` 时订阅触发；此后 `true → true`，Zustand 用 `Object.is` 比对，**不触发**。所以"每键都命中 `hasUnsavedChanges` 订阅"不成立，每键必命中的只有 `pages`。

5. **"向 Web Worker 重新发送排版请求"——需校正**。`useKnuthPlassLayout`（`src/hooks/useKnuthPlassLayout.ts#L89-L117`）有 500ms 防抖 + `cacheKey`（基于 `text`/`fontFamily`/`maxSize`/`containerWidth` 等字段）守卫。仅在文本内容实际变化且防抖到期时才 `postMessage`。击键时被重算的是 **React 调和树**，Worker 请求并非每键一发。报告把"调和开销"与"Worker 请求"混为一谈，需拆开陈述。

6. **"数十个组件"属实**。EditorPage 一级子树含 `TopNav`、`Sidebar`（N 个 `VirtualPageListItem`）、`PreviewArea`→`Preview`→模板递归树、`EditorPanel`→`Editor`→`FieldRenderer`→各 `Field`。典型模板 10+ 字段，整树 50+ 节点，"数十个"是公允描述。

## 根因

**订阅聚合点与渲染聚合点重合，且下游无隔离层。**

`useProject` 把 16 个状态切片的订阅全部集中在 EditorPage 这一层，返回新对象字面量；EditorPage 解构后下传给 4 个一级子组件，而它们都没有 `React.memo`。于是任何切片变化 → EditorPage 重渲染 → 全树调和。

放大器是 `pages` 切片：高频变化（每键新引用），且被下传给 `Sidebar`、`PreviewArea`、`EditorPanel` 三个子树。即便 `TopNav` 完全不消费 `pages`，也因无 memo 与 EditorPage 同步重渲染。

次要因素：

- `EditorPage.tsx` 的 JSX 内联回调（`onClearAll`、`onImport`、`onToggleFontManager`、`onNavigateHome`、`onExportPng`）每次渲染都新建引用。即使给子组件包 `React.memo`，浅比较也会因这些 inline prop 失效而穿透。
- `useProject` 返回对象无引用稳定性（每次调用都是新字面量）。这本身不是雪崩根因（hook 只在订阅切片变化时才重跑），但它让"包 memo"这一补救措施无法天然生效——必须配合 props 稳定化。

## 解决方案

分两层推进。Phase 1 是最小有效止血，单独即可消除"全树调和"；Phase 2 是结构改善，降低长期订阅面。遵从 `~/.claude/CLAUDE.md`：最简实现、不保留向后兼容、不破坏现有测试。

> **取舍说明**：Phase 1 已能完全消除雪崩症状（TopNav 与 N-1 个 Sidebar 条目跳过）。Phase 2 的边际收益主要在"EditorPage 自身不重渲染"，对击键场景收益有限，属结构清理。若仅追求止血，落地 Phase 1 即可；Phase 2 视后续性能 profiling 再决定是否推进。

### Phase 1：关键子组件 memo + 稳定 callback（最小有效）

**Step 1.1：4 个一级子组件包 `React.memo`**

以 `Sidebar` 为例（其余三个同构）：

```typescript
// Before
const Sidebar: React.FC<SidebarProps> = ({ ... }) => { ... };
export default Sidebar;
```

```typescript
// After — 命名函数 + memo，保留 DevTools 显示名
const Sidebar = React.memo(function Sidebar({ ... }: SidebarProps) { ... });
export default Sidebar;
```

`Preview`、`VirtualPageListItem` 已 memo，保持不动。

**Step 1.2：稳定 EditorPage 的 inline callback**

5 个内联回调收进 `useCallback`：

```typescript
// Before — 每次渲染新建引用，穿透 memo
onClearAll={() => useStore.getState().loadProject(projectId!)}
onImport={() => fileInputRef.current?.click()}
onToggleFontManager={() => setShowSettings(!showSettings)}
onNavigateHome={() => navigate('/')}
onExportPng={(all) => { setExportScope(all ? 'all' : 'current'); setShowExportModal(true); }}
```

```typescript
// After
const handleClearAll = useCallback(() => {
  if (projectId) useStore.getState().loadProject(projectId);
}, [projectId]);

const handleImport = useCallback(() => {
  fileInputRef.current?.click();
}, []);

const handleToggleFontManager = useCallback(() => {
  setShowSettings(prev => !prev);
}, []);

const handleNavigateHome = useCallback(() => navigate('/'), [navigate]);

const handleExportPng = useCallback((all: boolean) => {
  setExportScope(all ? 'all' : 'current');
  setShowExportModal(true);
}, []);
```

`onExport={handleOpenExportModal}`、`onAddPage={handleOpenAddPageModal}` 已是 `useCallback`，无需动。`onUpdatePage={updatePage}`、`onRemovePage={removePage}`、`onReorderPages={reorderPages}` 来自 store，引用稳定，无需动。`previewRef`/`previewContainerRef` 是 `useRef`，稳定。

> `GlobalSettings` 的 `setCounterColor={(value) => currentPage && updatePage({ ...currentPage, counterColor: value })}` 也是 inline，但它在 `Modal` 内、非高频路径，Phase 1 不动。

**Step 1.3：核查其余 inline prop**

对每个 memo 子组件的 prop 逐项核查 `useCallback` / `useMemo` 稳定性。原则：原生值与 store action 稳定，`useState` setter 稳定，`useRef` 稳定；凡是 JSX 内联函数与对象字面量都需收进 `useCallback` / `useMemo`。

### Phase 1 效果边界

击键时 `pages` 变 → `useProject` 重跑 → EditorPage 重渲染（无法避免，EditorPage 消费 `pages`）。下游：

| 子组件 | 是否重渲染 | 原因 |
|--------|-----------|------|
| `TopNav`（memo） | 跳过 | props 全稳定（`projectTitle`/`currentPageIndex`/`totalPages` 均未变） |
| `Sidebar`（memo） | 重渲染 | `pages` prop 变 |
| `VirtualPageListItem`（memo）× N | 仅 1 项重渲染 | 被编辑页对象引用变，其余 N-1 项引用不变 |
| `PreviewArea`（memo） | 重渲染 | `currentPage` prop 变（必要） |
| `EditorPanel`（memo） | 重渲染 | `currentPage` prop 变（必要） |

"全树调和"收敛为"必要子树调和"。TopNav 与 N-1 个 Sidebar 条目跳过，是主要收益。

### Phase 2：拆分 useProject + 订阅下沉（结构改善）

> 遵从 `~/.claude/CLAUDE.md` "avoid speculative abstractions"：本阶段为可选结构清理，非止血必需。落地前建议用 React DevTools Profiler 确认 EditorPage 自身重渲染是真实瓶颈。

**Step 2.1：拆分为 4 个聚焦 hook**

```typescript
// src/hooks/useProjectPages.ts — 高频切片
export function useProjectPages() {
  const pages = useStore(s => s.pages);
  const currentPageIndex = useStore(s => s.currentPageIndex);
  const updatePage = useStore(s => s.updatePage);
  const addPage = useStore(s => s.addPage);
  const removePage = useStore(s => s.removePage);
  const reorderPages = useStore(s => s.reorderPages);
  const setCurrentPageIndex = useStore(s => s.setCurrentPageIndex);
  const currentPage = pages[currentPageIndex];
  return { pages, currentPageIndex, currentPage, updatePage, addPage, removePage, reorderPages, setCurrentPageIndex };
}
```

```typescript
// src/hooks/useProjectMeta.ts — 低频元数据
export function useProjectMeta() {
  const projectTitle = useStore(s => s.projectTitle);
  const setProjectTitle = useStore(s => s.setProjectTitle);
  const theme = useStore(s => s.theme);
  const setTheme = useStore(s => s.setTheme);
  const isLoaded = useStore(s => s.isLoaded);
  const currentFilePath = useStore(s => s.currentFilePath);
  const setCurrentFilePath = useStore(s => s.setCurrentFilePath);
  return { projectTitle, setProjectTitle, theme, setTheme, isLoaded, currentFilePath, setCurrentFilePath };
}
```

```typescript
// src/hooks/useProjectSettings.ts — 设置面板切片
export function useProjectSettings() {
  const printSettings = useStore(s => s.printSettings);
  const setPrintSettings = useStore(s => s.setPrintSettings);
  const imageQuality = useStore(s => s.imageQuality);
  const setImageQuality = useStore(s => s.setImageQuality);
  const minimalCounter = useStore(s => s.minimalCounter);
  const setMinimalCounter = useStore(s => s.setMinimalCounter);
  const counterStyle = useStore(s => s.counterStyle);
  const setCounterStyle = useStore(s => s.setCounterStyle);
  const customFonts = useStore(s => s.customFonts);
  const setCustomFonts = useStore(s => s.setCustomFonts);
  return { printSettings, setPrintSettings, imageQuality, setImageQuality,
           minimalCounter, setMinimalCounter, counterStyle, setCounterStyle,
           customFonts, setCustomFonts };
}
```

```typescript
// src/hooks/useProjectHistory.ts — 撤销栈，细化订阅
export function useProjectHistory() {
  // 只订 length 不订数组：pushHistory 换引用但 length 不变时不触发
  const pastLength = useStore(s => s.past.length);
  const futureLength = useStore(s => s.future.length);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const hasUnsavedChanges = useStore(s => s.hasUnsavedChanges);
  const markAsSaved = useStore(s => s.markAsSaved);
  return {
    pastLength, futureLength,
    canUndo: pastLength > 0,
    canRedo: futureLength > 0,
    undo, redo, hasUnsavedChanges, markAsSaved,
  };
}
```

**关于 `useShallow` 的取舍**：原 `useProject` 把 `past`/`future` 数组整个订阅，每次 `pushHistory` 都换引用。改为订阅 `s.past.length`（number）后，length 不变即不触发——这是"单独 selector"比 `useShallow` 更精准的场景。`useShallow` 适合"必须返回多字段对象且字段都可能变"的场景（如 `useProjectSettings` 返回 10 字段），可用 `useShallow` 合并以避免每次返回新对象：

```typescript
// 可选：useShallow 合并多字段返回
import { useShallow } from 'zustand/shallow';

export function useProjectSettings() {
  return useStore(useShallow(s => ({
    printSettings: s.printSettings,
    setPrintSettings: s.setPrintSettings,
    imageQuality: s.imageQuality,
    setImageQuality: s.setImageQuality,
    // ... 其余字段
  })));
}
```

zustand 4.5.5 的 `useShallow` 从 `zustand/shallow` 导入（已核对 `node_modules/zustand/shallow.js` 存在）。

> **注意**：对 `useProjectPages` 不要用 `useShallow` 合并 `pages` —— `pages` 每键必变，浅比较永远失败，`useShallow` 反而多一次浅比较开销。`pages` 用单独 selector 即可。

**Step 2.2：`useProject` 退化为编排 hook**

`useProject` 不再聚合 16 切片，只保留 EditorPage 编排逻辑：`saveToDB`、缩略图定时器、`loadProject` 包装、`handleExportProject`/`handleImportProject`。编排逻辑中需要读状态的地方改用 `useStore.getState()`（快照读取，不订阅），这样 EditorPage 自身不再因 `pages` 变化而重渲染。

```typescript
// useProject 退化为编排层 — 不再订阅状态
export function useProject(projectId: string | undefined, templateId: string | null) {
  const loadProjectSync = useStore(s => s.loadProject);
  const loadProject = useCallback(async (idOrData: any, tpl?: string | null, fp?: string | null) => {
    await loadProjectSync(idOrData, tpl, fp);
  }, [loadProjectSync]);

  // saveToDB 内部用 getState 读取最新快照
  const saveToDB = useCallback(async (previewRef: React.RefObject<HTMLDivElement | null>, forceThumbnail: boolean = true) => {
    const { projectId: pid, isLoaded, activeProjectId, pages, projectTitle, theme,
            designSystem, customFonts, imageQuality, printSettings,
            minimalCounter, counterStyle, currentFilePath } = useStore.getState();
    if (!pid || !isLoaded || activeProjectId !== pid || pages.length === 0) return;
    // ... 其余保存逻辑不变
  }, []);

  // ... 缩略图定时器、export/import 触发逻辑不变
}
```

**Step 2.3：子组件直接调用聚焦 hook**

`TopNav`、`Sidebar`、`PreviewArea`、`EditorPanel` 不再从 props 接收状态切片，改为各自调用聚焦 hook：

```typescript
// TopNav — 内部订阅 meta + history，不再接收 projectTitle/canUndo 等 props
const TopNav = React.memo(function TopNav() {
  const { projectTitle, setProjectTitle } = useProjectMeta();
  const { canUndo, canRedo, undo, redo } = useProjectHistory();
  const currentPageIndex = useStore(s => s.currentPageIndex);
  const totalPages = useStore(s => s.pages.length);
  // ...
});
```

下沉的边界：`Sidebar`、`PreviewArea`、`EditorPanel` 都需要 `pages`，各自调 `useProjectPages()` 产生 3 次 `pages` 订阅——Zustand 单 store 多 selector 成本极低（每次 `set` 多跑 3 个 selector 函数），且各自重渲染只影响自身子树。下沉的收益是 EditorPage 自身不再订阅 `pages`，从而击键时 EditorPage 不重渲染。

> `currentPageIndex` 是独立切片，`Sidebar`/`PreviewArea`/`EditorPanel`/`TopNav` 都需要，但只在翻页时变化（非击键路径），3-4 次订阅成本可忽略。若担心，可让 `useProjectPages` 同时返回 `currentPageIndex`，子组件共用。

**Step 2.4：测试同步**

遵从 CLAUDE.md "不保留向后兼容"：删除 `useProject` 旧返回结构，不留 facade；测试跟随更新。

- `src/hooks/__tests__/useProject.test.ts`：现有测试 mock 了 `useStore`（`vi.mock('../../store/useStore', () => ({ useStore: vi.fn() }))`）。拆分后 `useProject` 内部仍可能调 `useStore`（取 `loadProject`/`getState`），mock 机制保留；但断言需按新返回结构调整（`useProject` 不再返回 `pages`/`projectTitle` 等，改返回 `saveToDB`/`loadProject` 等编排能力）。
- 新增 `useProjectPages.test.ts`、`useProjectMeta.test.ts`、`useProjectSettings.test.ts`、`useProjectHistory.test.ts`：各 hook 独立单测。`useProjectHistory` 单测重点验证"`past.length` 未变时不触发重渲染"（用 `renderHook` + `act` 推一次等价 snapshot，断言 rerender 次数为 0）。
- `src/pages/__tests__/EditorPage.test.tsx`：mock 机制不变（仍 mock `useStore`），但子组件改直订后，需确保 mock store 状态覆盖子组件所需切片。现有 store mock 已含全量字段，应能通过。
- `src/components/ui/__tests__/IconPicker.test.tsx`、`src/components/editor/fields/__tests__/ImageField.test.tsx`：两者 mock 了 `useProject` 返回 `{ imageQuality }`。但核查 `IconPicker.tsx#L77` 与 `ImageField` 实际是从 `useStore` 直订 `imageQuality`，不经 `useProject`——这两个 mock 本就无效，拆分时一并删除。

## Before / After

### Before：击键时的订阅与调和

```
keystroke → updatePage → set({ pages: nextPages, hasUnsavedChanges: true })
  └─ useProject 16 状态订阅命中（pages 必中，hasUnsavedChanges 仅首次命中）
       └─ EditorPage 重渲染
            ├─ TopNav (无 memo) 重渲染 — props 未变，纯浪费
            ├─ Sidebar (无 memo) 重渲染 — pages 变
            │    └─ VirtualPageListItem × N 重渲染 — 仅 1 项必要
            ├─ PreviewArea (无 memo) 重渲染 — 必要
            │    └─ Preview (memo) 重渲染 — page 变，必要
            └─ EditorPanel (无 memo) 重渲染 — 必要
                 └─ FieldRenderer → Field 重渲染
```

### After Phase 1：memo + 稳定 callback

```
keystroke → updatePage → set({ pages, hasUnsavedChanges })
  └─ useProject 重跑 → EditorPage 重渲染
       ├─ TopNav (memo) — props 全稳定 → 跳过
       ├─ Sidebar (memo) — pages 变 → 重渲染
       │    └─ VirtualPageListItem (memo) × N — 仅 1 项重渲染
       ├─ PreviewArea (memo) — currentPage 变 → 重渲染（必要）
       └─ EditorPanel (memo) — currentPage 变 → 重渲染（必要）
```

### After Phase 2：订阅下沉

```
keystroke → updatePage → set({ pages, hasUnsavedChanges })
  └─ useProjectPages (在 Sidebar/PreviewArea/EditorPanel 内) 命中
  └─ useProjectMeta (在 TopNav 内) 未变 → TopNav 跳过（即便无 memo）
  └─ EditorPage 编排层不订阅 pages → 不重渲染
       └─ 子组件各自订阅各自切片，独立重渲染
```

### 代码量变化

- Phase 1：4 个子组件各包 `React.memo`（+4 行）；EditorPage 5 个 inline callback 收进 `useCallback`（约 +25 行）。净增约 30 行。
- Phase 2：新增 4 个聚焦 hook 文件（约 +120 行）；`useProject.ts` 退化为编排层（约 -90 行净减聚合代码）；新增 4 个 hook 单测（约 +80 行）；调整现有 `useProject.test.ts` 与 `EditorPage.test.tsx` 断言。

## 风险与回滚

### 风险

1. **`React.memo` 浅比较的隐式依赖**：memo 只做 props 浅比较，若子组件通过 `useStore` 直订了未列入 props 的切片，memo 跳过 props 比较仍会因 store 变化重渲染——这是已有行为，不构成回退。**严重度：无。**

2. **inline callback 稳定化遗漏**：若漏包某个 callback，对应 memo 子组件会每次穿透。`tsc` 不报，需 code review 兜底。**严重度：低，机械可控。**

3. **Phase 2 下沉后 `pages` 多订阅**：`Sidebar`/`PreviewArea`/`EditorPanel` 各订一次 `pages`，共 3 次。Zustand 单 store 多 selector 开销是每次 `set` 跑 3 个 selector 函数，可忽略。**严重度：低。**

4. **`saveToDB` 改 `getState()` 读取的时序**：`saveToDB` 当前闭包捕获 `pages`/`projectTitle` 等；改为 `getState()` 后在调用时刻读最新快照，与原行为等价（原闭包也是当时的最新值）。但 auto-save effect（`EditorPage.tsx#L110-L120`）的依赖数组列了 `pages`/`projectTitle`/`theme`/`saveToDB`，Phase 2 后 `saveToDB` 引用稳定（无状态依赖），effect 仍会因 `pages` 变而重新调度——需把依赖改为 `hasUnsavedChanges` + `projectId` + `isLoaded`，让防抖定时器只在"有未保存变更"时启动而非每键重排。**严重度：中，需核对 effect 依赖。**

5. **测试 mock `useProject` 的下游**：`IconPicker.test.tsx`、`ImageField.test.tsx` mock 了 `useProject` 返回 `{ imageQuality }`。但实际组件从 `useStore` 直订，mock 本就无效。拆分时删除这两个 mock，测试应仍通过。**严重度：低。**

### 回滚

改造分两阶段、互相独立：

- Phase 1 改动文件：`TopNav.tsx`、`Sidebar.tsx`、`PreviewArea.tsx`、`EditorPanel.tsx`、`EditorPage.tsx`。无 store schema 变更，无数据迁移。
- Phase 2 改动文件：新增 `useProjectPages.ts`、`useProjectMeta.ts`、`useProjectSettings.ts`、`useProjectHistory.ts`；改写 `useProject.ts`；调整 `EditorPage.tsx` 与 4 个子组件的订阅方式；同步测试。

任一阶段可独立 `git revert`。建议先合并 Phase 1 验证收益，再视 profiling 决定是否推进 Phase 2。

## 验证方式

1. **类型与单测**：
   - `npx tsc --noEmit`：确认 4 个子组件 memo 包裹后签名不变；Phase 2 确认聚焦 hook 入参/返回类型正确、`useProject` 退化后无未用 import（`noUnusedLocals` 兜底）。
   - `npm test -- useProject`：跑通拆分后的 hook 单测（含新增 `useProjectHistory` 的"length 未变不重渲染"用例）。
   - `npm test -- EditorPage Sidebar TopNav`：跑通组件单测，确认 memo 包裹不破坏行为断言。
   - `npm test -- IconPicker ImageField`：确认清理冗余 `useProject` mock 后仍通过。

2. **订阅面静态核对**（Phase 2 核心验证）：
   ```
   grep -rn "useStore(s =>" src/hooks/useProject.ts
   ```
   Phase 2 后预期：`useProject.ts` 内状态 selector 调用数为 0（编排层不再订阅状态，仅取 action 与 `getState`）。

3. **行为人工验证**（遵从项目 verify skill，驱动真实流程）：
   - 启动 dev server，打开任意项目，进入编辑器。
   - 用 React DevTools Profiler 录制：在 `EditorPanel` 的文本字段中连续键入 10 个字符。
     - Phase 1 预期：每键 `EditorPage` 重渲染 1 次，`TopNav` 0 次，`Sidebar` 1 次（但 `VirtualPageListItem` 仅 1 项），`PreviewArea` 1 次，`EditorPanel` 1 次。
     - Phase 2 预期：每键 `EditorPage` 0 次重渲染，子组件各自按需重渲染。
   - 回归：翻页、undo/redo、切模板、导出 PNG/PDF、auto-save 触发，确认无渲染崩溃或功能丢失。

4. **渲染性能回归**（可选）：
   - 改造前用 Profiler 录制 10 次键入，记录 commit 次数与每 commit 的组件数。
   - Phase 1 后同样操作，预期总 commit 组件数下降（TopNav 与 N-1 个 Sidebar 条目跳过）。

## 涉及文件

Phase 1：
- `src/components/editor/TopNav.tsx` — 包 `React.memo`
- `src/components/editor/Sidebar.tsx` — 包 `React.memo`
- `src/components/editor/PreviewArea.tsx` — 包 `React.memo`
- `src/components/editor/EditorPanel.tsx` — 包 `React.memo`
- `src/pages/EditorPage.tsx` — 5 个 inline callback 收进 `useCallback`

Phase 2：
- 新增 `src/hooks/useProjectPages.ts`
- 新增 `src/hooks/useProjectMeta.ts`
- 新增 `src/hooks/useProjectSettings.ts`
- 新增 `src/hooks/useProjectHistory.ts`
- 改写 `src/hooks/useProject.ts` — 退化为编排层
- 调整 `src/pages/EditorPage.tsx` 与 4 个子组件的订阅方式
- 同步 `src/hooks/__tests__/useProject.test.ts`、新增 4 个聚焦 hook 单测
- 清理 `src/components/ui/__tests__/IconPicker.test.tsx`、`src/components/editor/fields/__tests__/ImageField.test.tsx` 的冗余 `useProject` mock
