# 6.2 PageData 索引签名

## 事实核对

报告对问题定性准确，但行号与规模描述需校正：

1. **`PageData` 行号漂移**：报告标注 `src/types.ts#L171-L270`，实际 `PageData` 定义在 `L199-L280`。报告起点 `L171` 落在 `FieldSchema.defaultValue` 的 JSDoc 内，终点 `L270` 漏掉 `freeformItems` / `freeformConfig`（`L271-L279`）。不影响问题定位，但建议后续修订以 `L199-L280` 为准。

2. **两处点名行号属实**：
   - `src/components/editor/fields/GenericTextField.tsx#L49`：`const value = ((page as any)[fieldKey] as string) || '';` 精确命中。
   - `src/components/ui/slide/atoms/ZineDisplay.tsx#L45`：`const defaultFallback = text || (fieldKey ? (page as any)[fieldKey] : page.title);` 精确命中。

3. **规模核对**：`grep "\(page as any)\[" src/` 命中 **23 处**，分布在 9 个源文件：

   | 文件 | 命中数 | 行号 |
   |------|--------|------|
   | `src/components/editor/fields/ImageField.tsx` | 13 | L36, L39×2, L68, L98, L106, L109, L119, L130, L146×2, L155, L165 |
   | `src/components/editor/fields/GenericTextField.tsx` | 1 | L49 |
   | `src/components/editor/fields/GenericNumberField.tsx` | 2 | L20, L23 |
   | `src/components/editor/fields/ArtFontField.tsx` | 1 | L17 |
   | `src/components/ui/slide/hooks/useDataConnector.ts` | 2 | L26, L38 |
   | `src/components/ui/slide/atoms/ZineBody.tsx` | 1 | L43 |
   | `src/components/ui/slide/atoms/ZineCaption.tsx` | 1 | L43 |
   | `src/components/ui/slide/atoms/ZineDisplay.tsx` | 1 | L45 |
   | `src/components/ui/slide/atoms/ZineVocabList.tsx` | 1 | L47 |

   `ImageField.tsx` 一家占 13/23，是重灾区——`fieldKey` 与 `configKey`（如 `imageConfig` / `signatureConfig`）两类动态键交织。

4. **报告「在所有编辑字段组件中」描述偏窄**：实际波及面不止编辑字段组件，还包含 `useDataConnector`（slide 渲染 hook）与 `ZineBody` / `ZineCaption` / `ZineVocabList`（slide 原子组件）。这 5 处不是编辑器专用，是渲染层共享的数据接入点。方案需同步覆盖，否则只清理编辑器侧会留下渲染层的 `as any` 残留。

5. **测试文件不在本节范围**：`src/utils/migrations/__tests__/v2-to-v3.edgecase.test.ts` 也出现 `(page as any)`，但用的是点访问（`(page as any).layout` / `(page as any).schemaNode`），不是本节的 `[key]` 动态索引模式——它读的是 V2 历史字段，属于迁移测试 fixture 的合法 `as any`，遵从 6.1 方案对测试目录保留 `warn` 的策略。本方案不动测试文件。

6. **报告「优雅解法」成立但需补一笔 tradeoff**：`PageData extends Record<string, unknown>` 会让 `PageData` 变为「开放类型」，对象字面量构造时不再做 excess property checking。对本仓库影响有限（`PageData` 几乎不从字面量构造，走 `getDefaultPage` 或 JSON 载入），但需在风险节显式声明。更重要的副作用：`keyof PageData` 从「具体字面量联合」退化为 `string | number`，会击穿 `src/constants/fields.ts` 的 `GLOBAL_FIELDS: Array<keyof PageData>` 类型安全——这一点报告未提，下方根因与风险节展开。

## 根因

`PageData` 是一个事实上的动态数据袋（dynamic data bag）：

- 模板通过 `TemplateConfig.fields` 声明任意 `FieldType` 字段，`getDefaultPage` 按字段表批量赋值；
- 编辑器与渲染层通过 `fieldKey: string`（运行时字符串，非字面量）读取字段值；
- 工程数据从 JSON 载入，字段集合随模板扩展而增长。

但 `PageData` 的类型声明只列了固定字段，**没有声明如何处理动态字符串键访问**。当调用方写 `page[fieldKey]`（`fieldKey: string`）时，TypeScript 无法把 `string` 解析到某个声明成员，编译报错；开发者被迫用 `(page as any)[fieldKey]` 绕过。这是「类型契约缺失」导致的逃逸，不是单纯怠惰——23 处逃逸集中在 9 个文件，模式高度一致，都是同一个类型缺口的投影。

报告把根因归为「没有约束动态字段访问的索引签名」，准确。补索引签名是把「动态数据袋」这个事实在类型层显式化，让 `page[stringKey]` 合法返回 `unknown`，调用方再做受控窄化。

**与 `GLOBAL_FIELDS` 的耦合**：`src/constants/fields.ts#L8` 把 `GLOBAL_FIELDS` 标为 `Array<keyof PageData>`，依赖 `keyof PageData` 是「具体字面量联合」来做拼写校验。一旦 `PageData` 加索引签名，`keyof PageData` 退化为 `string | number`，`GLOBAL_FIELDS` 的拼写校验失效。这是索引签名的连带代价，需要同步处理（见解决方案步骤 3）。

## 解决方案

核心是给 `PageData` 补索引签名，让动态键访问合法化；再用一个受控辅助函数收敛 `|| fallback` / `?? fallback` 模式中的 `as T` 断言，避免 23 处各自窄化。

### 设计原则（遵从 `~/.claude/CLAUDE.md`）

- **不保留向后兼容**：直接修改 `PageData` 与全部 23 处调用点，不保留 `(page as any)[key]` 兼容层。
- **最简实现**：能用索引签名一行解决的就不引入泛型抽象；辅助函数只做 nullish 兜底与 `as T` 收口，不做运行时类型守卫（守卫属推测性抽象，调用方需要时自行内联）。
- **分层治理**：先补类型（步骤 1）→ 再加辅助（步骤 2）→ 最后清调用点（步骤 3-4）。先补类型后清调用点，否则清理后的调用点会因类型未补而暴露新编译错误。
- **不破坏现有测试**：`pnpm test:unit:run` 全绿，行为不变。

### 步骤 1：`PageData` 补索引签名

`src/types.ts#L199` 当前：

```ts
export interface PageData {
  id: string;
  type: 'slide' | 'freeform';
  // ...
}
```

改为：

```ts
export interface PageData extends Record<string, unknown> {
  id: string;
  type: 'slide' | 'freeform';
  // 其余字段保持不变
}
```

一行 `extends Record<string, unknown>` 让 `page[stringKey]` 合法返回 `unknown`。显式声明的成员（`id` / `title` / `layoutId` 等）仍保留各自的具体类型——TypeScript 在显式成员与索引签名并存时优先返回显式成员类型，`page.title` 仍是 `string`，不会降级为 `unknown`。

### 步骤 2：`getPageField<T>` 辅助函数

新建 `src/utils/pageField.ts`：

```ts
import type { PageData } from '../types';

/**
 * 动态字段读取：在 PageData 索引签名之上收敛 (page as any)[key] 逃逸。
 * 仅做 nullish 兜底，不做运行时类型守卫；T 由调用方保证与实际值类型一致。
 */
export function getPageField<T>(page: PageData, key: string, fallback: T): T {
  const v: unknown = page[key];
  return (v !== undefined && v !== null ? v : fallback) as T;
}
```

要点：

- `page[key]` 依赖步骤 1 的索引签名返回 `unknown`，函数内一次性 `as T` 收口，调用方不再散落 `as any` / `as string`。
- nullish 语义（`!== undefined && !== null`）覆盖现有 `?? fallback` 与 `|| fallback` 两种用法——对所有字符串字段（`''` / `undefined` 同兜底）与数值字段（`0` 不兜底，与 `?? 50` 一致）行为均与现状一致，见 Before/After 推导。
- **不做运行时类型守卫**：曾考虑加 `guard?: (v: unknown) => v is T` 参数，但 9 个调用点无一处需要运行时校验，属于推测性抽象，按 CLAUDE.md 删除。若后续确有运行时安全需求，调用方自行内联 `typeof page[key] === 'string'` 即可。

### 步骤 3：`GLOBAL_FIELDS` 类型加固

`src/constants/fields.ts#L8` 当前 `Array<keyof PageData>` 在索引签名加入后退化为 `(string | number)[]`，拼写错误不再报错。改为显式字面量联合：

```ts
const GLOBAL_FIELD_KEYS = [
  'counterStyle', 'counterColor', 'backgroundPattern', 'footer',
  'titleFont', 'bodyFont', 'logo', 'logoSize', 'accentColor', 'pageNumber'
] as const;

export type GlobalField = typeof GLOBAL_FIELD_KEYS[number];

// @lat: [[constants#Global Fields]]
export const GLOBAL_FIELDS: GlobalField[] = [...GLOBAL_FIELD_KEYS];
```

`GlobalField` 是独立于 `keyof PageData` 的字面量联合，不受索引签名影响。`useStore.ts#L398` 的 `GLOBAL_FIELDS.forEach(f => ...)` 中 `f` 仍是 `'counterStyle' | ...` 窄联合，下游 `updatedPage[f]` / `globalUpdates[f] = val` 借助索引签名合法化，且键类型仍受 `GlobalField` 约束。

### 步骤 4：清理 23 处调用点

按模式分组替换：

**模式 A：字符串字段 `((page as any)[key] as string) || ''`**

```ts
// Before
const value = ((page as any)[fieldKey] as string) || '';
// After
const value = getPageField<string>(page, fieldKey, '');
```

适用于 `GenericTextField.tsx#L49`、`ArtFontField.tsx#L17`、`ImageField.tsx#L98/L106/L109/L119/L130`。行为不变：值非 nullish 时原样返回，nullish 时回退 `''`；空串 `''` 在下游真值判断（`value ? 'Change Source' : 'Browse Library'`）中与现状一致。

**模式 B：数值字段 `(page as any)[key] ?? 50`**

```ts
// Before
const [localValue, setLocalValue] = useState<number>((page as any)[fieldKey] ?? 50);
// After
const [localValue, setLocalValue] = useState<number>(getPageField<number>(page, fieldKey, 50));
```

适用于 `GenericNumberField.tsx#L20/L23`。行为不变：辅助函数 nullish 兜底等价 `?? 50`；`0` 不触发兜底，与 `??` 语义一致。

**模式 C：嵌套对象访问 `(page as any)[configKey]?.scale`**

```ts
// Before (ImageField.tsx#L39)
const currentScale = (page as any)[configKey]?.scale !== undefined
  ? (page as any)[configKey].scale : 1;
// After
import type { ImageConfig } from '../../../types';
const imageConfig = getPageField<ImageConfig | undefined>(page, configKey, undefined);
const currentScale = imageConfig?.scale ?? 1;
```

`ImageConfig` 已存在于 `src/types.ts#L95-L99`（`{ scale: number; x: number; y: number }`），直接复用，不新增类型。同模式处理 `L68`（`currentConfig`）、`L146/L155/L165`（`scale` / `x` / `y` 滑块）。

**模式 D：原始读取（不兜底，交给下游判定）**

`useDataConnector.ts#L26`：

```ts
// Before
const pageVal = fieldKey ? (page as any)[fieldKey] : undefined;
// After
const pageVal = fieldKey ? page[fieldKey] : undefined;
```

索引签名让 `page[fieldKey]` 直接返回 `unknown`，无需辅助函数。下游 `pageVal !== undefined && pageVal !== null && pageVal !== ''` 判定在 `unknown` 上完全合法，行为不变。`useDataConnector.ts#L38` 的 useMemo 依赖项 `(page as any)?.[fieldKey]` 同步改为 `page[fieldKey]`。

`ZineDisplay.tsx#L45` / `ZineBody.tsx#L43` / `ZineCaption.tsx#L43` / `ZineVocabList.tsx#L47`：

```ts
// Before
const defaultFallback = text || (fieldKey ? (page as any)[fieldKey] : page.title);
// After
const defaultFallback = text || (fieldKey ? page[fieldKey] : page.title);
```

`defaultFallback` 类型从 `any` 变为 `string | unknown`，传入 `useDataConnector<T = any>` 的 `fallbackContent: T` 兼容。行为不变：`useDataConnector` 内部仍以 `pageVal !== '' ? pageVal : fallbackContent` 决定最终内容，`page[fieldKey]` 的 `unknown` 值与原 `any` 值在判等比较中行为一致。

### 与 6.1 协同

本方案与 `21-any-type-escape.md` 存在两处耦合，落地顺序固定为 **6.2 先、6.1 后**：

1. **6.1 阶段 1.2（`getDefaultPage` 写入侧）依赖 6.2 索引签名**。`useStore.ts#L45-L47` 的 `(base as any)[field.key] = field.defaultValue`，在 `PageData` 加索引签名后可直接写为 `base[field.key as keyof PageData] = field.defaultValue`（写入目标类型为索引签名的 `unknown`，接受任意值）。6.1 方案在风险节已声明此依赖。6.1 阶段 2.3 的 `useStore.ts#L399-L401`（`(updatedPage as any)[f]` / `(globalUpdates as any)[f] = val`）同样依赖本方案的索引签名才可清理为 `updatedPage[f]` / `globalUpdates[f] = val`。本方案步骤 3 的 `GlobalField` 联合与 6.1 的 `field: FieldSchema` 收窄可并行，不冲突。

2. **6.1 阶段 1.4（`Record<string, any>` → `Record<string, unknown>`）独立可并行**。`PageData.styleOverrides` / `mosaic` / `gallery` 的元素类型从 `any` 收紧为 `unknown` 与本方案无依赖：索引签名不影响显式成员的类型声明。两节谁先落地均可。

3. **6.1 阶段 1.1（删除 `TemplateConfig.component`）独立**，与本方案无交互。

实施建议：本方案与 6.1 阶段 1.2 / 2.3 同 PR 落地，避免中间态出现「索引签名已加但 `useStore` 仍写 `(base as any)`」的反复。

## Before / After

### GenericTextField.tsx（字符串字段兜底）

Before：

```tsx
const value = ((page as any)[fieldKey] as string) || '';
```

After：

```tsx
import { getPageField } from '../../../utils/pageField';
// ...
const value = getPageField<string>(page, fieldKey, '');
```

### GenericNumberField.tsx（数值字段兜底）

Before：

```tsx
const [localValue, setLocalValue] = useState<number>((page as any)[fieldKey] ?? 50);
useEffect(() => {
  const val = (page as any)[fieldKey] ?? 50;
  setLocalValue(val);
}, [page, fieldKey]);
```

After：

```tsx
import { getPageField } from '../../../utils/pageField';
// ...
const [localValue, setLocalValue] = useState<number>(getPageField<number>(page, fieldKey, 50));
useEffect(() => {
  setLocalValue(getPageField<number>(page, fieldKey, 50));
}, [page, fieldKey]);
```

### ImageField.tsx（嵌套对象访问）

Before：

```tsx
const currentScale = (page as any)[configKey]?.scale !== undefined
  ? (page as any)[configKey].scale : 1;
// ...
const currentConfig = (page as any)[configKey] || { scale: 1, x: 0, y: 0 };
// ...
<Slider
  label="Scale"
  value={(page as any)[configKey]?.scale !== undefined ? (page as any)[configKey].scale : 1}
  min={1} max={3} step={0.05}
  onChange={(v) => handleConfigChange('scale', v, true)}
/>
```

After：

```tsx
import { getPageField } from '../../../utils/pageField';
import type { ImageConfig } from '../../../types';
// ...
const imageConfig = getPageField<ImageConfig | undefined>(page, configKey, undefined);
const currentScale = imageConfig?.scale ?? 1;
// ...
const currentConfig = getPageField<ImageConfig>(page, configKey, { scale: 1, x: 0, y: 0 });
// ...
<Slider
  label="Scale"
  value={imageConfig?.scale ?? 1}
  min={1} max={3} step={0.05}
  onChange={(v) => handleConfigChange('scale', v, true)}
/>
```

`L36` 的 `useAssetUrl((page as any)[fieldKey])` 改为 `useAssetUrl(getPageField<string | undefined>(page, fieldKey, undefined))`——`useAssetUrl` 入参类型为 `string | undefined`，原代码传 `any`（可能含 `null` / 对象）被 TS 放过，新写法把 nullish 兜成 `undefined` 后传入，类型与运行时都对齐。空串 `''` 仍按原样传入（`getPageField` 不兜空串，与 `useAssetUrl` 内 `if (!assetSource)` 的 falsy 判定一致）。`src/components/editor/fields/__tests__/ImageField.test.tsx#L34-L39` 的 mock 按真值返回 url，`basePage`（无 `image` 字段）走 `undefined` 兜底返回 `undefined` url，`pageWithImage` 返回真值 url，断言不变）。

### useDataConnector.ts（原始读取 + 空串判定）

Before：

```ts
const pageVal = fieldKey ? (page as any)[fieldKey] : undefined;
const content = pageVal !== undefined && pageVal !== null && pageVal !== '' ? pageVal : fallbackContent;
// ...
}, [
  fieldKey,
  page,
  fieldKey ? (page as any)?.[fieldKey] : undefined,
  // ...
]);
```

After：

```ts
const pageVal = fieldKey ? page[fieldKey] : undefined;
const content = pageVal !== undefined && pageVal !== null && pageVal !== '' ? pageVal : fallbackContent;
// ...
}, [
  fieldKey,
  page,
  fieldKey ? page[fieldKey] : undefined,
  // ...
]);
```

### ZineDisplay.tsx（fallback 链）

Before：

```tsx
const defaultFallback = text || (fieldKey ? (page as any)[fieldKey] : page.title);
```

After：

```tsx
const defaultFallback = text || (fieldKey ? page[fieldKey] : page.title);
```

`ZineBody.tsx#L43` / `ZineCaption.tsx#L43` / `ZineVocabList.tsx#L47` 同模式替换。

### useStore.ts getDefaultPage（6.1 依赖项，本方案落地后可清理）

Before：

```ts
templateConfig.fields.forEach((field: any) => {
  if (field.defaultValue !== undefined && base[field.key as keyof PageData] === undefined) {
    (base as any)[field.key] = field.defaultValue;
  }
});
```

After：

```ts
templateConfig?.fields.forEach(field => {
  if (field.defaultValue !== undefined) {
    const key = field.key as keyof PageData;
    if (base[key] === undefined) {
      base[key] = field.defaultValue;
    }
  }
});
```

索引签名让 `base[key] = field.defaultValue`（`unknown = unknown`）合法，无需 `as any`。本块属于 6.1 阶段 1.2，建议与本方案同 PR。

### useStore.ts updatePage 全局字段同步（bonus 清理）

Before：

```ts
GLOBAL_FIELDS.forEach(f => {
  const val = (updatedPage as any)[f];
  if (val !== undefined && val !== (original as any)[f]) {
    (globalUpdates as any)[f] = val;
  }
});
```

After：

```ts
GLOBAL_FIELDS.forEach(f => {
  const val = updatedPage[f];
  if (val !== undefined && val !== original[f]) {
    globalUpdates[f] = val;
  }
});
```

`f: GlobalField`（步骤 3 的显式联合），`updatedPage[f]` / `original[f]` 借索引签名返回 `unknown`，`globalUpdates[f] = val` 写入目标为 `unknown`，合法。报告未点名这 3 处，但它们是同一逃逸模式在 store 层的投影，一并清理避免残留。

## 风险与回滚

### 风险

1. **`PageData` 开放化，对象字面量 excess property checking 失效**。加索引签名后，`const p: PageData = { id, type, layoutId, aspectRatio, title, typoField: 123 }` 不再对 `typoField` 报错。本仓库 `PageData` 几乎不从字面量构造（走 `getDefaultPage` 或 JSON 载入），影响有限。`getDefaultPage` 返回的 `base` 对象初始化仍是字面量，但其字段均来自 `templateConfig.fields` 表，无多余字段风险。

2. **`keyof PageData` 退化为 `string | number`**。击穿 `GLOBAL_FIELDS: Array<keyof PageData>` 的拼写校验。步骤 3 用独立 `GlobalField` 字面量联合补回。仓库内其余 `keyof PageData` 用法需 grep 一遍确认无类似依赖——目前已知仅 `GLOBAL_FIELDS` 与 `getDefaultPage` 的 `field.key as keyof PageData` 两处，后者是断言而非枚举，不受影响。

3. **辅助函数的 `as T` 仍是类型断言，无运行时守卫**。`getPageField<number>(page, key, 50)` 在运行时值是字符串时仍会返回字符串伪装成 `number`。这与原 `(page as any)[key] as number` 安全性等同，非回退。若后续需要运行时校验，调用方自行内联 `typeof` 守卫，不在本方案引入 `guard` 参数（遵从「避免推测性抽象」）。

4. **`ImageField.tsx#L36` 的 `useAssetUrl` 入参语义**。原 `useAssetUrl((page as any)[fieldKey])` 在 `page[fieldKey]` 为 `null` 时传 `null`，`useAssetUrl` 入参类型 `string | undefined`，传 `null` 在运行时被 `if (!assetSource)` 兜住（`null` falsy，走 `setUrl(undefined)` 分支）。改为 `getPageField<string | undefined>(page, fieldKey, undefined)` 后，`null` 会被辅助函数兜成 `undefined` 传入，行为一致。`src/components/editor/fields/__tests__/ImageField.test.tsx#L34-L39` 的 mock 按 `source ? 'data:...' : undefined` 返回，`basePage`（无 `image` 字段）与 `pageWithImage` 均覆盖，断言不变。

5. **测试文件 `v2-to-v3.edgecase.test.ts` 不动**。其 `(page as any).layout` / `(page as any).schemaNode` 是点访问 V2 历史字段，不是本节的 `[key]` 动态索引模式。但 `PageData` 加索引签名后，`page.layout` / `page.schemaNode` 在静态类型上变为 `unknown`，测试中 `schemaNode.layout` 会因 `unknown` 无属性而报类型错误。处理：测试文件保留 `(page as any).layout` 写法（遵从 6.1 对测试目录保留 `warn` 的策略），或改为 `const schemaNode = page.schemaNode as Record<string, unknown>`。本方案不强制改测试，但需在实施时跑一次 `npx tsc --noEmit` 确认该文件不报错。

### 回滚

方案分两步独立提交，回滚粒度清晰：

- **步骤 1（索引签名）回滚**：删除 `PageData` 的 `extends Record<string, unknown>`。回滚后步骤 4 的 23 处 `page[key]` 调用会重新报「元素隐式具有 `any` 类型」编译错误，需同步回退步骤 4。`GlobalField` 联合（步骤 3）可保留——它是独立字面量联合，不依赖索引签名存在与否。
- **步骤 2（辅助函数）回滚**：删除 `src/utils/pageField.ts` 与 9 个文件的 import，调用点回退为 `(page[fieldKey] as T) || fallback` 或 `(page as any)[fieldKey]`（视步骤 1 是否同时回退）。纯加法，无数据迁移，回滚零成本。

### 不破坏现有测试的边界

- `src/store/useStore.test.ts` 的 `mockProject` fixture 构造 `PageData` 时字段均在声明成员内，索引签名不引入新约束，`partial(getDefaultPage(...))` 等断言不变。
- `src/components/ui/slide/__tests__/` 若存在 `ZineDisplay` / `useDataConnector` 快照测试，`page[fieldKey]` 与 `(page as any)[fieldKey]` 在运行时返回值完全一致（索引签名只改静态类型，不改运行时查表行为），快照不变。
- `src/utils/migrations/__tests__/v2-to-v3.edgecase.test.ts` 见风险 5，保留 `as any` 或改 `as Record<string, unknown>`，断言语义不变。

## 验证方式

1. **数量基线**：治理前记录 `grep -c "(page as any)\[" src/` 基线（23），完成后归零。

2. **类型检查**：仓库无 `typecheck` 脚本，直接跑：

   ```bash
   npx tsc --noEmit
   ```

   确认索引签名加入后无新编译错误，重点核对 `src/constants/fields.ts` 的 `GlobalField` 改动与 `useStore.ts` 的 `getDefaultPage` / `updatePage` 改动。

3. **单元测试**：

   ```bash
   pnpm test:unit:run
   ```

   全绿。重点核对 `useStore.test.ts` 的 `loadProject` / `updatePage` 用例与 `migrations/__tests__/v2-to-v3.edgecase.test.ts` 的迁移断言。

4. **Lint 逐文件**：

   ```bash
   npx eslint src/components/editor/fields/GenericTextField.tsx \
                src/components/editor/fields/GenericNumberField.tsx \
                src/components/editor/fields/ImageField.tsx \
                src/components/editor/fields/ArtFontField.tsx \
                src/components/ui/slide/hooks/useDataConnector.ts \
                src/components/ui/slide/atoms/ZineBody.tsx \
                src/components/ui/slide/atoms/ZineCaption.tsx \
                src/components/ui/slide/atoms/ZineDisplay.tsx \
                src/components/ui/slide/atoms/ZineVocabList.tsx \
                src/constants/fields.ts \
                src/store/useStore.ts
   ```

   确认上述文件 `no-explicit-any` 命中归零（`useStore.ts` 与 `fields.ts` 的清理需与 6.1 阶段 1.2 / 2.3 协同，若 6.1 未同步落地则 `useStore.ts` 仍残留 `templateConfig?: any` 等 6.1 范围内的逃逸，不在本节计数）。

5. **端到端手测**：`pnpm dev` 启动，在编辑器切换不同模板，确认 `GenericTextField` / `ImageField` / `GenericNumberField` 的字段值读取与写入正常，`ZineDisplay` / `ZineBody` 渲染不回归。重点测 `ImageField` 的 `signature` 字段（`configKey = 'signatureConfig'`，未在 `PageData` 声明，依赖索引签名才能合法读取）——这是索引签名是否真正生效的最直接验证。

6. **最终基线**：全量 `pnpm lint` 中 `(page as any)[` 计数应为 0（测试文件的 `(page as any).` 点访问不计入）。`pnpm test:unit:run && pnpm test:e2e` 全绿。
