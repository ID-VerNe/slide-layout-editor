# 2.5 GlobalSettings 修复

## 事实核对

逐项核对 `docs/code-review-report.md` 第 335-357 行的描述，结论如下：

1. **僵尸组件 `ColorToken`** — **属实**。
   - 声明位置：`src/components/editor/GlobalSettings.tsx:29-39`。
   - 全项目检索 `ColorToken` 仅命中该声明本身（见 `Grep ColorToken` 输出），文件内、`EditorPage.tsx`、测试文件、其它组件均无任何引用，也未通过 `export` 暴露。
   - 它接受 `theme`/`onThemeChange` 参数，本意是渲染 `ProjectTheme['colors']` 的颜色拾取器。但 `GlobalSettings` 主体从未把它渲染进任何 Tab，等价于死代码。

2. **`GlobalSettingsProps` 虚假声明四个属性** — **属实，但需要细化**。
   - 接口 `src/components/editor/GlobalSettings.tsx:15-24` 确实声明了 `theme`、`setTheme`、`counterColor`、`setCounterColor`。
   - 函数解构签名 `src/components/editor/GlobalSettings.tsx:43-48` 解构了 12 个字段，确实**遗漏** `theme`/`setTheme`/`counterColor`/`setCounterColor`。TypeScript 之所以不报错，是因为解构后的剩余对象被丢弃，未消费的 props 不算类型错误。
   - `EditorPage.tsx:447-464` 的调用处把这 4 个属性全部传入（`theme={theme}`、`setTheme={setTheme}`、`counterColor={currentPage?.counterColor || ''}`、`setCounterColor={(value) => currentPage && updatePage({ ...currentPage, counterColor: value })}`），运行时只是把值塞进 props 对象然后立刻被丢弃，等价于「假透传」。

3. **「主题颜色与计数器颜色的设置项完全无法生效或根本未被渲染」** — **部分准确，措辞需修正**。
   - `counterColor`：组件实现内零引用，`GlobalSettings` 弹窗内**根本不存在**计数器颜色 UI。`counterColor` 字段目前唯一真实的消费方是 `src/components/page-frame/GlobalFolio.tsx:24`（`page.counterColor || ds.tokens.colors.secondary`）和 `src/constants/fields.ts:10` 的 `GLOBAL_FIELDS`（用于跨页同步）。也就是说，`counterColor` 是一个**真实存在但缺少编辑入口**的字段，不是纯死字段。
   - `theme`/`setTheme`：组件实现内零引用，弹窗内**没有任何主题颜色编辑 UI**。`ColorToken` 本是为这块 UI 准备的组件，但从未被挂载。主题颜色的真实编辑入口目前不在 `GlobalSettings`，而在别处（`setTheme` 的真实调用方见 `src/store/useStore.ts:502` 及其单测，组件层无 `.tsx` 直接调用 `setTheme(` —— Grep `setTheme\(` over `**/*.tsx` 命中 0 处）。

4. **`EditorPage` 透传链路描述** — **属实**。`EditorPage.tsx:34-43` 从 `useProject` 解构，`EditorPage.tsx:447-464` 把 12 个绑定透传给 `<GlobalSettings />`，其中 4 个落入「假透传」。

> 与已存在的 `docs/solutions/13-props-drilling-globalsettings.md` 的关系：13 号方案处理的是「props drilling 整体消除、组件直连 store」的横向重构；本方案聚焦 2.5 节标定的两个具体缺陷——僵尸 `ColorToken` 与 4 个被遗漏解构的 props。两者范围正交，可独立落地，落地顺序上本方案是 13 号方案的前置清理。

## 根因

两个缺陷同源：**`GlobalSettings` 在演进过程中被剥离了「主题颜色编辑」职责，但剥离不彻底**。

- `ColorToken` 是为「在 General Tab 内编辑 `theme.colors.background/accent/primary/secondary`」准备的原子组件。它的 props 签名 `onThemeChange: (t: Partial<ProjectTheme>) => void` 与 `useStore.setTheme` 的入参形态完全吻合，说明设计意图是直连 `setTheme`。
- 主题颜色编辑后来被迁移到独立的编辑链路（`StyleLab` / `style-lab` 相关，仓库内已无残留 `.tsx` 文件 —— Grep 命中 0），`GlobalSettings` 里的颜色编辑 UI 被整体移除，但 `ColorToken` 声明、`theme`/`setTheme` 接口字段、`EditorPage` 的透传被一并遗留。
- `counterColor` 走了相反路径：它的**消费侧**（`GlobalFolio`、`GLOBAL_FIELDS`）被保留并正常工作，但**编辑侧**（`GlobalSettings` 里的颜色拾取 UI）被移除，留下接口字段与透传。
- 解构签名遗漏 4 个字段后不报类型错误，是 TypeScript 的语义盲区：对象解构中未列出的键被静默丢弃，没有「未使用 props」告警。`@typescript-eslint/no-unused-vars` 默认只检查变量，不检查「传入但未解构的 props」。这给了僵尸字段长期存活的温床。

简言之：**职责迁移做了半步，残留了三个痕迹（僵尸组件、僵尸接口字段、僵尸透传），TS 类型系统未能拦截**。

## 解决方案

遵循 `~/.claude/CLAUDE.md`：不保留向后兼容、最简实现、不破坏现有测试。

### 决策：删除，而非补全

报告原文给出「补全或重构 props」的选项。本方案选择**删除**这 4 个字段及 `ColorToken`，理由：

- `theme`/`setTheme`：弹窗内无主题颜色 UI，`setTheme` 在组件层无任何 `.tsx` 调用方。补全解构只会让一个未被渲染的 UI 路径重新「能跑」，但 UI 本身不存在，等于把僵尸字段从「静默丢弃」升级为「显式接收但仍不使用」，不解决任何用户可感知的问题。若后续要在弹窗内重建主题颜色编辑，应作为独立特性重新设计，而非沿用为已废弃 UI 准备的 `ColorToken`。
- `counterColor`/`setCounterColor`：`counterColor` 字段本身有用，但其编辑入口**不应**通过 `EditorPage` 透传一个内联 `(value) => updatePage({ ...currentPage, counterColor: value })` 来实现。`counterColor` 已在 `GLOBAL_FIELDS` 中，`updatePage` 会自动跨页同步（见 `src/store/useStore.ts:400-414` 的 `globalKeys` 逻辑）。若要补编辑入口，正确做法是在 `GlobalSettings` 内直连 `useStore(s => s.pages[s.currentPageIndex]?.counterColor)` 与 `updatePage`，而不是延续 props 透传。本方案不引入新 UI，仅清理死链；`counterColor` 的编辑入口缺失作为已知遗留记录在「风险与回滚」。

### Step 1：删除僵尸 `ColorToken`

`src/components/editor/GlobalSettings.tsx:29-39` 整块删除。

删除后，文件顶部仅保留必要的 import。`ProjectTheme` 若不再被 `ColorToken` 使用，需检查是否仍被接口字段引用——本方案删除接口中的 `theme`/`setTheme` 后，`ProjectTheme` 在该文件内不再有引用，应从 import 中移除（见 Step 2）。

### Step 2：从 `GlobalSettingsProps` 删除四个字段

`src/components/editor/GlobalSettings.tsx`：

```tsx
// Before
import { PageData, CustomFont, CounterStyle, PrintSettings, ProjectTheme } from '../../types';

interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  theme: ProjectTheme;                                       // delete
  setTheme: (t: Partial<ProjectTheme>, applyToAll?: boolean) => void;  // delete
  imageQuality: number;
  setImageQuality: (q: number) => void;
  minimalCounter: boolean;
  setMinimalCounter: (m: boolean) => void;
  counterStyle: CounterStyle;
  setCounterStyle: (s: CounterStyle) => void;
  counterColor: string;                                      // delete
  setCounterColor: (c: string) => void;                      // delete
  printSettings: PrintSettings;
  setPrintSettings: (s: PrintSettings) => void;
}

// After
import { PageData, CustomFont, CounterStyle, PrintSettings } from '../../types';

interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  imageQuality: number;
  setImageQuality: (q: number) => void;
  minimalCounter: boolean;
  setMinimalCounter: (m: boolean) => void;
  counterStyle: CounterStyle;
  setCounterStyle: (s: CounterStyle) => void;
  printSettings: PrintSettings;
  setPrintSettings: (s: PrintSettings) => void;
}
```

函数解构签名 `L43-48` 无需改动——它本来就只解构了保留的 12 个字段。删除接口字段后，TS 会反向校验：若 `EditorPage` 调用处仍传入被删字段，会报 `Object literal may only specify known properties` 错误，这正是 Step 3 要消除的。

### Step 3：移除 `EditorPage` 的 4 行假透传

`src/pages/EditorPage.tsx:447-464`：

```tsx
// Before
<GlobalSettings 
  page={currentPage || pages[0]} 
  onUpdate={updatePage} 
  customFonts={customFonts} 
  setCustomFonts={setCustomFonts} 
  theme={theme}                                          // delete
  setTheme={setTheme}                                    // delete
  imageQuality={imageQuality} 
  setImageQuality={setImageQuality} 
  minimalCounter={minimalCounter || false} 
  setMinimalCounter={setMinimalCounter} 
  counterStyle={counterStyle} 
  setCounterStyle={setCounterStyle} 
  counterColor={currentPage?.counterColor || ''}         // delete
  setCounterColor={(value) => currentPage && updatePage({ ...currentPage, counterColor: value })}  // delete
  printSettings={printSettings} 
  setPrintSettings={setPrintSettings} 
/>

// After
<GlobalSettings 
  page={currentPage || pages[0]} 
  onUpdate={updatePage} 
  customFonts={customFonts} 
  setCustomFonts={setCustomFonts} 
  imageQuality={imageQuality} 
  setImageQuality={setImageQuality} 
  minimalCounter={minimalCounter || false} 
  setMinimalCounter={setMinimalCounter} 
  counterStyle={counterStyle} 
  setCounterStyle={setCounterStyle} 
  printSettings={printSettings} 
  setPrintSettings={setPrintSettings} 
/>
```

删除后，`EditorPage.tsx:35` 从 `useProject` 解构出的 `theme`、`setTheme` 若在本文件其它位置无消费，应一并从解构中移除。核查：`Grep theme` 在 `EditorPage.tsx` 内的命中仅 `L35`（解构）与 `L452-L453`（透传），删除透传后 `theme`/`setTheme` 在 `EditorPage` 内零引用，从 `L35` 的解构中删除这两个绑定。

> 注意：`useProject.ts:145` 仍返回 `theme`、`setTheme`，供 `saveToDB`（`useProject.ts:124` 持久化 theme）与未来主题编辑入口使用，**不动 `useProject` 的返回结构**。本次只清理 `EditorPage` 这一侧的过度解构。

### Step 4：同步测试

`src/components/editor/__tests__/GlobalSettings.test.tsx:46-55` 的 `baseProps`：

```tsx
// Before
const baseProps = {
  page,
  onUpdate: vi.fn(),
  customFonts: [],
  setCustomFonts: vi.fn(),
  theme: { colors: {} as any, typography: { headingFont: '', bodyFont: '' } } as ProjectTheme,  // delete
  setTheme: vi.fn(),                                                                            // delete
  imageQuality: 0.9,
  setImageQuality: vi.fn(),
  minimalCounter: false,
  setMinimalCounter: vi.fn(),
  counterStyle: 'number' as const,
  setCounterStyle: vi.fn(),
  counterColor: '#000',        // delete
  setCounterColor: vi.fn(),    // delete
  printSettings,
  setPrintSettings: vi.fn(),
};

// After
const baseProps = {
  page,
  onUpdate: vi.fn(),
  customFonts: [],
  setCustomFonts: vi.fn(),
  imageQuality: 0.9,
  setImageQuality: vi.fn(),
  minimalCounter: false,
  setMinimalCounter: vi.fn(),
  counterStyle: 'number' as const,
  setCounterStyle: vi.fn(),
  printSettings,
  setPrintSettings: vi.fn(),
};
```

测试文件 `L4` 的 `import { PageData, PrintSettings, ProjectTheme } from '../../../types'` 中，`ProjectTheme` 在删除 `theme` 字段后不再被使用，从 import 中移除，避免 ESLint `no-unused-vars` 告警。

`src/pages/__tests__/EditorPage.test.tsx:128` 的 `setTheme: vi.fn()` 与 `src/components/editor/__tests__/GlobalSettings.test.tsx` 同理处理——若 `EditorPage` 测试的 mock props 中 `setTheme` 不再被 `EditorPage` 透传，可删除；但 `EditorPage.test.tsx` mock 的是 `useProject` 返回，`useProject` 仍返回 `setTheme`，故 `EditorPage.test.tsx:128` 的 `setTheme: vi.fn()` **保留**。

现有 9 个 `GlobalSettings` 测试用例（`L60-126`）的 DOM 断言全部基于保留的字段（`imageQuality`、`counterStyle`、`minimalCounter`、`backgroundPattern`、`printSettings`、`customFonts`），不涉及 `theme`/`counterColor`，删除字段后用例行为不变，无需改断言。

## Before / After

### Before

```tsx
// src/components/editor/GlobalSettings.tsx
// L2: import { ..., ProjectTheme } from '../../types';   // ProjectTheme 仅为 ColorToken 与 theme/setTheme 接口而存在
// L15-24: interface 声明 16 个字段，含 theme/setTheme/counterColor/setCounterColor
// L29-39: const ColorToken = (...) => (...)   // 全项目零引用的僵尸组件
// L43-48: 解构 12 个字段，遗漏 theme/setTheme/counterColor/setCounterColor

// src/pages/EditorPage.tsx L447-464
// 传入 16 个 props，其中 4 个被组件静默丢弃
```

### After

```tsx
// src/components/editor/GlobalSettings.tsx
// L2: import { PageData, CustomFont, CounterStyle, PrintSettings } from '../../types';   // 移除 ProjectTheme
// interface GlobalSettingsProps 声明 12 个字段，全部在函数体内被解构消费
// ColorToken 块删除
// 函数解构签名不变（本来就是正确的 12 个）

// src/pages/EditorPage.tsx
<GlobalSettings 
  page={currentPage || pages[0]} 
  onUpdate={updatePage} 
  customFonts={customFonts} 
  setCustomFonts={setCustomFonts} 
  imageQuality={imageQuality} 
  setImageQuality={setImageQuality} 
  minimalCounter={minimalCounter || false} 
  setMinimalCounter={setMinimalCounter} 
  counterStyle={counterStyle} 
  setCounterStyle={setCounterStyle} 
  printSettings={printSettings} 
  setPrintSettings={setPrintSettings} 
/>
// EditorPage 解构中移除 theme、setTheme（仅服务于本次透传）
```

接口字段数 16 → 12，透传 props 数 16 → 12，僵尸组件 1 → 0，`ProjectTheme` 在该文件的 import 1 → 0。

## 风险与回滚

### 风险

1. **`counterColor` 编辑入口缺失未被本方案解决** — **已知遗留，严重度：低**。
   - 现状：`counterColor` 在 `GlobalFolio.tsx:24` 被消费，在 `GLOBAL_FIELDS` 中跨页同步，但 `GlobalSettings` 弹窗内无编辑 UI。本方案删除了死透传，没有新增编辑入口。
   - 影响：用户当前就无法通过 `GlobalSettings` 修改 `counterColor`，本方案不改变这一现状。若需补编辑入口，应作为独立特性：在 `GlobalSettings` 的 General Tab 内新增颜色拾取器，直连 `useStore(s => s.pages[s.currentPageIndex]?.counterColor)` 读取、`useStore(s => s.updatePage)` 写入，依赖 `GLOBAL_FIELDS` 自动跨页同步。不属本方案范围。

2. **`theme`/`setTheme` 在 `EditorPage` 解构中被移除** — **严重度：极低**。
   - 已核查 `EditorPage.tsx` 内 `theme` 仅出现在 `L35`（解构）与 `L452-L453`（透传），无其它消费。移除后 `EditorPage` 不再订阅 `useProject` 返回的 `theme`，减少一处无关重渲染源。
   - `useProject` 仍返回 `theme`/`setTheme`，供 `saveToDB` 持久化，不受影响。

3. **测试同步** — **严重度：低，可控**。
   - `GlobalSettings.test.tsx` 的 `baseProps` 删除 4 个字段后，9 个用例的 DOM 断言不变。`ProjectTheme` import 移除后需确认测试文件无其它引用——核查 `L4` 仅 `baseProps.theme` 使用 `ProjectTheme`，删除 `theme` 后 import 可安全移除。
   - `EditorPage.test.tsx:128` 的 `setTheme: vi.fn()` 保留（`useProject` 仍返回 `setTheme`）。

4. **未引入 `ColorToken` 的替代品** — **严重度：无**。
   - `ColorToken` 从未被渲染，删除它不改变任何渲染产物。零行为影响。

### 回滚

改动集中在 2 个源文件 + 1 个测试文件：

- `src/components/editor/GlobalSettings.tsx` — 删除 `ColorToken`（L29-39）、接口 4 字段（L15-24）、`ProjectTheme` import（L2）。
- `src/pages/EditorPage.tsx` — 删除 4 行透传（L452-453, L460-461）、解构中移除 `theme`/`setTheme`（L35）。
- `src/components/editor/__tests__/GlobalSettings.test.tsx` — 删除 `baseProps` 4 字段、`ProjectTheme` import。

无 store schema 变更，无数据迁移，无持久化格式变化。回滚即 `git revert` 对应提交，无副作用。

## 验证方式

1. **类型校验**：
   - `npx tsc --noEmit` — 确认删除接口字段后，`EditorPage` 调用处不再传入 `theme`/`setTheme`/`counterColor`/`setCounterColor`，无 `Object literal may only specify known properties` 报错。
   - 确认 `ProjectTheme` import 移除后，`GlobalSettings.tsx` 与其测试文件无 `no-unused-vars` 告警。

2. **单测**：
   - `npm test -- GlobalSettings` — 9 个用例全过，断言未改。
   - `npm test -- EditorPage` — 确认 `EditorPage` 测试不受解构收缩影响。
   - `npm test -- useStore` — store 测试不受影响（本方案不动 store）。

3. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程）：
   - 启动 dev server，打开任意项目，点 `Sidebar` 的 `Global Settings` 按钮打开弹窗。
   - General Tab：滑动 WebP Quality、切换 Counter Style、切换 Minimal UI、切换 Texture Patterns，确认行为与改造前一致（这些字段本就被正确解构，不受本方案影响）。
   - Assets Tab：点 `FontManager` 的 Add，确认字体列表更新。
   - Print Tab：开启 Engine、修改尺寸与装订方向、切换 Visual Helpers，确认打印设置写入正常。
   - 关键回归：弹窗内不应出现任何主题颜色拾取 UI（本就不存在，确认删除 `ColorToken` 后仍未出现）；弹窗内不应出现计数器颜色拾取 UI（本就不存在，确认未因删除 `counterColor` 透传而出现异常报错或空白区块）。
   - 全局搜索 `ColorToken` 确认仓库内无残留引用。

## 涉及文件

- `src/components/editor/GlobalSettings.tsx` — 删除 `ColorToken` 僵尸组件、`GlobalSettingsProps` 中 4 个未被解构的字段、`ProjectTheme` import。
- `src/pages/EditorPage.tsx` — 删除 4 行假透传、从 `useProject` 解构中移除 `theme`/`setTheme`。
- `src/components/editor/__tests__/GlobalSettings.test.tsx` — 同步 `baseProps`，移除 `ProjectTheme` import。
