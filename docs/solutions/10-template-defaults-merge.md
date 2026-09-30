# 3.5 模板默认值合并统一

## 事实核对

逐行核对 `docs/code-review-report.md` 第 672-698 行描述。报告定位的文件行号与实际代码一致,但"两处实现处理默认值的逻辑微妙不同"这一概括在 `fields` 分支上不准确 —— 两处的 `fields` 处理其实完全相同,真正分叉的只有 `defaultData` 分支。

| 报告描述 | 代码事实 | 结论 |
|---|---|---|
| `useStore.ts#L38-L50` (`getDefaultPage`) | 实际位于 `src/store/useStore.ts#L20-L53`;`defaultData` 分支在 L39-L41,`fields` 分支在 L44-L50 | 行号偏移,逻辑属实 |
| `EditorPage.tsx#L268-L282` (`mergeDefaults`) | 实际位于 `src/pages/EditorPage.tsx#L260-L295`;`mergeDefaults` 在 L262-L283,`defaultData` 分支 L268-L274,`fields` 分支 L275-L281 | 行号偏移,逻辑属实 |
| `getDefaultPage` 用 `Object.assign(base, templateConfig.defaultData)` 直接浅覆盖 | L40:`Object.assign(base, templateConfig.defaultData)` | 属实 |
| `mergeDefaults` 仅在 `undefined || null` 时覆盖 | L270:`if ((merged as any)[k] === undefined || (merged as any)[k] === null)` | 属实 |
| "两处实现处理默认值的逻辑微妙不同" | `defaultData` 分支确实不同(直接覆盖 vs fill);但 `fields` 分支两处均为 `field.defaultValue !== undefined && target[field.key] === undefined`,**完全一致** | 概括不准确:分叉仅存在于 `defaultData`,不在 `fields` |

补充事实(报告未提及,但影响方案选择):

1. **`mergeDefaults` 在合并前强制覆盖 `layoutId` 与 `aspectRatio`**(L265-L267:`{ ...target, layoutId, aspectRatio: selectedRatio }`)。这是切换模板入口的固有需求 —— 用户主动选模板时,结构字段必须更新。这部分不属于"默认值合并"语义,应留在调用点,不进入统一函数。

2. **`getDefaultPage` 的直接覆盖是有意的,不是 bug**。base 由程序构造(L21-L36),`title: 'New Slide'`、`subtitle: 'Created with SlideGrid Studio'` 等都是占位值;模板 `defaultData`(如 `bilingual-cover.json` 的 `title: "B I L I N G U A L  E S S A Y"`)应覆盖这些占位值,使新页面继承模板示例内容。若改用 fill 语义,新页面将停留在 `'New Slide'`,用户看不到模板设计意图 —— 这是用户可见的行为回归。

3. **`mergeDefaults` 的 fill 语义也是必需的**。其 target 是 `currentPage`(L291),即用户已编辑的页面;切换模板时若用直接覆盖,模板 `defaultData` 会抹掉用户已输入的 `title`、`paragraph` 等。fill 语义保留用户编辑。

4. **`createProject` 在 `getDefaultPage` 之后再覆盖 `title`**(L200:`{ ...getDefaultPage(...), title: 'PLACEHOLDER_FOR_NEW_PROJECT' }`)。即占位标题在 `getDefaultPage` 内部被模板 `defaultData.title` 覆盖,又在 `createProject` 外部被 `'PLACEHOLDER_FOR_NEW_PROJECT'` 覆盖。`EditorPage.tsx#L285-L286` 进一步在 `modalMode === 'create'` 且首页为占位时把 title 改回 `'New Slide'`。这条链路依赖 `getDefaultPage` 用直接覆盖让模板示例内容先填入,再由外层按需覆写 title。

5. **`addPage` 的调用点**(`useStore.ts#L459-L475`)在 `getDefaultPage` 之后用当前全局 `theme`/`counterStyle` 覆盖 `backgroundColor`/`accentColor`/`titleFont`/`bodyFont`/`counterStyle`(L466-L473)。这条链路同样依赖 `getDefaultPage` 先填入模板示例,再由 `addPage` 覆写全局样式字段。

6. **现有测试不约束合并语义**:`useStore.test.ts#L78-L86` 的 `addPage` 断言仅检查 `layoutId` 与 `aspectRatio`,不检查 `title` 是否被模板 `defaultData` 覆盖;`createProject` 测试(L377-L401)只检查 `pages.length >= 1` 与 `currentPageIndex`;`EditorPage.test.tsx` 中 `updatePage`/`addPage` 均被 `vi.fn()` mock(L137-L138),不触达 `mergeDefaults`。`bilingual.test.ts#L38-L55` 只读 `tpl.defaultData` 的存在性,不涉及合并行为。

## 根因

1. **语义分叉未被显式表达**:`getDefaultPage`(新建场景,base 是占位值)与 `mergeDefaults`(切换场景,base 是用户编辑)对 `defaultData` 的覆盖策略本就不同 —— 前者需覆盖以继承模板示例,后者需 fill 以保留用户编辑。但两处实现把策略硬编码在各自函数体内,既无命名差异也无共享抽象,使"策略选择"这一关键决策隐没在重复代码中。

2. **`fields` 处理重复但无共享**:`fields` 分支两处逻辑完全相同(`field.defaultValue !== undefined && target[field.key] === undefined`),却各自手写一遍。这是报告所称"重复堆砌"的最直接证据 —— 即便 `defaultData` 语义不能统一,`fields` 至少应共享。

3. **drift 风险**:由于无共享源,若未来调整 `fields` 的 null 容忍策略或 `defaultData` 的合并语义,必须同步修改两处。`mergeDefaults` 的 `defaultData` 已含 null 容忍(`undefined || null`),`getDefaultPage` 的 `fields` 仅检查 `undefined` —— 这种细微不一致已在潜伏。

4. **`mergeDefaults` 的内联定义**:`mergeDefaults` 是 `handleFinalAction` 内的局部函数(L262),无法被其他入口(如未来的批量切换模板、模板预设恢复)复用。任何新的"应用模板默认值"入口都会再写第三遍。

## 解决方案

### 决策原则

- 不保留向后兼容:直接替换两处内联逻辑,不为旧实现留 shim。
- 最简实现:单一函数 + 显式 `mode` 参数,表达"新建覆盖"与"切换 fill"两种语义。不拆成两个函数,因为 `fields` 分支两处本就一致,共用一份即可消除重复;`defaultData` 的语义差异通过参数显式表达,比两个名字相近的函数更不易误用。
- 不投机抽象:不引入"默认值优先级"配置、不引入"字段级覆盖策略"映射表。`mode` 只有两个枚举值,覆盖当前所有调用场景。
- 不破坏现有测试:`useStore.test.ts`/`EditorPage.test.tsx`/`bilingual.test.ts` 的断言均不约束合并后的具体字段值(见事实核对第 6 条),统一函数保持两处原语义即可零回归。
- 遵从 `~/.claude/CLAUDE.md`:禁止 emoji;注释遵从 `AGENTS.md` 不中英混写。

### 语义选择

`defaultData` 采用双模式:

| 模式 | 行为 | 调用场景 |
|---|---|---|
| `'override'` | 无条件写入 `defaultData` 的所有键(等价 `Object.assign`) | `getDefaultPage`:base 是程序占位值,需被模板示例覆盖 |
| `'fill'`(默认) | 仅当目标字段为 `undefined` 或 `null` 时写入 | `mergeDefaults`:base 是用户编辑,需保留 |

`fields.defaultValue` 始终用 fill 语义(只检查 `=== undefined`),与两处原实现一致 —— `fields.defaultValue` 是字段级 fallback,优先级低于 `defaultData`(模板级)与已存在的值。两处原实现在此分支本就一致,统一为单一实现后零回归。

### 新增文件:`src/utils/templateDefaults.ts`

```typescript
import type { PageData } from '../types';
import type { TemplateConfig } from '../templates/registry';

/** 默认值合并策略:override 用于新建页面覆盖占位值,fill 用于切换模板时保留用户编辑 */
export type DefaultsMergeMode = 'fill' | 'override';

/**
 * 将模板默认值合并到目标页面。
 * defaultData 按 mode 决定覆盖策略;fields.defaultValue 始终用 fill 语义,
 * 作为字段级 fallback,不覆盖 defaultData 已填入的值或目标已有值。
 */
export function applyTemplateDefaults<T extends Partial<PageData>>(
  target: T,
  templateConfig: TemplateConfig | undefined | null,
  mode: DefaultsMergeMode = 'fill',
): T {
  if (!templateConfig) return target;
  const merged = { ...target };

  if (templateConfig.defaultData) {
    for (const [k, v] of Object.entries(templateConfig.defaultData)) {
      const current = (merged as any)[k];
      const isEmpty = current === undefined || current === null;
      if (mode === 'override' || isEmpty) {
        (merged as any)[k] = v;
      }
    }
  }

  if (templateConfig.fields) {
    for (const field of templateConfig.fields) {
      if (field.defaultValue === undefined) continue;
      if ((merged as any)[field.key] === undefined) {
        (merged as any)[field.key] = field.defaultValue;
      }
    }
  }

  return merged;
}
```

### 落地点 1:`src/store/useStore.ts`

删除 `getDefaultPage` 内 L38-L50 的两段内联合并逻辑,改为调用 `applyTemplateDefaults(base, templateConfig, 'override')`。base 构造(L21-L36)不变。

```typescript
import { applyTemplateDefaults } from '../utils/templateDefaults';

const getDefaultPage = (ratio: AspectRatioType, layoutId: string, templateConfig?: any): PageData => {
  const base: PageData = {
    id: `slide-${crypto.randomUUID()}`,
    type: layoutId === 'freeform' ? 'freeform' : 'slide',
    layoutId: layoutId as any,
    aspectRatio: ratio,
    title: 'New Slide',
    subtitle: 'Created with SlideGrid Studio',
    backgroundColor: DEFAULT_THEME.colors.background,
    accentColor: DEFAULT_THEME.colors.accent,
    titleFont: DEFAULT_THEME.typography.headingFont,
    bodyFont: DEFAULT_THEME.typography.bodyFont,
    counterStyle: 'number',
    visibility: { logo: true },
    freeformItems: [],
    freeformConfig: { gridSize: 20, snapToGrid: true, showGridOverlay: false, showAlignmentGuides: true }
  };

  // 新建页面:模板示例内容覆盖占位值,使用 override 语义
  return applyTemplateDefaults(base, templateConfig, 'override');
};
```

行为等价性:`override` 模式下 `defaultData` 无条件写入,与原 `Object.assign(base, templateConfig.defaultData)` 等价(包括 `defaultData` 中值为 `undefined` 的键也会写入,与 `Object.assign` 一致)。`fields` 分支保持 `=== undefined` 检查,与原实现一致。零回归。

### 落地点 2:`src/pages/EditorPage.tsx`

将 `mergeDefaults`(L262-L283)内联的 `defaultData`/`fields` 合并逻辑替换为 `applyTemplateDefaults(merged, templateConfig, 'fill')`。`layoutId`/`aspectRatio` 的强制覆盖(L265-L267)保留在 `mergeDefaults` 内,不进入统一函数 —— 它是切换模板入口的结构性需求,不属于"默认值合并"语义。

```typescript
import { applyTemplateDefaults } from '../utils/templateDefaults';

const handleFinalAction = (layoutId: string) => {
  const templateConfig = getTemplateById(layoutId);
  const mergeDefaults = (target: PageData): PageData => {
    // 切换模板:结构字段强制更新,内容字段仅在新页面缺省时填入,保留用户编辑
    const merged: PageData = {
      ...target,
      layoutId: layoutId as any,
      aspectRatio: selectedRatio,
    };
    return applyTemplateDefaults(merged, templateConfig, 'fill');
  };
  // ...后续 if/else 分支不变
};
```

行为等价性:`fill` 模式下 `defaultData` 仅在 `undefined || null` 时写入,与原 L270 一致。`fields` 分支保持 `=== undefined` 检查,与原 L277 一致。零回归。

### 不做的事

- **不把 `layoutId`/`aspectRatio` 强制覆盖纳入 `applyTemplateDefaults`**:这是 `EditorPage` 切换模板入口的独有需求,`getDefaultPage` 不需要(`base` 已含 `layoutId`/`aspectRatio`)。塞进统一函数会迫使 `getDefaultPage` 传入空 `forceFields` 或接受不需要的覆盖,违反最简实现。
- **不拆成 `applyTemplateDefaultsFill` 与 `applyTemplateDefaultsOverride` 两个函数**:`fields` 分支两处完全一致,共用一份是消除重复的核心;`defaultData` 的差异通过参数表达,比两个名字相近的函数更不易误调。
- **不引入 `null` 容忍到 `fields` 分支**:两处原实现都只检查 `undefined`,统一函数保持一致。若未来需要 null 容忍,是独立的语义增强,不在本节推进。
- **不改 `getDefaultPage` 的 `templateConfig?: any` 参数类型**:改类型会牵动三个调用点(`createProject` L196、`loadProject` L267、`addPage` 隐式传 undefined)的类型推断,超出本节范围。`any` 传入 `TemplateConfig | undefined | null` 形参 TypeScript 接受,无类型错误。

## Before / After

### Before

```
src/store/useStore.ts
  getDefaultPage (L20-L53)
    ├─ base 构造
    ├─ if (templateConfig?.defaultData) Object.assign(base, ...)     // override 语义,内联
    └─ if (templateConfig?.fields) forEach ... base[key]===undefined // fill 语义,内联

src/pages/EditorPage.tsx
  handleFinalAction > mergeDefaults (L262-L283)
    ├─ merged = { ...target, layoutId, aspectRatio }                 // 结构强制覆盖
    ├─ if (templateConfig?.defaultData) for ... merged[k]===undefined||null  // fill 语义,内联
    └─ if (templateConfig?.fields) forEach ... merged[key]===undefined      // fill 语义,内联

两处 defaultData 合并语义不同(Object.assign vs fill),fields 合并语义相同但各写一遍。
```

### After

```
src/utils/templateDefaults.ts
  applyTemplateDefaults(target, templateConfig, mode)              // 单一实现
    ├─ defaultData: mode==='override' ? 无条件写入 : 仅 undefined/null 写入
    └─ fields: 始终仅 undefined 写入

src/store/useStore.ts
  getDefaultPage (L20-L40 附近)
    ├─ base 构造
    └─ return applyTemplateDefaults(base, templateConfig, 'override')

src/pages/EditorPage.tsx
  handleFinalAction > mergeDefaults
    ├─ merged = { ...target, layoutId, aspectRatio }               // 结构强制覆盖,留在调用点
    └─ return applyTemplateDefaults(merged, templateConfig, 'fill')

defaultData 语义差异通过 mode 参数显式表达;fields 逻辑共享单一实现。
```

效果:

- `defaultData` 与 `fields` 的合并逻辑集中到 `src/utils/templateDefaults.ts` 一处,`getDefaultPage` 与 `mergeDefaults` 各自只剩构造 base 与强制结构字段的职责,关注点分离。
- 两处语义选择(`'override'` vs `'fill'`)在调用点显式标注,后续维护者一眼可见"新建覆盖、切换保留"的决策。
- `mergeDefaults` 从 `handleFinalAction` 的局部函数变为对 `applyTemplateDefaults` 的一行封装,未来新的"应用模板默认值"入口可直接复用 `applyTemplateDefaults`。
- `fields` 分支从两份实现收敛为一份,消除 drift 风险。

## 风险与回滚

### 风险

1. **`override` 模式与 `Object.assign` 的边界差异(低)**:`Object.assign` 会复制 `defaultData` 中**自身**值为 `undefined` 的键(把 base 已定义值覆盖为 undefined);`override` 模式的实现 `mode === 'override' || isEmpty` 在 `v === undefined` 时仍会写入(`(merged as any)[k] = v` 即赋 undefined),行为等价。**缓解**:已逐字段对照,无差异;`useStore.test.ts#L78-L86` 的 `addPage` 断言不检查被覆盖字段,即使有差异也不触发测试失败,但人工回归仍需验证新建页面能显示模板示例内容(见验证方式第 5 条)。

2. **`mergeDefaults` 调用顺序变更(低)**:原实现先 `{ ...target, layoutId, aspectRatio }` 再合并 `defaultData`;新实现顺序一致(`merged` 先构造再传入 `applyTemplateDefaults`)。`layoutId`/`aspectRatio` 已在 `merged` 中定义为非空值,`fill` 模式不会再用 `defaultData` 覆盖它们 —— 与原行为一致。**缓解**:行为等价,无需额外缓解。

3. **`applyTemplateDefaults` 的类型签名与 `templateConfig?: any`(低)**:`getDefaultPage` 的 `templateConfig` 是 `any`,传入 `TemplateConfig | undefined | null` 形参 TypeScript 接受。但 `templateConfig.fields` 在 `any` 上是 `any`,`for...of` 遍历 `any` 会触发 `@typescript-eslint/no-unsafe-iteration` 类规则(取决于 lint 配置)。**缓解**:落地后 `pnpm lint` 兜底;若触发告警,在 `getDefaultPage` 内将 `templateConfig` 显式窄化为 `TemplateConfig | undefined`(仅类型标注,不改运行时),或在调用点 `applyTemplateDefaults(base, templateConfig as TemplateConfig | undefined, 'override')`。

4. **未来第三处入口复用时的语义误用(低)**:新调用方可能误选 `mode`。**缓解**:`mode` 命名(`'fill'`/`'override'`)与 JSDoc 已标注场景;code review 时核对调用方是"新建"还是"切换"。

### 回滚

回滚 = 反向操作,代价低:

1. `git revert` 本次提交,恢复 `getDefaultPage` 与 `mergeDefaults` 的内联实现。
2. 删除 `src/utils/templateDefaults.ts`(或保留为独立工具,因其无其他消费方)。
3. `applyTemplateDefaults` 不触达任何外部 API,回滚不影响调用方契约。

## 验证方式

1. **类型检查**:在仓库根执行 `npx tsc --noEmit`。通过即证明 `applyTemplateDefaults` 的类型签名与两处调用点(`useStore.ts`、`EditorPage.tsx`)兼容,`templateConfig?: any` 传入形参无类型错误。

2. **单元测试**:执行 `pnpm test:unit:run`。重点:
   - `src/store/__tests__/useStore.test.ts`:`addPage` 用例(L78-L86)检查 `layoutId`/`aspectRatio`;`createProject` 用例(L377-L401)检查 `pages.length` 与 `currentPageIndex`。两处均不约束 `title` 等被 `defaultData` 覆盖的字段,`'override'` 模式零回归。
   - `src/pages/__tests__/EditorPage.test.tsx`:`updatePage`/`addPage` 被 mock,`mergeDefaults` 不被实际执行,`'fill'` 模式零回归。
   - `src/templates/schemas/__tests__/bilingual.test.ts`:仅读 `tpl.defaultData` 存在性,不涉及合并,零回归。

3. **Lint**:执行 `pnpm lint` 确认 `src/utils/templateDefaults.ts` 无未使用 import、无中英混写注释、无 `no-unsafe-iteration` 告警(见风险第 3 条)。

4. **构建**:执行 `pnpm build` 确认 Vite 打包无路径解析报错。

5. **人工核对(关键)**:由于现有测试不约束 `defaultData` 覆盖后的具体字段值,必须人工验证两入口的实际行为:
   - **新建入口**:启动应用,通过 `createProject` 或 `addPage` 创建一个 `bilingual-cover` 模板页面,确认 `title` 显示为 `"B I L I N G U A L  E S S A Y"`(模板示例内容)而非 `'New Slide'`(占位值)—— 证明 `'override'` 模式生效。
   - **切换入口**:在已有页面上输入自定义 `title`(如 `"My Title"`),通过 `handleFinalAction` 切换到 `bilingual-cover` 模板,确认 `title` 仍为 `"My Title"` 而非被 `"B I L I N G U A L  E S S A Y"` 覆盖 —— 证明 `'fill'` 模式生效。
   - **结构字段**:切换模板后确认 `layoutId` 与 `aspectRatio` 更新为新模板的值(被 `mergeDefaults` 内的强制覆盖更新,而非被 `applyTemplateDefaults` 处理)。
