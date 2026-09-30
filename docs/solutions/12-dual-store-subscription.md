# 4.2 双轨 Store 订阅统一

## 事实核对

报告对问题的定位准确，以下逐一核对，并补两处需要校正的细节。

1. **顶层设计意图注释属实**。`src/components/JsonTemplateRenderer.tsx#L19-L21` 写有：
   > "在此处订阅 useStore，以 props 向下传参，避免 LayoutRenderer 递归渲染时每个节点都触发 store 订阅产生级联重渲染。"
   `L28` 订阅 `state.theme`、`L30` 订阅 `state.designSystem`，随后以 props 传入 `LayoutRenderer`。注释与实现一致。

2. **顶层 props 链路完整**。`src/templates/schemas/LayoutRenderer.tsx` 接收 `theme`/`designSystem`/`typography` 作为 props，向下透传给 `LayoutRendererInternal`（命名为 `ds`），再透传给 `renderContainer`/`renderComponent`/`renderRepeater` 与递归 `LayoutRenderer` 调用。`src/templates/schemas/renderer/componentRenderer.tsx#L70-L77` 在每个 `Component` 节点的 `baseProps` 中注入：
   ```typescript
   theme: context.theme,
   designSystem: ds,
   typography,
   ```
   也就是说，**每个叶子原子组件本应已经拿到 `theme`/`designSystem` 作为 props**。

3. **`useModularStyle` 直连 store 属实，且是核心破坏点**。`src/components/ui/slide/hooks/useModularStyle.ts#L36-L37`：
   ```typescript
   const ds = useStore(s => s.designSystem);
   const theme = useStore(s => s.theme);
   ```
   更关键的是：`UseModularStyleProps` 接口（`L5-L14`）**根本没有 `designSystem`/`theme` 入参**。顶层下传的 props 在这里被完全旁路，hook 自行从 store 取数。这是双轨制的真正源头。

4. **`ZineBody` 额外订阅属实**。`src/components/ui/slide/atoms/ZineBody.tsx#L39-L40`：
   ```typescript
   const storeDs = useStore(s => s.designSystem);
   const ds = propsDs || storeDs;
   ```
   同类"额外再订一次"的原子还有：`ZineDisplay.tsx#L41`、`ZineCaption.tsx#L39`、`ZineDivider.tsx#L36`、`ZineVocabList.tsx#L41-L42`、`ZineMetric.tsx#L42`、`ZineResume.tsx#L28`。每个原子在自身又订阅一次，再调用 `useModularStyle` 时 hook 内部再订两次（`ds` + `theme`）。单个叶子节点的 store 订阅数最高可达 3 次。

5. **"数十个"需校正**。实际使用 `useModularStyle` 的原子为 11 个：`ZineBody`、`ZineDisplay`、`ZineCaption`、`ZineDivider`、`ZineMedia`、`ZineVocabList`、`ZineMetric`、`ZineResume`、`ZineIcon`、`ZineLogo`、`ZineArtFont`。另加 `BigDataMetrics`（不使用 `useModularStyle`、不订 store，仅声明 `designSystem?`/`theme?` props 但未消费，与本问题无关）。规模是"十余个"，不是"数十个"。

6. **双轨导致的重复调和属实**。当 `theme` 或 `designSystem` 变动时：顶层 `JsonTemplateRenderer` 重渲染 → props 链路自顶向下传播；同时 Zustand 广播给 `useModularStyle` 及 7 个原子的直订 selector → 每个叶子从底部独立触发一次重渲染。React 18 的自动批处理能合并同帧的多次状态更新，但无法消除"同一节点因两个独立信号源各触发一次 reconciliation"这一结构性重复——这正是注释里想避免、却被实现破坏的级联。

## 根因

**职责边界在最后一跳断裂**。整条渲染链路 `JsonTemplateRenderer → LayoutRenderer → renderComponent → 原子组件` 都遵循"props 单轨下传"的架构意图，唯独到了 `useModularStyle` 与原子组件这一层，改为"自己再去 store 订一次"。断裂的表面原因是 `useModularStyle` 的接口没有设计 `designSystem`/`theme` 入参，导致 hook 只能自行订阅；深层原因是原子组件在引入 Zustand 时图方便直接 `useStore`，没有遵守顶层已建立的 props 通道契约。

次要因素：

- `useModularStyle` 的 `UseModularStyleProps` 接口未把 `ds`/`theme` 列为必填入参，调用方无从感知"应该把 props 传进来"。
- 7 个原子组件保留 `propsDs || storeDs` 这种"props 优先、store 兜底"的写法，本质是兼容层。它让 store 订阅看起来"必要"，实际上 `componentRenderer` 已经保证 props 永远不为 `undefined`——兜底分支是死代码。

## 解决方案

统一为 **props 单轨**：保留并完成既有的 props 通道，移除 `useModularStyle` 与所有原子组件对 store 的直连订阅。

### 为什么选 props 而非 Context

报告建议"Context/props 单一通道"，二者皆可。本方案选 props，理由：

- props 通道**已经端到端存在**（`JsonTemplateRenderer` 订阅 → `LayoutRenderer` 透传 → `componentRenderer` 注入 `baseProps`）。断裂只在最后一跳，补齐即可，无需新建通道。
- 引入 Context 需要：新建 Provider、在 `JsonTemplateRenderer` 包裹、移除 `LayoutRenderer`/`componentRenderer` 的 `ds`/`theme` props 透传（否则就是 props 与 Context 双轨并存，反而违反"单一通道"）。这是一次跨 `LayoutRenderer` 递归结构的手术，影响面远大于补齐 props 最后一跳。
- 遵从 `~/.claude/CLAUDE.md`："Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection." Context 在这里属于新增抽象层，props 不属于。

### 设计原则（遵从 `~/.claude/CLAUDE.md` 与 `AGENTS.md`）

- **不保留向后兼容**：删除 `useModularStyle` 内的 `useStore`、删除 7 个原子组件的 `storeDs`/`storeTheme` 兜底分支、删除 `propsDs || storeDs` 写法。不留 fallback。
- **最简实现**：`useModularStyle` 接口新增 `designSystem`/`theme` 两个必填入参，hook 内直接使用入参，不再订阅 store。
- **不破坏现有测试**：行为断言全部保留；仅变更输入方式——原子单测从"渲染时 mock store 自动注入"改为"渲染时显式传 `designSystem`/`theme` props"，`useModularStyle` 单测从"mock store"改为"传参"。集成测试（`JsonTemplateRenderer.integration.test.tsx`）走完整 renderer 链路，由 `componentRenderer` 自动注入 props，不受影响。

### 实施步骤

**Step 1：`useModularStyle` 接口补入参，移除 store 订阅**

`src/components/ui/slide/hooks/useModularStyle.ts`：

```typescript
// Before
import { useStore } from '../../../../store/useStore';

interface UseModularStyleProps {
  fieldKey?: string;
  overrides?: Record<string, any>;
  props?: Record<string, any>;
  variant?: 'display' | 'body' | 'caption' | 'h1' | 'h2';
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  customStyle?: React.CSSProperties;
  className?: string;
  page?: PageData;
}

export const useModularStyle = ({ ... }: UseModularStyleProps) => {
  const ds = useStore(s => s.designSystem);
  const theme = useStore(s => s.theme);
  ...
};
```

```typescript
// After：移除 useStore import，新增两个必填入参
import { DesignSystem, ProjectTheme, PageData } from '../../../../types';

interface UseModularStyleProps {
  designSystem: DesignSystem;   // 必填，由调用方从 props 透传
  theme: ProjectTheme;          // 必填，由调用方从 props 透传
  fieldKey?: string;
  overrides?: Record<string, any>;
  props?: Record<string, any>;
  variant?: 'display' | 'body' | 'caption' | 'h1' | 'h2';
  orientation?: 'horizontal' | 'vertical-stack' | 'vertical-rotate';
  customStyle?: React.CSSProperties;
  className?: string;
  page?: PageData;
}

export const useModularStyle = ({
  designSystem: ds,
  theme,
  ...
}: UseModularStyleProps) => {
  // 直接使用入参 ds / theme，不再 useStore
  ...
};
```

`resolvedStyle` 的 `useMemo` 依赖数组（`L219`）保持 `[ds, theme, variant, overrides, props, customStyle]` 不变——`ds`/`theme` 现在指向入参，引用稳定性由上层 `JsonTemplateRenderer` 的 store 订阅保证（store 未变则 `ds`/`theme` 引用不变，`useMemo` 自然命中缓存）。

**Step 2：7 个直订 store 的原子改为纯 props**

以 `ZineBody` 为例（`src/components/ui/slide/atoms/ZineBody.tsx`）：

```typescript
// Before
import { useStore } from '../../../../store/useStore';
...
  const storeDs = useStore(s => s.designSystem);
  const ds = propsDs || storeDs;

  const { style, className: resolvedClassName } = useModularStyle({
    page,
    fieldKey,
    props: { color: (ds.tokens.colors as any)?.[color as string] || color, ...otherProps },
    variant: 'body',
    customStyle,
    className
  });
```

```typescript
// After：移除 useStore import 与 storeDs，ds 直接取 propsDs，透传给 hook
...
  const ds = propsDs;

  const { style, className: resolvedClassName } = useModularStyle({
    designSystem: ds,
    theme: propsTheme,
    page,
    fieldKey,
    props: { color: (ds.tokens.colors as any)?.[color as string] || color, ...otherProps },
    variant: 'body',
    customStyle,
    className
  });
```

对其余 6 个原子执行同构改造：

| 文件 | 移除的 store 订阅 | 透传入参 |
|------|------------------|----------|
| `ZineDisplay.tsx#L41` | `storeDs` | `designSystem: propsDs`, `theme: propsTheme` |
| `ZineCaption.tsx#L39` | `storeDs` | `designSystem: propsDs`, `theme: propsTheme` |
| `ZineDivider.tsx#L36` | `storeDs` | `designSystem: propsDs`, `theme: propsTheme` |
| `ZineVocabList.tsx#L41-L42` | `storeDs`, `storeTheme` | `designSystem: propsDs`, `theme: propsTheme` |
| `ZineMetric.tsx#L42` | `storeTheme` | `designSystem: propsDs`, `theme: propsTheme` |
| `ZineResume.tsx#L28` | `storeTheme` | `designSystem: propsDs`, `theme: propsTheme` |

注意 `ZineMetric`/`ZineResume` 当前只订 `theme` 不订 `ds`，但仍需把 `propsDs` 透传给 `useModularStyle`——因为 hook 现在要求 `designSystem` 必填，而 `componentRenderer` 已经在 `baseProps` 里给了。

**Step 3：4 个未透传的原子补齐 forward**

这 4 个原子已经声明 `designSystem?`/`theme?` props（或让其落入 `...otherProps`），但没有透传给 `useModularStyle`：

| 文件 | 现状 | 改造 |
|------|------|------|
| `ZineIcon.tsx#L39-L40` | 解构 `propsDs`/`propsTheme` 但未用 | `useModularStyle` 调用处加 `designSystem: propsDs, theme: propsTheme` |
| `ZineMedia.tsx#L43-L44` | 解构 `propsDs`/`propsTheme` 但未用 | 同上 |
| `ZineLogo.tsx#L19` | 函数签名未解构 `designSystem`/`theme` | 签名补 `designSystem: propsDs, theme: propsTheme`，透传给 hook |
| `ZineArtFont.tsx#L33-L51` | `designSystem`/`theme` 落入 `...otherProps` | 显式解构 `designSystem: propsDs, theme: propsTheme`，从 `otherProps` 中排除，透传给 hook |

**Step 4：`JsonTemplateRenderer` 保持不变**

顶层 `useStore` 订阅（`L28`/`L30`）是单轨的合法源头，保留。`L19-L21` 的设计意图注释至此与实现完全一致——无需修改注释。

**Step 5：测试同步**

`src/components/ui/slide/hooks/__tests__/useModularStyle.test.ts`：

```typescript
// Before
vi.mock('../../../../../store/useStore', () => ({
  useStore: vi.fn((selector: any) => {
    const mockState = { designSystem: DEFAULT_DESIGN_SYSTEM, theme: DEFAULT_THEME };
    return selector(mockState);
  }),
}));
...
const { result } = renderHook(() => useModularStyle({ variant: 'display' }));
```

```typescript
// After：删除 vi.mock，显式传参
const { result } = renderHook(() =>
  useModularStyle({
    designSystem: DEFAULT_DESIGN_SYSTEM,
    theme: DEFAULT_THEME,
    variant: 'display'
  })
);
```

约 20 个用例均按此模式补充 `designSystem`/`theme` 入参；DOM/样式断言不变。

`ZineBody.test.tsx`、`ZineDisplay.test.tsx`、`ZineCaption.test.tsx`、`ZineDivider.test.tsx`、`ZineMedia.test.tsx`：每个 `render(<ZineXxx ... />)` 调用补充 `designSystem={DEFAULT_DESIGN_SYSTEM} theme={DEFAULT_THEME}` props，并删除已失效的 `vi.mock('../../store/useStore')`。断言不变。

`JsonTemplateRenderer.integration.test.tsx`：走完整 renderer 链路，`componentRenderer` 自动注入 props，现有 `useStore` mock 保留（顶层 `JsonTemplateRenderer` 仍订阅 store），无需改动。

`LayoutRenderer.test.tsx`：`LayoutRenderer` 本身不订 store（接收 props），且测试 mock 了 `componentRegistry`，不受影响。

## Before / After

### Before：单叶子节点的订阅面（以 `ZineBody` 为例）

```
JsonTemplateRenderer
  └─ useStore(theme) + useStore(designSystem)        顶层 2 次订阅
  └─ LayoutRenderer(props: theme, designSystem)
       └─ componentRenderer 注入 baseProps
            └─ ZineBody
                 ├─ useStore(designSystem)             叶子 1 次直订
                 └─ useModularStyle
                      ├─ useStore(designSystem)        hook 1 次直订
                      └─ useStore(theme)               hook 1 次直订
```
单个叶子节点 3 次 store 订阅，且与顶层 props 链路并行，形成双轨。

### After：单叶子节点的订阅面

```
JsonTemplateRenderer
  └─ useStore(theme) + useStore(designSystem)        顶层 2 次订阅（唯一源头）
  └─ LayoutRenderer(props: theme, designSystem)
       └─ componentRenderer 注入 baseProps
            └─ ZineBody(props: designSystem, theme)
                 └─ useModularStyle(designSystem, theme)   纯函数消费，零订阅
```
全树 store 订阅收敛为顶层 2 次。`theme`/`designSystem` 变动时，仅 `JsonTemplateRenderer` 收到广播，props 链路自顶向下一次性传播；叶子节点不再独立订阅，不再有第二次 reconciliation。

### 代码量变化

- `useModularStyle.ts`：`-2` 行 `useStore`，`+2` 行入参解构，接口 `+2` 字段。
- 7 个直订原子：各 `-1~2` 行 `useStore`/兜底，`+2` 行透传入参。
- 4 个未透传原子：各 `+2` 行透传入参（`ZineLogo`/`ZineArtFont` 额外 `+1` 行解构）。
- 测试：`useModularStyle.test.ts` 删 mock、`~20` 用例各 `+2` 入参；5 个原子单测各 `+2` props、删 mock。

净增行数有限，核心是消除了 11 个原子 × 平均 2~3 次的冗余 store 订阅。

## 风险与回滚

### 风险

1. **原子单测批量改动**：5 个原子单测与 `useModularStyle` 单测需同步补 props/入参。`useModularStyle` 入参设为必填后，遗漏传参会在 TypeScript 编译期报错，可被 `tsc --noEmit` 兜住。**严重度：低，机械可控。**

2. **`ZineLogo`/`ZineArtFont` 的 props 解构变更**：这两个原子当前让 `designSystem`/`theme` 落入 `...otherProps`，改造后需从 `otherProps` 中显式剥离。若遗漏，`designSystem`/`theme` 会同时出现在 `useModularStyle` 的入参与 `props` 字段里——不致命（hook 只消费入参），但会污染 `props` 透传给样式解析。需在 code review 时核对 `otherProps` 不再包含这两个键。**严重度：低。**

3. **`React.memo` 的引用稳定性**：`ZineMedia` 是 `React.memo` 包裹的。改造后它通过 props 接收 `designSystem`/`theme`，当 store 变动时 `JsonTemplateRenderer` 重渲染会下发新引用，`React.memo` 浅比较失效触发重渲染——这与改造前由 `useStore` 触发重渲染的语义等价，不构成性能回退，反而是单次而非双次。**严重度：无。**

4. **非 registry 路径直接渲染原子**：已用 `Grep` 核对，`Zine*` 原子仅被 `componentRegistry.ts` 与测试引用，不存在应用代码绕过 registry 直接 `<ZineBody />` 渲染并依赖 store 兜底的路径。**严重度：无。**

5. **`BigDataMetrics` 例外**：它不使用 `useModularStyle`、不订 store，`designSystem?`/`theme?` 是死 props。本次不动它；若后续清理可单独移除其接口字段，不属本方案范围。**严重度：无。**

### 回滚

改造集中在以下文件：

- `src/components/ui/slide/hooks/useModularStyle.ts`
- `src/components/ui/slide/atoms/` 下 11 个 `Zine*.tsx`
- `src/components/ui/slide/hooks/__tests__/useModularStyle.test.ts`
- `src/components/__tests__/ZineBody.test.tsx`、`ZineDisplay.test.tsx`、`ZineCaption.test.tsx`、`ZineDivider.test.tsx`、`ZineMedia.test.tsx`

无 store schema 变更、无数据迁移。回滚即 `git revert` 对应提交，无副作用。

## 验证方式

1. **类型与单测**：
   - `npx tsc --noEmit`：确认 `useModularStyle` 入参必填后，所有调用点均传 `designSystem`/`theme`；确认 11 个原子已移除 `useStore` import（`noUnusedLocals` 会报未用 import）。
   - `npm test -- useModularStyle`：跑通改造后的约 20 个用例。
   - `npm test -- ZineBody ZineDisplay ZineCaption ZineDivider ZineMedia`：跑通 5 个原子单测。
   - `npm test -- JsonTemplateRenderer LayoutRenderer`：确认集成测试与 renderer 测试不受影响。

2. **store 订阅数静态核对**（本方案的核心验证）：
   ```
   grep -rn "useStore" src/components/ui/slide/atoms src/components/ui/slide/hooks/useModularStyle.ts
   ```
   预期：`src/components/ui/slide/` 目录下 `useStore` 调用数为 **0**。若仍有命中，说明有原子遗漏改造。

3. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程）：
   - 启动 dev server，打开任意项目，切到含 `ZineBody`/`ZineDisplay`/`ZineVocabList` 的模板（如 `zine-classic`、`bilingual-glossary`）。
   - 进入 `Style Lab` 或 `Global Settings`，修改 `theme.colors.primary`、`theme.typography.headingFont`、`designSystem.tokens.typography.body.fontSize`，确认主视口所有叶子组件的字体、颜色、字号同步更新——验证 props 单轨能正确传播。
   - 用 React DevTools Profiler 录制一次 `theme` 变更：预期 `JsonTemplateRenderer` 重渲染一次，其下 `LayoutRenderer` 与各 `Zine*` 原子各重渲染一次；不应出现同一原子在单次 `theme` 变更中被触发两次的记录（双轨特征）。
   - 回归：切模板、翻页、undo/redo，确认无渲染崩溃或样式丢失。

4. **渲染性能回归**（可选）：
   - 改造前用 Profiler 录制 `designSystem` 变更，记录各 `Zine*` 原子的 commit 次数。
   - 改造后同样操作，预期每个原子 commit 次数减半（从 props + store 双触发收敛为 props 单触发）。

## 涉及文件

- `src/components/ui/slide/hooks/useModularStyle.ts` — 接口补 `designSystem`/`theme` 必填入参，移除 `useStore`。
- `src/components/ui/slide/atoms/ZineBody.tsx` — 移除 `storeDs` 直订，透传入参。
- `src/components/ui/slide/atoms/ZineDisplay.tsx` — 同上。
- `src/components/ui/slide/atoms/ZineCaption.tsx` — 同上。
- `src/components/ui/slide/atoms/ZineDivider.tsx` — 同上。
- `src/components/ui/slide/atoms/ZineVocabList.tsx` — 移除 `storeDs`/`storeTheme`，透传入参。
- `src/components/ui/slide/atoms/ZineMetric.tsx` — 移除 `storeTheme`，透传入参。
- `src/components/ui/slide/atoms/ZineResume.tsx` — 同上。
- `src/components/ui/slide/atoms/ZineIcon.tsx` — 透传已解构的 `propsDs`/`propsTheme`。
- `src/components/ui/slide/atoms/ZineMedia.tsx` — 同上。
- `src/components/ui/slide/atoms/ZineLogo.tsx` — 签名补解构，透传入参。
- `src/components/ui/slide/atoms/ZineArtFont.tsx` — 显式解构并透传，从 `otherProps` 中剥离。
- `src/components/ui/slide/hooks/__tests__/useModularStyle.test.ts` — 删 `vi.mock`，传参。
- `src/components/__tests__/ZineBody.test.tsx` 等原子单测 — 补 `designSystem`/`theme` props，删 `vi.mock`。
