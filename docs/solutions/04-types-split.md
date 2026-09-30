# 2.4 types.ts 拆分

## 事实核对

针对 `docs/code-review-report.md` 第 312-334 行的描述逐条核对:

| 报告描述 | 实际核对 | 结论 |
|---|---|---|
| `src/types.ts#L1-L371` (371 行, 9,194 字节) | `wc -l` 输出 370 行;`wc -c` 输出 9,194 字节 | 字节数一致;行数差 1 行(末行是否带换行符的计数差异),可忽略 |
| 汇聚了整套系统 371 行的全部类型 | 文件内 `export interface/type` 共 35 处,无 import 语句,所有领域类型集中于此 | 属实 |
| `src/types/` 目录存在且完全为空(幽灵目录) | `ls -la src/types/` 仅返回 `.` 与 `..`;Glob `src/types/**/*` 无任何匹配 | 属实,确认是 0 文件的空目录 |
| `PageData` 是 50 字段的 Mega-Interface | 逐字段清点(L199-L280),实为 53 个顶级字段,平铺了 `vocabItems`/`agenda`/`features`/`metrics`/`mosaic`/`bentoItems`/`resumeSections` 等模板专用结构 | 字段数略有出入(53 vs 50),核心问题成立 |
| 提议目录 `core/tokens/print/page/project` | 与现有 35 个类型的依赖图一致,可无环拆分 | 方案可行 |

补充事实(报告未提及,但影响落地方案):

1. 全项目有 **156 个文件** 通过 `from '../types'` / `from '../../types'` / `from '../../../types'` 引用本文件(基于 Grep 计数,含测试)。
2. `tsconfig.json` 采用 `moduleResolution: "bundler"`,在该模式下,若 `src/types.ts` 被删除、仅保留 `src/types/index.ts`,路径 `../types` 会解析到 `src/types/index.ts`,**所有 156 个引用方无需改动**。
3. `src/types.ts` 当前**无任何 import 语句**;`DesignSystem.presets.effects` 直接使用 `React.CSSProperties`,依赖 `@types/react` 的全局 React 命名空间。
4. 同项目内 `src/templates/schemas/` 下另有一组 `types.ts`(导出 `TemplateSchema`/`TemplateNode` 等),与 `src/types.ts` 是不同模块,**不在本节拆分范围**。

## 根因

1. **空目录异味**: `src/types/` 已存在却为空,说明拆分意图曾被打断或未落地,留下"半完成"信号。
2. **职责未分离**: `src/types.ts` 同时承担原子类型(`TemplateId`)、设计令牌(`DesignSystem`)、打印设置(`PrintSettings`)、页面模型(`PageData` 及 9 个 Specific Page Data)、工程结构(`ProjectData`)。五类职责无依赖却平铺在同一文件,任意字段调整都会触动一个 9KB 文件。
3. **Mega-Interface**: `PageData` 把所有模板专用字段平铺为可选属性,字段数达 53 个,导致:
   - Type Guard(`src/utils/typeGuards.ts`)只能通过 `extends PageData` 的接口收窄,无法在类型层面强制"某模板必须带某字段"。
   - 任意模板新增字段都直接膨胀 `PageData`,文件难收敛。
4. **空文件 + 巨文件并存**: 一边是空的 `types/` 目录,一边是 370 行的 `types.ts`,形成"该拆的没拆、该填的没填"的对照。

## 解决方案

### 决策原则

- 不保留向后兼容层:直接删除 `src/types.ts`,不留 shim、不留 re-export 别名。
- 最简实现:仅按依赖图做 5 文件拆分 + 1 个聚合 `index.ts`,不引入 barrel 工具、不引入代码生成。
- 不投机抽象:不为"未来可能拆分的模板专用字段"预设子目录;`PageData` 的拆解属于领域建模范畴,不在本节(类型物理拆分)内强行推进。
- 不破坏 156 个引用方:`from '../types'` 在 bundler 模式下天然解析到 `src/types/index.ts`,无需改动调用点。

### 目录结构

```
src/types/
  index.ts      # 聚合重导出
  core.ts       # 无依赖原子类型
  tokens.ts     # 设计令牌
  print.ts      # 打印设置
  page.ts       # 页面数据模型 + 模板专用 PageData 扩展
  project.ts    # 工程级别数据
```

### 类型归属与依赖图

```
core.ts      (无依赖)
tokens.ts    (无依赖;使用全局 React.CSSProperties)
print.ts     (无依赖)
page.ts      --> core.ts (TemplateId, AspectRatioType, CounterStyle, BackgroundPatternType)
project.ts   --> core.ts (CustomFont, CounterStyle)
             --> tokens.ts (DesignSystem)
             --> print.ts (PrintSettings)
             --> page.ts (PageData)
index.ts     --> re-export all
```

无环。

### 各文件内容映射

**`src/types/core.ts`** — 原子类型(无依赖)
- `TemplateId`
- `AspectRatioType`
- `CounterStyle`
- `BackgroundPatternType`
- `CustomFont`
- `TypographySettings`

**`src/types/tokens.ts`** — 设计令牌
- `TypographyToken`
- `DesignTokens`
- `DesignSystem`(保留 `React.CSSProperties` 用法,不新增 import)

**`src/types/print.ts`** — 打印设置
- `PrintSettings`

**`src/types/page.ts`** — 页面数据模型
- 子结构: `VocabItem`、`AgendaData`、`BentoItemType`/`BentoItem`、`FeatureData`、`MetricData`、`PartnerData`、`ImageConfig`、`TestimonialData`、`ResumeItem`、`ResumeSection`
- Schema 驱动: `FieldType`、`FieldSchema`
- 主接口: `PageData`
- 模板专用 PageData 扩展(用于 Type Guards): `TableOfContentsData`、`PlatformHeroData`、`StepTimelineData`、`TestimonialCardData`、`CommunityHubData`、`ComponentMosaicData`、`GalleryCapsuleData`、`EditorialSplitData`
- 从 `./core` 导入: `TemplateId`、`AspectRatioType`、`CounterStyle`、`BackgroundPatternType`

**`src/types/project.ts`** — 工程级别
- `ProjectTheme`
- `ProjectData`
- `ProjectSaveData`
- 从 `./core` 导入: `CustomFont`、`CounterStyle`
- 从 `./tokens` 导入: `DesignSystem`
- 从 `./print` 导入: `PrintSettings`
- 从 `./page` 导入: `PageData`

**`src/types/index.ts`** — 聚合重导出
```typescript
export * from './core';
export * from './tokens';
export * from './print';
export * from './page';
export * from './project';
```

### 落地步骤

1. 在空的 `src/types/` 下创建 `core.ts`、`tokens.ts`、`print.ts`、`page.ts`、`project.ts`,按上述归属迁移类型定义;每文件顶部一行中文注释说明职责(遵从 `AGENTS.md`:不中英混写)。
2. 创建 `src/types/index.ts` 执行 `export *` 聚合。
3. 删除 `src/types.ts`(巨石文件)。删除后 `src/types.ts` 与 `src/types/` 不再并存,消除解析歧义。
4. 不改动任何引用方代码。`from '../types'` 在 bundler 模式下解析到 `src/types/index.ts`。
5. 运行类型检查与测试验证。

### 关键实现注意

- **禁止中英混写注释**: 各分文件头部用一行中文说明职责,如 `// 原子类型:模板 ID、宽高比、计数器样式等无依赖基础类型`。
- **不做重命名**: 类型名一律保留(`PageData` 不改 `BasePageData`,不引入新概念),避免大面积改动。
- **不做字段拆解**: `PageData` 整体迁入 `page.ts`,不在本节拆解其 53 个字段。字段层面的领域建模属于独立重构,与"巨石文件物理拆分"是两件事,合并推进会扩大风险面。
- **不新增依赖**: 不引入 `import type { CSSProperties } from 'react'`,保持与原文件一致的全局 React 命名空间用法,避免无谓 diff。

## Before / After

### Before

```
src/
  types.ts        # 370 行,35 个 export,5 类职责平铺
  types/          # 空目录(幽灵)
```

调用方: 156 个文件通过 `from '../types'` 引用单一巨石文件。

### After

```
src/
  types/
    index.ts     # 5 行 re-export
    core.ts      # ~30 行
    tokens.ts    # ~40 行
    print.ts     # ~20 行
    page.ts      # ~200 行(含 PageData 及 9 个 Specific Data)
    project.ts   # ~40 行
```

调用方: 156 个文件零改动,`from '../types'` 解析到 `src/types/index.ts`。

效果:
- 空目录异味消除。
- 5 类职责物理分离,单文件最大约 200 行(从 370 行降下来)。
- 依赖图显式化:`project.ts` 依赖 `core/tokens/print/page` 可在一眼内看清。
- 后续若要拆解 `PageData` 字段或迁移模板专用扩展到各模板目录,可在 `page.ts` 内独立推进,不再牵动工程级类型。

## 风险与回滚

### 风险

1. **解析歧义(低)**: 若删除 `src/types.ts` 不彻底(仍残留空壳),`src/types.ts` 与 `src/types/index.ts` 并存可能让 bundler 解析行为依赖 tsconfig 优先级。**缓解**: 步骤 3 必须真正删除 `src/types.ts`,不留空文件。
2. **循环引用(低)**: 若误将 `PageData` 拆回 `core.ts` 或把 `ProjectData` 放进 `page.ts`,会引入环。**缓解**: 依赖图已明确,`project.ts` 单向依赖 `page.ts`,反向不允许。
3. **类型导出遗漏(中)**: `index.ts` 用 `export *` 时,若某分文件忘记 `export` 某类型,调用方会报 `has no exported member`。**缓解**: 迁移时对照本方案"类型归属"清单逐项核对,并用 `tsc --noEmit` 兜底。
4. **`React.CSSProperties` 全局命名空间(低)**: 拆分后 `tokens.ts` 仍隐式依赖 `@types/react` 的全局 React。若未来 tsconfig 收紧(如关闭 `jsx: react-jsx` 或移除 `@types/react`),需补 `import type { CSSProperties } from 'react'`。本节不改,仅记录。
5. **测试快照/类型基准(低)**: 若存在基于 `src/types.ts` 路径的快照或 import 精确匹配的测试,路径未变(`../types` 仍有效),不受影响。

### 回滚

回滚 = 反向操作,代价低:
1. `git revert` 本次提交,恢复 `src/types.ts` 原文件。
2. 删除 `src/types/` 下的 5 个分文件与 `index.ts`(或保留空目录以备后续重试)。
3. 因调用方零改动,回滚后无需触动 156 个引用方。

## 验证方式

1. **类型检查**: 在仓库根执行 `npx tsc --noEmit`(`package.json` 未配 typecheck 脚本,直接调 tsc)。通过即证明 156 个引用方解析正确、类型导出无遗漏。
2. **单元测试**: 执行 `pnpm test:unit:run`(等价 `vitest run`)。重点关注:
   - `src/utils/__tests__/typeGuards.test.ts`(直接消费 PageData 扩展类型)
   - `src/components/__tests__/*.test.tsx`(消费 PageData/ProjectData)
   - `src/templates/schemas/__tests__/*.test.ts`(消费 PageData、ProjectTheme)
3. **Lint**: 执行 `pnpm lint` 确认无未使用 import、无中英混写注释。
4. **构建**: 执行 `pnpm build` 确认 Vite 打包无路径解析报错。
5. **人工核对**:
   - `src/types.ts` 已删除(`ls src/types.ts` 应失败)。
   - `src/types/` 下恰有 6 个文件(`core/tokens/print/page/project/index`)。
   - `grep -rn "from '../types'" src/ | wc -l` 与拆分前一致(引用方零改动)。
