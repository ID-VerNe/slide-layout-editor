# 6.3 外部输入 Zod 校验

## 事实核对

报告对问题点的定性基本属实，但有两处描述需要校正，避免后续实施走偏：

1. **「已实现一整套校验逻辑」说法误导**。`src/templates/schemas/validator.ts` 全文 121 行，定义的是 `TemplateSchemaValidator`（模板结构校验器），导出的 `validateTemplate` 仅服务 `src/templates/registry.ts` 的模板对象。**工程数据（`ProjectData`）从未有过对应的 Zod schema**，仓库中不存在 `ProjectSchema`。报告把「模板校验已落地」当成「工程校验已落地」的前提，会让读者误以为只要接线即可，实际是从零新建。

2. **`z.record(z.string(), z.unknown())` 提议过于宽松**。该写法等价于「任意 plain object」，连 `pages` 是否为数组都不检查，校验形同虚设。团队指示中的 `passthrough 容错` 应落到 `z.looseObject`（声明关键字段、放行未知字段），既保留前向兼容，又能断言 `pages` 数组结构。本方案采用后者。

3. **事实成立的部分**：
   - `package.json#L42` 确有 `"zod": "^4.3.6"`，`node_modules/zod/package.json` 实装版本 `4.3.6`。
   - `src/utils/db.ts#L242-L287` 的 `openProjectFromFilePicker` 在 `.slgrid`（L265）与 `.json`（L269）两条路径上均 `JSON.parse(text)` 后直接 `resolve({ project: data })`，无任何结构断言。
   - `src/store/useStore.ts#L238` 的 `loadProject` 在 `migrateToV3(projectData)` 之后直接 `set({ pages: migratedData.pages || [] })`，无校验。`||` 仅兜底 `null/undefined`，对「`pages` 是字符串或对象」这类畸形值不设防。
   - `migrateToV3` 位于 `src/utils/migrations/v2-to-v3.ts#L139-L163`，行为是字段重命名（`desc->description`、`quote->content`）、布局 ID 映射（`layout->layoutId`）、补全 `theme`/`designSystem`、`ensureCollectionIds` 注入集合元素 `id`。它不做任何结构断言，畸形数据穿过迁移依然畸形。

4. **报告行号轻微偏差**：报告标注 `db.ts#L240-L275`，实际函数体 `L242-L287`；`useStore.ts#L215-L265` 实际为 `L214-L306`。不影响问题定位。

5. **IndexedDB 路径同样无校验**：`getProject`（`db.ts#L139-L148`）从 IndexedDB 直读返回，与文件选择器返回的数据汇入同一个 `loadProject` 入口。因此校验应放在 `loadProject`（唯一消费者），而非分散到 `db.ts` 各读取点——这样文件导入与本地缓存共用一道防线。

## 根因

工程级数据从未建立 schema，校验责任在 `db.ts` 与 `useStore` 之间被无声地传递：

- `db.ts` 把 `JSON.parse` 结果原样上抛，认为「我只是文件读取器，结构对不对不归我管」。
- `useStore.loadProject` 拿到数据后只做迁移不做断言，认为「迁移已经规范化了」，但 `migrateToV3` 的设计目标是字段重命名与补全，不是结构校验——它对 `pages: "not an array"` 这类畸形无能为力。
- `validator.ts` 的存在让团队产生「Zod 校验已覆盖」的错觉，实际上它只覆盖模板，与工程数据是两条平行线。

历史字段在 V1/V2/V3 间反复变动，导致开发者不敢加严格校验（怕误杀历史工程），结果连最低限度的「`pages` 必须是数组」都没有，畸形 JSON 直接穿透到 React 渲染树，以 `Cannot read properties of undefined` 白屏收场。

## 解决方案

两阶段管道：**先迁移、后校验**。迁移负责把历史字段名升格到 V3，校验负责在迁移后的规范数据上断言最小可渲染结构。校验失败不阻断载入，而是 `logger.warn` 留痕并回退迁移数据——保留现有行为不误杀历史工程，同时为后续收紧 schema 留出口子。

### 设计原则（遵从 `~/.claude/CLAUDE.md`）

- **不保留向后兼容**：新建 `ProjectSchema`，不复制 `validator.ts` 的旧接口，不保留任何中间兼容层。
- **最简实现**：schema 只断言唯一一个关键字段 `pages`（数组），其余字段全部 `passthrough` 放行。不引入逐字段必检的严格模式，因为历史数据字段不稳定，严格校验会误杀。
- **禁止 emoji**：代码与注释均不出现 emoji 字符。
- **不破坏现有测试**：`src/store/useStore.test.ts` 的 `mockProject` 与对象输入用例（L404-L432）在迁移后均能通过 `z.looseObject` 校验，`pages` 始终是合法数组，走 `parsed.success` 分支，行为不变。

### Zod 4 API 选型

Zod 4（`4.3.6`）中 `.passthrough()` 已废弃，官方推荐 `z.looseObject(shape)` 或 `.loose()`。本方案统一用 `z.looseObject`：

- `z.looseObject({ pages: z.array(...).default([]) })`：声明 `pages` 必须为数组，缺省回填 `[]`；其余未知字段全部保留放行。
- `.default([])` 让缺 `pages` 的合法空工程通过校验并补成 `[]`，与 `migrateToV3` 对 `pages` 的 `||` 兜底语义一致。
- `safeParse` 返回 `ZodSafeParseResult`，按 `success` 分支，不抛异常。

### 新建文件 `src/utils/validation/projectSchema.ts`

```ts
import { z } from 'zod';

// 单页 schema：仅断言「是 plain object」，字段全放行
// 历史页面字段差异大，逐字段必检会误杀 V1/V2 工程
const PageSchema = z.looseObject({});

// 工程 schema：唯一硬约束是 pages 必须为数组，缺省回填空数组
// 其余字段（theme / designSystem / customFonts / ...）全部 passthrough
export const ProjectSchema = z.looseObject({
  pages: z.array(PageSchema).default([]),
});

export type ValidatedProject = z.infer<typeof ProjectSchema>;

// safeParse 包装，返回标准结果供调用方分支处理
export function validateProject(data: unknown) {
  return ProjectSchema.safeParse(data);
}
```

### 接入点一：`src/utils/db.ts` 文件选择边界前置守卫

`openProjectFromFilePicker` 在 `JSON.parse` 之后、`resolve` 之前加一道对象结构守卫。这是「用户主动选文件」的入口，在这里抛友好错误可被 `Dashboard.tsx` / `EditorPage.tsx` 的 `try/catch` 捕获并提示，而非让畸形数据一路穿透到 React 渲染。

```ts
// .slgrid 分支（L256-L266 附近）
const text = await projectJsonFile.async('text');
const data = JSON.parse(text);
// 前置守卫：必须是 plain object，非对象在文件边界即抛友好错误
if (!data || typeof data !== 'object' || Array.isArray(data)) {
  throw new Error('Invalid project file: expected a JSON object');
}
resolve({ project: data, filename: file.name });

// .json 分支（L267-L270 附近）同样加守卫
const text = await file.text();
const data = JSON.parse(text);
if (!data || typeof data !== 'object' || Array.isArray(data)) {
  throw new Error('Invalid project file: expected a JSON object');
}
resolve({ project: data, filename: file.name });
```

`getProject`（IndexedDB 读取）不加守卫——数据由应用自身写入，且校验统一在 `loadProject` 收口，避免分散断言。

### 接入点二：`src/store/useStore.ts` 迁移后 Zod 校验

`loadProject` 在 `migrateToV3` 之后调用 `validateProject`，按 `success` 分支。校验失败回退迁移数据并 `logger.warn` 留痕；`pages` 取值增加 `Array.isArray` 防御，堵住「畸形 `pages` 穿过迁移」的最后一道关。

```ts
// L236-L260 附近改造
if (projectData) {
  const migratedData = migrateToV3(projectData);

  // 迁移后做结构校验：失败不阻断，回退迁移数据并留痕
  const parsed = validateProject(migratedData);
  if (!parsed.success) {
    logger.warn(
      'Project validation failed, falling back to migrated data',
      parsed.error.issues
    );
  }
  const validatedPages = parsed.success ? parsed.data.pages : migratedData.pages;

  if (nativeFs.isElectron()) {
    const title = migratedData.title || migratedData.projectTitle || 'Untitled Project';
    nativeFs.setCurrentProject(projectId!, title);
  }

  set((state) => ({
    pages: Array.isArray(validatedPages) ? validatedPages : [],
    projectTitle: migratedData.title || migratedData.projectTitle || '',
    theme: migratedData.theme || DEFAULT_THEME,
    // ...其余字段保持原样，仍从 migratedData 取值
    designSystem: migratedData.designSystem || DEFAULT_DESIGN_SYSTEM,
    customFonts: migratedData.customFonts || [],
    imageQuality: migratedData.imageQuality ?? 0.95,
    minimalCounter: migratedData.minimalCounter ?? false,
    counterStyle: migratedData.counterStyle || (migratedData.pages?.[0]?.counterStyle) || 'number',
    printSettings: migratedData.printSettings || DEFAULT_PRINT_SETTINGS,
    currentFilePath: filePath || migratedData.filePath || state.currentFilePath,
    currentPageIndex: 0,
    isLoaded: true,
    past: [],
    future: []
  }));

  if (migratedData.customFonts && migratedData.customFonts.length > 0) {
    loadCustomFontsIntoDOM(migratedData.customFonts);
  }
}
```

关键点：

- 校验只对 `pages` 字段负责，`theme`/`designSystem`/`customFonts` 等仍走 `migratedData` 原值，**行为与现状一致**，确保现有测试不破。
- `parsed.success` 分支下 `parsed.data.pages` 是经 `.default([])` 兜底的合法数组，`Array.isArray` 必为真。
- `parsed.error.issues` 是 Zod 4 的 issue 数组（含 `path`/`message`/`code`），随 `logger.warn` 一并落盘，便于事后排查畸形数据来源。
- `migratedData.title`、`migratedData.theme` 等字段在 `z.looseObject` 下不在静态类型里（passthrough 字段），因此非 `pages` 字段一律从 `migratedData`（类型为 `ProjectData`）取，避免类型摩擦。

## Before / After

### Before

```ts
// db.ts L256-L270：裸 JSON.parse
const text = await file.text();
const data = JSON.parse(text);
resolve({ project: data, filename: file.name });

// useStore.ts L236-L260：迁移后直接 set
if (projectData) {
  const migratedData = migrateToV3(projectData);
  set((state) => ({
    pages: migratedData.pages || [],   // 字符串 pages 穿透
    // ...
  }));
}
```

用户导入 `{ "pages": "oops" }`：`JSON.parse` 成功 → `migrateToV3` 原样返回 → `set({ pages: "oops" || [] })` → `pages` 为字符串 `"oops"` → React 渲染 `pages.map` 抛 `TypeError` → 顶层 ErrorBoundary 白屏，未保存数据遗失。

### After

```ts
// db.ts：文件边界前置守卫
const data = JSON.parse(text);
if (!data || typeof data !== 'object' || Array.isArray(data)) {
  throw new Error('Invalid project file: expected a JSON object');
}
resolve({ project: data, filename: file.name });

// useStore.ts：迁移后 safeParse + 防御性 Array.isArray
const migratedData = migrateToV3(projectData);
const parsed = validateProject(migratedData);
if (!parsed.success) {
  logger.warn('Project validation failed', parsed.error.issues);
}
const validatedPages = parsed.success ? parsed.data.pages : migratedData.pages;
set((state) => ({
  pages: Array.isArray(validatedPages) ? validatedPages : [],
  // ...
}));
```

同一份畸形数据：`JSON.parse` 成功 → 前置守卫通过（仍是 object）→ `migrateToV3` 原样返回 → `validateProject` 对 `pages: "oops"` `safeParse` 失败 → `logger.warn` 留痕 → 回退 `migratedData.pages`（仍为 `"oops"`）→ `Array.isArray("oops")` 为假 → `pages` 落到 `[]` → 工程以空页面载入，不白屏，用户看到「工程为空」+ 控制台告警而非整页崩溃。

## 风险与回滚

### 风险

1. **校验失败仍回退迁移数据**：`pages` 以外的畸形字段（如 `theme: "not an object"`）不在 `ProjectSchema` 断言范围内，会原样穿透到 `set`，下游 `migratedData.theme || DEFAULT_THEME` 的 `||` 兜底能吸收 `null/undefined` 但吸收不了错误类型对象。这是**有意保留的宽松度**——收紧到逐字段必检会误杀历史工程，与「最简实现、不破坏现有测试」冲突。后续可按字段逐步加严。

2. **`z.looseObject` 静态类型不覆盖 passthrough 字段**：`parsed.data` 的静态类型只有 `pages`，因此非 `pages` 字段必须从 `migratedData`（`ProjectData` 类型）取，不能从 `parsed.data` 取。实施时若图省事全用 `parsed.data` 会触发 TS 报错——这反而是好事，强制开发者显式区分「校验过的字段」与「放行的字段」。

3. **`logger.warn` 在生产环境被过滤**：`src/utils/logger.ts#L91-L96` 的 `applyProdOverrides` 会过滤含 `AutoSave`/`Thumbnail` 的 warn，但 `Project validation failed` 不在过滤名单，会正常输出到 `console.warn`。如需进入遥测通道，需另接 hook，本方案不展开。

### 回滚

方案是**纯加法**：新建 `projectSchema.ts`、在 `db.ts` 与 `useStore.ts` 各加一段守卫。回滚即删除新增文件与两段守卫代码，`loadProject` 回到 `migratedData.pages || []` 的原样。无数据迁移、无 schema 版本号变更、无 IndexedDB 结构变动，回滚零成本。

## 验证方式

1. **现有测试全绿**：`pnpm test src/store/useStore.test.ts` 与 `pnpm test src/utils/__tests__/db.test.ts` 必须全过。重点核对：
   - `loadProject` 用例（L284-L356）：`mockProject` 的 `pages` 是合法数组，走 `parsed.success` 分支，`pages` 断言不变。
   - 对象输入用例（L404-L432）：`{ title, pages: [makePage] }` 无 `version`/`customFonts`，`z.looseObject` 放行，`pages` 合法，`activeProjectId`/`projectTitle` 断言不变。
   - `getProject 不存在返回 null`（L163-L168）：`loadProject('missing')` 走模板兜底分支，不触发校验。

2. **新增畸形数据用例**：在 `useStore.test.ts` 的 `loadProject 对象输入` describe 块内补两个用例：
   - `pages` 为字符串时，`loadProject({ pages: 'oops' })` 后 `state.pages` 应为 `[]`，且 `console.warn` 被调用（用 `vi.spyOn(console, 'warn')` 断言）。
   - `pages` 缺省时，`loadProject({ title: 'Empty' })` 后 `state.pages` 应为 `[]`（`safeParse` 的 `.default([])` 兜底）。

3. **db.ts 前置守卫用例**：在 `src/utils/__tests__/db.test.ts` 补一个用例，mock 一个返回 `JSON.parse('"a string"')` 的文件输入，断言 `openProjectFromFilePicker` reject 并抛 `Invalid project file: expected a JSON object`。

4. **端到端手测**：启动 `pnpm dev`，在 Dashboard 导入一个内容为 `"just a string"` 的 `.json` 文件，确认 UI 弹出友好错误提示而非白屏；导入一个 `pages` 字段为字符串的工程 JSON，确认工程以空页面载入且控制台输出 `Project validation failed` 告警。

5. **Lint 不破**：`pnpm lint` 必须全过。`db.ts` 新增的 `if (!data || ...)` 守卫不引入 `no-control-regex` 等规则触发点（正则字符过滤在别处，本方案不动）。
