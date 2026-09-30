# 2.2 useStore.ts 切片化

> 对应 `docs/code-review-report.md` 第 255-287 行 2.2 节。
> 关联 4.1(`uncommittedBaseline` 修复)、5.3(快照字体剥离)、2.3(`db.ts` 拆解)。

## 事实核对

逐条核对报告描述与 `src/store/useStore.ts` / `src/store/useStore.test.ts` 实际代码:

| 报告描述 | 实际核对 | 结论 |
|---|---|---|
| 文件 `src/store/useStore.ts#L1-L615` (615 行, 23,267 字节) | `wc -l` 实测 614 行、`wc -c` 实测 23,267 字节 | 字节一致;行数差 1(末行换行计数),可忽略 |
| 维护 35 个状态字段与动作 | `interface ProjectState` 含 16 个状态字段 + 22 个 action = 38 个成员 | 报告低估 3,核心问题成立 |
| `updatePage` 遍历 `GLOBAL_FIELDS` 强制同步所有页 | `useStore.ts#L396-L412` 预计算 `globalUpdates` 后二次 `map` 同步 | 属实 |
| `buildSnapshot` / `structuredClone` / 5MB 门限 / `isEqualSnapshot` | `useStore.ts#L71-L111`、`L318-L328`、`L88-L111` 逐一存在 | 属实 |
| `loadProject` 直接调用 `getProject(id)` 与 `migrateToV3(data)` | `useStore.ts#L225`、`L238` | 属实 |
| `loadCustomFontsIntoDOM()` 在 store 方法中被直接同步调用 | `useStore.ts#L264`(`loadProject`)、`L356`(`setCustomFonts`)两处 | 属实 |
| `loadProject` 直接调用 `nativeFs.setCurrentProject(projectId, title)` | `useStore.ts#L242` | 属实 |
| `(window as any).__SLIDEGRID_STORE__` 是 6 套 Playwright 夹具不可删 | `e2e/02-editor-workflow.spec.ts:35`、`04-all-templates-gallery.spec.ts:57`、`06-visual-asset-and-image-geometry.spec.ts:8`、`08-project-persistence-and-storage.spec.ts:24`、`09-undo-redo-and-keyboard-shortcuts.spec.ts:20`、`10-direction-switcher-and-json-templates.spec.ts:12` 均经 `__SLIDEGRID_STORE__` 调 `getState()`;04 与 10 还带 `|| (window as any).useStore` 兜底 | 属实 |
| 建议用 `if (process.env.NODE_ENV !== 'production' || (window as any).__PLAYWRIGHT_TEST__)` 收敛 | `process.env.NODE_ENV` 在 `src/` 内零引用,项目走 vite 的 `import.meta.env.DEV/PROD`(`src/utils/logger.ts:18`、`src/hooks/useImagePreload.ts:57`);`__PLAYWRIGHT_TEST__` 全工程 grep 无任何赋值点;E2E 跑 `vite build` 产物(production),`import.meta.env.PROD` 为 true | 守卫前提错误,见下文 |

**报告环境守卫建议的致命缺陷**:E2E 在 `vite build` 出的 production bundle 下运行,`import.meta.env.PROD` 必为 true;若按报告建议加 `NODE_ENV !== 'production'` 守卫,production bundle 内 `__SLIDEGRID_STORE__` 会被剥掉,6 套 E2E 全部失去 `getState()` 入口而红。且 `__PLAYWRIGHT_TEST__` 这个 window 标志在仓库内根本不存在,`e2e/fixtures.ts:50` 只在 Electron 主进程 env 注入 `NODE_ENV: 'test'`,渲染进程拿不到。该守卫不能直接采纳,需换为「无条件保留 + 与 `__SLIDEGRID_DB__` 对齐」的策略(见「解决方案」第 4 步)。

**附带发现(报告未点明,影响落地)**:

1. **IPC 双写**:`EditorPage.tsx:105` 在 `useEffect` 里又调了一次 `nativeFs.setCurrentProject(projectId, projectTitle || fallbackTitle)`,与 `loadProject` 内的 `L242` 调用构成双写。切片化时若把 IPC 从 store 抽出,须同时清理 `EditorPage` 的重复调用,否则出现两套来源不一致的 IPC 入口。
2. **`useProject` 聚合瓶颈**:`src/hooks/useProject.ts#L9-L46` 一次性订阅 16 个 state 切片 + 13 个 action,共 29 次 `useStore(s => ...)` 调用。它是 `EditorPage` 的数据瓶颈,但属 5.1 节范围,本方案不越界处理,仅保证切片后 `useProject` 的 `from '../store/useStore'` 导入路径不变。
3. **`db.ts` 同名模式**:`src/utils/db.ts:210` 也用 `(window as any).__SLIDEGRID_DB__ = {...}` 暴露测试夹具,2.3 节方案 `docs/solutions/03-db-decompose.md` 保留该挂载。本方案对 `__SLIDEGRID_STORE__` 采取对齐策略,保持两处夹具的暴露方式一致。
4. **测试 mock 路径**:`useStore.test.ts` 通过 `vi.mock('../utils/db')` 与 `vi.mock('../utils/native-fs')` 注入桩;`vi.mock('../store/useStore', ...)` 在 `src/hooks/__tests__/useProject.test.ts`、`src/pages/__tests__/Dashboard.test.tsx`、`src/pages/__tests__/EditorPage.test.tsx` 中使用。切片后 `useStore` 命名导出必须保留在同一路径,否则 4 个测试文件的 mock 路径全部失效。

## 根因

`useStore.ts` 的膨胀不是偶然,而是三个结构性诱因叠加:

1. **单 `create` 装下所有关注点**。zustand 的 `create((set, get) => ({...}))` 天然鼓励把所有 state + action 平铺在一个对象字面量里。文件从最初的项目元数据,逐步吸收了样式设置、打印配置、历史快照引擎、IPC 同步、DOM 字体注册、模板兜底构造,边界从未被守住。38 个成员挤在同一闭包,任一字段调整都触动一个 23KB 文件。

2. **历史引擎与业务状态纠缠**。`buildSnapshot` 需要读取全部 16 个 state 字段构建快照,`undo`/`redo` 需要写回全部字段。这使得历史逻辑天然耦合到每一个 state 字段,无法作为独立模块演进。同时 `uncommittedBaseline`(`L114`)是模块级变量,被 `projectSlice`(`setProjectTitle`/`updatePage`/`addPage`/`removePage`/`reorderPages`)与 `styleSlice`(`setTheme`/`setDesignSystem`/`setCounterStyle`)交叉读写,生命周期维护散落在 7 个 action 里。

3. **副作用直接嵌入 reducer**。`loadProject` 把「IndexedDB 读取 → V3 迁移 → Electron IPC 同步 → DOM 字体注册 → 状态写入」五步串在一个 async 函数里;`setCustomFonts` 把「DOM 字体注册 → 状态写入」串在一个同步 action 里。这使得 store 无法被纯单测,必须 mock `../utils/db`、`../utils/native-fs`、`loadCustomFontsIntoDOM` 三个外部依赖才能跑——而 `loadCustomFontsIntoDOM` 当前甚至没被 mock,仅因测试桩数据 `customFonts: []` 走早返回才未爆雷。

次要因素:

- 报告建议的 `middleware/undoMiddleware.ts` 是误开药方。项目当前未启用任何 zustand middleware(全手工 `set` + spread),引入自定义中间件会新增一层抽象而旧逻辑(`pushHistory`/`isEqualSnapshot`/`uncommittedBaseline`)仍需搬迁,双倍工作量且不解决副作用嵌入问题。历史逻辑用 slice 收纳即可,无需 middleware。
- `EditorPage.tsx:105` 的 IPC 重复调用说明副作用本就不该在 store 里——一旦 store 不再调 IPC,`EditorPage` 那处要么补全要么删除,但绝不能两处都留。

## 解决方案

按「职责单一、关注点分离」拆成 3 个 slice + 1 个副作用服务,聚合在原 `useStore.ts`。**不保留 `db.ts` 式的 re-export 聚合层**:聚合即 `useStore.ts` 本身,它从薄文件变成组合根,调用方 `from '../store/useStore'` 路径全部不动,避免 22 个源文件 + 4 个测试文件的无效 churn。

### 设计原则(遵从 `~/.claude/CLAUDE.md`)

- **不保留向后兼容**:不写 `useStore.ts → index.ts` 重导出垫片,不保留旧路径。`useStore.ts` 直接重写为组合根。
- **最简实现**:用 zustand v4 原生 `StateCreator` 组合,不引入 `immer` middleware(项目当前不用,引入它属于投机抽象),不引入 `zundo`/`temporal` 等撤销库。
- **不投机抽象**:不为「未来可能拆分的 slice」预留子目录;3 个 slice 是当前职责的真实边界。
- **不破坏测试**:729 项单测 + 6 套 E2E 的入口(`useStore` 命名导出、`isEqualSnapshot` 命名导出、`__SLIDEGRID_STORE__` window 挂载、`getState().addPage/loadProject/updatePage/undo/redo/pushHistory` 方法签名)全部保留。

### 目录结构

```
src/store/
├── useStore.ts                  # 组合根,聚合 3 个 slice 与副作用服务
├── projectLoader.ts             # loadProject 的 IO 管道(DB + 迁移 + IPC + 字体 DOM)
└── slices/
    ├── projectSlice.ts          # pages / projectTitle / currentPageIndex / activeProjectId
    │                             #   / currentFilePath / isLoaded / hasUnsavedChanges
    │                             #   + createProject / addPage / removePage / updatePage
    │                             #   / updatePages / reorderPages / setPages / setProjectTitle
    │                             #   / setCurrentPageIndex / setCurrentFilePath / markAsSaved
    ├── styleSlice.ts            # theme / designSystem / customFonts / imageQuality
    │                             #   / minimalCounter / counterStyle / printSettings
    │                             #   + setTheme / setDesignSystem / setCustomFonts
    │                             #   / setPrintSettings / setImageQuality
    │                             #   / setMinimalCounter / setCounterStyle
    └── historySlice.ts          # past / future + pushHistory / undo / redo
                                  #   + buildSnapshot / isEqualSnapshot
                                  #   + uncommittedBaseline / commitUncommittedBaseline
```

### Slice 划分依据

| Slice | 内聚理由 | 跨 slice 依赖 |
|---|---|---|
| `historySlice` | 快照构建、防重复压栈、5MB 门限、undo/redo 还原、`uncommittedBaseline` 生命周期——全部围绕「历史栈」这一关注点 | `buildSnapshot` 读全量 state(经 `get()`);`undo`/`redo` 写回 `pages`/`theme`/`designSystem` 等多 slice 字段(经 `set`) |
| `projectSlice` | 页面数组 CRUD、工程元数据、当前页索引、未保存标记——全部围绕「工程业务模型」 | 调 `get().pushHistory()` / `commitUncommittedBaseline(get())`(从 historySlice 导入);`loadProject` 委托 `projectLoader` |
| `styleSlice` | 主题、设计令牌、自定义字体、图像质量、计数器、打印设置——全部围绕「视觉配置」 | 调 `get().pushHistory()` / `commitUncommittedBaseline(get())`;`setTheme(applyToAll)` / `setCounterStyle` 写 `pages`(经 `set` 跨 slice 写) |

`uncommittedBaseline` 留在 `historySlice` 模块作用域,导出 `commitUncommittedBaseline(get)` 与 `buildSnapshot(get)` 供另两个 slice 调用。不把它提升为 store action——暴露内部机制到公共 API 会破坏 store 的封装边界,且测试会因此被迫断言内部状态。

### 实施步骤

**Step 1:抽离 `historySlice`**

把 `buildSnapshot`、`isEqualSnapshot`、`uncommittedBaseline`、`commitUncommittedBaseline`、`pushHistory`、`undo`、`redo`、`past`/`future` 初值整体搬到 `src/store/slices/historySlice.ts`。`deepClone`、`deepEqual` 的 import 跟随。`buildSnapshot` 与 `commitUncommittedBaseline` 改为接收 `get: () => ProjectState` 参数,以便跨 slice 调用。

`historySlice.ts` 导出 `createHistorySlice: StateCreator<ProjectState, [], [], HistorySlice>` 与命名导出 `isEqualSnapshot`、`HistorySnapshot`、`buildSnapshot`、`commitUncommittedBaseline`。后两者仅供 `projectSlice` / `styleSlice` 内部消费,不进 `ProjectState` 接口。

**Step 2:抽离 `projectLoader`(剥离 `loadProject` 副作用)**

新建 `src/store/projectLoader.ts`,把 `loadProject` 内的 IO 步骤提炼为纯函数:

```typescript
// src/store/projectLoader.ts
import { getProject } from '../utils/storage/projectDb';   // 2.3 节拆解后的路径
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { nativeFs } from '../utils/native-fs';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { getRatioFromTemplate, getDefaultPage } from './slices/projectSlice';

export interface LoadResult {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  currentFilePath: string | null;
  currentPageIndex: number;
}

/**
 * 执行工程加载的纯 IO 管道:读取 -> 迁移 -> IPC 同步 -> 字体注册
 * 不触碰 store,只返回可写入的状态快照与过时检测句柄
 */
export async function loadProjectPipeline(
  idOrData: string | (Partial<ProjectData> & Record<string, any>),
  templateId: string | null,
  filePath: string | null,
  projectId: string,
  isStale: () => boolean,
): Promise<LoadResult | null> { ... }
```

`projectSlice.loadProject` 退化为薄壳:

```typescript
// src/store/slices/projectSlice.ts
loadProject: async (idOrData, templateId, filePath) => {
  uncommittedBaseline = null;   // 从 historySlice 导入的句柄
  const reqId = ++loadRequestId;
  const projectId = typeof idOrData === 'string' ? idOrData : (idOrData.id || crypto.randomUUID());
  set({ isLoaded: false, activeProjectId: projectId, currentFilePath: filePath || null, hasUnsavedChanges: false });

  try {
    const result = await loadProjectPipeline(idOrData, templateId ?? null, filePath ?? null, projectId, () => reqId !== loadRequestId);
    if (reqId !== loadRequestId) return;   // 过时请求丢弃
    if (result) {
      set({ ...result, isLoaded: true, past: [], future: [] });
    } else {
      // 模板兜底分支保留在 slice 内,不依赖 IO
      const templateConfig = getTemplateById(templateId || 'modern-feature');
      set({ pages: [getDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig)], ... defaults ..., isLoaded: true, past: [], future: [] });
    }
  } catch (err) {
    if (reqId !== loadRequestId) return;
    console.error('[Store] Failed to load project:', err);
    set({ ...defaults..., isLoaded: true, activeProjectId: null, past: [], future: [] });
  }
}
```

**`EditorPage.tsx:105` 的 IPC 重复调用一并删除**——IPC 同步已由 `projectLoader` 单点负责,`EditorPage` 不再二次写入。

**Step 3:抽离 `styleSlice`,把 `setCustomFonts` 的 DOM 副作用移出**

`setCustomFonts` 当前在 action 内同步调 `loadCustomFontsIntoDOM(customFonts)`。改为:`setCustomFonts` 只写 state,DOM 字体注册由订阅 `customFonts` 的 `useEffect` 承担。

```typescript
// src/components/editor/FontManager.tsx 或新建 src/hooks/useCustomFontsDom.ts
useEffect(() => {
  loadCustomFontsIntoDOM(customFonts);
}, [customFonts]);
```

放在何处:`useProject.ts` 已订阅 `customFonts`(`L21`),在其内追加一个 `useEffect(() => loadCustomFontsIntoDOM(customFonts), [customFonts])` 即可,无需新文件。`loadProject` 内的 `loadCustomFontsIntoDOM(migratedData.customFonts)` 调用同步移除——加载完成后 `set({ customFonts })` 触发 `useEffect` 自然注册。

**Step 4:`__SLIDEGRID_STORE__` 暴露策略(否决报告的 env 守卫)**

保留 `useStore.ts` 末尾的无条件暴露,与 `db.ts` 的 `__SLIDEGRID_DB__` 对齐:

```typescript
// 暴露 store 引用以支持端到端自动化测试与控制台调试
if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_STORE__ = useStore;
}
```

**不采纳报告建议的 `if (process.env.NODE_ENV !== 'production' || (window as any).__PLAYWRIGHT_TEST__)` 守卫**,理由见「事实核对」:E2E 跑 production bundle,该守卫会剥掉 6 套 E2E 的 `getState()` 入口;且 `__PLAYWRIGHT_TEST__` 标志在仓库内不存在。`__SLIDEGRID_DB__`(2.3 节方案保留)已是同类夹具的先例,对齐即可。

**Step 5:`useStore.ts` 重写为组合根**

```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createStyleSlice, StyleSlice } from './slices/styleSlice';
import { createHistorySlice, HistorySlice, isEqualSnapshot, HistorySnapshot } from './slices/historySlice';

export type ProjectState = ProjectSlice & StyleSlice & HistorySlice;
export { isEqualSnapshot, HistorySnapshot };

// @lat: [[store#Project State]]
export const useStore = create<ProjectState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createStyleSlice(...a),
  ...createHistorySlice(...a),
}));

if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_STORE__ = useStore;
}
```

`isEqualSnapshot` 与 `HistorySnapshot` 从组合根 re-export,保证 `useStore.test.ts` 的 `import { useStore, isEqualSnapshot } from '../store/useStore'` 不变。这不是兼容层——组合根本就负责聚合 slice 的对外符号。

### 关键设计决策

**为什么不用 `immer` middleware**。项目当前零 middleware,全手工 `set` + spread。引入 `immer` 会改写所有 `set` 调用形态(`set(state => { state.pages.push(...) })`),且 `structuredClone` 深拷贝路径仍需保留(快照构建)。引入新依赖形态而旧逻辑不减少,属投机抽象。zustand v4 的 `StateCreator` 组合已足够切片。

**为什么 `loadProject` 不整体搬到 `projectLoader`**。`loadProject` 需要写 `past: []`、`future: []`、`uncommittedBaseline = null` 等 store 内部状态,这些是 slice 的私有职责。把 store 写入搬出去会让 `projectLoader` 反向持有 `set`/`get`,变成事实上的 store 外置,违背「store 拥有状态」边界。拆分边界是:`projectLoader` 只做 IO 与纯计算,返回 `LoadResult`;`projectSlice.loadProject` 负责 `set` 与 baseline 生命周期。

**为什么 `uncommittedBaseline` 不进 store state**。它是「防抖输入期间尚未提交的历史基准」,不是业务状态,放进 state 会触发组件重渲染,且会被 `buildSnapshot` 误纳入快照。模块级变量是正确归属,搬到 `historySlice` 模块作用域后仍是单例,行为不变。4.1 节方案(`docs/solutions/11-uncommitted-baseline-fix.md`)对其生命周期的修复在 slice 化后原样保留,因 `commitUncommittedBaseline` 的调用点全部在 slice 内部。

**为什么不拆 `printSlice`**。报告建议把 `printSettings` 单列为 `printSlice`,但 `printSettings` 只有一个 setter(`setPrintSettings`),且与 `imageQuality`/`minimalCounter`/`counterStyle` 同属「视觉配置」语义簇。为单字段单 setter 开一个 slice 是过度拆分。归入 `styleSlice`。

## Before / After

### Before:`src/store/useStore.ts`(614 行单文件)

```typescript
import { create } from 'zustand';
import { PageData, AspectRatioType, ProjectTheme, PrintSettings, CustomFont, CounterStyle, DesignSystem, ProjectData } from '../types';
import { getProject } from '../utils/db';
import { nativeFs } from '../utils/native-fs';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { GLOBAL_FIELDS } from '../constants/fields';
import { TEMPLATES, getTemplateById } from '../templates/registry';
import { logger } from '../utils/logger';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';
import { deepEqual } from '../utils/comparison';

// ... 60 行辅助函数与类型 ...

let uncommittedBaseline: HistorySnapshot | null = null;
let loadRequestId = 0;

interface ProjectState {
  // 16 个 state 字段
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  currentPageIndex: number;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  isLoaded: boolean;
  activeProjectId: string | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  // 22 个 action
  createProject: ...;
  loadProject: ...;        // 内联 getProject + migrateToV3 + nativeFs.setCurrentProject + loadCustomFontsIntoDOM
  setPages: ...;
  setProjectTitle: ...;
  setTheme: ...;
  setDesignSystem: ...;
  setPrintSettings: ...;
  setImageQuality: ...;
  setMinimalCounter: ...;
  setCounterStyle: ...;
  setCustomFonts: ...;     // 内联 loadCustomFontsIntoDOM
  setCurrentPageIndex: ...;
  setCurrentFilePath: ...;
  markAsSaved: ...;
  updatePage: ...;
  updatePages: ...;
  addPage: ...;
  removePage: ...;
  reorderPages: ...;
  undo: ...;
  redo: ...;
  pushHistory: ...;
}

export const useStore = create<ProjectState>((set, get) => ({
  // 38 个成员平铺,614 行
  pages: [], projectTitle: '', theme: DEFAULT_THEME, ...,
  createProject: (title, templateId) => { ... },
  loadProject: async (idOrData, templateId, filePath) => {
    // 内联:uncommittedBaseline 清空 + getProject + migrateToV3
    //        + nativeFs.setCurrentProject + loadCustomFontsIntoDOM + set
  },
  // ... 其余 35 个成员 ...
}));

if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_STORE__ = useStore;
}
```

### After:3 slice + 1 loader + 组合根

```typescript
// src/store/slices/historySlice.ts (~180 行)
import { StateCreator } from 'zustand';
import { ProjectState } from '../useStore';
import { PageData, ProjectTheme, DesignSystem, PrintSettings, CustomFont, CounterStyle } from '../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { deepEqual } from '../../utils/comparison';

const deepClone = <T>(obj: T): T => structuredClone(obj);

export interface HistorySnapshot {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  printSettings?: PrintSettings;
  minimalCounter?: boolean;
  counterStyle?: CounterStyle;
  imageQuality?: number;
  customFonts?: CustomFont[];
  currentPageIndex?: number;
  currentFilePath?: string | null;
}

let uncommittedBaseline: HistorySnapshot | null = null;

export const buildSnapshot = (state: ProjectState): HistorySnapshot => ({ ... });
export const isEqualSnapshot = (a?, b?): boolean => { ... };
export const commitUncommittedBaseline = (get: () => ProjectState) => { ... };

export interface HistorySlice {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  pushHistory: (customSnapshot?: HistorySnapshot) => void;
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice: StateCreator<ProjectState, [], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],
  pushHistory: (customSnapshot) => { /* 原 L309-L335 逻辑,使用 buildSnapshot(get()) */ },
  undo: () => { /* 原 L535-L582 逻辑 */ },
  redo: () => { /* 原 L584-L607 逻辑 */ },
});
```

```typescript
// src/store/projectLoader.ts (~80 行)
import { getProject } from '../utils/storage/projectDb';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { nativeFs } from '../utils/native-fs';
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { ProjectData, PageData, ProjectTheme, DesignSystem, PrintSettings, CustomFont, CounterStyle } from '../types';

export interface LoadResult { ... }

export async function loadProjectPipeline(
  idOrData: string | (Partial<ProjectData> & Record<string, any>),
  templateId: string | null,
  filePath: string | null,
  projectId: string,
  isStale: () => boolean,
): Promise<LoadResult | null> {
  let projectData: any = null;
  if (typeof idOrData === 'string') {
    projectData = await getProject(idOrData);
  } else {
    projectData = idOrData;
  }
  if (isStale()) return null;

  if (projectData) {
    const migrated = migrateToV3(projectData);
    if (nativeFs.isElectron()) {
      const title = migrated.title || migrated.projectTitle || 'Untitled Project';
      nativeFs.setCurrentProject(projectId, title);
    }
    // 字体 DOM 注册移至 useProject 的 useEffect,此处不再调
    return {
      pages: migrated.pages || [],
      projectTitle: migrated.title || migrated.projectTitle || '',
      theme: migrated.theme || DEFAULT_THEME,
      designSystem: migrated.designSystem || DEFAULT_DESIGN_SYSTEM,
      customFonts: migrated.customFonts || [],
      imageQuality: migrated.imageQuality ?? 0.95,
      minimalCounter: migrated.minimalCounter ?? false,
      counterStyle: migrated.counterStyle || migrated.pages?.[0]?.counterStyle || 'number',
      printSettings: migrated.printSettings || DEFAULT_PRINT_SETTINGS,
      currentFilePath: filePath || migrated.filePath || null,
      currentPageIndex: 0,
    };
  }
  return null;
}
```

```typescript
// src/store/slices/projectSlice.ts (~200 行)
import { StateCreator } from 'zustand';
import { ProjectState } from '../useStore';
import { PageData, AspectRatioType, ProjectData } from '../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { TEMPLATES, getTemplateById } from '../../templates/registry';
import { GLOBAL_FIELDS } from '../../constants/fields';
import { logger } from '../../utils/logger';
import { deepEqual } from '../../utils/comparison';
import { buildSnapshot, commitUncommittedBaseline } from './historySlice';
import { loadProjectPipeline } from '../projectLoader';

const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => { ... };
const getDefaultPage = (ratio, layoutId, templateConfig?): PageData => { ... };

let loadRequestId = 0;

export interface ProjectSlice {
  pages: PageData[];
  projectTitle: string;
  currentPageIndex: number;
  isLoaded: boolean;
  activeProjectId: string | null;
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  createProject: (title: string, templateId?: string) => string;
  loadProject: (idOrData: string | (Partial<ProjectData> & Record<string, any>), templateId?: string | null, filePath?: string | null) => Promise<void>;
  setPages: (pages: PageData[]) => void;
  setProjectTitle: (title: string) => void;
  setCurrentPageIndex: (index: number) => void;
  setCurrentFilePath: (path: string | null) => void;
  markAsSaved: () => void;
  updatePage: (updatedPage: PageData, silent?: boolean) => void;
  updatePages: (updates: Partial<PageData>[], silent?: boolean) => void;
  addPage: (ratio: AspectRatioType, layoutId: string) => void;
  removePage: (id: string) => void;
  reorderPages: (newPages: PageData[]) => void;
}

export const createProjectSlice: StateCreator<ProjectState, [], [], ProjectSlice> = (set, get) => ({
  pages: [], projectTitle: '', currentPageIndex: 0, isLoaded: false,
  activeProjectId: null, currentFilePath: null, hasUnsavedChanges: false,

  createProject: (title, templateId) => { /* 原 L193-L211,调 commitUncommittedBaseline(get()) */ },
  loadProject: async (idOrData, templateId, filePath) => {
    // 委托 loadProjectPipeline,只负责 set 与 baseline
  },
  setPages: (pages) => set({ pages }),
  setProjectTitle: (projectTitle) => {
    if (projectTitle === get().projectTitle) return;
    commitUncommittedBaseline(get());
    get().pushHistory();
    set({ projectTitle, hasUnsavedChanges: true });
  },
  // ... 其余 action 原样搬迁,内部 set/get 不变 ...
});
```

```typescript
// src/store/slices/styleSlice.ts (~120 行)
import { StateCreator } from 'zustand';
import { ProjectState } from '../useStore';
import { ProjectTheme, DesignSystem, CustomFont, CounterStyle, PrintSettings } from '../../types';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../../constants/theme';
import { deepEqual } from '../../utils/comparison';
import { commitUncommittedBaseline } from './historySlice';

export interface StyleSlice {
  theme: ProjectTheme;
  designSystem: DesignSystem;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  setTheme: (update: any, applyToAll?: boolean) => void;
  setDesignSystem: (ds: DesignSystem) => void;
  setCustomFonts: (fonts: CustomFont[]) => void;
  setPrintSettings: (settings: PrintSettings) => void;
  setImageQuality: (q: number) => void;
  setMinimalCounter: (m: boolean) => void;
  setCounterStyle: (s: CounterStyle) => void;
}

export const createStyleSlice: StateCreator<ProjectState, [], [], StyleSlice> = (set, get) => ({
  theme: DEFAULT_THEME, designSystem: DEFAULT_DESIGN_SYSTEM, customFonts: [],
  imageQuality: 0.95, minimalCounter: false, counterStyle: 'number',
  printSettings: DEFAULT_PRINT_SETTINGS,

  setCustomFonts: (customFonts) => set({ customFonts, hasUnsavedChanges: true }),
  // ↑ DOM 字体注册移至 useProject 的 useEffect,不再在此调 loadCustomFontsIntoDOM
  setTheme: (update, applyToAll = false) => { /* 原 L502-L526 逻辑 */ },
  setDesignSystem: (ds) => { /* 原 L528-L533 */ },
  setPrintSettings: (s) => set({ printSettings: s, hasUnsavedChanges: true }),
  setImageQuality: (q) => set({ imageQuality: q, hasUnsavedChanges: true }),
  setMinimalCounter: (m) => set({ minimalCounter: m, hasUnsavedChanges: true }),
  setCounterStyle: (s) => { /* 原 L347-L354,跨 slice 写 pages */ },
});
```

```typescript
// src/store/useStore.ts (~20 行组合根)
import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createStyleSlice, StyleSlice } from './slices/styleSlice';
import { createHistorySlice, HistorySlice, isEqualSnapshot, HistorySnapshot } from './slices/historySlice';

export type ProjectState = ProjectSlice & StyleSlice & HistorySlice;
export { isEqualSnapshot, HistorySnapshot };

// @lat: [[store#Project State]]
export const useStore = create<ProjectState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createStyleSlice(...a),
  ...createHistorySlice(...a),
}));

// 暴露 store 引用以支持端到端自动化测试与控制台调试
if (typeof window !== 'undefined') {
  (window as any).__SLIDEGRID_STORE__ = useStore;
}
```

```typescript
// src/hooks/useProject.ts 追加(字体 DOM 注册从 store 移出)
import { loadCustomFontsIntoDOM } from '../utils/fontLoader';

// ... 现有订阅 ...
const customFonts = useStore(s => s.customFonts);

useEffect(() => {
  loadCustomFontsIntoDOM(customFonts);
}, [customFonts]);
```

```diff
// src/pages/EditorPage.tsx 删除 IPC 重复调用
- if (isLoaded && projectId) {
-   nativeFs.setCurrentProject(projectId, projectTitle || fallbackTitle);
- }
```

## 风险与回滚

### 风险

1. **`uncommittedBaseline` 跨模块单例**:`commitUncommittedBaseline` 从 `historySlice` 模块作用域导出,`projectSlice` 与 `styleSlice` 都 import 它。若 vitest 模块隔离(`vi.resetModules`)配置不当,跨文件单例可能在并发测试间串味。但项目当前 `vitest` 默认不 `resetModules`,且 `useStore.test.ts` 单文件内 `beforeEach` 走 `useStore.setState` 重置 store,`uncommittedBaseline` 的清空由 `loadProject`/`createProject`/`redo` 等动作入口兜底(4.1 节已核证)。**严重度:低。**

2. **`setCustomFonts` DOM 注册时序变更**:原实现同步注册字体后 state 写入;新实现 state 写入后 `useEffect` 异步注册。首次设置字体的那一帧,`document.fonts` 尚未含新字体,画布可能闪一帧 fallback 字。E2E `04-all-templates-gallery` 与 `07-style-overrides-and-typography` 不断言字体注册时序,只断言渲染结果与 `layoutVariant` 等状态;`07` 走 `FontFace.load()` 异步路径,本就容忍延迟。**严重度:低,可接受。**

3. **`projectLoader` 的 mock 路径**:`useStore.test.ts#L9-L26` 当前 mock `../utils/db` 与 `../utils/native-fs`。`projectLoader` 内部 import `../utils/storage/projectDb`(2.3 节后)与 `../utils/native-fs`。vitest 的 `vi.mock` 按模块路径全局桩,`projectLoader` 经由这些路径调用时仍命中桩,测试无需改 mock 目标。但 2.3 节若未先落地,`projectLoader` 须先从 `../utils/db` import `getProject`(过渡),待 2.3 节再改路径。**严重度:依赖 2.3 节时序,需协同。**

4. **`ProjectState` 类型组合**:`ProjectState = ProjectSlice & StyleSlice & HistorySlice`。若两 slice 接口出现同名字段(zustand slice 组合的浅合并会后者覆盖前者),类型层面 `&` 交集会报错。已核对三个 slice 接口无字段冲突(`hasUnsavedChanges` 只在 `projectSlice`)。**严重度:极低。**

5. **E2E `__SLIDEGRID_STORE__` 暴露**:保留无条件暴露。生产 bundle 仍带此挂载,理论上有信息泄漏面,但 `__SLIDEGRID_DB__` 已是同类先例,且 store 内无敏感凭据。**严重度:可接受,与现状一致。**

### 回滚

改造涉及文件:

- `src/store/useStore.ts`(重写为组合根)
- `src/store/slices/projectSlice.ts`(新建)
- `src/store/slices/styleSlice.ts`(新建)
- `src/store/slices/historySlice.ts`(新建)
- `src/store/projectLoader.ts`(新建)
- `src/hooks/useProject.ts`(追加字体 DOM `useEffect`)
- `src/pages/EditorPage.tsx`(删除 `L104-L106` 的 IPC 重复调用)

回滚即 `git revert` 对应提交。无数据迁移、无 store schema 变更、无 IPC 契约变更,回滚无副作用。`useStore.test.ts` 与 6 套 E2E 的入口保持不变,回滚后无需同步改测试。

## 验证方式

1. **类型与单测**:
   - `npx tsc --noEmit` 确认 `ProjectState` 类型组合无字段冲突、slice 导出齐全。
   - `npm run test:unit:run -- useStore` 跑通 48 个用例(含 `pushHistory` 大小保护、`undo`/`redo` 边界、`loadProject` Electron IPC 断言 L355、防抖打字 undo 精准恢复 L641-L723)。
   - `npm run test:unit:run` 全量跑通 729 项单测,确认 `useProject.test.ts`、`Dashboard.test.tsx`、`EditorPage.test.tsx` 的 `vi.mock('../../store/useStore')` 仍命中(命名导出未变)。

2. **E2E(6 套全部跑)**:
   - `npm run test:e2e -- 02-editor-workflow` 验证 `__SLIDEGRID_STORE__.getState().addPage` 仍可用。
   - `npm run test:e2e -- 04-all-templates-gallery` 验证 `store?.getState` 兜底路径。
   - `npm run test:e2e -- 06-visual-asset-and-image-geometry` 验证 `updatePage` 经 store 切片后仍同步全局字段。
   - `npm run test:e2e -- 08-project-persistence-and-storage` 验证 `loadProject` 经 `projectLoader` 后 `__SLIDEGRID_DB__.saveProject` 仍能读回完整状态。
   - `npm run test:e2e -- 09-undo-redo-and-keyboard-shortcuts` 验证 `undo`/`redo` 与键盘快捷键。
   - `npm run test:e2e -- 10-direction-switcher-and-json-templates` 验证 `layoutVariant` 经 `updatePage` 写入。

3. **行为人工验证**(遵从项目 verify skill 精神,驱动真实流程而非只看测试):
   - 启动 `pnpm dev`,新建项目,在 `Sidebar` 增删页,确认 `currentPageIndex` 与页码联动。
   - 打开 `Global Settings` → `Assets` → `FontManager`,上传一个 woff2 字体,确认画布内文字在该字体渲染(验证 `setCustomFonts` 的 DOM 注册经 `useEffect` 后仍生效,无肉眼可见延迟)。
   - 修改 `Counter Style` 为 `alpha`,确认所有页页码同步变化(验证 `setCounterStyle` 跨 slice 写 `pages`)。
   - 编辑工程标题、做几次页面编辑、`Ctrl+Z`/`Ctrl+Y`,确认 undo/redo 精准恢复(验证 `historySlice` + `uncommittedBaseline` 跨 slice 协作)。
   - 关闭并重开项目,确认工程从 IndexedDB 完整恢复(验证 `projectLoader` 管道)。

## 涉及文件

- `src/store/useStore.ts` — 重写为组合根,从 614 行降至约 20 行。
- `src/store/slices/projectSlice.ts` — 新建,承接页面与工程元数据(约 200 行)。
- `src/store/slices/styleSlice.ts` — 新建,承接视觉配置(约 120 行)。
- `src/store/slices/historySlice.ts` — 新建,承接历史引擎与 `uncommittedBaseline`(约 180 行)。
- `src/store/projectLoader.ts` — 新建,承接 `loadProject` 的 IO 管道(约 80 行)。
- `src/hooks/useProject.ts` — 追加 `useEffect(() => loadCustomFontsIntoDOM(customFonts), [customFonts])`。
- `src/pages/EditorPage.tsx` — 删除 `L104-L106` 的 `nativeFs.setCurrentProject` 重复调用。

## 协同依赖

- **2.3 节(`db.ts` 拆解)**:`projectLoader` 的 `getProject` import 路径依赖 2.3 节落地后的 `../utils/storage/projectDb`。若 2.3 节未先行,`projectLoader` 暂从 `../utils/db` import,待 2.3 节再改路径——不阻塞本方案编译。
- **4.1 节(`uncommittedBaseline` 修复)**:本方案搬迁 `commitUncommittedBaseline` 与 `uncommittedBaseline` 到 `historySlice`,4.1 节对 `setCurrentPageIndex`/`setPages` 的 baseline 补全在 slice 内部原样应用,两方案无冲突。
- **5.3 节(快照字体剥离)**:在 `historySlice.buildSnapshot` 内进行,本方案为其提供落点,无冲突。
