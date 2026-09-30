# 4.4 CustomEvent 事件总线收敛

## 事实核对

报告将三个 `window` CustomEvent 视为同构的"隐式事件总线"。逐条核对派发端与监听端后，发现**其中两个通道已处于死链状态**，仅一个真正在运行。先列核对结论，再给校正。

1. **`open-layout-browser` 是唯一活通道**。派发端 `src/components/Editor.tsx#L26-L30`：

   ```typescript
   const handleOpenBrowser = useCallback(() => {
     window.dispatchEvent(new CustomEvent('open-layout-browser', {
       detail: { mode: 'change' }
     }));
   }, []);
   ```
   该回调绑定在 `Editor.tsx#L68` 的 "Change Layout" 按钮上，点击即派发。监听端 `src/pages/EditorPage.tsx#L170` 注册 `handleOpenBrowser`（定义于 `L152-L160`），接收后设置 `modalMode`、初始化 `selectedOrientation`/`selectedRatio`、打开 `showLayoutModal`。链路完整、真实运行。报告对这一通道的描述准确。

2. **`show-export-modal` 与 `trigger-import` 是死通道——报告未指出**。派发端位于 `src/hooks/useProject.ts#L48-L56`：

   ```typescript
   const handleExportProject = useCallback(() => {
     window.dispatchEvent(new CustomEvent('show-export-modal'));
   }, []);

   const handleImportProject = useCallback(() => {
     window.dispatchEvent(new CustomEvent('trigger-import'));
   }, []);
   ```
   这两个回调被 `useProject` 在 `L149` 返回，但全仓库 grep 显示其消费端为空：
   - `handleImportProject` **连解构都没有**——`EditorPage.tsx#L34-L43` 的解构里不存在该项，自始至终无调用方。
   - `handleExportProject` 在 `EditorPage.tsx#L38` 被解构，但解构之后**无任何引用**。`Sidebar` 的导出入口 `onExport={handleOpenExportModal}`（`EditorPage.tsx#L437`）用的是本地 `handleOpenExportModal`（`L431-L433`，直接 `setShowExportModal(true)`）；`TopNav` 的导出入口 `onExportPng={(all) => { setExportScope(...); setShowExportModal(true); }}`（`L441`）同样直连本地 state。
   - 导入入口 `Sidebar` 的 `onImport={() => fileInputRef.current?.click()}`（`L437`）直接点击文件输入，不走任何事件。

   也就是说，`show-export-modal` 与 `trigger-import` 的派发器是死代码，监听器在 `EditorPage.tsx#L171-L172` 等待永远不会到达的事件。导出弹窗与导入文件选择器**早就通过直接 callback 实现了**，这两个 CustomEvent 是历史改造遗留的空壳。报告将它们与 `open-layout-browser` 并列为"事件总线耦合"，掩盖了它们已无业务功能这一事实。

3. **`EditorPage.tsx#L170-L179` 的依赖数组确为 `[currentPage]`**，与报告及 5.5 节一致。每次 `pages` 变更触发 3 个监听器的解绑与重挂——但其中 2 个监听的事件永不派发，属于无意义开销；只有 `open-layout-browser` 的重挂有实际副作用。5.5 节用 `currentPageRef` 稳定监听器的方案，若本方案落地删除整条监听块，则自然失效。

4. **`e2e/04-all-templates-gallery.spec.ts#L66` 的 `switch-template-test` 事件不在本方案范围**。它是测试专用 fallback，且位于 `if (!store?.getState)` 的 `else` 分支。`useStore.ts#L611-L613` 在浏览器环境总会将 store 挂到 `window.__SLIDEGRID_STORE__`，因此该 `else` 分支在真实运行中永不执行。它不是应用事件总线的一部分，保留不动。

5. **`EditorPage.tsx#L403-L417` 的 `keydown` 监听器不在本方案范围**。全局键盘快捷键（Ctrl+S/Z/Y）是 `window` keydown 的合理用法——键盘事件本就是 DOM 全局事件，不属于"业务通讯总线"。报告未将其纳入 4.4，本方案亦不触碰。

## 根因

直接根因是**用 DOM 全局事件总线替代了组件调用链**。`open-layout-browser` 的真实通讯需求是：`Editor`（深层子组件，位于 `EditorPanel` 内）需要通知 `EditorPage`（祖先）打开"切换版式"弹窗。这是一条标准的"子→父"通讯，本应通过 callback prop 完成，却被实现为 `Editor` 派发 `window` 事件、`EditorPage` 监听。这切断了 TypeScript 在两者之间的类型契约：派发端的 `detail: { mode: 'change' }` 与监听端的 `e.detail?.mode` 之间没有任何类型约束，`e` 被标注为 `any`（`L152`）。

深层根因有两条：

- **派发端与监听端的角色错位**。`Editor` 是 `EditorPanel` 的子组件，`EditorPanel` 是 `EditorPage` 的子组件。`EditorPage` 已经持有打开弹窗所需的全部 state（`modalMode`、`selectedOrientation`、`selectedRatio`、`showLayoutModal`），`EditorPanel` 也已经在透传 `currentPage`/`onUpdatePage`/`customFonts`/`pages` 四个 props。在这条已存在的 props 通道上再加一个 `onOpenLayoutBrowser` callback 是零成本的，作者却绕开它走了 `window`。
- **死通道未清理**。`handleExportProject`/`handleImportProject` 是更早版本的遗留——彼时导出/导入可能确实通过事件触发。后来 `Sidebar`/`TopNav` 改为直接 callback，但 `useProject` 里的派发器与 `EditorPage` 里的监听器都没被一并删除。这是"不保留向后兼容"原则未被执行的反例：兼容层一旦留下，就会在 code review 中被误认为"仍在使用"，掩盖真实通讯路径。

## 解决方案

分两步：**删除两个死通道**，**将 `open-layout-browser` 改为 callback prop**。

### 为什么选 callback prop 而非 Zustand UI Slice / React Context

报告建议"收敛至 Zustand UI Slice 或 React Context"。本方案选 callback prop，理由：

- 弹窗的开关 state（`showLayoutModal`/`modalMode`/`selectedOrientation`/`selectedRatio`）是 `EditorPage` 的本地 UI 状态，生命周期与该页面绑定。将其下沉到 Zustand 会让全局 store 承载一个瞬时模态字段，违反"store 只放跨页面共享状态"的边界；引入 React Context 则需新建 Provider，仅为传递一个 callback，属于新增抽象层。
- `EditorPanel` 已经在透传 4 个 props 给 `Editor`，再加一个 `onOpenLayoutBrowser` 与既有模式一致，不引入新的 drilling 层级。报告 4.3 批评的是 `GlobalSettings` 16 层 props drilling 那种"搬运工"反模式，不适用于单 callback 透传。
- 遵从 `~/.claude/CLAUDE.md`："Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection." callback prop 是最小改动：零新 state、零新抽象、零新订阅。

### 设计原则（遵从 `~/.claude/CLAUDE.md` 与 `AGENTS.md`）

- **不保留向后兼容**：删除 `useProject` 的 `handleExportProject`/`handleImportProject` 及其返回项；删除 `EditorPage` 的整个 `useEffect` 监听块（含三个 `addEventListener` 与三个 `removeEventListener`）；删除 `Editor.tsx` 内对 `window.dispatchEvent` 的调用。不保留任何 fallback 分支或中间层。
- **最简实现**：`Editor` 接口新增可选 `onOpenLayoutBrowser?: (mode: 'create' | 'change') => void`，`EditorPanel` 透传，`EditorPage` 将原 `handleOpenBrowser` 提取为顶层 `useCallback` 并作为 prop 下发。
- **不破坏现有测试**：`Editor.edgecase.test.tsx` 渲染 `<Editor page={...} onUpdate={...} customFonts={[]} pages={[...]} />` 时未传 `onOpenLayoutBrowser`，因此该 prop 必须可选且调用处用 `?.()` 守卫。`EditorPage.test.tsx` 不断言监听器挂载次数，删除监听块不影响其 `renders without crashing` 等用例。`useProject.test.ts` 未断言 `handleExportProject`/`handleImportProject` 的存在（`L102-L110` 只断言 `projectTitle`/`currentPage`/`canUndo`/`canRedo`），删除二者不破坏现有用例。
- **注释规范**：遵从 `AGENTS.md`，中文写意图，英文写技术标识，禁止单行中英混写。

### 实施步骤

**Step 1：删除 `useProject` 中的两个死派发器**

`src/hooks/useProject.ts`：

```typescript
// Before（L48-L56）
const handleExportProject = useCallback(() => {
  // 触发导出模态框
  window.dispatchEvent(new CustomEvent('show-export-modal'));
}, []);

const handleImportProject = useCallback(() => {
  // 触发文件选择器
  window.dispatchEvent(new CustomEvent('trigger-import'));
}, []);
```

```typescript
// After：整段删除，同步从返回对象中移除
// 返回对象（L144-L154）中删除 handleExportProject, handleImportProject 两项
```

`useCallback` 的 import 若因此出现未使用，需一并清理（`L1` 的 `useCallback` 仍被 `loadProject`/`saveToDB` 使用，保留）。

**Step 2：`Editor` 接口新增 callback prop，替换派发**

`src/components/Editor.tsx`：

```typescript
// Before（L10-L30）
interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts, pages }) => {
  ...
  const handleOpenBrowser = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-layout-browser', {
      detail: { mode: 'change' }
    }));
  }, []);
```

```typescript
// After：新增可选 callback，删除 window.dispatchEvent
interface EditorProps {
  page: PageData;
  onUpdate: (page: PageData, silent?: boolean) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
  // 由祖先提供，点击 "Change Layout" 时回调
  onOpenLayoutBrowser?: (mode: 'create' | 'change') => void;
}

const Editor: React.FC<EditorProps> = React.memo(({ page, onUpdate, customFonts, pages, onOpenLayoutBrowser }) => {
  ...
  const handleOpenBrowser = useCallback(() => {
    onOpenLayoutBrowser?.('change');
  }, [onOpenLayoutBrowser]);
```

按钮 `onClick={handleOpenBrowser}`（`L68`）保持不变。

**Step 3：`EditorPanel` 透传 callback**

`src/components/editor/EditorPanel.tsx`：

```typescript
// Before（L6-L19）
interface EditorPanelProps {
  currentPage: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentPage,
  onUpdatePage,
  customFonts,
  pages,
}) => {
```

```typescript
// After：新增可选 callback 并透传给 Editor
interface EditorPanelProps {
  currentPage: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
  onOpenLayoutBrowser?: (mode: 'create' | 'change') => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentPage,
  onUpdatePage,
  customFonts,
  pages,
  onOpenLayoutBrowser,
}) => {
```

`Editor` 调用处（`L35-L40`）补 prop：

```typescript
<Editor
  page={currentPage}
  onUpdate={onUpdatePage}
  customFonts={customFonts}
  pages={pages}
  onOpenLayoutBrowser={onOpenLayoutBrowser}
/>
```

**Step 4：`EditorPage` 提取 `handleOpenBrowser` 为顶层 callback，删除监听块**

`src/pages/EditorPage.tsx`：

```typescript
// Before（L151-L179）：监听块整体删除
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
}, [currentPage]);
```

```typescript
// After：提取为顶层 callback，依赖 currentPage，作为 prop 下发
const handleOpenLayoutBrowser = useCallback((mode: 'create' | 'change') => {
  setModalMode(mode);
  if (currentPage) {
    const currentConfig = LAYOUT_CONFIG[currentPage.aspectRatio || '16:9'];
    setSelectedOrientation(currentConfig.orientation);
    setSelectedRatio(currentPage.aspectRatio || '16:9');
  }
  setShowLayoutModal(true);
}, [currentPage]);
```

`EditorPanel` 渲染处（`L444`）下发：

```typescript
<EditorPanel
  currentPage={currentPage}
  onUpdatePage={updatePage}
  onRemovePage={removePage}
  customFonts={customFonts}
  pages={pages}
  onOpenLayoutBrowser={handleOpenLayoutBrowser}
/>
```

`L34-L43` 的解构中移除 `handleExportProject`（`handleImportProject` 本就未解构，无需改动）。

**Step 5：`Editor` 的 memo comparator 校准**

`Editor.tsx#L99-L105` 的自定义比较器当前只检查 `page`/`onUpdate`/`customFonts`/`pages`：

```typescript
}, (prevProps, nextProps) => {
  const pageEqual = shallowEqual(prevProps.page, nextProps.page);
  const onUpdateEqual = prevProps.onUpdate === nextProps.onUpdate;
  const fontsEqual = shallowEqual(prevProps.customFonts, nextProps.customFonts);
  const pagesEqual = shallowEqual(prevProps.pages, nextProps.pages);
  return pageEqual && onUpdateEqual && fontsEqual && pagesEqual;
});
```

`handleOpenLayoutBrowser` 在 `EditorPage` 以 `[currentPage]` 为依赖 memoize，`currentPage` 变化时 `page` prop 同步变化，comparator 已会判 false 并重渲染 `Editor`，callback 随之刷新。因此理论上 callback 不会比 `page` 更陈旧。但为显式表达契约，将 callback 纳入比较器：

```typescript
}, (prevProps, nextProps) => {
  const pageEqual = shallowEqual(prevProps.page, nextProps.page);
  const onUpdateEqual = prevProps.onUpdate === nextProps.onUpdate;
  const fontsEqual = shallowEqual(prevProps.customFonts, nextProps.customFonts);
  const pagesEqual = shallowEqual(prevProps.pages, nextProps.pages);
  const browserEqual = prevProps.onOpenLayoutBrowser === nextProps.onOpenLayoutBrowser;
  return pageEqual && onUpdateEqual && fontsEqual && pagesEqual && browserEqual;
});
```

### 与 5.5 节方案的关系

5.5 节（`docs/solutions/19-event-listener-lifecycle.md`）用 `currentPageRef` 稳定监听器，保留 `window` CustomEvent 通道。本方案删除整条通道后，5.5 的 `currentPageRef` 与 mount-once effect 失去存在意义——`handleOpenLayoutBrowser` 作为顶层 `useCallback([currentPage])`，其闭包天然捕获最新 `currentPage`，无需 ref 中转。两个方案二选一：

- 若 4.4 先落地：5.5 自然消解，`docs/solutions/19-event-listener-lifecycle.md` 中新增的 `currentPageRef` 不再需要，该文档应标记为"被 4.4 取代"。
- 若 5.5 先落地（仅稳定监听器、保留通道）：4.4 后续落地时，5.5 新增的 ref 与 mount-once effect 随监听块整体删除，不产生冲突代码。

建议 4.4 优先落地，一次性消除通道及其衍生症状。

## Before / After

### Before

```
Editor (深层子组件)
  └─ 点击 "Change Layout"
       └─ window.dispatchEvent('open-layout-browser', { mode: 'change' })
            │  无类型契约，detail 为 any
            ▼
EditorPage (祖先)
  └─ useEffect([currentPage])
       └─ window.addEventListener('open-layout-browser', handleOpenBrowser)
            └─ 每次 currentPage 变更：3 次 remove + 3 次 add
            └─ 另 2 个监听器（show-export-modal / trigger-import）等待永不派发的事件

useProject
  └─ handleExportProject / handleImportProject：派发死事件，返回后无消费端
```

### After

```
EditorPage
  └─ handleOpenLayoutBrowser = useCallback([currentPage])   闭包捕获最新 currentPage
       ▲ 作为 prop 下发
       │
EditorPanel
  └─ onOpenLayoutBrowser prop 透传
       ▲
       │
Editor
  └─ 点击 "Change Layout"
       └─ onOpenLayoutBrowser?.('change')   有类型契约：(mode: 'create' | 'change') => void

useProject
  └─ handleExportProject / handleImportProject：已删除
EditorPage 监听块：已删除（含 3 个 addEventListener / 3 个 removeEventListener）
```

### 行为差异

| 维度 | Before | After |
|------|--------|-------|
| `open-layout-browser` 通讯 | `window` 派发/监听，`detail` 无类型 | callback prop，`(mode) => void` 有类型 |
| 监听器挂载 | 每次 `currentPage` 变更 3 次 add + 3 次 remove | 无监听器 |
| 死通道 | `show-export-modal`/`trigger-import` 派发器与监听器空转 | 整体删除 |
| `Editor` 重渲染 | `page` 变化时重渲染（comparator 检查 `page`） | 同左，comparator 额外检查 `onOpenLayoutBrowser` 引用 |
| `handleOpenBrowser` 闭包新鲜度 | effect 重挂刷新闭包（5.5 改用 ref） | `useCallback([currentPage])` 天然刷新 |

### 代码量变化

- `useProject.ts`：`-10` 行（两个 `useCallback` 派发器）、返回对象 `-2` 项。
- `EditorPage.tsx`：`-29` 行（整个 `useEffect` 监听块）、`+8` 行（`handleOpenLayoutBrowser` callback）、解构 `-1` 项、`EditorPanel` 渲染 `+1` prop。
- `EditorPanel.tsx`：接口 `+1` 字段、解构 `+1`、透传 `+1` prop。
- `Editor.tsx`：接口 `+1` 字段、`handleOpenBrowser` 改 1 行、comparator `+1` 行。
- 净减约 25 行，核心是消除了 3 个 `window` 监听器与 2 个死派发器。

## 风险与回滚

### 风险

1. **`Editor.memo` comparator 漏检 callback（低风险）**：若 Step 5 未将 `onOpenLayoutBrowser` 纳入比较器，当 `currentPage` 不变但 `EditorPage` 因其他 state 重渲染时，`handleOpenLayoutBrowser` 的 `useCallback([currentPage])` 引用稳定，comparator 返回 true，`Editor` 跳过重渲染——此时 `Editor` 持有的仍是上次渲染的 callback，但因 callback 引用未变，闭包内的 `currentPage` 也未变（依赖项决定），行为正确。仅当 `currentPage` 变化时 comparator 因 `page` 变化判 false，`Editor` 重渲染并拿到新 callback。因此即便漏检 Step 5，也不会产生陈旧闭包。Step 5 的价值是显式化契约，非防 bug。**严重度：低。**

2. **`Editor.edgecase.test.tsx` 未传新 prop（无风险）**：`onOpenLayoutBrowser` 设为可选，`handleOpenBrowser` 内用 `?.()` 守卫，测试渲染不传该 prop 时按钮点击为 no-op，不抛错。该测试不断言按钮行为，只断言不崩溃（`L24-L42`），通过。**严重度：无。**

3. **`useProject.test.ts` 是否隐式依赖被删函数（需核对）**：通读 `src/hooks/__tests__/useProject.test.ts`，7 个用例（`L102-L227`）均未引用 `handleExportProject`/`handleImportProject`，断言对象为 `projectTitle`/`currentPage`/`canUndo`/`canRedo`/`loadProject`/`saveToDB`。删除二者不破坏任何用例。**严重度：无。**

4. **`EditorPage.test.tsx` 是否隐式依赖监听块（无风险）**：该测试 mock 了 `Sidebar`/`TopNav`/`EditorPanel` 等子组件（`L154-L182`），`EditorPanel` 被 mock 为静态 `<div>`，不会渲染真实 `Editor`，因此删除监听块对测试无影响。`renders without crashing` 等 6 个用例（`L256-L304`）不断言事件或监听器。**严重度：无。**

5. **是否有其他路径派发 `open-layout-browser`（已核对）**：全仓库 grep `open-layout-browser` 仅命中 `Editor.tsx#L27`（派发）、`EditorPage.tsx#L170/L175`（监听）与文档/测试。无其他派发点。将 `Editor` 改为 callback 后，该事件名在应用代码中绝迹。**严重度：无。**

6. **`e2e` 测试是否会派发 `open-layout-browser`（已核对）**：`e2e/04-all-templates-gallery.spec.ts#L66` 派发的是 `switch-template-test`（测试专用 fallback，且永不执行），与 `open-layout-browser` 无关。其他 e2e 用例不派发本方案涉及的事件。**严重度：无。**

### 回滚

改动集中在 4 个文件：

- `src/hooks/useProject.ts` — 删除两个死派发器及返回项。
- `src/components/Editor.tsx` — 新增 `onOpenLayoutBrowser` prop，替换派发，comparator 校准。
- `src/components/editor/EditorPanel.tsx` — 透传新 prop。
- `src/pages/EditorPage.tsx` — 删除监听块，提取 `handleOpenLayoutBrowser` 为顶层 callback，下发 prop，解构移除 `handleExportProject`。

无 store schema 变更、无数据迁移、无路由变更。回滚即 `git revert` 对应提交，无副作用。

## 验证方式

1. **类型检查**：

   ```
   npx tsc --noEmit
   ```
   预期：`Editor` 新增可选 prop 后，所有调用点（仅 `EditorPanel.tsx#L35`）类型匹配；`useProject` 删除返回项后，`EditorPage.tsx#L38` 的解构同步移除 `handleExportProject`，`noUnusedLocals` 不报错。

2. **静态核对：事件总线应彻底消失**：

   ```
   grep -rn "open-layout-browser\|show-export-modal\|trigger-import" src
   ```
   预期：`src/` 下命中数为 0。若仍有命中，说明有遗漏的派发或监听点未清理。

3. **静态核对：死派发器应消失**：

   ```
   grep -rn "handleExportProject\|handleImportProject" src
   ```
   预期：`src/` 下命中数为 0。

4. **单测**：

   ```
   npm test -- EditorPage useProject Editor.edgecase
   ```
   预期：`EditorPage.test.tsx` 6 个用例、`useProject.test.ts` 7 个用例、`Editor.edgecase.test.tsx` 1 个用例全部通过。

5. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程）：
   - 启动 dev server，打开任意项目，进入编辑器。
   - 在右侧 `Editor` 面板点击 "Slide Layout & Ratio" 区域的 "Change Layout" 按钮，验证版式选择弹窗打开，且初始方向/比例与当前页一致（`currentPage.aspectRatio` 正确读取）。
   - 在 `EditorPanel` 中连续修改标题字段若干次后，再次点击 "Change Layout"，验证弹窗初始比例仍与最新当前页一致——这是 callback prop 闭包新鲜度的核心断言（对应 5.5 节 `currentPageRef` 想解决的同一问题，此处由 `useCallback([currentPage])` 天然保证）。
   - 回归：点击 `Sidebar` 的导出按钮、导入按钮，验证导出弹窗与文件选择器仍正常（这两条路径本就直连 callback，删除死通道不影响）。
   - 回归：切模板、翻页、undo/redo，确认无渲染崩溃。

6. **DevTools 验证（可选）**：在 Chrome DevTools 的 Event Listeners 面板中观察 `window` 上的自定义事件监听器，预期 `open-layout-browser`/`show-export-modal`/`trigger-import` 三者均为 0；`keydown`（键盘快捷键）保持 1。

## 涉及文件

- `src/hooks/useProject.ts` — 删除 `handleExportProject`/`handleImportProject` 及其返回项。
- `src/components/Editor.tsx` — 新增 `onOpenLayoutBrowser` 可选 prop，替换 `window.dispatchEvent`，memo comparator 增加该 prop 比较。
- `src/components/editor/EditorPanel.tsx` — 新增并透传 `onOpenLayoutBrowser` prop。
- `src/pages/EditorPage.tsx` — 删除 `L151-L179` 监听 `useEffect`，提取 `handleOpenLayoutBrowser` 为顶层 `useCallback([currentPage])`，作为 prop 下发给 `EditorPanel`，解构移除 `handleExportProject`。
