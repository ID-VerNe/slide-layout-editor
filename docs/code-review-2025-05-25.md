# 代码审查报告 — Slide Layout Editor

> 审查日期：2025-05-25
> 审查范围：全项目源码（src / electron）
> 审查重点：连锁逻辑漏洞、参数透传正确性、边界条件触发

---

## 一、连锁逻辑漏洞 / 参数透传问题 (严重)

### 1. `silent` 参数在全链路中丢失

**文件**: `src/store/useStore.ts` (L188-L207), `src/components/Editor.tsx` (L10), `src/components/editor/fields/TitleField.tsx` (L22-L24)

`Editor` 声明了 `onUpdate: (page: PageData, silent?: boolean) => void`，`TitleField` 在即时输入时也传递了 `silent=true`：

```typescript
const handleImmediateChange = (val: string) => {
  onUpdate({ ...page, title: val }, true);
};
```

但 `useStore.updatePage` 函数**始终调用 `pushHistory()`**，完全不检查 `silent` 参数（它甚至没有接收这个参数）。这导致：

- 用户每次输入一个字符都会在 undo 栈中产生一条历史记录
- undo 栈会快速膨胀到 50 条上限，覆盖掉真正有价值的操作历史

**修复建议**：给 `updatePage` 添加 `silent?: boolean` 参数，`silent=true` 时跳过 `pushHistory()` 调用。

---

### 2. `pushHistory` 快照不完整 — undo/redo 丢失关键全局状态

**文件**: `src/store/useStore.ts` (L164-L172)

`pushHistory` 只保存了 4 个字段：

```typescript
past: [
  ...state.past,
  {
    pages: deepClone(pages),
    projectTitle,
    theme: deepClone(theme),
    designSystem: deepClone(designSystem)
  }
].slice(-50),
```

但 `undo`/`redo` 也只恢复这 4 个字段。以下全局状态**不参与 undo/redo**：

- `printSettings`
- `minimalCounter`
- `counterStyle`
- `imageQuality`
- `customFonts`

**用户体验影响**：用户修改了全局计数器样式后按 Ctrl+Z，计数器样式不会恢复，而页面内容恢复了。这种"部分回退"会让用户困惑。

**修复建议**：在 `pushHistory` 快照中加入所有用户可变更的全局状态字段，`undo`/`redo` 中同步恢复。

---

### 3. `setCounterStyle` 与 `updatePage` 的双重更新问题

**文件**: `src/store/useStore.ts` (L179-L183, L191-L194)

`setCounterStyle` 遍历所有页面设置 `counterStyle`，而 `updatePage` 的 `GLOBAL_FIELDS` 也包含 `counterStyle`，当某页面因为全局同步而更新 `counterStyle` 时，又会在 `updatePage` 中触发 `set({ counterStyle: updatedPage.counterStyle })`。

这导致：
- 同一状态被两条路径重复设置
- state 更新顺序不可预测，可能产生竞态

**修复建议**：去掉 `updatePage` 中 `GLOBAL_FIELDS` 的 `counterStyle`，统一由 `setCounterStyle` 管理。

---

### 4. `deepClone` 使用 `JSON.parse(JSON.stringify())` 的风险

**文件**: `src/store/useStore.ts` (L66)

```typescript
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
```

已知问题：

- `undefined` 值会丢失（JSON 不支持 undefined）
- `NaN` / `Infinity` 变为 `null`
- 对于包含 `data:` URL 的缩略图数据（可能达几百 KB），字符串序列化极其低效
- `imageConfig` 等字段如果是 `undefined`（表示未设置），通过 spread 操作赋值后，JSON clone 会丢弃这些 key

**修复建议**：使用 `structuredClone()`（现代浏览器已原生支持）或 lodash 的 `cloneDeep`。

---

## 二、表达式引擎漏洞 (严重 / 重要)

### 5. `evaluatePart` 中可选链 `?.` 被错误解析

**文件**: `src/templates/schemas/expressionEvaluator.ts` (L80)

```typescript
const parts = part.split(/[\.\[\]\?]+/).filter(Boolean);
```

这行把 `?` 当作分隔符，**彻底破坏了可选链语义**。例如：

- `"page.visibility?.logo"` 被分割为 `['page', 'visibility', 'logo']`
- `"page.data?.items[0]"` 完全无法正确处理

如果 `visibility` 为 `null`（不是 `undefined`），访问 `null['logo']` 行为取决于 JS 引擎，且语义与可选链的"短路"截然不同。

**修复建议**：使用支持可选链的路径解析库（如 `lodash.get`）或自行实现支持 `?.` 的路径遍历。

---

### 6. 三元运算符 `? :` 在复杂表达式时可能错误分割

**文件**: `src/templates/schemas/expressionEvaluator.ts` (L30-L34)

```typescript
const qIndex = cleanExpr.indexOf(' ? ');
const cIndex = cleanExpr.lastIndexOf(' : ');
```

使用 `lastIndexOf` 找 `:` 的位置。如果 false 分支本身恰好包含 ` : `（例如嵌套表达式值），会被错误截断。

此外，`parseFloat` / `split` 方式完全不支持括号嵌套、逻辑运算符（`&&`、`||`）、比较运算符（`>`、`<`、`>=`）等常见表达式需求。

**修复建议**：考虑使用受限的 `new Function()` 沙箱求值，或集成 mini-eval 库。

---

### 7. `evaluateObject` 对纯表达式字符串的类型判断

**文件**: `src/templates/schemas/expressionEvaluator.ts` (L131-L133)

```typescript
if (obj.startsWith('{') && obj.endsWith('}') && obj.indexOf('{', 1) === -1) {
  return this.evaluate(obj, context);
}
```

对于 `"{true}"` 这样的布尔表达式，`evaluate` 会返回字符串 `'true'`（因为 `evaluatePart` 处理 `"true"` 返回布尔值 `true`，但这个路径下 `evaluate` 处理后返回的是 `evaluate` 的结果）。对于 `"{false}"`，`evaluate` 返回 `false` 布尔值。这些类型不一致可能导致下游组件的 props 类型问题（例如 React 组件期望 `string` 但收到了 `boolean`）。

**修复建议**：明确文档说明求值规则，或在关键路径上做类型强制转换。

---

## 三、渲染管线问题

### 8. `Conditional` 节点与 `visibleWhen` 的双重条件行为

**文件**: `src/templates/schemas/LayoutRenderer.tsx` (L31-L46)

`visibleWhen` 对**所有节点类型**（包括 `Conditional`）都会先检查。这意味着一个 `Conditional` 节点如果同时设置了 `visibleWhen` 和 `condition`，两个条件都会叠加生效：先通过 `visibleWhen` 检查，再决定渲染 `then`/`else` 分支。文档中没有明确说明这个行为的优先级。

---

### 9. Modular Grid 布局 `gap` Token 解析失败时返回原始字符串

**文件**: `src/templates/schemas/LayoutRenderer.tsx` (L241-L243, L182-L188)

```typescript
// resolveTokenValue:
if (val.startsWith('spacing.')) {
  const key = val.split('.')[1] as keyof typeof ds.tokens.spacing;
  return ds.tokens.spacing[key] || val;
}
return val;
```

如果 `ds.tokens.spacing.none` 恰好未定义，`resolveTokenValue` 返回原始字符串 `'spacing.none'`，这在 CSS `gap` 属性中无效，会导致布局错误。

**修复建议**：在找不到 token 时返回安全默认值 `'0px'`。

---

### 10. `renderRepeater` 中 `itemVariable` 可能覆盖 context 已有 key

**文件**: `src/templates/schemas/LayoutRenderer.tsx` (L325)

```typescript
const itemContext = { ...context, [itemVar]: item, index };
```

如果外层 Repeater 的 context 中已经有了名为 `item` 的字段，内层的 `item` 会直接覆盖外层值。嵌套 Repeater 场景下无法同时访问内外层的 item。

**修复建议**：为嵌套 Repeater 提供 `$parent` 引用，或使用不同变量名约定。

---

### 11. `renderComponent` 中 `bind` 未正确传递到 ZineMedia 等组件

**文件**: `src/templates/schemas/LayoutRenderer.tsx` (L283-L306)

ZineMedia 通过 `bind` 传递数据，但 `renderComponent` 中生成的 `baseProps` 不含 `src` 字段。数据是通过 `dynamicProps.src = value` 注入的，且仅在 props 中 `src` 为 `undefined` 时才注入。如果模板作者在 `props` 中同时指定了 `src` 和 `bind`，可能会产生非预期覆盖。

---

## 四、类型系统问题 (重要)

### 12. `imageConfig` 在 `PageData` 类型中缺失

**文件**: `src/components/editor/fields/ImageField.tsx` (L50), `src/components/ui/slide/SlideImage.tsx` (L88), `src/types.ts`

`ImageField` 和 `SlideImage` 大量使用 `page.imageConfig`，但 `PageData` 接口中没有定义 `imageConfig` 字段：

```typescript
// ImageField.tsx L50
const currentConfig = page.imageConfig || { scale: 1, x: 0, y: 0 };
```

`BentoItem` 中有 `imageConfig`，但 `PageData` 没有。这会导致 TypeScript 类型检查报错。

**修复建议**：在 `PageData` 中添加 `imageConfig?: { scale: number; x: number; y: number }`。

---

### 13. `FeatureData` 同时定义 `description` 和 `desc` 字段

**文件**: `src/types.ts` (L54-L66), `src/components/editor/fields/FeaturesField.tsx` (L213)

```typescript
export interface FeatureData {
  description?: string;
  desc?: string;
  // ...
}
```

`FeaturesField` 使用 `f.desc`，但其他模板可能使用 `f.description`。两个字段语义相同但名称不同，会导致数据不一致。

**修复建议**：统一为一个字段名，废弃另一个（保留但标记 `@deprecated`）。

---

### 14. Zod 验证器缺少 `Repeater`、`Text`、`modular` 类型

**文件**: `src/templates/schemas/validator.ts` (L34-L60)

`TemplateNodeSchema` 的 `discriminatedUnion` 只包含 3 种类型：

```typescript
z.discriminatedUnion('type', [
  // Container, Component, Conditional
])
```

缺少 `Repeater` 和 `Text` 节点类型。Layout 枚举也缺少 `'modular'`：

```typescript
z.enum(['flex', 'grid', 'absolute']),  // 缺少 'modular'
```

这意味着所有使用 `Repeater`、`Text` 节点或 `modular` 布局的模板在运行时**不会被 Zod 验证捕获**。

**修复建议**：补全 `TemplateNodeSchema` 中的所有节点类型和 layout 枚举。

---

## 五、字段编辑器 Bug (严重 / 重要)

### 15. `BentoField` 的 `fieldKey` 硬编码错误

**文件**: `src/components/editor/fields/BentoField.tsx` (L46)

```typescript
<FieldWrapper page={page} onUpdate={onUpdate} label="Bento Grid" icon={LayoutGrid} fieldKey="features">
```

这里 `fieldKey="features"` 是错误的，应该是 `"bentoItems"`。

**影响**：

- Visibility toggle 操作的是 `page.visibility.features` 而非 `page.visibility.bentoItems`
- ZineStylePanel 修改的是 `styleOverrides.features` 而非 `styleOverrides.bentoItems`

**修复建议**：改为 `fieldKey="bentoItems"`。

---

### 16. `FeaturesField` 不使用 `FieldWrapper`，手动实现 visibility toggle

**文件**: `src/components/editor/fields/FeaturesField.tsx` (L17)

`FeaturesField` 手动实现了 toggle 按钮样式，与 `FieldWrapper` 提供的标准行为不一致：
- 没有点击外部关闭 panel
- 没有 z-index 提升
- 没有 ZineStylePanel 集成

同样的问题也存在于 `AgendaField`（手动实现 toggle，缺少 FieldWrapper 封装）。

**修复建议**：统一使用 `FieldWrapper` 包装所有字段编辑器组件。

---

### 17. `FeaturesField` 中 `useEffect` 的 ID 迁移使用了不当的依赖

**文件**: `src/components/editor/fields/FeaturesField.tsx` (L20-L26)

```typescript
React.useEffect(() => {
  const features = page.features || [];
  if (features.some(f => !f.id)) {
    const migrated = features.map(f => f.id ? f : { ...f, id: `feat-${Date.now()}-...` });
    onUpdate({ ...page, features: migrated });
  }
}, [page.features, onUpdate, page]);
```

依赖中包含 `onUpdate` 和 `page`，而 `page` 是整个 `PageData` 引用。这导致每次页面更新（无论是否与 features 相关）都会触发此 effect，且如果 `page` 引用变化，effect 再次触发 `onUpdate`，可能造成无限循环。

**修复建议**：使用 ref 追踪是否已迁移，或将迁移逻辑移到 store 层。

---

## 六、Store / 数据流问题

### 18. `addPage` 使用 `Date.now()` 产生可能的 ID 碰撞

**文件**: `src/store/useStore.ts` (L9)

```typescript
id: `slide-${Date.now()}`,
```

在同一毫秒内快速添加多个页面（例如脚本批量导入）会产生重复 ID。

**修复建议**：使用 `crypto.randomUUID()`。

---

### 19. `Editor` 的 `React.memo` 比较器中 `page` 引用比较

**文件**: `src/components/Editor.tsx` (L93-L98)

```typescript
prevProps.page === nextProps.page
```

这依赖于 `page` 在每次更新时都变为新引用。目前 `updatePage` 使用 `{ ...page, ...changes }` 展开创建新引用，是正确的。但如果未来任何地方直接 mutate 了 page 对象，memo 会静默跳过渲染。

**修复建议**：在 store 层使用 immer 或 readonly 类型防止直接 mutation。

---

### 20. `Dashboard` 中创建项目使用的 templateId 不在注册表中

**文件**: `src/pages/Dashboard.tsx` (L51)

```typescript
const id = createProject("New Slide", 'standard');
```

`registry.ts` 中没有 `'standard'` 这个 template ID。虽然新项目会在模板选择器中覆盖 layoutId，但期间存在短暂的无效状态。

**修复建议**：使用 `'modern-feature'` 或任意有效 template ID。

---

## 七、渲染性能 / React 优化问题

### 21. `useDataConnector` 使用整个 `page` 对象作为依赖

**文件**: `src/components/ui/slide/hooks/useDataConnector.ts` (L18)

```typescript
return useMemo(() => { ... }, [fieldKey, page]);
```

`page` 是完整的 `PageData` 对象（30+ 字段），任何字段变化（如 `backgroundColor`）都会让所有使用 `useDataConnector` 的组件重新计算 memo。

**修复建议**：依赖改为 `[fieldKey, (page as any)[fieldKey], page.styleOverrides?.[fieldKey], page.visibility?.[fieldKey]]`。

---

### 22. `useModularStyle` 和 `LayoutRenderer.resolveBaseProps` 样式白名单不一致

**文件**: `src/components/ui/slide/hooks/useModularStyle.ts` (L91-L103), `src/templates/schemas/LayoutRenderer.tsx` (L128-L140)

`useModularStyle` 白名单包含 `fontStyle`，但 `LayoutRenderer.resolveBaseProps` 白名单不含 `fontStyle`。同一字段在两处可能被不同处理。

**修复建议**：抽取为共享常量 `ZINE_ALLOWED_STYLE_PROPS`。

---

## 八、边界情况 / Edge Cases

### 23. `removePage` 阻止删除最后一页 — 无清理全部页面的路径

**文件**: `src/store/useStore.ts` (L215-L217)

```typescript
if (pages.length <= 1) return;
```

用户无法删除最后一页来"清空项目"。如果那页恰好是 `PLACEHOLDER_FOR_NEW_PROJECT`，也不能清除。

---

### 24. `handleExport` 中状态异常中途失败不可恢复

**文件**: `src/pages/EditorPage.tsx` (L197-L235)

导出过程中会调用 `setPreviewZoom(1)`、`setCurrentPageIndex(idx)` 等修改状态。虽然在 `finally` 中恢复了 `prevZoom` 和 `prevIdx`，但如果恢复代码也抛出异常，用户界面会停留在错误的 zoom/index 状态。

**修复建议**：使用 try-catch 包裹 finally 中的恢复逻辑。

---

### 25. `AutoFitHeadline` Worker 初始化失败后无 fallback 方案

**文件**: `src/components/AutoFitHeadline.tsx` (L53-L66)

```typescript
try {
  workerRef.current = new Worker(...);
} catch (e) {
  console.error('Failed to initialize font calculator worker', e);
}
```

Worker 初始化失败后 `workerRef.current === null`。后续 `useLayoutEffect` 中有守卫 `if (workerRef.current && ref.current)`。但如果 Worker 在 `postMessage` 或 `onmessage` 中遇到错误，没有 error 回调。

**修复建议**：添加 `workerRef.current.onerror` 处理。

---

### 26. `Canvas.getContext` 可能返回 `null`

**文件**: `src/utils/db.ts` (L122-L125), `src/components/editor/OffscreenExportRenderer.tsx`

```typescript
const ctx = canvas.getContext('2d');
if (!ctx) return reject('Failed context');
```

此处的 null 检查是对的，但 `OffscreenExportRenderer` 中有多处 canvas 操作未做 null 检查。

---

### 27. 缩略图生成中的大字符串序列化性能问题

**文件**: `src/store/useStore.ts` (L66), `src/pages/Dashboard.tsx` (L65-L73)

`thumbnail` 可能包含完整的 base64 图片数据（几百 KB）。`deepClone` 的 `JSON.stringify` + `JSON.parse` 和 localStorage 的 `JSON.stringify` 处理这种大字符串非常低效。

**修复建议**：缩略图单独存储（IndexedDB），projects 索引中仅存路径引用。

---

## 九、Electron 集成

### 28. `processResponsiveImages` IPC 缺少 main handler

**文件**: `electron/preload.ts` (L15), `electron/main.ts`

Preload 暴露了：
```typescript
processResponsiveImages: (input, formats) =>
  ipcRenderer.invoke('process-responsive-images', { input, formats })
```

但 `main.ts` 中**没有**对应的 `ipcMain.handle('process-responsive-images', ...)` 处理器。调用会静默失败。

**修复建议**：添加 handler 或移除 preload 中的暴露。

---

### 29. `saveAsset` 中 Electron 路径和 Web 路径的 asset ID 格式不一致

**文件**: `src/utils/db.ts` (L39-L59)

Electron 环境下使用 `filename` 格式（如 `asset_xxx.png`→`asset://asset_xxx.png`），而 Web 环境使用 hash ID 格式（`asset://${hashId}`）。两者格式可能不同，但在 Electron 路径中函数提前 return，不会混用。

Web 环境中 `saveAsset` 生成的 `assetId` 缺少文件扩展名（只有 hashId），`getAsset` 查询需要依赖 `assetId` 格式完全一致。

---

## 十、代码一致性问题

### 30. `useModularStyle` 中 `page` 参数未在接口中定义

**文件**: `src/components/ui/slide/hooks/useModularStyle.ts` (L30-L36)

```typescript
export const useModularStyle = ({
  fieldKey,
  overrides: directOverrides = {},
  props = {},
  variant,
  customStyle = {},
  className = '',
  page  // 通过交叉类型 & { page?: PageData } 扩展
}: UseModularStyleProps & { page?: PageData }) => {
```

部分调用点传了 `page`（如 `ZineDisplay.tsx`、`SlideImage.tsx`），部分没传（如 `SlideHeadline.tsx` 手动传 `overrides`）。两种路径都能工作但不够统一。

**修复建议**：将 `page` 作为 `UseModularStyleProps` 的标准可选属性。

---

### 31. `VariantsField` 中对硬编码的 layoutId 做了特殊处理

**文件**: `src/components/editor/fields/VariantField.tsx` (L51-L77)

硬编码了 `gallery-capsule` 和 `film-diptych` 的特化 UI 逻辑，其他 layoutId 走通用的 left/right 切换。这种模式不可扩展，新增模板需要修改核心编辑器代码。

**修复建议**：所有 variant 选项都通过 schema 的 `options` prop 传入（当前已有这个能力，只是没有全面使用）。

---

## 总结

| 等级 | 数量 | 关键问题 |
|------|------|---------|
| **严重** | 4 | silent 参数丢失致 undo 栈膨胀、undo/redo 丢失全局状态、可选链解析错误、BentoField fieldKey 错误 |
| **重要** | 9 | imageConfig 类型缺失、deepClone 风险、Zod 验证不全、Repeater 嵌套覆盖、modular gap 无语义默认值、FeaturesField effect 循环风险、ExpressionEvaluator 三元解析、FeaturesField/AgendaField 不使用 FieldWrapper、FeatureData desc/description 歧义 |
| **建议** | 18 | ID碰撞、导出状态恢复、memo 依赖过度、样式白名单不一致、Worker 异常处理、缩略图性能、Electron IPC 缺失、canvas null 检查等 |

**修复优先级**：

1. **立即修复**：#1 silent 参数丢失、#2 undo/redo 快照不全、#15 BentoField fieldKey 错误
2. **尽快修复**：#5 可选链解析、#12 imageConfig 类型、#14 Zod 验证器补全、#17 FeaturesField effect 循环
3. **技术债务**：#4 deepClone 替换、#23 白名单抽取、#31 VariantField 去硬编码