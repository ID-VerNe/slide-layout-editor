# 4.1 uncommittedBaseline 闭包污染修复

## 事实核对

逐行核对 `src/store/useStore.ts` 中 `uncommittedBaseline` 的全部读写点（L114 声明、L119-127 提交函数、L337/L492 状态转移、L194/L215/L585 丢弃点、L536-558 undo 特殊分支）。报告 4.1 节的核心机制成立，但「未重置 baseline」的动作清单与代码事实存在出入，需逐项修正：

| 动作 (行号) | 报告描述 | 代码事实 | 结论 |
|---|---|---|---|
| `setCurrentPageIndex` (L337) | 未重置 baseline | `(index) => set({ currentPageIndex: index })`，无任何 baseline 处理 | 属实，确为缺陷 |
| `loadProject` (L215) | 未重置 baseline | 函数入口 `uncommittedBaseline = null;` | 不属实，已丢弃 baseline（未提交） |
| `undo` (L536-558) | 未重置 baseline | 进入分支即读取 baseline，将其作为还原目标并清空，当前快照压入 future | 不属实，已有专门处理 |
| `redo` (L585) | 未重置 baseline | 函数首行 `uncommittedBaseline = null;` | 不属实，已丢弃 baseline |

报告时序图描述的「切页 → 编辑新页 → undo 连带回滚旧页」复现路径仅由 `setCurrentPageIndex` 即可触发，**缺陷真实存在**。但报告建议的「在 `loadProject` / `undo` / `redo` 前强制 `commitUncommittedBaseline`」是基于错误前提的过度修复——这三处已各自处理 baseline，再叠加 commit 会破坏 undo 的既有语义：undo 当前会还原至 baseline（由 `useStore.test.ts` L671-688 用例保护），若先 commit 则 baseline 被压栈后清空，undo 将跳过打字内容直接回滚到上一条历史。

附带的额外发现（不在 4.1 范围但相关）：
- `setPages` (L492) 同样未处理 baseline，外部整体替换页数组时会遗留旧基准。当前仅测试代码调用，仍建议防御性修复。
- `setPrintSettings` (L344) / `setImageQuality` (L345) / `setMinimalCounter` (L346) / `setCustomFonts` (L355-358) 既不提交 baseline 也不调用 `pushHistory`，属于「历史栈绕过」的另一类缺陷，不在本节处理。

## 根因

`uncommittedBaseline` 是脱离 Zustand store 事务边界的模块级全局变量（L114）。它承载「防抖输入期间的编辑前快照」，其生命周期应由所有状态转移动作共同维护：任一动作在改变状态前，要么提交（将 baseline 压入 past 后清空），要么丢弃（直接清空）。

`setCurrentPageIndex` 是状态转移动作——它改变 `currentPageIndex`，而 `currentPageIndex` 是 `HistorySnapshot` 的字段之一（L67、L81）——却未参与 baseline 生命周期维护。复现路径：

1. 用户在 P1 静默打字 → `updatePage(silent:true)` 命中 L370，baseline 捕获 P1 编辑前全量快照（含 `currentPageIndex: 0`）
2. 切换到 P2 → `setCurrentPageIndex(1)` 仅改索引，baseline 仍指向 P1 编辑前状态
3. 在 P2 上失焦提交 → `updatePage(silent:false)` 命中 L374 分支，将 P1 编辑前 baseline 与 P2 编辑后当前态比对，二者必然不同，于是把 P1 baseline 压入 past
4. undo → 弹出 P1 baseline 还原，`currentPageIndex` 被一并回滚到 0，用户从 P2 跳回 P1，且 P1 半截输入丢失、P2 编辑也消失

关键在于 baseline 快照内嵌 `currentPageIndex`，跨页携带后语义错位：基准属于 P1 的编辑上下文，却被 P2 的提交消费。

## 解决方案

采用方案 B：在缺失的状态转移前补齐 `commitUncommittedBaseline(get())`。不采用方案 A（将 baseline 移入 store state），理由见末段。

### 修复点 1：`setCurrentPageIndex` (L337) — 核心修复

```typescript
setCurrentPageIndex: (index) => {
  // 切页前结算正在进行的静默输入基准，避免旧页基准污染新页历史栈
  commitUncommittedBaseline(get());
  set({ currentPageIndex: index });
},
```

### 修复点 2：`setPages` (L492) — 防御性修复

```typescript
setPages: (pages) => {
  // 外部整体替换页数组前结算基准，避免替换后旧基准与新页面错位
  commitUncommittedBaseline(get());
  set({ pages });
},
```

### 不修复的项（已正确处理，勿动）

- `loadProject` (L215) / `createProject` (L194) / `redo` (L585)：全量状态替换场景，直接 `uncommittedBaseline = null` 丢弃基准是正确语义——新项目或重做状态不应继承旧编辑上下文。改为 commit 反而会向新项目的 past 栈注入无关历史。
- `undo` (L536-558)：当前的特殊处理（还原至 baseline + 当前态压入 future）正是打字中途撤销的期望行为，由 `useStore.test.ts` L671-688 用例保护。叠加 commit 会破坏该语义。
- 其余 7 个动作（`setProjectTitle` L340 / `setCounterStyle` L349 / `addPage` L461 / `removePage` L484 / `reorderPages` L497 / `setTheme` L503 / `setDesignSystem` L530）已正确调用 `commitUncommittedBaseline(get())`，不变。

### 修复后状态机

baseline 生命周期以两态刻画：`IDLE`（`uncommittedBaseline === null`）与 `PENDING`（持有快照）。每个状态转移动作按下表归属其一：

| 动作 | IDLE → | PENDING → | 说明 |
|---|---|---|---|
| `updatePage(silent:true)` | PENDING（捕获） | PENDING（保留） | L370 仅在 null 时捕获 |
| `updatePage(silent:false)` | IDLE | IDLE（提交） | L374 提交 baseline 至 past |
| `setCurrentPageIndex` | IDLE | IDLE（提交） | **修复新增** |
| `setPages` | IDLE | IDLE（提交） | **修复新增** |
| `addPage` / `removePage` / `reorderPages` | IDLE | IDLE（提交） | 已有 |
| `setTheme` / `setDesignSystem` / `setCounterStyle` / `setProjectTitle` | IDLE | IDLE（提交） | 已有 |
| `createProject` / `loadProject` / `redo` | IDLE | IDLE（丢弃） | 全量替换，丢弃正确 |
| `undo` | IDLE | IDLE（还原至 baseline） | 特殊：不进 past，直接还原 |

「提交」= `commitUncommittedBaseline(get())`（基准与当前态不同则压栈，清空 baseline）；「丢弃」= `uncommittedBaseline = null`；「还原」= undo 专属分支。修复后不存在任何 PENDING → IDLE 的遗漏路径，每个转移动作都显式归属三类之一。

### 方案 A 为何不采用

将 baseline 移入 store state（如 `uncommittedBaseline: HistorySnapshot | null` 作为 `ProjectState` 字段）虽使变量可观测、随 store 重置，但：

1. 核心问题是「状态转移前漏提交」，不是「变量不可见」。方案 A 仍需在每个动作里显式 `set({ uncommittedBaseline: null })` 或调用 commit，diff 更大却不消除漏写风险。
2. baseline 是编辑过程中的瞬态标记，进入 store state 后任何 `useStore(s => s.uncommittedBaseline)` 订阅都会引发额外重渲染，需额外规避。
3. 违反 `~/.claude/CLAUDE.md` 的「最简实现」原则：当前模块级变量配合方案 B 已能完整修复，无需扩大 `ProjectState` 接口面。

## Before / After

### 修复前代码（L337、L492）

```typescript
setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
setPages: (pages) => set({ pages }),
```

### 修复后代码

```typescript
setCurrentPageIndex: (index) => {
  // 切页前结算正在进行的静默输入基准
  commitUncommittedBaseline(get());
  set({ currentPageIndex: index });
},
setPages: (pages) => {
  // 替换页数组前结算基准
  commitUncommittedBaseline(get());
  set({ pages });
},
```

### 行为时序对比

修复前（报告复现路径）：

```
P1 打字(silent) → baseline=[P1orig, idx=0]
切到 P2          → baseline 未变，idx=1
P2 编辑提交      → past=[[P1orig,P2orig, idx=0]], 当前=[P1typed, P2edited, idx=1]
undo             → 还原 baseline → pages=[P1orig,P2orig], idx=0
                  P2 编辑丢失，跳回 P1，P1 半截输入也消失
```

修复后：

```
P1 打字(silent) → baseline=[P1orig, idx=0]
切到 P2          → commit → past=[[P1orig,P2orig, idx=0]], baseline=null, idx=1
P2 编辑提交      → baseline=null → 走 L386 else 分支 pushHistory()
                  past 加 [P1typed,P2orig, idx=1], 当前=[P1typed, P2edited, idx=1]
undo             → 弹出 [P1typed,P2orig, idx=1] → 仅回退 P2 编辑, idx 仍=1
undo             → 弹出 [P1orig,P2orig, idx=0] → 回退 P1 打字, idx=0
```

## 风险与回滚

### 风险

1. **历史栈增长**：用户打字中途频繁切页会使每次切页产生一条历史记录。但每条对应一个真实的编辑边界，属合理代价，且受 50 条上限（L331）与 5MB 上限（L318）约束。
2. **`setPages` 误触发提交**：若外部代码在非编辑态调用 `setPages`，`commitUncommittedBaseline` 因 baseline 为 null 提前返回（L120），无副作用。当前仅测试调用，风险可忽略。
3. **测试兼容性**：`useStore.test.ts` 现有切页用例（L172-182、L503-507、L551-563）均在无 baseline 态调用 `setCurrentPageIndex`，commit 提前返回，行为不变。`setPages` 用例（L436-444、L447-458）同理。

### 回滚

改动仅涉及两个 action 体内各加一行 `commitUncommittedBaseline(get())` 并由 arrow 表达式包装为块体。回滚即恢复两处单行 arrow 表达式，单一 commit 即可还原，无状态迁移、无接口变更。

## 验证方式

### 现有测试

运行 `pnpm test src/store/useStore.test.ts`，以下用例须全绿：

- L120-130 silent 更新不写入历史
- L641-668 连续静默打字并提交，undo 精准恢复
- L671-688 打字中途 undo 立即撤销
- L690-699 打字删回原样不产生无意义历史
- L701-723 打字中插入 addPage 后历史衔接
- L503-507 setCurrentPageIndex 基础切换

### 新增用例（建议补入「历史记录防重复与撤销重做恢复」describe 块）

```typescript
it('打字中途切换页面后编辑新页，undo 仅撤销新页编辑且停留在新页', () => {
  const { addPage, updatePage, setCurrentPageIndex, undo } = useStore.getState();
  addPage('16:9', 'modern-feature');
  addPage('16:9', 'modern-feature');

  const p1 = useStore.getState().pages[0];
  updatePage({ ...p1, title: 'P1 Typed' }, true);

  // 修复前：此处不提交基准
  setCurrentPageIndex(1);

  const p2 = useStore.getState().pages[1];
  updatePage({ ...p2, title: 'P2 Edited' }, false);

  // 一次 undo：仅回退 P2 编辑，currentPageIndex 仍为 1
  undo();
  expect(useStore.getState().pages[1].title).toBe('New Slide');
  expect(useStore.getState().currentPageIndex).toBe(1);

  // 二次 undo：回退 P1 打字
  undo();
  expect(useStore.getState().pages[0].title).toBe('New Slide');
});
```

修复前该用例在第一次 `undo` 后断言失败：`currentPageIndex` 被回滚为 0（断言期望 1），且 `pages[0].title` 也被还原。修复后通过。
