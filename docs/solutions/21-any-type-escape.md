# 6.1 any 类型逃逸治理

## 事实核对

实际运行 `pnpm lint`（`eslint src/`）得到 613 个 problems：3 errors、610 warnings。其中 `@typescript-eslint/no-explicit-any` 为 **507 处**，与报告所写的 513 处偏差 6 处。其余规则计数与报告一致：`no-unused-vars` 实际 91（报告 94，偏差 3）、`exhaustive-deps` 9、`prefer-const` 3。总体分布与报告结论一致，数量级准确；少量漂移应是评审期间提交增量（见 `4cd3a8e`），不影响严重级别判断（Major 成立）。

3 个 errors 不属于本节范围，单列以避免混淆：`src/templates/schemas/validator.ts` 的 `no-empty` 与 `no-control-regex`（`149`/`178`/`232` 行）。这些是阻断 `pnpm lint` 退出的根因，但与 any 无关，应单独修复，不在本方案内。

报告点名的 5 个文件与实际代码逐一核对：

1. **`src/pages/Dashboard.tsx`** — 报告点名 `L22, L78, L114, L211`。实际 `no-explicit-any` 命中 9 处：`L22`（`useState<any[]>`）、`L31`（两处 `paths as any`）、`L78`（两处 sort 参数）、`L114`（`project: any`）、`L123`、`L131`、`L205`（`catch (err: any)`）、`L211`（`handleProjectClick` 入参）。报告遗漏了 `L31`、`L123`、`L131`、`L205` 四处，但点名位置均属实。报告描述「全部 project 变量均标注为 any，完全抛弃已有的 RecentProjectEntry 强类型」**属实**：`src/services/recentProjects.ts#L1-L10` 已定义 `RecentProjectEntry`，但 `Dashboard.tsx` 的 `projects` state、`handleDeleteProject`/`handleProjectClick` 入参、`refreshProjects` 内的 sort 比较器全部回退到 `any`。

2. **`src/store/useStore.ts`** — 报告点名 `L16, L20, L219`。实际命中 12 处（`L16` 两处、`L20`、`L24`、`L45`、`L47`、`L148`、`L219`、`L399-L401`、`L612`），报告点名的三处均属实。`(TEMPLATES as any[])`（`L16`）之所以存在，是因为 `src/templates/registry.ts#L24` 的 `TemplateConfig.component: React.FC<{ page: any; typography?: any }>` 已经把 `page` 标成 any，`useStore` 在 `getRatioFromTemplate` 里为了拿 `supportedRatios` 只能强转。这是类型逃逸的下游传播，不是孤立的 `as any`。

3. **`src/templates/schemas/renderer/basePropsResolver.ts`** — 报告点名 `L84`。实际命中 6 处（`L71, L73×2, L74×2, L84`）。`L84` 的 `(node as any).zIndex` 属实。但 `L71-L74` 的 `filteredStyle: any` 与 `(presetStyle as any)[p]` 是更严重的逃逸点，报告未点名。`zIndex` 已在 `BaseNode`（`src/templates/schemas/types.ts#L27`）声明为 `ZIndexDeclaration | undefined`，`L84` 完全可以无成本去掉 `as any`。

4. **`src/templates/schemas/zIndexResolver.ts`** — 报告点名 `L38, L189`。两处 `(node as any).zIndex` 属实。`BaseNode.zIndex` 已有强类型，这两处 `as any` 是冗余逃逸。

5. **`src/templates/schemas/expressionEvaluator.ts`** — 报告点名 `L6`。`EvaluationContext` 的 `[key: string]: any` 属实（`L6`）。实际命中 18 处，遍布 `parseExpression/parseTernary/.../parseMember/evaluate/hasExpression/evaluateObject` 全部解析方法。这些方法的 `any` 不是「缺乏精确 AST 节点类型推导」，而是表达式求值器天然返回联合类型（`number | string | boolean | null | undefined | object`）。报告对根因的描述偏浅：真正问题不是「缺 AST 类型」，而是没有定义 `EvaluationResult` 联合类型来收窄求值返回值。

**报告与实际不符之处**：

- 数量 513 与实际 507 存在 6 处偏差，建议后续修订报告时以实际 lint 输出为准。
- 报告将 `basePropsResolver.ts` 的问题仅归为 `L84` 的 `(node as any)`，遗漏了 `L71-L74` 的 `filteredStyle: any` 与动态属性访问链，这是该文件更核心的逃逸点（涉及 CSS 白名单过滤的类型设计）。
- 报告将 `expressionEvaluator.ts` 的根因归为「缺乏精确的 AST 节点类型推导」，不准确。求值器使用的是递归下降 tokenizer + Parser，根本没有 AST 节点对象，只有 `Token`。真实根因是求值返回值未定义联合类型，且 `EvaluationContext` 的索引签名过度宽松。

## 根因

any 逃逸在仓库中呈现三层结构，根因分别独立：

**第一层：已有强类型未被引用（怠惰逃逸）**

`RecentProjectEntry`、`BaseNode.zIndex`、`NativeProjectSummary` 等类型已存在，但调用方在写 `state`、`sort` 比较器、`(node as any).zIndex` 时直接用 `any`。这类逃逸成本最低，去掉 `as any` 即可，无需新增类型。典型样本：`Dashboard.tsx` 全部 `project` 变量、`zIndexResolver.ts#L38/L189`、`basePropsResolver.ts#L84`。

**第二层：类型设计缺口被迫逃逸（结构性逃逸）**

某些类型边界本身没有定义强类型，调用方只能 `as any` 穿过去。这是真正的根因，必须补类型：

- `TemplateConfig.component: React.FC<{ page: any; typography?: any }>`（`registry.ts#L24`）：模板组件的 props 没有强类型，导致 `useStore` 在 `getRatioFromTemplate` 里 `(TEMPLATES as any[])` 强转，并向下游 `getDefaultPage` 的 `templateConfig?: any`（`useStore.ts#L20`）传播。
- `EvaluationContext` 的 `[key: string]: any`（`expressionEvaluator.ts#L6`）：上下文允许任意键名访问，求值器内部 `this.context[token.value]` 永远是 any，整条求值链路被迫 any。
- `ComponentNode.props?: Record<string, any>` 与 `TemplateSchema.defaults?: Record<string, any>`（`schemas/types.ts#L81, L104`）：模板 props 与默认值没有约束。
- `PageData.styleOverrides?: Record<string, any>` 与 `mosaic?: Record<string, any>[]`（`types.ts#L237, L254, L256`）：动态字段容器没有约束。

**第三层：边界天然的 any（合理逃逸，需保留或收窄）**

- 表达式求值器返回值联合类型（`number | string | boolean | null | undefined | object`）：求值器本身的语义就是「计算任意表达式的值」，返回值确实可以是任意类型。这里应定义 `EvaluationResult` 联合类型，而非 `any`。
- 第三方 IPC 返回值（`native-fs.ts#L41/L78` 的 `processResponsiveImages: Promise<any>`）：Electron 主进程返回的 sharp 处理结果，类型由 sharp 库决定，可以收窄为 `Buffer | { format: string; data: Buffer }[]`。
- `catch (err: any)`：ES 规范下 catch 子句变量类型是 `unknown`，应改为 `catch (err: unknown)` 后用 `err instanceof Error` 收窄。仓库内已有混合写法（`Dashboard.tsx#L205` 用 `err: any`，`expressionEvaluator.ts#L392` 也用 `err: any`）。

## 解决方案

按「先收窄结构性逃逸 → 再清理怠惰逃逸 → 最后升级 ESLint 规则」三阶段推进。每阶段独立可落地，不破坏现有测试。

### 设计原则（遵从 ~/.claude/CLAUDE.md）

- **不保留向后兼容**：直接修改原类型与原调用点，不保留 `as any` 兼容层、不新增 migration。
- **最简实现**：能用现有类型解决的就不新增类型；必须新增时，类型定义紧贴使用点，不引入泛型抽象层。
- **不破坏现有测试**：所有改动通过 `pnpm test:unit:run` 验证，不修改测试断言。
- **分层治理**：结构性逃逸补类型在前，怠惰逃逸清理在后——否则清理后的调用点会因类型补强而暴露新的编译错误。

### 阶段 1：补强结构性类型（修复 4 个传播源）

**1.1 `TemplateConfig.component` 的 props 强类型化**

`src/templates/registry.ts#L24` 当前：

```ts
component: React.FC<{ page: any; typography?: any }>;
```

但 `component` 实际是 `() => null`（`registry.ts#L52`），从未真正渲染 `page`。模板渲染走的是 `LayoutRenderer`（`src/templates/schemas/LayoutRenderer.tsx`）基于 `schema.root` 的递归渲染，`component` 字段是历史遗留的死代码。

**核对结果**：`grep` 确认 `template.component` 仍被 `src/components/ui/TemplatePreview.tsx#L76` 作为 `schema` 缺失时的 fallback 引用：

```tsx
{template.schema ? (
  <JsonTemplateRenderer schema={template.schema} page={mockPage as any} />
) : (
  <template.component page={mockPage} />
)}
```

但 `registry.ts#L44-L65` 构造 `TEMPLATES` 时 `schema` 字段始终被赋值，`template.schema` 永远为真，`else` 分支不可达；且 `component: () => null` 即使被调用也渲染 `null`。因此该 fallback 分支本身就是死代码。

最简处理：**删除 `component` 字段**（遵从「不保留向后兼容」），同步删除 `TemplatePreview.tsx#L73-L77` 的三元 fallback，直接渲染 `<JsonTemplateRenderer schema={template.schema} page={mockPage} />`（`mockPage as any` 一并处理，见 2.1）。这会连带消除 `registry.ts#L24` 两处 `any`，并让 `useStore.ts#L16` 的 `(TEMPLATES as any[])` 失去存在理由——`TEMPLATES` 已经是 `TemplateConfig[]`，可以直接 `TEMPLATES.find(t => t.id === templateId)?.supportedRatios?.[0]`。

实施前仍需再跑一次 `pnpm test:unit:run && pnpm test:e2e` 确认没有测试用例依赖 `template.component` 的存在。

**1.2 `getDefaultPage` 的 `templateConfig` 参数收窄**

`src/store/useStore.ts#L20` 的 `templateConfig?: any` 改为 `templateConfig?: TemplateConfig`（从 `../templates/registry` 导入）。`L45` 的 `field: any` 改为 `field: FieldSchema`（从 `../types` 导入），`L47` 的 `(base as any)[field.key]` 改为受控索引写入：

```ts
const key = field.key as keyof PageData;
if (field.defaultValue !== undefined && base[key] === undefined) {
  (base[key] as unknown) = field.defaultValue;
}
```

注意：`PageData` 没有索引签名，`field.key` 是 `FieldType` 联合，部分 key 可能不在 `PageData` 字段内。`as keyof PageData` 是必要的窄化，不属于「逃逸」——`FieldType` 是 `PageData` 字段名的子集枚举，类型安全可证。

**1.3 `EvaluationContext` 索引签名收窄**

`src/templates/schemas/expressionEvaluator.ts#L3-L7` 当前：

```ts
export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  [key: string]: any;
}
```

改为：

```ts
export type EvaluationResult = number | string | boolean | null | undefined | object;

export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  index?: number;
  $parent?: Record<string, unknown>;
  [key: string]: unknown;
}
```

索引签名从 `any` 收紧为 `unknown`。求值器内部所有 `this.context[token.value]` 的读取类型变为 `unknown`，`parseMember` 的 `current` 参数从 `any` 改为 `unknown`，在每次属性访问前用类型守卫收窄：

```ts
private parseMember(current: unknown): EvaluationResult {
  while (true) {
    if (this.match('.')) {
      this.consume('.');
      const prop = this.consumeIdentifier();
      if (FORBIDDEN_PROPERTIES.has(prop)) return undefined;
      if (current == null) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[prop];
    } else if (this.match('?.')) {
      // 同上
    } else if (this.match('[')) {
      this.consume('[');
      const index = this.parseExpression();
      this.consume(']');
      if (FORBIDDEN_PROPERTIES.has(String(index))) return undefined;
      if (current == null) return undefined;
      if (!Array.isArray(current) && typeof current !== 'object') return undefined;
      current = Array.isArray(current)
        ? current[Number(index)]
        : (current as Record<string, unknown>)[String(index)];
    } else {
      break;
    }
  }
  return current as EvaluationResult;
}
```

所有 `parseXxx` 方法的返回类型从 `any` 改为 `EvaluationResult`。`evaluate`、`hasExpression`、`evaluateObject` 同步收窄。`evaluateObject` 的 `obj: any` 改为 `obj: unknown`，递归分支用类型守卫驱动。

**1.4 `ComponentNode.props` 与 `TemplateSchema.defaults` 收窄**

`src/templates/schemas/types.ts#L81` 的 `props?: Record<string, any>` 改为 `props?: Record<string, unknown>`。`L104` 的 `defaults?: Record<string, any>` 同改。这两个是模板 JSON 静态数据容器，`unknown` 是正确语义——消费方在读取时做类型守卫。

`src/types.ts#L237` 的 `styleOverrides?: Record<string, any>` 改为 `Record<string, unknown>`。`L254` 的 `mosaic?: Record<string, any>[]` 与 `L256` 的 `gallery?: Record<string, any>[]` 同改。

### 阶段 2：清理怠惰逃逸（核心数据流优先）

**2.1 `Dashboard.tsx` 全量替换 `RecentProjectEntry`**

- `L22` `useState<any[]>` → `useState<RecentProjectEntry[]>`
- `L31` `(paths as any)?.defaultWorkspace` → `paths?.defaultWorkspace`（`getAppPaths` 返回类型需补 `defaultWorkspace?: string; localWorkspace?: string`，见 2.2）
- `L78` `sort((a: any, b: any) => ...)` → `sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))`（参数类型由 `RecentProjectEntry[]` 推导）
- `L114` `handleDeleteProject = (e, project: any)` → `project: RecentProjectEntry`
- `L123/L131` `prev.filter((p: any) => ...)` → `prev.filter(p => p.id !== project.id)`
- `L205` `catch (err: any)` → `catch (err: unknown)`，`err?.message` 改为 `err instanceof Error ? err.message : String(err)`
- `L211` `handleProjectClick = async (project: any)` → `project: RecentProjectEntry`

**2.2 `native-fs.ts` 的 `getAppPaths` 返回类型补全**

`src/utils/native-fs.ts#L27` 的 `getAppPaths: () => Promise<{ userData: string; thumbnails: string }>` 缺少 `defaultWorkspace` 与 `localWorkspace` 字段，这是 `Dashboard.tsx#L31` 被迫 `as any` 的根因。补全：

```ts
getAppPaths: () => Promise<{
  userData: string;
  thumbnails: string;
  defaultWorkspace?: string;
  localWorkspace?: string;
}>;
```

`L41` 与 `L78` 的 `processResponsiveImages: Promise<any>` 收窄为 `Promise<{ format: string; data: Buffer }[]>`（按 sharp 输出实际形态；若不确定，先用 `Promise<unknown>` 作为过渡，不保留 `any`）。

**2.3 `useStore.ts` 清理**

- `L16` `(TEMPLATES as any[]).find((t: any) => t.id === templateId)` → `TEMPLATES.find(t => t.id === templateId)`（依赖 1.1 删除 `component` 字段后 `TemplateConfig` 已是干净类型）
- `L219` `let projectData: any = null` → `let projectData: ProjectData | null = null`（从 `../types` 导入 `ProjectData`）
- `L399-L401` `(updatedPage as any)[f]` 与 `(globalUpdates as any)[f]` → 用 `f as keyof PageData` 窄化（与 1.2 同模式）
- `L612` `(window as any).__SLIDEGRID_STORE__` → `(window as Window & { __SLIDEGRID_STORE__?: typeof useStore }).__SLIDEGRID_STORE__`

**2.4 模板解析器清理**

- `basePropsResolver.ts#L84` `(node as any).zIndex` → `node.zIndex`（`BaseNode.zIndex` 已有强类型）
- `zIndexResolver.ts#L38, L189` `(node as any).zIndex` → `node.zIndex`
- `basePropsResolver.ts#L71-L74` `filteredStyle: any` 与 `(presetStyle as any)[p]` → 用 `Record<string, React.CSSProperties[keyof React.CSSProperties]>` 或直接 `Partial<React.CSSProperties>`，配合 `ALLOWED_CSS_PROPERTIES` 的类型收窄。`ALLOWED_CSS_PROPERTIES` 若是 `string[]`，`(style as Record<string, unknown>)[p]` 即可。

### 阶段 3：ESLint 规则灰度升级

当前 `eslint.config.js` 已配置 `@typescript-eslint/no-explicit-any: 'warn'`。目标：分文件灰度从 `warn` 升级到 `error`，防止回退。

使用 ESLint flat config 的 `files` 覆盖语法：

```js
// 第一批：核心数据流（已清理完成的文件）
{
  files: [
    'src/pages/Dashboard.tsx',
    'src/store/useStore.ts',
    'src/services/recentProjects.ts',
    'src/templates/registry.ts',
    'src/templates/schemas/expressionEvaluator.ts',
    'src/templates/schemas/renderer/basePropsResolver.ts',
    'src/templates/schemas/zIndexResolver.ts',
    'src/templates/schemas/types.ts',
    'src/types.ts',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
},
// 第二批：模板渲染层（阶段 2.4 完成后加入）
{
  files: ['src/templates/schemas/**/*.ts', 'src/templates/schemas/**/*.tsx'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
},
// 第三批：工具层（utils/ 清理完成后加入）
{
  files: ['src/utils/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
},
// 测试文件最后批，允许 unknown 过渡
{
  files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // 测试 fixture 可保留过渡
  },
},
```

灰度策略：每完成一个文件的清理，就把该文件从 `warn` 区移入对应的 `error` 区。CI 上 `pnpm lint` 一旦在该文件触发 any 告警即 fail，防止回退。最终目标：全库 `no-explicit-any: 'error'`，仅测试目录保留 `warn`。

## Before / After

### Dashboard.tsx（核心数据流）

Before：

```tsx
const [projects, setProjects] = useState<any[]>([]);
// ...
const mergedList = Array.from(uniqueMap.values())
  .sort((a: any, b: any) => (b.lastModified || 0) - (a.lastModified || 0));
// ...
const handleDeleteProject = (e: React.MouseEvent, project: any) => {
  // ...
  setProjects(prev => prev.filter((p: any) => p.id !== project.id));
};
// ...
} catch (err: any) {
  alert('Open Failed', err?.message || 'Failed to open project file.');
}
// ...
const handleProjectClick = async (project: any) => { ... };
```

After：

```tsx
import { RecentProjectEntry } from '../services/recentProjects';
// ...
const [projects, setProjects] = useState<RecentProjectEntry[]>([]);
// ...
const mergedList = Array.from(uniqueMap.values())
  .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
// ...
const handleDeleteProject = (e: React.MouseEvent, project: RecentProjectEntry) => {
  // ...
  setProjects(prev => prev.filter(p => p.id !== project.id));
};
// ...
} catch (err: unknown) {
  alert('Open Failed', err instanceof Error ? err.message : 'Failed to open project file.');
}
// ...
const handleProjectClick = async (project: RecentProjectEntry) => { ... };
```

### useStore.ts（模板配置传播链）

Before：

```ts
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = (TEMPLATES as any[]).find((t: any) => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const getDefaultPage = (ratio: AspectRatioType, layoutId: string, templateConfig?: any): PageData => {
  // ...
  templateConfig.fields.forEach((field: any) => {
    if (field.defaultValue !== undefined && base[field.key as keyof PageData] === undefined) {
      (base as any)[field.key] = field.defaultValue;
    }
  });
};
// ...
let projectData: any = null;
```

After：

```ts
const getRatioFromTemplate = (templateId?: string | null): AspectRatioType => {
  if (!templateId) return '16:9';
  const template = TEMPLATES.find(t => t.id === templateId);
  return template?.supportedRatios?.[0] || '16:9';
};

const getDefaultPage = (
  ratio: AspectRatioType,
  layoutId: string,
  templateConfig?: TemplateConfig
): PageData => {
  // ...
  templateConfig?.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      const key = field.key as keyof PageData;
      if (base[key] === undefined) {
        (base[key] as unknown) = field.defaultValue;
      }
    }
  });
};
// ...
let projectData: ProjectData | null = null;
```

### basePropsResolver.ts（冗余逃逸清理）

Before：

```ts
const filteredStyle: any = {};
ALLOWED_CSS_PROPERTIES.forEach(p => {
  if ((presetStyle as any)[p] !== undefined) filteredStyle[p] = (presetStyle as any)[p];
  if ((finalStyle as any)[p] !== undefined) filteredStyle[p] = (finalStyle as any)[p];
});
// ...
if (resolveZIndex) {
  const declaredZIndex = (node as any).zIndex;
  finalStyle.zIndex = resolveZIndex(declaredZIndex);
}
```

After：

```ts
const filteredStyle: Partial<React.CSSProperties> = {};
const presetRecord = presetStyle as Record<string, unknown>;
const finalRecord = finalStyle as Record<string, unknown>;
ALLOWED_CSS_PROPERTIES.forEach(p => {
  if (presetRecord[p] !== undefined) (filteredStyle as Record<string, unknown>)[p] = presetRecord[p];
  if (finalRecord[p] !== undefined) (filteredStyle as Record<string, unknown>)[p] = finalRecord[p];
});
// ...
if (resolveZIndex) {
  finalStyle.zIndex = resolveZIndex(node.zIndex);
}
```

### expressionEvaluator.ts（求值返回值联合类型）

Before：

```ts
export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  [key: string]: any;
}
// ...
parseExpression(): any { ... }
parseTernary(): any { ... }
// ...
evaluate(expr: string, context: EvaluationContext): any { ... }
evaluateObject(obj: any, context: EvaluationContext, depth = 0): any { ... }
```

After：

```ts
export type EvaluationResult = number | string | boolean | null | undefined | object;

export interface EvaluationContext {
  page: PageData;
  theme: ProjectTheme;
  index?: number;
  $parent?: Record<string, unknown>;
  [key: string]: unknown;
}
// ...
parseExpression(): EvaluationResult { ... }
parseTernary(): EvaluationResult { ... }
// ...
evaluate(expr: string, context: EvaluationContext): EvaluationResult { ... }
evaluateObject(obj: unknown, context: EvaluationContext, depth = 0): unknown { ... }
```

## 风险与回滚

### 主要风险

1. **`EvaluationContext` 索引签名从 `any` 收紧为 `unknown` 会波及所有调用 `evaluator.evaluate/interpolate/evaluateObject` 的下游消费方**。已确认调用点共 8 处（`LayoutRenderer.tsx#L76/L84/L147`、`basePropsResolver.ts#L21/L22`、`componentRenderer.tsx#L33/L47`、`repeaterRenderer.tsx#L27`）。这些消费方读取求值结果时若直接用作 `string`/`number`/`React.CSSProperties`，会出现类型错误。需要在消费方用类型守卫收窄（`typeof result === 'string'`）或显式 `as string` 窄化。这是阶段 1 工作量最大的部分，建议逐文件推进：`LayoutRenderer` → `basePropsResolver` → `componentRenderer` → `repeaterRenderer`。

2. **删除 `TemplateConfig.component` 字段**（阶段 1.1）的 fallback 分支不可达：`registry.ts#L44-L65` 构造 `TEMPLATES` 时 `schema` 字段始终被赋值，`TemplatePreview.tsx#L73` 的 `template.schema ?` 三元 `else` 分支永不执行。但删除前仍需在清理后跑 `pnpm test:unit:run && pnpm test:e2e` 确认无测试用例依赖该 fallback 渲染路径。

3. **`PageData` 没有 `Record<string, unknown>` 索引签名**，`field.key as keyof PageData` 的窄化是类型断言而非类型保证。`FieldType` 联合是否完全包含于 `keyof PageData` 需要核对 `src/types.ts#L155-L161` 的 `FieldType` 定义。若存在 `FieldType` 不在 `PageData` 字段内的成员，`(base[key] as unknown) = field.defaultValue` 会在运行时写入 `PageData` 未声明的字段，与 6.2 节的索引签名治理存在交叉。建议与 6.2 方案协同，先落地 6.2 的 `PageData extends Record<string, unknown>` 索引签名，再做本节的 `field.key` 窄化。

4. **ESLint 规则升级到 `error` 后，CI 会在任何新引入的 any 上失败**。若阶段 2 清理未完全覆盖某个文件，将 `error` 区写入 `eslint.config.js` 后会阻断 `pnpm lint`。灰度顺序必须严格按「先清理、后升级」执行，不可先升规则再清理。

5. **测试文件的 `any` 治理优先级最低**。`__tests__/` 与 `*.test.tsx` 下有大量 fixture 用 `any` 模拟数据，清理成本高、收益低。阶段 3 方案保留测试目录 `warn` 级别，不强制 `error`，避免测试治理阻塞主线。

### 回滚

每阶段独立提交，回滚粒度为单阶段：

- 阶段 1 回滚：恢复 `TemplateConfig.component`、`EvaluationContext` 索引签名、`ComponentNode.props`、`TemplateSchema.defaults` 的 `any`。回滚后阶段 2 的清理仍可保留，但部分调用点会重新出现类型错误（因为底层类型回退），需要同步回退阶段 2 对应文件。
- 阶段 2 回滚：恢复各文件 `as any`。回滚后阶段 3 的 ESLint `error` 规则必须同步降回 `warn`，否则 CI 会失败。
- 阶段 3 回滚：将 `eslint.config.js` 中对应 `files` 块的 `no-explicit-any` 改回 `warn` 或删除覆盖块。纯配置改动，无代码风险。

### 不破坏现有测试的边界

- `src/services/__tests__/recentProjects.test.ts` 已使用 `RecentProjectEntry` 构造 fixture，阶段 2.1 不会破坏。
- `src/templates/schemas/__tests__/expressionEvaluator.test.ts` 与 `expressionEvaluator.edgecase.test.ts` 断言求值返回值与类型行为，阶段 1.3 改返回类型为联合类型后，测试中 `expect(evaluator.evaluate(...)).toBe(...)` 仍通过（`toBe` 接受 `unknown`）。但若有测试用 `typeof result === 'number'` 等断言，需确认联合类型不破坏。建议在阶段 1.3 完成后单独跑 `npx vitest run src/templates/schemas/__tests__/expressionEvaluator` 验证。
- `src/store/useStore.test.ts` 若断言了 `projectData` 的具体类型，阶段 2.3 的 `ProjectData | null` 改动可能触发类型错误。需在该测试文件内同步收窄 fixture 类型，但不修改断言语义。

## 验证方式

1. **数量基线**：治理前先记录 `pnpm lint 2>&1 | grep -c "no-explicit-any"` 的当前基线（507），每完成一个阶段重新统计，确认数量按预期下降。

2. **阶段 1 验证**：
   ```bash
   # 确认删除 component 字段后无渲染回归
   pnpm test:unit:run
   pnpm test:e2e
   # 确认 EvaluationContext 收紧后下游编译通过
   npx tsc --noEmit
   ```

3. **阶段 2 验证**：逐文件清理后跑：
   ```bash
   npx eslint <file> # 确认该文件 no-explicit-any = 0
   npx vitest run <对应测试文件> # 确认行为不变
   ```

4. **阶段 3 验证**：每加入一个 `error` 区后：
   ```bash
   pnpm lint # 确认对应文件无 any 残留，CI 通过
   ```

5. **最终基线**：全量 `pnpm lint` 输出中 `no-explicit-any` 计数应趋近 0（测试目录保留 `warn` 级别，允许少量残留）。`pnpm test:unit:run && pnpm test:e2e` 全绿。

6. **类型检查**：仓库当前没有 `typecheck` 脚本，建议补一条 `npx tsc --noEmit` 作为 CI gate，确保 any 收窄后没有引入新的类型错误。这不在本方案范围内，但是 any 治理的必要前置——否则 `as any` 删除后编译错误会被 `vite build` 的 esbuild 容忍，却在运行时爆出。
