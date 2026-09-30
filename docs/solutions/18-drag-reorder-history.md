# 5.4 拖拽排序历史栈防污染

## 事实核对

报告对核心缺陷的判断成立，但定位面比报告描述的更广，先逐条核对：

1. **`useDragReorder.ts` 的 150ms 节流**：报告引用的 `useDragReorder.ts#L51-L56` 确实存在节流逻辑（`if (now - lastReorderRef.current < 150) return;`），节流后调用 `commitReorder(index)`，其中 `commitReorder`（L24-L42）计算新顺序并调用 `onReorderPages(newPages)`。描述属实。

2. **`reorderPages` 每次压栈**：`useStore.ts#L493-L500` 的 `reorderPages` 内部顺序为 `commitUncommittedBaseline(get())` → `get().pushHistory()` → `set({ pages: newPages, hasUnsavedChanges: true })`。报告引文准确（仅行号 `#L496` 实为 `#L498`，差 2 行，不影响结论）。每次 `reorderPages` 调用都会触发一次 `pushHistory`，属实。

3. **`pushHistory` 的去重保护失效**：`pushHistory`（L309-L335）在 L313-L316 有"栈顶相同则跳过"的去重逻辑。但拖拽过程中每 150ms 产生的中间顺序**各不相同**（页面在持续位移），`isEqualSnapshot` 判定为 false，去重不生效。因此 4~5 个中间快照确实会被压入 `past`。报告的"快照轰炸"判断成立。

4. **报告遗漏的另一条路径**：`reorderPages` 不仅被 `useDragReorder`（HTML5 拖拽，>=30 页走 `VirtualPageList`）调用，也被 `Sidebar.tsx#L100` 的 framer-motion `Reorder.Group onReorder={onReorderPages}` 调用（<30 页走 `Sidebar`）。framer-motion 的 `onReorder` 在拖拽过程中持续触发，**且没有 150ms 节流**，频率更高。报告只点了 `useDragReorder`，但 `Sidebar` 路径的污染更严重。本次方案在 store 层统一修复，两条路径同时受益。

5. **`commitUncommittedBaseline` 在拖拽场景是空操作**：`commitUncommittedBaseline`（L119-L127）仅当模块级 `uncommittedBaseline` 非空时才压栈，而该变量只在 `updatePage(..., silent=true)` 静默输入路径中被赋值。拖拽不经过静默输入路径，因此 `commitUncommittedBaseline(get())` 在 `reorderPages` 中实际是 no-op。报告把 `commitUncommittedBaseline` 与 `pushHistory` 并列展示，容易让人误以为它也参与污染，实际污染源只有一个：`pushHistory`。

6. **现有测试覆盖**：`src/store/useStore.test.ts#L447-L458` 的 `reorderPages 重排序并标记未保存` 用例通过 `reorderPages(reordered)` 单参调用，断言 `pages` 顺序变更与 `hasUnsavedChanges` 标记，**未断言 `past.length`**。因此给 `reorderPages` 增加第二参数 `isCommit` 不会破坏该测试。

## 根因

根因是 **"视觉更新"与"历史提交"两件事被绑在同一个 store action 里**。

`reorderPages` 被设计成"设置 pages + 压栈"的原子操作，这在"一次性给出最终顺序"的调用场景（如程序化重排）是正确的。但拖拽是**流式交互**：拖拽过程中需要持续更新 `pages` 以驱动缩略图列表的视觉位移，而历史栈只应在"落手"那一刻记录**一次**"从拖拽前到落手后"的状态转换。

由于 `reorderPages` 不区分调用语义，调用方（`useDragReorder`、`Sidebar` 的 `Reorder.Group`）只能把每一次中间位移都当作"最终结果"喂给 store，store 也就老老实实把每一次中间状态都压进 `past`。

次要因素：

- `useDragReorder` 的 150ms 节流只是**降低**了压栈频率（从每次 `dragover` 降到每 150ms 一次），并没有改变"中间状态被压栈"的本质。即使把节流调到 500ms，一次跨 5 张的拖拽仍会塞进 1~2 个无意义中间态。
- `Sidebar` 的 framer-motion 路径连节流都没有，污染更直接。

## 解决方案

把 `reorderPages` 拆成两种语义：**视觉更新**（拖拽中，仅 `set` 不压栈）与**历史提交**（落手时，对比拖拽前基准与最终结果，实质变更才压一次栈）。

基准快照在 store 内捕获，复用项目已有的"`uncommittedBaseline` 模式"（见 L113-L127 的静默输入基准机制），保持代码风格统一。

### 设计原则（遵从 `~/.claude/CLAUDE.md`）

- **不保留向后兼容**：直接给 `reorderPages` 增加第二参数 `isCommit`，不为旧调用方保留无参兼容层。调用方必须显式声明语义。
- **最简实现**：store 内新增一个模块级 `reorderBaseline` 变量（镜像 `uncommittedBaseline`），不引入额外抽象、不新增 action。
- **不破坏现有测试**：`isCommit` 默认值为 `true`，使 `reorderPages(reordered)` 的单参调用（如 `useStore.test.ts#L452`）保持"压栈 + 设置"的旧行为，测试断言不变。
- **两条拖拽路径统一修复**：`useDragReorder`（HTML5）与 `Sidebar` 的 `Reorder.Group`（framer-motion）都改为"拖拽中 `isCommit=false`、落手 `isCommit=true`"。

### 实施步骤

**Step 1：store 内引入 `reorderBaseline` 并改造 `reorderPages`**

`src/store/useStore.ts`：

在 L114 附近（`uncommittedBaseline` 声明旁）新增：

```ts
/** 拖拽期间尚未提交的排序基准快照 */
let reorderBaseline: HistorySnapshot | null = null;
```

改造 `reorderPages`（L493-L500）：

```ts
reorderPages: (newPages, isCommit = true) => {
  logger.action('Store', 'ReorderPages', { count: newPages.length, isCommit });

  if (!isCommit) {
    // 拖拽中：首次进入时锁定拖拽前基准，仅做视觉更新
    if (!reorderBaseline) {
      reorderBaseline = buildSnapshot(get());
    }
    set({ pages: newPages, hasUnsavedChanges: true });
    return;
  }

  // 落手：对比拖拽前基准与最终结果，实质变更才压栈一次
  const baseline = reorderBaseline;
  reorderBaseline = null;
  const before = get().pages;
  if (deepEqual(before, newPages) && !baseline) return;

  if (baseline) {
    const finalSnapshot: HistorySnapshot = { ...buildSnapshot(get()), pages: deepClone(newPages) };
    if (!isEqualSnapshot(baseline, finalSnapshot)) {
      get().pushHistory(baseline);
    }
  } else {
    // 无拖拽基准（外部程序化调用，走 isCommit=true 默认路径）
    commitUncommittedBaseline(get());
    get().pushHistory();
  }

  set({ pages: newPages, hasUnsavedChanges: true });
},
```

要点：

- `isCommit=false` 时**不调用** `commitUncommittedBaseline`，避免与静默输入路径的 `uncommittedBaseline` 互相干扰；拖拽用独立的 `reorderBaseline`。
- `isCommit=true` 且有 `reorderBaseline` 时，压入的是**拖拽前基准**（不是落手时的 post-drag 状态），保证 `undo` 能复原到拖拽开始前的顺序。
- `isCommit=true` 且无 `reorderBaseline`（程序化一次性重排）走原有 `commitUncommittedBaseline + pushHistory` 路径，语义不变。

**Step 2：类型声明更新**

L165 的接口声明同步：

```ts
reorderPages: (newPages: PageData[], isCommit?: boolean) => void;
```

**Step 3：`useDragReorder` 在落手时提交**

`src/components/editor/virtual-page-list/useDragReorder.ts`：

`commitReorder`（L24-L42）的 `onReorderPages(newPages)` 改为 `onReorderPages(newPages, false)`（视觉更新）：

```ts
const commitReorder = (targetIndex: number) => {
  // ... 计算 newPages 不变
  onReorderPages(newPages, false);
  lastReorderRef.current = Date.now();
  lastDragOverIndexRef.current = targetIndex;
};
```

`handleDragEnd`（L59-L63）在清理后触发一次提交：

```ts
const handleDragEnd = () => {
  // 落手：以当前 pages 为最终顺序提交一次历史
  const finalPages = pages;
  onReorderPages(finalPages, true);
  setDraggedIndex(null);
  draggedPageIdRef.current = null;
  lastDragOverIndexRef.current = -1;
};
```

注意：`handleDragEnd` 读取的 `pages` 是闭包内的 props。由于 `commitReorder` 已通过 `onReorderPages(newPages, false)` 把最新顺序写回 store，`pages` prop 在下一次渲染时即为最终顺序。但 `handleDragEnd` 在同一次渲染周期内拿到的 `pages` 可能仍是旧值。为避免读到过期闭包，最稳妥的做法是在 `commitReorder` 内用一个 ref 记录最后一次 `newPages`，`handleDragEnd` 读 ref：

```ts
const lastNewPagesRef = useRef<PageData[] | null>(null);

const commitReorder = (targetIndex: number) => {
  // ... 计算 newPages 不变
  lastNewPagesRef.current = newPages;
  onReorderPages(newPages, false);
  lastReorderRef.current = Date.now();
  lastDragOverIndexRef.current = targetIndex;
};

const handleDragEnd = () => {
  const finalPages = lastNewPagesRef.current;
  if (finalPages) {
    onReorderPages(finalPages, true);
  }
  lastNewPagesRef.current = null;
  setDraggedIndex(null);
  draggedPageIdRef.current = null;
  lastDragOverIndexRef.current = -1;
};
```

这样落手提交的 `finalPages` 永远是最后一次视觉更新的顺序，与 store 当前 `pages` 一致，`isCommit=true` 分支的 `deepEqual(before, newPages)` 不会误判为"无变更"。

**Step 4：`Sidebar` 的 framer-motion 路径同步改造**

`src/components/editor/Sidebar.tsx#L100`：

```tsx
<Reorder.Group
  axis="y"
  values={pages}
  onReorder={(newPages) => onReorderPages(newPages, false)}
  // ...
>
```

framer-motion 的 `Reorder.Group` 没有"落手"事件，但 `Reorder.Item` 支持 `onDragEnd`。在最后一个 `Reorder.Item` 上挂 `onDragEnd={() => onReorderPages(pages, true)}` 即可触发落手提交。更稳妥的做法是在 `Reorder.Group` 外层包一个 `onDragEnd` 传播：由于 framer-motion 的拖拽事件会冒泡到 `Reorder.Group`，可在 `Reorder.Group` 上直接挂 `onDragEnd={() => onReorderPages(pages, true)}`。

`pages` 此时已是 framer-motion 维护的最终顺序（framer-motion 在 `onReorder` 中通过 `values` 受控同步），闭包刷新后即为最终态。为避免闭包过期，同样可用 ref 记录最后一次 `onReorder` 的 `newPages`，在 `onDragEnd` 读 ref 提交。

**Step 5：更新调用方类型签名**

`VirtualPageList.tsx#L18`、`Sidebar.tsx#L18`、`useProject.ts#L34` 返回类型等处的 `onReorderPages` / `reorderPages` 类型签名同步为 `(newPages: PageData[], isCommit?: boolean) => void`。类型透传链路保持不变，仅签名扩展。

### 不做的事

- **不**给 `useDragReorder` 引入"拖拽中本地态优先"的重构（即不把视觉顺序从 store 搬到 hook 本地 state）。那会改变 `VirtualPageList` 的渲染数据源契约，代价远超修复目标。当前"视觉更新走 store、落手才压栈"已足够。
- **不**调整 150ms 节流参数。节流仍保留，用于限制 `set({ pages })` 的频率（降低 React 重渲染开销），但它不再是"历史栈污染"的防线——污染在 store 层根除。
- **不**新增 `reorderStart` / `reorderEnd` 独立 action。`isCommit` 一个参数足以表达二态语义。

## Before / After

### Before（一次跨 5 张的拖拽）

```
past 栈（拖拽前 → 拖拽后）:
[P0] [P0,P1,P2,P3,P4,P5]  ← 拖拽前栈顶

dragover @150ms  → reorderPages([P1,P0,P2,...])  → pushHistory → past: [P0, S1]
dragover @300ms  → reorderPages([P1,P2,P0,...])  → pushHistory → past: [P0, S1, S2]
dragover @450ms  → reorderPages([P1,P2,P3,P0,...])→ pushHistory → past: [P0, S1, S2, S3]
dragover @600ms  → reorderPages([P1,P2,P3,P4,P0]) → pushHistory → past: [P0, S1, S2, S3, S4]
drop             → reorderPages([P1,P2,P3,P4,P0]) → pushHistory → past: [P0, S1, S2, S3, S4, S5]

最终 past 长度 +5。用户需按 5 次 Ctrl+Z 才能复原。
```

### After

```
dragstart        → （store 无变化）
dragover @150ms  → reorderPages([P1,P0,...], false)    → set only, reorderBaseline = P0..P5
dragover @300ms  → reorderPages([P1,P2,P0,...], false) → set only
dragover @450ms  → reorderPages([P1,P2,P3,P0,...], false) → set only
dragover @600ms  → reorderPages([P1,P2,P3,P4,P0], false) → set only
drop (dragEnd)   → reorderPages([P1,P2,P3,P4,P0], true)  → pushHistory(reorderBaseline) once

最终 past 长度 +1。用户按 1 次 Ctrl+Z 即可复原。
```

## 风险与回滚

### 风险

1. **`handleDragEnd` 未触发导致基准泄漏**：若 HTML5 拖拽因异常未派发 `dragEnd`（极少见，但浏览器在拖拽到窗口外时可能发生），`reorderBaseline` 残留，下一次 `reorderPages(newPages, false)` 会误把已有基准当作本次拖拽的起点。缓解：`reorderPages` 进入 `isCommit=false` 分支时若发现 `reorderBaseline` 已存在且 `newPages` 与 `pages` 完全相同（无位移），可视为"拖拽已结束但未提交"，先清空再重新捕获。该兜底可后置，初版不强制加。

2. **framer-motion `onDragEnd` 在 `Reorder.Group` 上的冒泡行为**：需验证 `Reorder.Group` 是否正确冒泡 `onDragEnd`。若不冒泡，退路是给每个 `Reorder.Item` 挂 `onDragEnd`，用一个共享 ref 触发提交。实施时先验证冒泡，再决定。

3. **程序化调用 `reorderPages(pages)` 的隐式 commit**：默认 `isCommit=true` 保证旧调用方行为不变，但语义上"无基准时的 commit"走的是 `commitUncommittedBaseline + pushHistory` 老路径，与"有基准时的 commit"走 `pushHistory(baseline)` 新路径，两套逻辑并存。这是过渡期必要的双轨，不算技术债——程序化调用本就没有"拖拽前基准"概念，走老路径是正确的。

4. **`Sidebar.test.tsx` / `VirtualPageList.test.tsx` 的 mock**：这两个测试文件把 `onReorderPages` mock 为 `vi.fn()`，不关心第二参数，不受影响。

### 回滚

改动集中在三处：`useStore.ts`（`reorderPages` + `reorderBaseline` 声明）、`useDragReorder.ts`（`commitReorder` + `handleDragEnd`）、`Sidebar.tsx`（`onReorder` + `onDragEnd`）。回滚即 `git revert` 对应 commit，无数据迁移、无持久化格式变更。`reorderBaseline` 是内存态模块变量，不落盘，回滚后无残留。

## 验证方式

1. **单元测试（store 层）**：在 `src/store/useStore.test.ts` 的 `reorderPages` 用例旁新增两条：

   - `reorderPages 拖拽中仅视觉更新不压栈`：先 `setPages([a,b,c])`，调用 `reorderPages([b,a,c], false)`，断言 `pages` 已变更、`past.length` 不变、`hasUnsavedChanges` 为 true。
   - `reorderPages 落手提交压栈一次`：接上，调用 `reorderPages([b,a,c], true)`，断言 `past.length` +1，且 `past` 栈顶为拖拽前基准 `[a,b,c]`（用 `isEqualSnapshot` 比对）。

   现有的 `reorderPages 重排序并标记未保存`（L447-L458）保持不变，验证默认 `isCommit=true` 路径。

2. **集成测试（hook 层）**：为 `useDragReorder` 新增测试（当前无测试文件），模拟 `handleDragStart` → 多次 `handleDragOver` → `handleDragEnd`，断言 `onReorderPages` 被调用 N+1 次（N 次视觉 + 1 次提交），且只有最后一次第二参数为 `true`。

3. **手工验证**：启动 dev server，在 >=30 页工程中拖拽第 1 张滑过 5 张，观察控制台 `logger.action('Store', 'ReorderPages', ...)` 日志：应只见 N 条 `isCommit: false` + 1 条 `isCommit: true`。随后按 1 次 `Ctrl+Z`，页面顺序应回到拖拽前。在 <30 页工程中重复同样操作，验证 `Sidebar` 的 framer-motion 路径同样只压栈一次。

4. **回归**：跑全量 `npm test`，确认 `useStore.test.ts`、`Sidebar.test.tsx`、`VirtualPageList.test.tsx` 全绿。
