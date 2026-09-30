# 3.5 模板默认值合并统一（only-fill 方案）

> 对应 `docs/code-review-report.md` 第 672-698 行 3.5 节。
> 关联 3.1 节(`templates/registry.ts` 单源化)、3.4 节(`FieldSchema` 元数据收敛)、6.1 节(any 治理)。
> 本文是 `10-template-defaults-merge.md`(mode 参数方案)的并行替代方案,语义更激进:统一为单一 only-fill,无 mode 参数。

## 事实核对

逐条核对报告点名的两处合并实现,以及报告未提及但同源的两处缺陷。

### 1. `getDefaultPage` — 模板级 `defaultData` 走 `Object.assign` 直接覆盖

`src/store/useStore.ts#L20-L53` 的 `getDefaultPage(ratio, layoutId, templateConfig?)` 构造 `base: PageData` 后:

```typescript
// L38-L41
if (templateConfig?.defaultData) {
  Object.assign(base, templateConfig.defaultData); // 直接覆盖
}

// L43-L50
if (templateConfig?.fields) {
  templateConfig.fields.forEach((field: any) => {
    if (field.defaultValue !== undefined && base[field.key as keyof PageData] === undefined) {
      (base as any)[field.key] = field.defaultValue; // 仅 undefined 时填充
    }
  });
}
```

- 模板级 `defaultData`:`Object.assign` 无条件覆盖,即便 `base` 已有值也会被改写。
- 字段级 `fields[].defaultValue`:仅在 `base[field.key] === undefined` 时填充。

### 2. `mergeDefaults` — 模板级 `defaultData` 走 undefined/null 守卫

`src/pages/EditorPage.tsx#L260-L295` 的 `handleFinalAction` 内联 `mergeDefaults(target)`:

```typescript
// L268-L274
if (templateConfig?.defaultData) {
  for (const [k, v] of Object.entries(templateConfig.defaultData)) {
    if ((merged as any)[k] === undefined || (merged as any)[k] === null) {
      (merged as any)[k] = v; // 仅 undefined 或 null 时填充
    }
  }
}

// L275-L281
if (templateConfig?.fields) {
  templateConfig.fields.forEach((field: any) => {
    if (field.defaultValue !== undefined && (merged as any)[field.key] === undefined) {
      (merged as any)[field.key] = field.defaultValue; // 仅 undefined 时填充
    }
  });
}
```

- 模板级 `defaultData`:仅在 `undefined` 或 `null` 时填充。
- 字段级 `fields[].defaultValue`:仅在 `undefined` 时填充(与 `getDefaultPage` 该分支一致)。

### 3. 两处逻辑差异核对结论

| 维度 | `getDefaultPage` (useStore) | `mergeDefaults` (EditorPage) | 结论 |
|------|------------------------------|-------------------------------|------|
| 模板级 `defaultData` 合并策略 | `Object.assign` 直接覆盖 | undefined/null 守卫填充 | **不一致**,报告描述属实 |
| 字段级 `fields[].defaultValue` 合并策略 | 仅 undefined 填充 | 仅 undefined 填充 | 一致 |
| 操作对象 | 全新构造的 `base` 骨架(无用户数据) | `currentPage` 或 `pages[0]`(可能含用户编辑) | 场景不同 |
| `null` 处理 | `Object.assign` 会用模板值覆盖 `null` | 显式跳过 `null` | **不一致** |

报告"两处实现处理默认值的逻辑微妙不同"对 `fields` 分支概括不准:两处 `fields[].defaultValue` 逻辑完全相同(都只查 `=== undefined`),真正分叉只在 `defaultData` 分支。

### 4. 报告未提及的同源缺陷 — `addPage` 完全跳过模板默认值

`src/store/useStore.ts#L459-L475` 的 `addPage(ratio, layoutId)` 调用 `getDefaultPage(ratio, layoutId)` **未传第三参 `templateConfig`**:

```typescript
const defaultPage = getDefaultPage(ratio, layoutId); // templateConfig 缺省 → undefined
```

`getDefaultPage` 内部 `templateConfig?.defaultData` 与 `templateConfig?.fields` 两段守卫均因 `templateConfig` 为 `undefined` 而跳过。`addPage` 产出的新页只拿到硬编码骨架(`title: 'New Slide'`、`subtitle: 'Created with SlideGrid Studio'`),**模板的 `defaultData` 与字段默认值一律不生效**。

这与 `handleFinalAction` 的"切换布局"路径(L291 `updatePage(mergeDefaults(currentPage))`)形成行为分叉:用户在弹窗里选"Bilingual Cover"新增一页,得到 `title='New Slide'`、`paragraphZH` 缺失的空白页;选"Bilingual Cover"切换现有页布局,则 `paragraphZH`/`image` 等模板默认值被填充(仅当原字段缺失)。报告所称"同一个字段在不同入口表现出不一致的覆盖行为"即此,根因比"两处实现微妙不同"更深一层:**新增页入口根本没接入合并逻辑**。

### 5. 调用点与 `defaultData` 实际键集核对

`getDefaultPage` 在 useStore 内被调用三次:`createProject` (L200)、`loadProject` 模板兜底分支 (L269)、`addPage` (L464)。前两处传 `templateConfig`,第三处不传。

对 6 个含 `defaultData` 的模板逐个清点键集(`bilingual-cover`/`bilingual-glossary`/`bilingual-quote`/`bilingual-reader`/`editorial-classic`/`epilogue-pillar`),键全部为内容字段(`title`/`subtitle`/`paragraph`/`paragraphZH`/`image`/`imageLabel`/`actionText`/`sideHeader`/`vocabItems`/`metrics`/`bigDataMetricsConfig` 等),**无任何模板的 `defaultData` 覆盖骨架的结构/样式字段**(`backgroundColor`/`accentColor`/`titleFont`/`bodyFont`/`counterStyle`/`visibility`/`freeformItems`/`freeformConfig`)。这意味着骨架里这几个字段是否预先赋值,不会与模板默认值产生冲突——合并策略的差异**仅对 `title`/`subtitle` 两个内容占位字段**有实际影响。

### 6. 测试覆盖核对

- `src/store/useStore.test.ts` 的 `addPage`/`createProject`/`loadProject` 用例(L78-L86、L377-L401、L284-L308)仅断言 `pages.length`、`layoutId`、`aspectRatio`、`projectTitle`、`isLoaded`,**未断言任何 `defaultData` 衍生字段**(如 `paragraphZH`、`image`),也未断言 `title='New Slide'`/`subtitle='Created with SlideGrid Studio'`。改造不破坏这些用例。
- `src/pages/__tests__/EditorPage.test.tsx` 通过 `vi.mock('../../store/useStore', ...)` 整体 mock store(L149-L151),`handleFinalAction`/`mergeDefaults` 的内部逻辑无任何用例直接覆盖。改造不破坏该文件。
- `src/templates/schemas/__tests__/bilingual.test.ts` 断言 `tpl?.defaultData?.paragraph` 等模板注册表字段存在(L38-L55),不经过合并函数,不受影响。

## 根因

1. **样板复制**:迭代 `templateConfig.defaultData` 与 `templateConfig.fields[].defaultValue` 的 ~12 行循环被复制到 `getDefaultPage` 与 `mergeDefaults` 两处。两处本可共享,却被各自手写,导致后续维护者改一处忘改另一处。

2. **语义分裂未文档化**:`getDefaultPage` 操作全新骨架,`Object.assign` 覆盖是安全的(无用户数据可毁);`mergeDefaults` 操作已存在页,必须用 only-fill 保护用户编辑。两套语义本身**各有其正确性**,但分裂未被命名、未被文档化,仅以两段长得像的代码静默存在,让读者误以为"应统一成同一套语义"——实际统一的是**样板**,不是**策略**。

3. **`addPage` 接入遗漏**:`addPage` 调用 `getDefaultPage` 时未传 `templateConfig`,这是合并逻辑复制时的二阶产物——复制者只把目光放在"两处合并实现"上,没注意到第三处调用点根本没接入。报告把它归入"新增页面与切换模板不一致",但未点明 `addPage` 漏传 `templateConfig` 这一机械根因。

4. **骨架内容占位与模板默认值竞争**:`getDefaultPage` 的骨架把 `title='New Slide'`、`subtitle='Created with SlideGrid Studio'` 写死,与模板 `defaultData.title/subtitle` 处于同一优先级。`Object.assign` 让模板胜出,但若简单地把 `getDefaultPage` 也改成 only-fill,骨架的 `title='New Slide'` 会挡住模板的 `defaultData.title`——这是统一语义时的真正技术约束,下一节方案围绕它展开。

## 解决方案

新增 `src/utils/templateDefaults.ts`,导出两个职责清晰的纯函数:

- `createDefaultPage(ratio, layoutId, templateConfig?)` — 新建页入口,三层 only-fill:结构骨架 → 模板默认值 → 内容回退。
- `applyTemplateDefaults(target, templateConfig?)` — 已存在页入口,单层 only-fill,保留用户编辑。

**语义统一为 only-fill(undefined/null 守卫)**,既保护用户编辑,又通过"骨架不预置内容占位 + 内容回退层"让模板 `defaultData` 在新建页时仍能覆盖 'New Slide' 占位。

### 设计原则(遵从 `~/.claude/CLAUDE.md`)

- **不保留向后兼容**:删除 `getDefaultPage` 与 `EditorPage` 内联 `mergeDefaults`,不保留 shim、不保留双语义分支。所有调用点直连 `templateDefaults.ts`。
- **最简实现**:单一 only-fill 语义 + 三层优先级(骨架 < 模板 < 用户编辑),不引入 merge mode 枚举、不引入配置项。
- **不投机抽象**:`createDefaultPage` 与 `applyTemplateDefaults` 各自对应一个真实调用场景(新建页 / 已存在页),不为"未来可能的第三种模式"预留钩子。
- **不破坏现有测试**:见上文"事实核对"第 6 条,所有相关用例的断言面均不触及。
- **遵从 `AGENTS.md`**:注释中文写意图、英文写技术标识;禁单行中英混写;禁 emoji。

### 关键决策:为何不直接把 `getDefaultPage` 改成 only-fill

若 `getDefaultPage` 的骨架保留 `title='New Slide'`、`subtitle='Created with SlideGrid Studio'`,改为 only-fill 后,模板的 `defaultData.title='B I L I N G U A L  E S S A Y'`(bilingual-cover)会被骨架的 `'New Slide'` 挡住——新建 Bilingual 页时 `title` 退化为 'New Slide',模板设计落空。

本方案把骨架的 `title`/`subtitle` 剥离到独立的 `CONTENT_FALLBACK` 常量,并按 **模板优先于回退** 的顺序应用:

1. 结构骨架(不含 `title`/`subtitle`)——承载 `id`/`type`/`layoutId`/`aspectRatio`/样式/`freeformConfig` 等与模板无关的字段。
2. `applyTemplateDefaults` —— 模板 `defaultData` 与 `fields[].defaultValue` 经 only-fill 填入骨架的 undefined 字段(此时 `title` 仍 undefined,模板可填入)。
3. `applyContentFallback` —— 对仍为 undefined 的 `title`/`subtitle` 用 'New Slide' / 'Created with SlideGrid Studio' 兜底。

模板无 `defaultData.title`(如 `modern-feature`)时,第 2 步 no-op,第 3 步填 'New Slide';模板有 `defaultData.title`(如 `bilingual-cover`)时,第 2 步填入模板值,第 3 步跳过。两条路径均 only-fill,语义统一。

### 新建文件 `src/utils/templateDefaults.ts`

```typescript
import { PageData } from '../types';
import { TemplateConfig } from '../templates/registry';
import { DEFAULT_THEME } from '../constants/theme';
import { AspectRatioType } from '../constants/layout';

// 内容回退：模板未提供 title/subtitle 时使用
const CONTENT_FALLBACK: Partial<PageData> = {
  title: 'New Slide',
  subtitle: 'Created with SlideGrid Studio',
};

// 构造结构骨架，不含内容占位字段，避免挡住模板默认值
function createPageSkeleton(ratio: AspectRatioType, layoutId: string): Partial<PageData> {
  return {
    id: `slide-${crypto.randomUUID()}`,
    type: layoutId === 'freeform' ? 'freeform' : 'slide',
    layoutId,
    aspectRatio: ratio,
    backgroundColor: DEFAULT_THEME.colors.background,
    accentColor: DEFAULT_THEME.colors.accent,
    titleFont: DEFAULT_THEME.typography.headingFont,
    bodyFont: DEFAULT_THEME.typography.bodyFont,
    counterStyle: 'number',
    visibility: { logo: true },
    freeformItems: [],
    freeformConfig: {
      gridSize: 20,
      snapToGrid: true,
      showGridOverlay: false,
      showAlignmentGuides: true,
    },
  };
}

/**
 * 将模板默认值合并到目标页，仅在 undefined 或 null 时填充。
 * 适用于已存在页（保留用户编辑），也适用于骨架（由模板填充内容）。
 */
export function applyTemplateDefaults<T extends Partial<PageData>>(
  target: T,
  templateConfig?: TemplateConfig
): T {
  if (!templateConfig) return target;
  const result: Record<string, unknown> = { ...target };

  // 模板级默认数据：仅填充缺失字段，不覆盖已有值
  if (templateConfig.defaultData) {
    for (const [k, v] of Object.entries(templateConfig.defaultData)) {
      if (result[k] === undefined || result[k] === null) {
        result[k] = v;
      }
    }
  }

  // 字段级默认值：仅填充 undefined 字段
  if (templateConfig.fields) {
    for (const field of templateConfig.fields) {
      const key = String(field.key);
      if (field.defaultValue !== undefined && result[key] === undefined) {
        result[key] = field.defaultValue;
      }
    }
  }

  return result as T;
}

// 应用内容回退，补全模板与骨架都未覆盖的内容字段
function applyContentFallback<T extends Partial<PageData>>(target: T): T {
  const result: Record<string, unknown> = { ...target };
  for (const [k, v] of Object.entries(CONTENT_FALLBACK)) {
    if (result[k] === undefined || result[k] === null) {
      result[k] = v;
    }
  }
  return result as T;
}

/**
 * 新建页：结构骨架 → 模板默认值 → 内容回退，三层 only-fill。
 * 模板默认值优先于内容回退，确保带 defaultData 的模板能覆盖 New Slide 占位。
 */
export function createDefaultPage(
  ratio: AspectRatioType,
  layoutId: string,
  templateConfig?: TemplateConfig
): PageData {
  const skeleton = createPageSkeleton(ratio, layoutId);
  const withTemplate = applyTemplateDefaults(skeleton, templateConfig);
  return applyContentFallback(withTemplate) as PageData;
}
```

要点:

- `applyTemplateDefaults` 与 `applyContentFallback` 共用同一段 only-fill 原语(仅在 `undefined`/`null` 时填充),不引入 merge mode。两者区别仅在数据源(模板 vs 回退常量),通过函数名区分语义。
- `result: Record<string, unknown>` 是局部可变视图,避免 `any` 逃逸(对齐 6.1 节 any 治理目标)。`Object.entries` 返回 `string` 键,用 `Record<string, unknown>` 索引无需 `as any`。
- `field.key` 是 `FieldType`(字符串字面联合),`String(field.key)` 归一为 `string` 以索引 `Record`。
- `createPageSkeleton` 不导出——它是 `createDefaultPage` 的实现细节,不供外部直接调用。

### 调用点改造

**`src/store/useStore.ts` — 删除 `getDefaultPage`,改调 `createDefaultPage`**

删除 L20-L53 的 `getDefaultPage`。文件顶部 import 增加 `createDefaultPage`:

```typescript
import { createDefaultPage } from '../utils/templateDefaults';
```

三处调用点:

```typescript
// L200（createProject）
pages: [{ ...createDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }],

// L269（loadProject 模板兜底分支）
pages: [createDefaultPage(getRatioFromTemplate(templateId), templateId || 'modern-feature', templateConfig)],

// L464（addPage —— 修复：补传 templateConfig）
addPage: (ratio, layoutId) => {
  logger.action('Store', 'AddPage', { ratio, layoutId });
  commitUncommittedBaseline(get());
  get().pushHistory();
  const { pages, theme, counterStyle } = get();
  // 新增页同样走模板默认值合并，修复此前 templateConfig 漏传导致模板 defaultData 不生效
  const templateConfig = getTemplateById(layoutId);
  const defaultPage = createDefaultPage(ratio, layoutId, templateConfig);
  const newPage: PageData = {
    ...defaultPage,
    backgroundColor: theme.colors.background,
    accentColor: theme.colors.accent,
    titleFont: theme.typography.headingFont,
    bodyFont: theme.typography.bodyFont,
    counterStyle,
  };
  set({ pages: [...pages, newPage], currentPageIndex: pages.length, hasUnsavedChanges: true });
},
```

`addPage` 现在主动查 `getTemplateById(layoutId)` 并传入,修复"新增页跳过模板默认值"的缺陷。`getTemplateById` 已在 useStore L8 import,无需新增。

**`src/pages/EditorPage.tsx` — 删除内联 `mergeDefaults`,改调 `applyTemplateDefaults`**

文件顶部 import 增加 `applyTemplateDefaults`:

```typescript
import { applyTemplateDefaults } from '../utils/templateDefaults';
```

`handleFinalAction` (L260-L295) 改为:

```typescript
const handleFinalAction = (layoutId: string) => {
  const templateConfig = getTemplateById(layoutId);
  const mergeDefaults = (target: PageData): PageData =>
    applyTemplateDefaults(
      { ...target, layoutId, aspectRatio: selectedRatio },
      templateConfig
    );

  if (modalMode === 'create' && pages[0]?.title === 'PLACEHOLDER_FOR_NEW_PROJECT') {
    updatePage(mergeDefaults({ ...pages[0], title: 'New Slide' }));
  } else {
    if (modalMode === 'create') {
      addPage(selectedRatio, layoutId);
    } else {
      updatePage(mergeDefaults(currentPage));
    }
  }
  setShowLayoutModal(false);
};
```

内联 `mergeDefaults` 缩减为一行 `applyTemplateDefaults` 调用,`layoutId`/`aspectRatio` 经 spread 注入 `target`,不再用 `as any`(`TemplateId = string`,`layoutId: string` 直接可赋值)。

## Before / After

### 合并逻辑代码量

| 位置 | Before | After |
|------|--------|-------|
| `useStore.ts` `getDefaultPage` | L20-L53,34 行(含骨架 + 两段合并) | 删除,改调 `createDefaultPage` |
| `EditorPage.tsx` `mergeDefaults` | L262-L283,22 行(内联两段合并) | 一行 `applyTemplateDefaults` 调用 |
| `templateDefaults.ts` | — | ~75 行(含类型、骨架、两个纯函数、注释) |
| 合并样板复制份数 | 2 份 | 0 份(原语在 `templateDefaults.ts` 内部) |

### 行为对比

| 场景 | Before | After | 差异 |
|------|--------|-------|------|
| `createProject('My', 'modern-feature')` 首页 | 骨架 title='New Slide' → Object.assign(无 defaultData) → title='New Slide' → spread 改 title='PLACEHOLDER...' | 骨架(无 title) → applyTemplateDefaults(no-op) → 回退 title='New Slide' → spread 改 title='PLACEHOLDER...' | 无 |
| `loadProject` 模板兜底(modern-feature) | 同上骨架路径,title='New Slide' | 同上 | 无 |
| `addPage('16:9', 'modern-feature')` | 骨架 title='New Slide',无模板合并 | `createDefaultPage` 走骨架 + no-op 模板 + 回退,title='New Slide' | 无(modern-feature 无 defaultData) |
| `addPage('16:9', 'bilingual-cover')` | **骨架 title='New Slide',模板 defaultData 未应用** | `createDefaultPage` 骨架 → 模板填入 title='B I L I N G U A L  E S S A Y'、paragraphZH、image 等 → 回退跳过 | **修复**:新增页现在拿到模板内容 |
| 切换布局到 bilingual-cover(当前页 title='My Title') | mergeDefaults only-fill:title='My Title' 保留,paragraphZH 等填入 | `applyTemplateDefaults` only-fill:同左 | 无 |
| 切换布局到 bilingual-cover(当前页 title=null) | mergeDefaults 用模板 title 填充(null 守卫) | `applyTemplateDefaults` 用模板 title 填充(null 守卫) | 无 |
| `createProject` 传 bilingual-cover(理论路径,实际 Dashboard 不走) | Object.assign 覆盖骨架 title → title='B I L I N G U A L' → spread 改 title='PLACEHOLDER...' | 模板填入 title → 回退跳过 → title='B I L I N G U A L' → spread 改 title='PLACEHOLDER...' | 无(PLACEHOLDER 最终覆盖) |

### 语义统一性

| 维度 | Before | After |
|------|--------|-------|
| 模板级 `defaultData` 合并语义 | 覆盖(新建页) / only-fill(切换布局) / 不应用(addPage) — 三套 | only-fill(三处统一) |
| 字段级 `fields[].defaultValue` 合并语义 | only-fill(两处一致) / 不应用(addPage) | only-fill(三处统一) |
| `null` 处理 | Object.assign 覆盖 / null 守卫 — 不一致 | null 守卫(统一) |
| `addPage` 是否应用模板默认值 | 否 | 是 |

## 风险与回滚

### 风险

1. **`addPage` 行为变更(中危,预期正向)**:`addPage('16:9', 'bilingual-cover')` 此前产出 `title='New Slide'`、无 `paragraphZH`/`image` 的空白页,改造后产出 `title='B I L I N G U A L  ESSAY'`、含模板全套 `defaultData` 的页。这是缺陷修复,但若存在依赖"addPage 产出空白页"的下游逻辑(如某些模板渲染器假设 `paragraphZH` 缺失走兜底分支),需回归。核对:`src/components/Preview.tsx`、`src/templates/schemas/LayoutRenderer.tsx` 的渲染分支均以 `page.xxx` 为真值判断,模板填入的字符串/数组为真值,走正常渲染分支,无 `undefined` 兜底被绕过的风险。

2. **骨架剥离 `title`/`subtitle` 后的类型流转(低危)**:`createPageSkeleton` 返回 `Partial<PageData>`,`title` 缺失。`createDefaultPage` 经 `applyTemplateDefaults` + `applyContentFallback` 后以 `as PageData` 收尾。`as PageData` 的安全性由 `applyContentFallback` 保证:`title`/`subtitle` 必被填入(两层 only-fill 后仍 undefined 的场景不存在——`CONTENT_FALLBACK` 兜底)。若未来有人移除 `applyContentFallback`,`as PageData` 将变成不安全断言。该风险通过 `createDefaultPage` 的 JSDoc 注释与 `applyContentFallback` 的不可省略性(仅 `createDefaultPage` 调用)锁住。

3. **`layoutId` 类型断言去除(低危)**:`getDefaultPage` 原 `layoutId: layoutId as any` 被去掉,`createPageSkeleton` 直接 `layoutId`。`PageData.layoutId: TemplateId`,`TemplateId = string`,`layoutId: string` 可直接赋值。若 `TemplateId` 未来收窄为字面联合(如 `'modern-feature' | 'bilingual-cover' | ...`),则 `layoutId: string` 不再可赋值,需改 `layoutId as TemplateId`。当前无此约束,`tsc --noEmit` 可验证。

4. **`getTemplateById` 在 `addPage` 内重复查找(极低危)**:`addPage` 现在每次调用都 `getTemplateById(layoutId)`,这是 `TEMPLATES.find(t => t.id === id)` 的线性查找(`registry.ts#L69-L71`)。36 个模板的线性查找在单次 `addPage` 中可忽略,且 `addPage` 频率低(用户点击新增),不引入性能问题。若后续模板数量增长到数百,可由 3.1 节的注册表优化一并处理,不在本节加 cache。

5. **与 3.1 节(模板单源化)的协同**:3.1 节删除 `schemas/` 下的 TS 模板定义,`TemplateConfig` 类型仍来自 `registry.ts`,本方案 `import { TemplateConfig } from '../templates/registry'` 不受影响。两方案正交,落地顺序无关。

### 回滚

改动集中在 3 个文件:

- `src/utils/templateDefaults.ts`(新增)
- `src/store/useStore.ts`(删除 `getDefaultPage`,三处调用点改为 `createDefaultPage`,`addPage` 补 `getTemplateById`)
- `src/pages/EditorPage.tsx`(删除内联 `mergeDefaults`,改为 `applyTemplateDefaults` 调用)

无 store schema 变更、无数据迁移、无 IndexedDB 结构变动、无对外接口变更。回滚即 `git revert` 对应提交,`getDefaultPage` 与内联 `mergeDefaults` 从 git 历史恢复,零成本。

## 验证方式

1. **现有单测全绿**:
   - `pnpm test src/store/useStore.test.ts` 跑通全部用例。重点核对:
     - `addPage` 基础用例(L78-L86):`addPage('16:9', 'modern-feature')` → `pages[0].layoutId==='modern-feature'`、`aspectRatio==='16:9'`。改造后 `createDefaultPage` 经骨架 + no-op 模板 + 回退产出 `title='New Slide'`,`layoutId`/`aspectRatio` 不变,断言通过。
     - `createProject` 用例(L377-L401):断言 `projectTitle`/`activeProjectId`/`pages.length`/`isLoaded`,不断言 `defaultData` 衍生字段,改造不影响。
     - `loadProject 模板兜底`(L298-L308):`loadProject('missing', 'modern-feature')` → `pages[0].layoutId==='modern-feature'`。改造后走 `createDefaultPage` + modern-feature(无 defaultData),`layoutId` 不变。
   - `pnpm test src/pages/__tests__/EditorPage.test.tsx` 跑通。该文件整体 mock store,`handleFinalAction` 内部逻辑无断言,改造不影响。
   - `pnpm test src/templates/schemas/__tests__/bilingual.test.ts` 跑通。该文件断言模板注册表的 `defaultData` 字段存在,不经过合并函数。

2. **新增 `src/utils/__tests__/templateDefaults.test.ts`**(建议覆盖以下用例):
   - `createDefaultPage('16:9', 'modern-feature', getTemplateById('modern-feature'))` 返回 `title==='New Slide'`、`subtitle==='Created with SlideGrid Studio'`(回退层生效)、`paragraphZH===undefined`(模板无 defaultData)。
   - `createDefaultPage('3:4', 'bilingual-cover', getTemplateById('bilingual-cover'))` 返回 `title==='B I L I N G U A L  E S S A Y'`、`paragraphZH` 为模板中字符串、`image` 为模板中 URL(模板层覆盖回退层)。
   - `applyTemplateDefaults({ title: 'My Title' }, getTemplateById('bilingual-cover'))` 返回 `title==='My Title'`(用户编辑保留)、`paragraphZH` 为模板值(仅 undefined 填充)。
   - `applyTemplateDefaults({ title: null }, getTemplateById('bilingual-cover'))` 返回 `title` 为模板值(null 守卫填充)。
   - `applyTemplateDefaults({}, undefined)` 原样返回 `{}`(无 templateConfig 时 no-op)。
   - `createDefaultPage('16:9', 'freeform', undefined)` 返回 `type==='freeform'`、`freeformItems===[]`、`freeformConfig.gridSize===20`(骨架结构字段不受模板影响)。

3. **`addPage` 模板应用回归(新增建议)**:在 `useStore.test.ts` 补一例,`addPage('3:4', 'bilingual-cover')` 后 `pages[0].paragraphZH` 应为 `bilingual-cover.defaultData.paragraphZH` 的值(非 undefined),`pages[0].title` 应为 `'B I L I N G U A L  E S S A Y'`。该例锁死"addPage 现在应用模板默认值"这一行为修复,防止回归。

4. **类型与 lint**:
   - `npx tsc --noEmit` 确认 `templateDefaults.ts` 类型推导通过,`useStore.ts`/`EditorPage.tsx` 改造点无未使用 import、无 `as any` 新增。
   - `pnpm lint` 确认 `templateDefaults.ts` 不引入新的 `no-explicit-any` 告警(`Record<string, unknown>` 规避了 `any`)。

5. **手动验证**(遵从项目 verify skill 精神,驱动真实流程):
   - 启动 `pnpm dev`,新建一个 modern-feature 工程。
   - 在侧栏点"Add New Slide"打开模板弹窗,选"Bilingual Cover"新增一页。
   - 确认新页的标题为"B I L I N G U A L  ESS AY"(模板 defaultData 生效),正文为中英文双语模板内容(`paragraphZH` 填充),图片为模板的 Unsplash URL。
   - 在该页上把标题改成"My Custom Title",然后再次打开模板弹窗选"Bilingual Reader"切换布局。
   - 确认切换后标题仍为"My Custom Title"(用户编辑保留),`paragraph`/`paragraphZH`/`vocabItems` 等 Bilingual Reader 的 defaultData 填入了原先缺失的字段(only-fill 生效)。
   - 切换到 modern-feature 页新增一页,确认标题为"New Slide"、副标题为"Created with SlideGrid Studio"(无 defaultData 的模板走内容回退)。

## 与 mode 参数方案(`10-template-defaults-merge.md`)的对照

两份方案的事实核对与根因分析完全一致,分歧仅在统一语义的选择:

| 维度 | mode 参数方案 | 本方案(only-fill) |
|------|---------------|---------------------|
| 抽象形态 | 单一 `applyTemplateDefaults(target, cfg, mode)` | `createDefaultPage` + `applyTemplateDefaults` 两函数 |
| 语义表达 | `mode: 'fill' \| 'override'` 参数 | 函数名区分(新建 vs 已存在) |
| 新建页策略 | override(等价 Object.assign) | only-fill + 内容回退层 |
| `addPage` 修复 | 未明确(保留 `getDefaultPage` 签名) | 显式补传 `templateConfig` |
| 行为变更 | 零(逐字段等价) | `addPage` 新增页现带模板内容(缺陷修复) |
| `any` 治理 | 保留 `as any` 索引 | `Record<string, unknown>` 规避 |
| CLAUDE.md 对齐 | mode 参数属配置/间接 | 无配置参数,但改动面更大 |

选型建议:若优先"零行为变更、最小改动",取 mode 参数方案;若优先"单一语义、无配置参数、顺带修复 `addPage`",取本方案。两方案均不破坏现有测试。
