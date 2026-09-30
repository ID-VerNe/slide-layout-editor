# 3.1 模板单源化

## 事实核对

针对 `docs/code-review-report.md` 第 362-394 行的描述逐条核对:

| 报告描述 | 实际核对 | 结论 |
|---|---|---|
| 运行时源 `src/templates/definitions/**/*.json` (36 个文件, 7,529 行) | Glob 返回 36 个 JSON;`grep -rh '^  "id":'` 得 36 个顶层 id,均唯一 | 数量属实 |
| 孤立代码源 `src/templates/schemas/**/*.ts` (36 个文件, ~4,000 行) | 排除基础设施后,模板定义 TS 文件恰为 36 个,合计 4,333 行 | 数量属实 |
| `registry.ts#L38` 通过 `import.meta.glob('./definitions/**/*.json', { eager: true })` 载入 36 个 JSON | `src/templates/registry.ts#L38-L41` 与描述一致;`TEMPLATES` 数组由 JSON 派生 `schema.root` | 属实 |
| 36 个 TS 文件"与对应的 JSON 内容几乎 100% 相同" | 抽样 `editorial-split`:TS `supportedRatios: ['2:3', 'A4']` vs JSON `['16:9', '2:3']`;`bilingual-cover` 一致 | **不准确**:drift 已发生,非"几乎相同"。这恰好印证双轨维护风险 |
| `App.tsx#L10-L22` 预加载 3 个 TS 模块,运行时却走 JSON,导致预加载无效 | `src/App.tsx#L10-L29` 确在 `requestIdleCallback` 中动态 import `schemas/Universal-Product/modern-feature` 等 3 个 TS 模块;该 3 模块仅被 `schemas/index.ts` re-export,运行态无消费方 | 属实 |
| `schemas/` 仍保留 AST 解析器、验证器与 LayoutRenderer 等基础设施 | 基础设施实为:`types.ts`/`validator.ts`/`componentRegistry.ts`/`expressionEvaluator.ts`/`zIndexResolver.ts`/`LayoutRenderer.tsx`/`renderer/{basePropsResolver,componentRenderer,containerRenderer,repeaterRenderer,styleWhitelist,tokenResolver}`/`utils/modularFlex.ts` | 属实;`componentRegistry.ts` 报告未提但属基础设施 |

补充事实(报告未提及,但影响落地方案):

1. 36 个 TS 模板定义的**唯一运行态消费方**是 `src/App.tsx#L12-L14` 的 3 个动态 import;`schemas/index.ts#L7-L42` 虽 re-export 全部 36 个 schema,但生产路径无其他模块消费这些命名导出。
2. `registry.ts#L44-L65` 构造 `TemplateConfig.schema` 时,`root` 取自 `def.root`(JSON),**不引用** TS schema。TS schema 在运行态是纯孤儿。
3. 测试侧仅 `src/templates/schemas/__tests__/bilingual.test.ts` 直接消费 TS 命名导出(`BilingualCoverSchema` 等 4 个);`src/templates/__tests__/definitions.test.ts` 与 `registry.test.ts` 均通过 `TEMPLATES`/`getTemplateById` 走 JSON 路径。
4. `registry.ts#L38` 的 `eager: true` 意味着 36 个 JSON **本就全量进入初始 bundle**;`App.tsx` 的预加载对 JSON 注册表无意义,因为注册表在应用启动时已在内存。
5. `LayoutRenderer`、`JsonTemplateRenderer`、`validator` 等基础设施引用的是 `./types`、`./schemas/types` 或 `./schemas`(index 聚合)中的 `TemplateSchema` 类型与 `LayoutRenderer` 组件——这些来自 `schemas/types.ts` 与 `schemas/LayoutRenderer.tsx`,与 36 个 TS 模板定义无依赖关系,删除后者不触达前者。

## 根因

1. **双轨遗留**: 早期 TS schema 是模板的原始表达,后引入 JSON 作为 Vite Glob 的运行态源;迁移未贯彻到底,留下 36 份 TS 副本未被清理。`schemas/index.ts` 仍统一 re-export,制造"TS schema 是权威"的错觉。
2. **预加载误配**: `App.tsx` 的 `preloadCommonTemplates` 写于 TS schema 时代,迁移到 JSON 注册表后未同步移除;`eager: true` 又使 JSON 在启动时已全量载入,预加热失去对象。
3. **Drift 静默化**: 双轨之间无校验约束,`editorial-split` 的 `supportedRatios` 已在 TS/JSON 间分叉,运行态走 JSON、测试若引用 TS 将看不到分叉——这正是 DRY 违规的实质伤害。
4. **基础设施与定义混杂**: `schemas/` 目录同时承载"模板定义数据"(应删)与"渲染基础设施"(`LayoutRenderer`/`validator`/`expressionEvaluator` 等,应留),未做物理隔离,使删除范围不直观。

## 解决方案

### 决策原则

- 不保留向后兼容:直接删除 36 个 TS 模板定义文件,不为 `schemas/index.ts` 的旧 re-export 留 shim、不保留 `BilingualCoverSchema` 等命名导出别名。
- 最简实现:`App.tsx` 的预加载**整体删除**,不替换为"按需预热 JSON 注册表"——`registry.ts` 已用 `eager: true` 全量载入,无对象可预热。
- 不投机抽象:不为"未来可能懒加载 JSON"预留钩子;若后续要做 bundle 切分,那是独立的懒加载重构,不在本节推进。
- 不破坏现有测试:`definitions.test.ts`/`registry.test.ts` 走 JSON 路径,不受影响;`bilingual.test.ts` 重写为通过 `getTemplateById` 消费 JSON 派生 schema,保留其 3:4 比例与默认数据断言的覆盖价值。
- 遵从 `~/.claude/CLAUDE.md`:禁止 emoji;注释遵从 `AGENTS.md` 不中英混写。

### 删除范围与保留范围

删除(36 个 TS 模板定义):

```
src/templates/schemas/169-Product/bento-showcase.ts
src/templates/schemas/23-Cover/editorial-back.ts
src/templates/schemas/23-Cover/editorial-classic.ts
src/templates/schemas/23-Gallery/{epilogue-pillar,micro-anchor,sincerity-portrait}.ts
src/templates/schemas/A4-Resume/dynamic-resume-pro.ts
src/templates/schemas/Bilingual-Editorial/{bilingual-cover,bilingual-glossary,bilingual-quote,bilingual-reader}.ts
src/templates/schemas/Universal-Cover/cinematic-bleed.ts
src/templates/schemas/Universal-Editorial/zine-classic.ts
src/templates/schemas/Universal-Gallery/{artistic-l-space,art-montage,back-cover-movie,capsule-mosaic,cinematic-letterbox,editorial-feature,editorial-split,film-diptych,floating-gallery,gravity-anchor,horizon-sky,vertical-column}.ts
src/templates/schemas/Universal-General/{big-statement,kinfolk-essay,step-timeline,table-of-contents,typography-hero}.ts
src/templates/schemas/Universal-Marketing/{community-hub,future-focus,platform-hero,testimonial-card}.ts
src/templates/schemas/Universal-Product/{component-mosaic,modern-feature}.ts
```

保留(基础设施,零改动):

```
src/templates/schemas/
  index.ts              # 收敛为基础设施 re-export
  types.ts              # TemplateSchema / TemplateNode 类型
  validator.ts          # Zod 校验器
  componentRegistry.ts  # 原子组件注册表
  expressionEvaluator.ts
  zIndexResolver.ts
  LayoutRenderer.tsx
  renderer/             # 渲染子调度器
  utils/                # modularFlex 等工具
  __tests__/             # validator / LayoutRenderer 等基础设施测试
```

### 三个落地点

**1. 重写 `src/templates/schemas/index.ts`**

删除 L7-L42 的 36 行模板 re-export,仅保留基础设施:

```typescript
export * from './types';
export * from './componentRegistry';
export * from './expressionEvaluator';
export * from './validator';
export * from './zIndexResolver';
export * from './LayoutRenderer';
```

**2. 删除 `src/App.tsx` 的预加载逻辑**

移除 `preloadCommonTemplates` 函数(L10-L29)与其在 `useEffect` 中的调用(L34)。`useEffect` 仅保留工作区路径同步逻辑(L38-L41)。`registry.ts` 的 `eager: true` 已保证 36 个 JSON 在启动时进入内存,无需预热。

如保留 `useEffect` 后内部仅剩工作区同步,可直接保留该结构;不引入新的预热函数。

**3. 重写 `src/templates/schemas/__tests__/bilingual.test.ts` 为消费 JSON 注册表**

将命名导入替换为 `getTemplateById`,断言对象改为 `tpl.schema`:

```typescript
import { describe, it, expect } from 'vitest';
import { getTemplateById } from '../../registry';
import { validateTemplate } from '../validator';

describe('Bilingual Editorial Suite', () => {
  const bilingualIds = [
    { id: 'bilingual-cover', name: 'Bilingual Cover' },
    { id: 'bilingual-reader', name: 'Bilingual Reader' },
    { id: 'bilingual-quote', name: 'Bilingual Quote' },
    { id: 'bilingual-glossary', name: 'Bilingual Glossary' },
  ];

  it('所有双语模版 Schema 均通过 Zod 校验', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl).toBeDefined();
      const result = validateTemplate(tpl!.schema);
      expect(result.success).toBe(true);
    }
  });

  it('所有双语模版均支持 3:4 与 2:3', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl!.supportedRatios).toContain('3:4');
      expect(tpl!.supportedRatios).toContain('2:3');
    }
  });

  it('注册表成功注册所有双语模版并包含默认数据', () => {
    for (const { id } of bilingualIds) {
      const tpl = getTemplateById(id);
      expect(tpl).toBeDefined();
      expect(tpl?.category).toBe('Bilingual');
      expect(tpl?.defaultData).toBeDefined();
      expect(tpl?.fields.length).toBeGreaterThan(2);
    }
  });

  it('bilingual-reader 默认数据包含正文、中文译文与策展生词列表', () => {
    const readerTpl = getTemplateById('bilingual-reader');
    expect(readerTpl?.defaultData?.paragraph).toBeTruthy();
    expect(readerTpl?.defaultData?.paragraphZH).toBeTruthy();
    expect(readerTpl?.defaultData?.vocabItems?.length).toBeGreaterThan(0);
    expect(readerTpl?.defaultData?.vocabItems?.[0].word).toBeTruthy();
    expect(readerTpl?.defaultData?.vocabItems?.[0].meaning).toBeTruthy();
  });

  it('bilingual-quote 默认数据包含英文主句与中文释义', () => {
    const quoteTpl = getTemplateById('bilingual-quote');
    expect(quoteTpl?.defaultData?.paragraph).toBeTruthy();
    expect(quoteTpl?.defaultData?.quoteZH).toBeTruthy();
  });
});
```

注:改写后,3:4 比例断言对 JSON 中 `bilingual-cover`/`bilingual-reader`/`bilingual-quote`/`bilingual-glossary` 的 `supportedRatios` 成立(已核对 4 个 JSON 均含 `3:4` 与 `2:3`)。

### 落地步骤

1. 重写 `src/templates/schemas/index.ts`,删除 36 行模板 re-export,保留 6 行基础设施 re-export。
2. 删除 36 个 TS 模板定义文件(按"删除范围"清单)。
3. 重写 `src/templates/schemas/__tests__/bilingual.test.ts` 为通过 `getTemplateById` 消费 JSON 派生 schema。
4. 编辑 `src/App.tsx`,删除 `preloadCommonTemplates` 函数与 `useEffect` 内对其的调用;保留工作区路径同步逻辑。
5. 运行类型检查、单元测试、lint、构建验证。

### 关键实现注意

- **不引入 JSON 懒加载**: `registry.ts` 保持 `eager: true`。把 eager 改 lazy 会牵动 `TEMPLATES` 的类型(当前为静态数组)与所有消费方,属于独立重构,不在本节推进。
- **不改 `registry.ts`**: 注册表已是 JSON 单源,无需改动。本节只删冗余、修预加载。
- **`schemas/index.ts` 仍存在**: 不删除该文件,因其聚合了基础设施的 re-export,`JsonTemplateRenderer.tsx#L4` 通过 `from '../templates/schemas'` 消费 `LayoutRenderer` 与 `TemplateSchema`。
- **不补 `BilingualCoverSchema` 别名**: 遵循"不保留向后兼容",`bilingual.test.ts` 重写后不再有命名导出消费者,无别名需求。
- **`editorial-split` 的 drift 自动消解**: TS 删除后,`['2:3', 'A4']` 这条与 JSON `['16:9', '2:3']` 冲突的孤立数据随之消失,运行态仅剩 JSON 一份表述。无需单独修正 drift。

## Before / After

### Before

```
src/templates/
  registry.ts                 # JSON -> TemplateConfig (eager glob)
  definitions/**/*.json       # 36 个运行态权威
  schemas/
    index.ts                  # re-export 36 个 TS schema + 基础设施
    *.ts (36 个模板定义)       # 孤儿:运行态无消费,仅 App.tsx 预加载 + bilingual.test 引用
    types.ts/validator.ts/... # 基础设施
src/App.tsx                  # 预加载 3 个 TS schema (空跑)
```

Drift 实例: `editorial-split` 的 `supportedRatios` 在 TS/JSON 间不一致。

### After

```
src/templates/
  registry.ts                 # 不变
  definitions/**/*.json       # 36 个唯一权威
  schemas/
    index.ts                  # 仅 re-export 基础设施
    (36 个模板定义已删除)
    types.ts/validator.ts/... # 基础设施,零改动
src/App.tsx                  # 无预加载;useEffect 仅保留工作区同步
```

效果:

- 36 份 TS 副本(4,333 行)与 `schemas/index.ts` 的 36 行 re-export 删除,生产 bundle 不再打入孤儿 schema。
- `App.tsx` 预加载空跑消除;空闲时不再发起 3 个无用动态 import。
- `editorial-split` drift 随 TS 删除而消解,系统只剩 JSON 一份 `supportedRatios`。
- `bilingual.test.ts` 改为 JSON 路径,3:4 比例与默认数据断言继续覆盖运行态真实数据。

## 风险与回滚

### 风险

1. **遗漏的 TS schema 消费方(中)**: 若除 `App.tsx` 与 `bilingual.test.ts` 外尚有未发现的引用方,删除后 `tsc` 会报 `Module not found`。**缓解**: 已用 Grep 全仓扫描 `from '.*schemas/[^']+'` 与 `schemas/(Universal|A4|23|169|Bilingual)-`,仅命中 `App.tsx` 与 `bilingual.test.ts`;落地后 `tsc --noEmit` 兜底。
2. **`bilingual.test.ts` 重写遗漏断言(低)**: 改写后若漏掉某断言(如 3:4 比例),覆盖价值下降。**缓解**: 改写保留原 5 条断言的全部意图,逐条对照原文件;`definitions.test.ts` 仍兜底 36 文件计数与全量 Zod 校验。
3. **`schemas/index.ts` re-export 收敛遗漏(低)**: 若误删 `export * from './types'` 等基础设施行,`JsonTemplateRenderer` 等消费方将报 `has no exported member`。**缓解**: 改写后对照本方案"保留"清单核对,`tsc` 兜底。
4. **`App.tsx` 删除预加载后 `useEffect` 误删工作区逻辑(低)**: 若把 L38-L41 的工作区路径同步一并删掉,Electron 刷新后资产路径丢失问题回归。**缓解**: 仅删 `preloadCommonTemplates` 函数与其调用,工作区同步逻辑保留;改后 `useEffect` 体内仅剩工作区同步。
5. **bundle 体积回归(低)**: 删除 36 份 TS schema 后,初始 bundle 减小;但因 `registry.ts` 仍 `eager` 载入 36 个 JSON,总体积下降有限,不作为本节收益依据。

### 回滚

回滚 = 反向操作,代价低:

1. `git revert` 本次提交,恢复 36 个 TS 模板定义、`schemas/index.ts` 旧 re-export、`App.tsx` 预加载、`bilingual.test.ts` 旧断言。
2. 因 `registry.ts` 与基础设施文件未改动,回滚后运行态行为不变。
3. 调用方(`JsonTemplateRenderer` 等)零改动,回滚不触达消费侧。

## 验证方式

1. **类型检查**: 在仓库根执行 `npx tsc --noEmit`。通过即证明 36 个 TS schema 删除后无遗漏消费方、`schemas/index.ts` re-export 收敛正确。
2. **单元测试**: 执行 `pnpm test:unit:run`。重点:
   - `src/templates/__tests__/definitions.test.ts`(36 文件计数 + 全量 Zod 校验)
   - `src/templates/__tests__/registry.test.ts`(注册表唯一 id + 必需字段)
   - `src/templates/schemas/__tests__/bilingual.test.ts`(改写后断言对 JSON 派生 schema 成立)
   - `src/templates/schemas/__tests__/validator.test.ts`(基础设施,不受影响)
3. **Lint**: 执行 `pnpm lint` 确认无未使用 import、无中英混写注释。
4. **构建**: 执行 `pnpm build` 确认 Vite 打包无路径解析报错、`schemas/index.ts` re-export 收敛后产物正常。
5. **人工核对**:
   - `find src/templates/schemas -name "*.ts" -not -path "*__tests__*" -not -path "*renderer*" -not -path "*utils*"` 仅返回基础设施文件(`componentRegistry`/`expressionEvaluator`/`index`/`types`/`validator`/`zIndexResolver`/`LayoutRenderer.tsx`)。
   - `grep -rn "schemas/Universal-\|schemas/A4-\|schemas/23-\|schemas/169-\|schemas/Bilingual-" src/` 无命中(消费方已清零)。
   - `src/App.tsx` 中不再出现 `preloadCommonTemplates` 与 `import('./templates/schemas/`。
   - `src/templates/schemas/index.ts` 不再出现 `export * from './Universal-` 等模板 re-export 行。
