# 5.5 全局事件监听器生命周期稳定

## 事实核对

报告对问题点的描述属实，核对结论如下：

1. **依赖项确认**: `src/pages/EditorPage.tsx#L179` 的 `useEffect` 依赖数组确为 `[currentPage]`。三个 `window.addEventListener`（`open-layout-browser`、`show-export-modal`、`trigger-import`）在 cleanup 阶段被 `removeEventListener` 注销。

2. **`currentPage` 来源与抖动链路确认**: `currentPage` 来自 `useProject.ts#L147` 的 `pages[currentPageIndex]`。`pages` 由 `useStore(s => s.pages)` 订阅。用户在 `EditorPanel` 中编辑当前页字段时，`updatePage` 调用 `set({ pages: nextPages, hasUnsavedChanges: true })`（`useStore.ts#L456`），`pages` 数组引用变更 → `useProject` 返回值变 → `EditorPage` 重渲染 → `currentPage` 指向新对象引用 → `useEffect` 命中依赖变化 → 执行 cleanup 注销三个监听器后重新挂载。报告所描述的 "每一次敲键都被注销并重新挂载" 准确。

3. **触发频率核实**: 实际触发频率不止 "敲键"。任何会更新 `pages` 的操作（`updatePage`、`addPage`、`removePage`、`reorderPages`、`undo`、`redo`、`loadProject`、自动保存回写）都会引发同一抖动。报告将其归因于 "用户打字" 是低估了触发面，但严重级别判断（Major）仍成立。

4. **与 4.4 的协同关系确认**: 4.4 指出三个 `CustomEvent` 是隐式全局事件总线（`useProject.ts#L48-L56` 派发，`EditorPage.tsx#L170-L179` 监听）。本节的监听器抖动是这条事件总线的接收端生命周期问题。**若 4.4 方案将事件总线收敛为 Zustand UI Slice 或直接 callback，监听器本身将被删除，5.5 的抖动随之消失。** 但 4.4 的收敛是较大改动且涉及 `Sidebar`/`TopNav`/`Editor.tsx` 多个调用点；5.5 应作为可独立落地的最小修复，先行消除抖动，不依赖 4.4 的进度。

5. **`handleOpenBrowser` 内部对 `currentPage` 的真实读取**: 监听回调 `handleOpenBrowser`（`EditorPage.tsx#L152-L160`）确实读取了 `currentPage.aspectRatio` 用于初始化弹窗的 `selectedOrientation`/`selectedRatio`。这正是原代码把 `currentPage` 列入依赖的原因——作者为了让回调闭包捕获最新值。问题在于选择了错误的稳定化手段（用 effect 依赖刷新闭包），导致监听器随之重挂。

## 根因

直接根因是 **闭包刷新策略错位**：作者需要让 `handleOpenBrowser` 在事件触发时读到最新的 `currentPage`，但没有用 `ref` 稳定化读取入口，而是把 `currentPage` 塞进 `useEffect` 依赖数组，用 "重挂监听器" 这种重量级操作来换取 "闭包刷新"。

深层根因有两条：

- **副作用与状态读取耦合**：监听器注册是只需执行一次的副作用（mount/unmount 语义），而回调内读取的是会频繁变化的状态。两者被同一个 `useEffect` 承担，必然冲突。
- **与 4.4 的事件总线设计同源**：正因为使用了 `window` CustomEvent 这种无类型的隐式通道，TypeScript 无法在派发端与监听端之间建立契约，监听端只能靠闭包捕获状态，于是状态刷新需求被错误地映射到 effect 依赖上。这是 4.4 的衍生症状，但 5.5 可在不动事件总线的前提下先行修复。

## 解决方案

将 `currentPage` 通过 `ref` 稳定化，监听器在回调内读 ref.current 而非闭包变量；`useEffect` 依赖数组改为 `[]`，仅在 mount/unmount 执行一次。

### 设计原则（遵从 ~/.claude/CLAUDE.md）

- **不保留向后兼容**：直接修改原 `useEffect`，不保留 `[currentPage]` 版本的分支或中间层。
- **最简实现**：用一个 `currentPageRef` 解决问题，不引入 `useEventCallback`/`useLatest` 等抽象。仓库内已有 `useProject.ts#L59-L63` 使用 `stateRef` 配合 `useEffect` 同步的先例，沿用同一模式保持代码一致性。
- **不破坏现有测试**：`__tests__/EditorPage.test.tsx` 未直接断言监听器挂载次数或 `addEventListener` 调用，仅在 `renders without crashing` 与 `loads project when projectId differs` 间接渲染组件。改为 mount-once 后测试用例行为不变，无需改动。
- **不依赖 4.4**：本方案保留 `window` CustomEvent 通道不变，仅稳定监听端。若后续 4.4 落地、监听器整体删除，本方案自然失效，不会产生冲突代码。

### 实施步骤

**Step 1：新增 `currentPageRef` 并在 `useEffect` 中同步**

在 `EditorPage.tsx` 现有 `useEffect(..., [currentPage])` 之前新增：

```tsx
// 保存当前页引用，供事件回调在挂载时读取，避免把 currentPage 列入 effect 依赖
const currentPageRef = useRef<PageData | undefined>(undefined);
useEffect(() => {
  currentPageRef.current = currentPage;
}, [currentPage]);
```

注释说明意图（中文，解释为什么）；`PageData | undefined` 是技术性类型注解。

**Step 2：回调内改为读 `currentPageRef.current`**

```tsx
// 之前
const handleOpenBrowser = (e: any) => {
  setModalMode(e.detail?.mode || 'change');
  if (currentPage) {
    const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
    setSelectedOrientation(currentConfig.orientation);
    setSelectedRatio(currentPage.aspectRatio || '16:9');
  }
  setShowLayoutModal(true);
};

// 之后
const handleOpenBrowser = (e: any) => {
  setModalMode(e.detail?.mode || 'change');
  const page = currentPageRef.current;
  if (page) {
    const currentConfig = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
    setSelectedOrientation(currentConfig.orientation);
    setSelectedRatio(page.aspectRatio || '16:9');
  }
  setShowLayoutModal(true);
};
```

`handleShowExportModal` 与 `handleTriggerImport` 不读 `currentPage`，无需改动；它们随 effect 一并稳定为 mount-once。

**Step 3：依赖数组改为 `[]`**

```tsx
useEffect(() => {
  const handleOpenBrowser = (e: any) => { ... };
  const handleShowExportModal = () => { setShowExportModal(true); };
  const handleTriggerImport = () => { fileInputRef.current?.click(); };

  window.addEventListener('open-layout-browser', handleOpenBrowser);
  window.addEventListener('show-export-modal', handleShowExportModal);
  window.addEventListener('trigger-import', handleTriggerImport);

  return () => {
    window.removeEventListener('open-layout-browser', handleOpenBrowser);
    window.removeEventListener('show-export-modal', handleShowExportModal);
    window.removeEventListener('trigger-import', handleTriggerImport);
  };
}, []);
```

### 关于 `setModalMode` / `setSelectedOrientation` / `setSelectedRatio` / `setShowLayoutModal` 的稳定性

`useState` 的 setter 函数引用在组件生命周期内稳定不变（React 保证），即使未列入依赖数组也不会过期。这是 React 官方文档明确的行为，可安全地在 mount-once 的 effect 中闭包捕获。`fileInputRef` 同理（ref 对象引用稳定）。

## Before / After

### Before

```tsx
useEffect(() => {
  const handleOpenBrowser = (e: any) => {
    setModalMode(e.detail?.mode || 'change');
    if (currentPage) {
      const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
      setSelectedOrientation(currentConfig.orientation);
      setSelectedRatio(currentPage.aspectRatio || '16:9');
    }
    setShowLayoutModal(true);
  };
  const handleShowExportModal = () => { setShowExportModal(true); };
  const handleTriggerImport = () => { fileInputRef.current?.click(); };

  window.addEventListener('open-layout-browser', handleOpenBrowser);
  window.addEventListener('show-export-modal', handleShowExportModal);
  window.addEventListener('trigger-import', handleTriggerImport);

  return () => {
    window.removeEventListener('open-layout-browser', handleOpenBrowser);
    window.removeEventListener('show-export-modal', handleShowExportModal);
    window.removeEventListener('trigger-import', handleTriggerImport);
  };
}, [currentPage]); // 每次 currentPage 变化都重挂 3 个监听器
```

### After

```tsx
// 保存当前页引用，供事件回调在挂载时读取，避免把 currentPage 列入 effect 依赖
const currentPageRef = useRef<PageData | undefined>(undefined);
useEffect(() => {
  currentPageRef.current = currentPage;
}, [currentPage]);

useEffect(() => {
  const handleOpenBrowser = (e: any) => {
    setModalMode(e.detail?.mode || 'change');
    const page = currentPageRef.current;
    if (page) {
      const currentConfig = LAYOUT_CONFIG[page.aspectRatio || '16:9'];
      setSelectedOrientation(currentConfig.orientation);
      setSelectedRatio(page.aspectRatio || '16:9');
    }
    setShowLayoutModal(true);
  };
  const handleShowExportModal = () => { setShowExportModal(true); };
  const handleTriggerImport = () => { fileInputRef.current?.click(); };

  window.addEventListener('open-layout-browser', handleOpenBrowser);
  window.addEventListener('show-export-modal', handleShowExportModal);
  window.addEventListener('trigger-import', handleTriggerImport);

  return () => {
    window.removeEventListener('open-layout-browser', handleOpenBrowser);
    window.removeEventListener('show-export-modal', handleShowExportModal);
    window.removeEventListener('trigger-import', handleTriggerImport);
  };
}, []); // 仅 mount/unmount 执行一次
```

### 行为差异

| 维度 | Before | After |
|------|--------|-------|
| 监听器挂载次数 | 每次击键 3 次 add + 3 次 remove | mount 时 3 次 add，unmount 时 3 次 remove |
| 事件派发到回调的延迟 | 无 | 无（ref 同步在 commit 阶段完成，早于下次事件派发） |
| 回调读取的 `currentPage` | 闭包捕获的最新值 | `currentPageRef.current` 的最新值（每次回调触发时读取） |
| 与 4.4 的关系 | 监听器抖动是事件总线的衍生症状 | 抖动消除；事件总线本身仍存留，待 4.4 处理 |

## 风险与回滚

### 风险

1. **ref 滞后读取（低风险）**：`currentPageRef.current` 在 commit 阶段同步更新，早于下一次事件派发。事件是用户点击触发（`Editor.tsx#L26-L30` 的 "Change Layout" 按钮、`Sidebar` 的导入/导出按钮），派发时机必然在 commit 之后，因此回调读到的一定是最新值。不存在 "读到旧值" 的窗口。唯一的理论风险是事件在同一个 React batch 内派发并被同步监听——当前代码无此调用路径。

2. **React StrictMode 双挂载（无影响）**：开发模式下 StrictMode 会让 effect 执行两次 mount/unmount 验证幂等性。原代码 `[currentPage]` 与新代码 `[]` 在 StrictMode 下行为一致（cleanup 正确移除监听器），不引入新问题。

3. **与 4.4 后续落地的冲突（无）**：若 4.4 删除 `window` CustomEvent 通道、改为 Zustand UI Slice 或直接 callback，本方案新增的 `currentPageRef` 与 mount-once effect 会随监听器整体删除，不产生遗留代码。

### 回滚

改动范围限于 `EditorPage.tsx#L151-L179`，新增约 5 行（`currentPageRef` 声明与同步 effect），修改 1 行（依赖数组）与 1 处闭包读取。回滚直接还原 `[currentPage]` 依赖并删除 `currentPageRef` 即可，无数据迁移、无外部接口变更。

## 验证方式

1. **单元测试（已有）**：运行 `__tests__/EditorPage.test.tsx`，确认 `renders without crashing`、`renders main layout sections`、`loads project when projectId differs` 全部通过。这些用例间接覆盖组件挂载流程，验证 mount-once 不破坏初始渲染。

2. **监听器挂载次数验证（新增建议）**：在 `EditorPage.test.tsx` 中新增用例，mock `window.addEventListener`/`removeEventListener`，触发 `pages` 状态变更（如调用 `updatePage`），断言 `addEventListener('open-layout-browser', ...)` 仅在初始 mount 被调用一次。这是本方案的核心行为断言。

   ```tsx
   it('does not remount event listeners on page edits', () => {
     const addSpy = vi.spyOn(window, 'addEventListener');
     const removeSpy = vi.spyOn(window, 'removeEventListener');
     renderEditorPage();
     const initialAddCount = addSpy.mock.calls.filter(([t]) => t === 'open-layout-browser').length;
     // 模拟当前页字段更新
     storeState.pages = [{ ...storeState.pages[0], title: 'Edited' }];
     // rerender 触发 currentPage 引用变化
     const afterAddCount = addSpy.mock.calls.filter(([t]) => t === 'open-layout-browser').length;
     expect(afterAddCount).toBe(initialAddCount);
   });
   ```

3. **手动验证**：在编辑器中打开任意幻灯片，在 `EditorPanel` 中连续修改标题字段若干次，然后点击 "Change Layout" 按钮。验证 `open-layout-browser` 事件仍被正确接收、弹窗的初始方向/比例与当前页一致。同法验证 `show-export-modal`（导出按钮）、`trigger-import`（导入按钮）。

4. **DevTools 验证（可选）**：在 Chrome DevTools 的 Event Listeners 面板中观察 `window` 上的 `open-layout-browser` 监听器数量，编辑字段前后应保持为 1，不再随击键增长。
