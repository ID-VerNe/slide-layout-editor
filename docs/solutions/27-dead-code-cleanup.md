# 7.3 死代码与孤立文件清理

## 事实核对

针对 `docs/code-review-report.md` 第 1081-1088 行列出的 4 个文件,逐个在全项目(排除 `.claude/worktrees/**` 临时副本与 `dist/**` 构建产物)做 `Grep` 验证引用情况。

| 文件 | 报告描述 | 实际核对 | 结论 |
|---|---|---|---|
| `src/workers/fontCalculator.ts` | 生产 0 引用 | `src` 内仅被 `src/workers/fontCalculatorManager.ts#L22` 以 `new Worker(new URL('./fontCalculator.ts', ...))` 形式引用,以及自身测试 `src/workers/__tests__/fontCalculator.test.ts` 引用。无任何生产组件直接 import。 | 属实 |
| `src/workers/fontCalculatorManager.ts` | 生产 0 引用 | `src` 内仅被 `src/workers/__tests__/fontCalculatorManager.test.ts` import;`src/workers/fontCalculator.ts` 的 `onmessage` 不反向引用 manager。导出的 `getFontCalculatorWorker` / `calculateFontSizeWithWorker` / `resetFontCalculatorWorker` 在 `src/**/*`(除自身与测试)内 0 次出现。 | 属实 |
| `src/components/editor/ImageEditPreview.tsx` | 0 引用 | 全项目 `Grep "ImageEditPreview"` 仅命中文件自身(`src/components/editor/ImageEditPreview.tsx#L4`、`#L9`)。**无对应测试文件**(目录 `src/components/editor/__tests__/` 下无 `ImageEditPreview.test.tsx`)。 | 属实,且比报告更彻底:连测试都没有 |
| `src/hooks/useImagePreload.ts` | 0 引用 | `src` 内仅被 `src/hooks/__tests__/useImagePreload.test.ts` import。`src/pages/EditorPage.tsx`、`src/App.tsx`、`src/components/**` 均 `Grep` 不到 `useImagePreload`。 | 属实 |

### 补充事实(报告未提及,但影响落地方案)

1. **级联死代码**:`src/hooks/useImagePreload.ts#L3` 是 `src/utils/imagePreloader.ts` 导出的 `imagePreloader` 单例的**唯一生产消费方**。`Grep "imagePreloader"` 在 `src` 内的全部命中为:

   - `src/utils/imagePreloader.ts#L127`(定义点)
   - `src/hooks/useImagePreload.ts`(即将删除)
   - `src/hooks/__tests__/useImagePreload.test.ts`(即将删除)
   - `src/utils/__tests__/imagePreloader.test.ts`(针对 preloader 自身的测试)

   一旦删除 `useImagePreload.ts`,`imagePreloader.ts` 即降级为 0 生产消费方的死代码。报告未列入此文件。按 `~/.claude/CLAUDE.md`「不保留废弃路径」原则,应顺带清理,否则本次清理只是把死代码从一处搬到另一处。

2. **生产 bundle 已不含 fontCalculator**:`dist/assets/` 目录(`pnpm build` 产物)中存在 `knuthPlassWorker-DnWa9yOU.js` 独立 chunk,但**不存在** `fontCalculator-*.js` chunk。原因:`fontCalculatorManager.ts` 自身 0 importers,Vite 静态分析将其整段子图(含 `fontCalculator.ts` worker)从依赖图中剔除,根本不进入 bundle。因此删除这两个文件对**生产构建体积的净影响为 0**——它们早已不在产物里。

3. **测试用例清单(精准计数)**:对应待删测试文件及用例数(`grep -cE '^\s*(it|test)\('` 实测):

   | 测试文件 | 用例数 |
   |---|---|
   | `src/workers/__tests__/fontCalculator.test.ts` | 7 |
   | `src/workers/__tests__/fontCalculatorManager.test.ts` | 3 |
   | `src/hooks/__tests__/useImagePreload.test.ts` | 4 |
   | `src/utils/__tests__/imagePreloader.test.ts`(级联) | 10 |

   合计 24 个用例,占全项目 729 个用例的约 3.3%。

4. **`useKnuthPlassLayout` 链路完整独立**:`src/hooks/useKnuthPlassLayout.ts#L2`、`#L13` 通过 `new Worker(new URL('../workers/knuthPlassWorker.ts', ...))` 调用 `knuthPlassWorker.ts`;`AutoFitHeadline.tsx` 间接消费此 hook(`src/components/ui/slide/atoms/Text.tsx#L3`、`#L75`)。Knuth-Plass 链路是当前在线的字号计算路径,本次清理**不动**它,只动被它替代掉的旧 `fontCalculator` 路径。

5. **`ImageEditPreview.tsx` 不属于 zine 链路**:`src/components/editor/zine/` 与 `src/components/ui/slide/atoms/ZineMedia.tsx`(消费 `useResponsiveImage`)均不引用 `ImageEditPreview`。该组件是早期图片预览面板的遗留,从未接入任何路由或组件树。

## 根因

1. **引擎切换未清理前任**:提交 `d37d2e2 feat: integrate Knuth-Plass algorithm for text layout` 引入 `knuthPlassWorker.ts` + `useKnuthPlassLayout` + `AutoFitHeadline` 链路并全量切换后,旧的 `fontCalculator` 闭式代数 Worker 路径(`fontCalculator.ts` + `fontCalculatorManager.ts`)被整体留在仓库,无人删除。新引擎上线即旧引擎下线,但代码未同步下线。

2. **预加载机制废弃但未拆**:`useImagePreload.ts` 设计为「根据当前页索引预加载相邻 ±2 页图片」,依赖 `imagePreloader.ts` 的并发队列。实际渲染链路(`ZineMedia.tsx` → `useResponsiveImage`)已改用 `srcset`/响应式变体,运行态不再调用 `useImagePreload`。Hook 失去挂载点,`imagePreloader` 单例随之失去唯一消费方。两层代码一起沦为孤儿。

3. **`ImageEditPreview.tsx` 是 UI 探索期残留**:该组件提供 zoom/rotate/download 三按钮图片预览面板,与当前 `PreviewArea`/`Preview` 路径无任何耦合,属早期交互探索的废弃件,既无引用也无测试,纯遗留。

4. **CI 不拦截孤儿**:仓库 `pnpm lint` 配置(`eslint.config.js`)未启用 `ts-prune` 或等价死代码检测,`tsc --noEmit` 也不报 unused 模块(只要导出符号就不算 unused)。因此 0 引用文件能长期绿签通过,靠人工审查才发现。

## 解决方案

遵循 `~/.claude/CLAUDE.md`:不保留向后兼容、最简实现、禁止 emoji、不破坏现有测试(729 → 删 24 = 705,其余不变)。

### 删除清单(9 个文件)

生产源码 4 个:

```
src/workers/fontCalculator.ts
src/workers/fontCalculatorManager.ts
src/components/editor/ImageEditPreview.tsx
src/hooks/useImagePreload.ts
```

级联生产源码 1 个(删 `useImagePreload.ts` 后即变孤儿):

```
src/utils/imagePreloader.ts
```

关联测试 4 个:

```
src/workers/__tests__/fontCalculator.test.ts
src/workers/__tests__/fontCalculatorManager.test.ts
src/hooks/__tests__/useImagePreload.test.ts
src/utils/__tests__/imagePreloader.test.ts
```

合计 9 个文件(4 生产 + 1 级联生产 + 3 关联测试 + 1 级联测试)。下文统一编号为「清单 1-9」。

### 不做连带清理的边界

- **不动** `src/workers/knuthPlassWorker.ts` 及其测试 `src/workers/__tests__/knuthPlassWorker.test.ts`:在线路径,`AutoFitHeadline` 与 `useKnuthPlassLayout` 直接消费。
- **不动** `src/hooks/useResponsiveImage.ts` 与 `src/components/ui/slide/atoms/ZineMedia.tsx`:当前在线的图片响应式链路,与 `useImagePreload` 互不依赖。
- **不动** `src/utils/imageGeometry.ts`、`src/utils/imageUtils.ts`:虽同在图片工具域,但仍有生产消费方,不属本次清理范围。

### 执行顺序

按依赖反向删除,避免中间态破坏 import:

1. 先删测试(清单 6-9):测试文件不依赖生产代码之外的符号,删除不影响其他测试。
2. 再删生产源码(清单 1-5,含级联 5):`fontCalculatorManager.ts`(清单 2)引用 `fontCalculator.ts`(清单 1),`useImagePreload.ts`(清单 4)引用 `imagePreloader.ts`(级联 5)。删除顺序无技术约束(因为都不会被其他在线代码 import),单次 `git rm` 全部 9 个文件即可。

### 文档侧同步(必做)

`Grep "fontCalculator|ImageEditPreview|useImagePreload|imagePreloader"` 在 `docs/`、`README.md`、`AGENTS.md` 命中多个文档仍引用这些模块:

- `README.md#L143`:目录树注释 `# 全局 Worker 单例并发管理器` 指向 `fontCalculatorManager.ts`。
- `docs/architecture/overview.md#L18`、`#L69`:把 `fontCalculatorManager` 描述为「全局 Worker 单例」。
- `docs/reference/utils/common.md#L99`、`#L103`:整节 4.1 介绍 `fontCalculator.ts` 与 `fontCalculatorManager.ts`。
- `docs/reference/ui/atoms/text.md#L121`:「底层调度」链接指向 `fontCalculatorManager.ts`。
- `docs/guides/typography.md#L158`、`#L160`:「闭式字号计算引擎」整节基于 `fontCalculatorManager.ts`。
- `docs/guides/glossary.md#L102`:词表条目指向 `fontCalculatorManager.ts`。
- `docs/reference/hooks.md#L311`:列出 `useImagePreload` 行。
- `docs/guides/contributor.md#L307`:Hooks 列表含 `useImagePreload`。

按 `~/.claude/CLAUDE.md`「移除废弃路径」原则,这些文档引用必须同步删除或改写为 Knuth-Plass 链路的描述,否则文档与代码继续 drift。建议:

- `README.md` 目录树移除 `fontCalculatorManager.ts` 行。
- `docs/architecture/overview.md` 把字号计算描述改为 `knuthPlassWorker.ts`(可链接 `docs/guides/typography.md` 的 Knuth-Plass 段)。
- `docs/reference/utils/common.md` 删除 4.1 节。
- `docs/reference/ui/atoms/text.md` 把「底层调度」链接改为 `knuthPlassWorker.ts` 或 `useKnuthPlassLayout.ts`。
- `docs/guides/typography.md` 把 2 节标题改为 Knuth-Plass 引擎描述(若已有 Knuth-Plass 段则合并)。
- `docs/guides/glossary.md` 删除 `fontCalculatorManager` 条目。
- `docs/reference/hooks.md` 删除 `useImagePreload` 行。
- `docs/guides/contributor.md` 从 Hooks 列表移除 `useImagePreload`。

文档改动属本次清理的必要组成部分,不另起 PR,与代码同 commit 提交。

## Before / After

### 源码层

Before:9 个文件,源码合计约 26.5KB(含测试):

```
src/workers/fontCalculator.ts                1004 B
src/workers/fontCalculatorManager.ts         2627 B
src/components/editor/ImageEditPreview.tsx   2507 B
src/hooks/useImagePreload.ts                 2413 B
src/utils/imagePreloader.ts                  3418 B (级联)
src/workers/__tests__/fontCalculator.test.ts           3035 B
src/workers/__tests__/fontCalculatorManager.test.ts    2155 B
src/hooks/__tests__/useImagePreload.test.ts             3853 B
src/utils/__tests__/imagePreloader.test.ts              5508 B (级联)
```

After:`src/workers/` 仅剩 `knuthPlassWorker.ts` + 其测试;`src/hooks/` 移除 `useImagePreload.ts`;`src/utils/` 移除 `imagePreloader.ts`;`src/components/editor/` 移除 `ImageEditPreview.tsx`。`src/workers/__tests__/`、`src/hooks/__tests__/`、`src/utils/__tests__/` 三个测试目录各少一个文件,目录本身保留(仍有其他测试)。

### 测试层

Before:729 个用例跨 85 个文件。

After:705 个用例跨 81 个文件(85 - 4 个测试文件)。被删 24 个用例均针对已删的孤儿代码,无在线行为覆盖价值。其余 705 个用例不增不减。

### 构建体积

Before:`dist/assets/` 已无 `fontCalculator-*.js`(Vite 静态分析剔除),`useImagePreload.ts` / `imagePreloader.ts` / `ImageEditPreview.tsx` 同样未进入 bundle(0 引用,被 tree-shake)。

After:生产构建产物字节级**零变化**。源码层删除的收益不在 bundle,而在:

- 仓库源码体积下降约 26.5KB(含测试)。
- `pnpm lint` 扫描范围缩减 9 个文件。
- `pnpm test` 跳过 24 个用例(729 → 705)。
- 认知负担:开发者不再误以为 `fontCalculatorManager` 是在线字号路径、不再误以为 `useImagePreload` 是在线预加载路径。文档与代码一致,新人不会被 `docs/guides/typography.md` 误导去读已删的闭式代数引擎。

## 风险与回滚

### 风险

1. **级联删除 `imagePreloader.ts` 的二次连带**:`imagePreloader.ts` 仅被 `useImagePreload.ts` 消费,已确认无其他生产消费方。但其测试 `imagePreloader.test.ts`(10 用例)会一并删除,需确认没有其他测试间接依赖 `imagePreloader` 的副作用(如 `vi.spyOn(imagePreloader, ...)`)。`Grep "imagePreloader"` 在 `src/**/__tests__/` 的命中只有 `useImagePreload.test.ts` 与 `imagePreloader.test.ts` 自身,无第三方测试 spy。**严重度:无。**

2. **文档 drift 修复的连带改写**:文档侧改动 8 处,若只删代码不改文档,`docs/guides/typography.md` 等会指向不存在的文件,生成死链。必须与代码同 commit 改完。**严重度:中,可控,仅是工作量大。**

3. **Knuth-Plass 路径未被误伤**:`useKnuthPlassLayout.ts` 与 `fontCalculatorManager.ts` 在 `src/workers/` 同目录,删除时需按文件名精确指定,避免通配误删。执行命令应为显式 `git rm <path>` 列表,禁止 `git rm src/workers/*.ts`。**严重度:低,操作纪律问题。**

4. **无运行时回归**:被删的 4+1 个生产文件本就不在任何运行时路径上(0 import),删除后启动 dev server、跑 E2E、build 均不受影响。`dist/` 产物字节级不变。**严重度:无。**

### 回滚

改动为纯删除:9 个文件 `git rm`,文档侧改动手动 revert。回滚即:

```
git revert <commit-sha>
```

无数据迁移、无 schema 变更、无依赖增减、无持久化格式变化。IndexedDB 与 localStorage 数据未触及。回滚零副作用。

## 验证方式

1. **类型检查通过**:
   ```
   npx tsc --noEmit -p tsconfig.json
   ```
   确认无新增 TS 报错。被删文件本就 0 引用,删除后 import 图无悬挂引用,`tsc` 应直接通过。

2. **Lint 全过**:
   ```
   pnpm lint
   ```
   确认 error 数仍为 0(当前基线 3 errors 若已被方案 7.1 修复,则维持 0;否则仍为 3,与本次无关)。被删文件不应产生新 lint 报错(删除文件不会引入新告警)。

3. **单元测试全绿**:
   ```
   pnpm test:unit:run
   ```
   确认用例数从 729 降为约 705(差值 24,与被删测试用例数一致),全部通过。重点核对:
   - `src/workers/__tests__/knuthPlassWorker.test.ts`(1 用例)仍通过。
   - `src/hooks/__tests__/useKnuthPlassLayout.test.ts`(1 用例)仍通过。
   - `src/components/__tests__/AutoFitHeadline.test.tsx`(1 用例)仍通过。
   - `src/components/__tests__/ZineMedia.test.tsx`(3 用例,消费 `useResponsiveImage`)仍通过,无对 `imagePreloader` 的隐式依赖。

4. **构建产物字节级零变化**(可选,用于佐证「早已不在 bundle」):
   ```
   pnpm build
   ```
   对比 `dist/assets/` 文件列表与清理前快照,确认无新增、无移除、无字节变化。`knuthPlassWorker-*.js` chunk 仍存在且哈希不变。

5. **E2E 回归**:
   ```
   pnpm test:e2e
   ```
   确认编辑器主流程(打开工程、切换页面、修改文本触发 AutoFitHeadline、保存)不受影响。

6. **文档死链扫描**:
   ```
   Grep "fontCalculator|ImageEditPreview|useImagePreload|imagePreloader" docs/ README.md AGENTS.md
   ```
   确认除历史性叙述(如 CHANGELOG 类内容)外,无残留链接指向已删文件。

## 涉及文件

删除(9 个):
- `src/workers/fontCalculator.ts`
- `src/workers/fontCalculatorManager.ts`
- `src/components/editor/ImageEditPreview.tsx`
- `src/hooks/useImagePreload.ts`
- `src/utils/imagePreloader.ts`(级联)
- `src/workers/__tests__/fontCalculator.test.ts`
- `src/workers/__tests__/fontCalculatorManager.test.ts`
- `src/hooks/__tests__/useImagePreload.test.ts`
- `src/utils/__tests__/imagePreloader.test.ts`(级联)

文档同步(8 处):
- `README.md`
- `docs/architecture/overview.md`
- `docs/reference/utils/common.md`
- `docs/reference/ui/atoms/text.md`
- `docs/guides/typography.md`
- `docs/guides/glossary.md`
- `docs/reference/hooks.md`
- `docs/guides/contributor.md`

不动(在线路径):
- `src/workers/knuthPlassWorker.ts` + `src/workers/__tests__/knuthPlassWorker.test.ts`
- `src/hooks/useKnuthPlassLayout.ts` + `src/hooks/__tests__/useKnuthPlassLayout.test.ts`
- `src/components/AutoFitHeadline.tsx` + `src/components/__tests__/AutoFitHeadline.test.tsx`
- `src/hooks/useResponsiveImage.ts` + `src/hooks/__tests__/useResponsiveImage.test.ts`
- `src/components/ui/slide/atoms/ZineMedia.tsx` + `src/components/__tests__/ZineMedia.test.tsx`
