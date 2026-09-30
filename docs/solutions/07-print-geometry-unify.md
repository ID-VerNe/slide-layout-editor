# 3.2 印刷几何统一

## 事实核对

报告指出三处存在「几乎一模一样」的装订几何计算，定位基本准确，但对 `Preview.tsx` 的描述偏简，且报告自带的设计稿 `calcPrintLayoutGeometry` 与现有代码存在行为偏差。逐点核对：

1. **`src/pages/EditorPage.tsx#L297-L311` (`getExportDimensions`)** —— 与报告完全一致。核心算式：
   - `netWidthMm = isHorizontalBinding ? (widthMm - gutterMm) : widthMm`
   - `ppi = designDims.width / Math.max(1, netWidthMm)`
   - 返回 `{ width: Math.round(widthMm * ppi), height: Math.round(heightMm * ppi) }`
   - 调用点：`L338`（PDF 首页尺寸）、`L347`（PDF 续页尺寸）。`L297-L311` 准确。

2. **`src/hooks/usePreview.ts#L37-L44`（`calculateFitZoom` 内的打印分支）** —— 报告标注 `L33-L48`，实际打印几何块在 `L37-L44`（`L33-L36` 是 `designDims` 取值与 `targetWidth/targetHeight` 声明，`L45-L48` 是非打印回退）。算式与 `EditorPage` 完全相同：`ppi = designDims.width / Math.max(1, netWidthMm)`，`targetWidth = widthMm * ppi`、`targetHeight = heightMm * ppi`（**未取整**，用于 zoom 拟合）。即 `EditorPage` 与 `usePreview` 共用同一套「物理画幅像素」算式，仅末端正负取整不同。**这两处确属同构冗余，报告结论成立。**

3. **`src/components/Preview.tsx#L45-L64`** —— 报告称「同样的分支判断，但额外计算了 scaleW, scaleH, scaleFactor, gutterPx」。核对后发现这是**低估了差异**：
   - `Preview.tsx` 的 `ppi` 与前两处**不同**：`ppi = canvasWidth / widthMm = designDims.width / widthMm`（用满 `widthMm`，**不扣装订**）。
   - `canvasHeight = designDims.width * (heightMm / widthMm)`——画布高度按**整张物理纸**的宽高比外扩，而非 `designDims.height`。
   - `scaleFactor = Math.min(netWidthMm / widthMm, netHeightMm / heightMm)`——内容在画布内的缩放，对应「装订后净画幅占满画布」。
   - `gutterPx = gutterMm * ppi`（未取整）。

   也就是说，`Preview.tsx` 共享的只是**配置解析样板**（`orientation`、`config`、`isHorizontalBinding`、`widthMm/heightMm/gutterMm` 取值），几何算式本身与前两处**不同**：前两处算的是「按净宽求 PPI 后的物理画幅像素」，`Preview.tsx` 算的是「按满宽求 PPI 的屏幕画布 + 内容缩放」。三处真正同构的只有「装订配置解析」这一段样板（约 6 行），不是整套算式。

4. **报告自带设计稿 `calcPrintLayoutGeometry`（`docs/code-review-report.md#L449-L513`）存在两处会改变运行时行为的偏差**，不能直接照搬：
   - `exportPpi = isHorizontalBinding ? designDims.width/netWidthMm : designDims.height/netHeightMm`——垂直装订时改用 `designDims.height / netHeightMm`。但现有三处**永远以宽度求 PPI**（`designDims.width / netWidthMm`，垂直装订时 `netWidthMm = widthMm`）。这会让垂直装订的导出尺寸和预览缩放基准悄悄变化。
   - `preview.canvasHeight = designDims.height`（非打印回退之外的打印分支也未改 `canvasHeight`）——但 `Preview.tsx#L61` 实际是 `designDims.width * (heightMm / widthMm)`。照搬会让屏幕画布的高度从「物理宽高比外扩」退回「设计高度」，破坏 `Preview.tsx` 的画布渲染。

   这两点必须在统一函数中修正：**保留原有算式语义**，不借重构之名改算法。

5. **配置回退链一致**：三处均用 `configs[orientation] || configs['resume'] || { bindingSide: 'left', trimSide: 'bottom' }`，`DEFAULT_PRINT_SETTINGS`（`src/constants/theme.ts#L85-L99`）四个 orientation 均有值，回退路径在正常运行中不会触发，但作为防御保留。

6. **测试覆盖**：
   - `src/hooks/__tests__/usePreview.test.ts#L92-L110` 有一个「打印启用时按纸张尺寸计算」用例，断言 `previewZoom !== 0.5`，只校验非默认值，不锁死具体公式。统一函数只要让 `calculateFitZoom` 拿到相同的 `targetWidth/targetHeight`，此用例即通过。
   - `src/pages/__tests__/EditorPage.test.tsx` mock 了 `usePreview` 与子组件，`getExportDimensions` 在 `handleExport` 中调用，测试未触发导出流程，不受影响。
   - `Preview.tsx` 无单元测试。
   - 无 `printGeometry` 既有测试，需新增。

## 根因

三处的**配置解析样板**（`orientation → config → isHorizontalBinding → netWidthMm`）被复制了三遍，这是真冗余。但更隐蔽的问题在于：**算式被复制后，三处各自演化出了不同的语义**——`EditorPage`/`usePreview` 用净宽 PPI 算物理画幅像素，`Preview.tsx` 用满宽 PPI 算屏幕画布并额外算内容缩放。结果是「同一段样板支撑了三种几何」，任何人想改装订边逻辑都得在三处分别改对，且很容易误以为三处算式相同而把其中一处覆写成另一处的语义（报告自带的设计稿就踩了这个坑）。

根本治理是：把**配置解析**与**两套几何算式**都收敛到一个纯函数，调用点只取自己需要的字段，样板不再复制，算式语义由函数名与字段名显式区分。

## 解决方案

新增 `src/utils/printGeometry.ts`，导出两个职责清晰的纯函数：

- `resolvePrintBinding(orientation, printSettings)`——解析装订配置，返回 `{ bindingSide, trimSide }`。三处共用。
- `getPrintGeometry(aspectRatio, printSettings)`——一次性算出两套几何，返回结构化结果。调用方按需取字段。

接口设计（遵从 `~/.claude/CLAUDE.md`：不保留向后兼容、最简实现、无投机抽象；注释遵从 `AGENTS.md`：中文写意图，英文写技术标识，禁单行中英混写）：

```typescript
// src/utils/printGeometry.ts
import { LAYOUT_CONFIG, AspectRatioType, OrientationType } from '../constants/layout';
import { PrintSettings } from '../types';

export interface PrintBindingConfig {
  bindingSide: 'left' | 'right' | 'top' | 'bottom';
  trimSide: 'left' | 'right' | 'top' | 'bottom';
}

export interface PrintGeometry {
  /** 物理画幅像素：导出光栅与预览适配基准，按净宽求 PPI */
  rasterPx: { width: number; height: number; ppi: number };
  /** 屏幕画布像素：Preview.tsx 外框尺寸，按满宽求 PPI */
  canvasPx: { width: number; height: number; ppi: number };
  /** 内容在画布内的缩放与装订像素 */
  content: { scaleFactor: number; gutterPx: number };
  /** 解析后的装订配置与方向标记 */
  binding: PrintBindingConfig;
  isHorizontalBinding: boolean;
}

const DEFAULT_BINDING: PrintBindingConfig = { bindingSide: 'left', trimSide: 'bottom' };

/** Returns the binding config for an orientation, falling back to resume then default */
export function resolvePrintBinding(
  orientation: OrientationType,
  printSettings?: PrintSettings
): PrintBindingConfig {
  const configs = printSettings?.configs;
  if (!configs) return DEFAULT_BINDING;
  return configs[orientation] || configs['resume'] || DEFAULT_BINDING;
}

/** Computes print geometry for both export rasterization and on-screen preview canvas */
export function getPrintGeometry(
  aspectRatio: AspectRatioType = '16:9',
  printSettings?: PrintSettings
): PrintGeometry {
  const designDims = LAYOUT_CONFIG[aspectRatio] || LAYOUT_CONFIG['16:9'];

  if (!printSettings?.enabled) {
    return {
      rasterPx: { width: designDims.width, height: designDims.height, ppi: 1 },
      canvasPx: { width: designDims.width, height: designDims.height, ppi: 1 },
      content: { scaleFactor: 1, gutterPx: 0 },
      binding: DEFAULT_BINDING,
      isHorizontalBinding: false,
    };
  }

  const { widthMm, heightMm, gutterMm } = printSettings;
  const binding = resolvePrintBinding(designDims.orientation, printSettings);
  const isHorizontalBinding = binding.bindingSide === 'left' || binding.bindingSide === 'right';

  // 装订边占用的物理方向：水平装订扣宽，垂直装订扣高
  const netWidthMm = isHorizontalBinding ? Math.max(1, widthMm - gutterMm) : widthMm;
  const netHeightMm = !isHorizontalBinding ? Math.max(1, heightMm - gutterMm) : heightMm;

  // 物理画幅：以设计宽度对净宽求 PPI，画幅按物理尺寸外扩
  const rasterPpi = designDims.width / netWidthMm;
  const rasterPx = {
    width: widthMm * rasterPpi,
    height: heightMm * rasterPpi,
    ppi: rasterPpi,
  };

  // 屏幕画布：外框固定为设计宽度，高度按物理宽高比外扩
  const canvasPpi = designDims.width / widthMm;
  const canvasPx = {
    width: designDims.width,
    height: designDims.width * (heightMm / widthMm),
    ppi: canvasPpi,
  };

  // 内容缩放：装订后净画幅占满画布的比例
  const content = {
    scaleFactor: Math.min(netWidthMm / widthMm, netHeightMm / heightMm),
    gutterPx: gutterMm * canvasPpi,
  };

  return { rasterPx, canvasPx, content, binding, isHorizontalBinding };
}
```

### 调用点改造

**`EditorPage.tsx`——`getExportDimensions` 改为薄封装**：

```typescript
// 之前
const getExportDimensions = useCallback((page: PageData) => {
  const designDims = LAYOUT_CONFIG[(page.aspectRatio || '16:9') as AspectRatioType];
  if (printSettings?.enabled) {
    const orientation = designDims.orientation;
    const config = (printSettings?.configs && (printSettings.configs[orientation as keyof typeof printSettings.configs] || printSettings.configs['resume'])) || { bindingSide: 'left', trimSide: 'bottom' };
    const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
    const netWidthMm = isHorizontalBinding ? (printSettings.widthMm - printSettings.gutterMm) : printSettings.widthMm;
    const ppi = designDims.width / Math.max(1, netWidthMm);
    return {
      width: Math.round(printSettings.widthMm * ppi),
      height: Math.round(printSettings.heightMm * ppi)
    };
  }
  return { width: designDims.width, height: designDims.height };
}, [printSettings]);

// 之后
const getExportDimensions = useCallback((page: PageData) => {
  const { rasterPx } = getPrintGeometry((page.aspectRatio || '16:9') as AspectRatioType, printSettings);
  return { width: Math.round(rasterPx.width), height: Math.round(rasterPx.height) };
}, [printSettings]);
```

**`usePreview.ts`——`calculateFitZoom` 打印分支改为取 `rasterPx`**：

```typescript
// 之前 L37-L44
if (printSettings?.enabled) {
  const orientation = designDims.orientation;
  const config = (printSettings?.configs && (printSettings.configs[orientation as keyof typeof printSettings.configs] || printSettings.configs['resume'])) || { bindingSide: 'left', trimSide: 'bottom' };
  const isHorizontalBinding = config.bindingSide === 'left' || config.bindingSide === 'right';
  const netWidthMm = isHorizontalBinding ? (printSettings.widthMm - printSettings.gutterMm) : printSettings.widthMm;
  const ppi = designDims.width / Math.max(1, netWidthMm);
  targetWidth = printSettings.widthMm * ppi;
  targetHeight = printSettings.heightMm * ppi;
} else {
  targetWidth = designDims.width;
  targetHeight = designDims.height;
}

// 之后
const { rasterPx } = getPrintGeometry(
  (currentPage.aspectRatio || '16:9') as AspectRatioType,
  printSettings
);
targetWidth = rasterPx.width;
targetHeight = rasterPx.height;
```

非打印分支由 `getPrintGeometry` 内部回退为 `designDims.width/height`，调用方无需再写 `if/else`。`designDims` 局部变量在 `usePreview` 中不再需要，连带删除 `L33` 的 `designDims` 取值（`calculateFitZoom` 顶部改用 `currentPage` 直接传参）。

**`Preview.tsx`——`L45-L64` 改为解构 `getPrintGeometry` 结果**：

```typescript
// 之后
const isPrintEnabled = printSettings?.enabled;
const { canvasPx, content, binding, isHorizontalBinding } = getPrintGeometry(
  page.aspectRatio || '16:9',
  printSettings
);
const { width: canvasWidth, height: canvasHeight } = canvasPx;
const { scaleFactor, gutterPx } = content;
const config = binding;

const getOriginX = () => { /* 不变 */ };
const getOriginY = () => { /* 不变 */ };
```

`L97-L108` 的 gutter/trim 阴影叠层继续使用 `config`（即 `binding`）、`isHorizontalBinding`、`gutterPx`、`canvasWidth`、`canvasHeight`、`scaleFactor`，字段名完全对齐，叠层逻辑不动。

## Before / After

### Before（三处样板合计约 30 行重复）

`EditorPage.tsx#L297-L311`（15 行）、`usePreview.ts#L33-L48`（16 行，含 `designDims` 取值）、`Preview.tsx#L45-L64`（20 行）。三处各自解析 `orientation → config → isHorizontalBinding → netWidthMm`，且 `Preview.tsx` 的 `ppi`/`canvasHeight` 算式与前两处不同，差异无文档记录。

### After（样板归零，算式语义显式化）

- 新增 `src/utils/printGeometry.ts`（约 60 行，含类型与注释）。
- `EditorPage.tsx` 的 `getExportDimensions` 收敛为 4 行（取 `rasterPx` + 取整）。
- `usePreview.ts` 的 `calculateFitZoom` 打印分支收敛为 5 行（取 `rasterPx`，无 `if/else`）。
- `Preview.tsx#L45-L64` 收敛为 7 行（解构 `canvasPx`/`content`/`binding`），`ppi`/`canvasHeight` 的语义由字段名 `canvasPx` 与 `rasterPx` 区分，不再依赖注释解释「为什么这里用满宽」。

样板复制消除，且「净宽 PPI」与「满宽 PPI」两套语义在函数签名层面就分开，避免后续误改。

## 风险与回滚

### 风险

1. **算式语义漂移**：本次重构**不改任何算式**，`rasterPx` 对齐 `EditorPage`/`usePreview` 原算式，`canvasPx`/`content` 对齐 `Preview.tsx` 原算式。唯一变更是非打印分支由函数内部回退处理，调用方删除 `if/else`。需在改造后用 `printSettings.enabled = false` 与 `enabled = true` 两组场景分别回归。**严重度：低。**
2. **`usePreview` 依赖数组**：`calculateFitZoom` 的 `useCallback` 依赖 `[pages, currentPageIndex, printSettings, isLoaded]`。改造后函数体内不再直接读 `designDims`，而是通过 `getPrintGeometry` 读 `LAYOUT_CONFIG`，依赖数组不变。但 `currentPage` 的取值从 `pages[currentPageIndex]` 来，`pages`/`currentPageIndex` 仍在依赖里，无需调整。**严重度：极低。**
3. **`EditorPage` 的 `LAYOUT_CONFIG`/`AspectRatioType` import**：`getExportDimensions` 不再直接用 `LAYOUT_CONFIG`，但 `EditorPage.tsx#L16` 的 `LAYOUT_CONFIG` import 仍服务于其他逻辑（如 `LAYOUT.EDITOR_PANEL_WIDTH`），不要顺手删。`AspectRatioType` 若仅此处使用需保留（`getPrintGeometry` 入参类型）。改造时用 `tsc --noEmit` 验证未引入未使用 import。**严重度：低。**
4. **`Preview.tsx` 的 `config` 引用**：`L97-L108` 大量引用 `config.bindingSide`/`config.trimSide`。改造后 `config = binding`，类型从内联对象变为 `PrintBindingConfig`，字段相同，TS 兼容。`L48` 的 `printSettings?.configs[orientation] || printSettings?.configs['resume']` 整段删除。**严重度：极低。**
5. **报告自带 `calcPrintLayoutGeometry` 的算式偏差未被引入**：本方案不采用报告设计稿的 `exportPpi` 垂直分支与 `canvasHeight = designDims.height`，而是保留现有语义。若后续需要「垂直装订按高度求 PPI」，应作为独立改动提案，不混入本次去重。**严重度：已规避。**

### 回滚

改造集中在 4 个文件：

- `src/utils/printGeometry.ts`（新增）
- `src/pages/EditorPage.tsx`（`L297-L311` 区段）
- `src/hooks/usePreview.ts`（`L33-L48` 区段）
- `src/components/Preview.tsx`（`L45-L64` 区段）

无 store schema 变更、无数据迁移、无对外接口变更。回滚即 `git revert` 对应提交，无副作用。

## 验证方式

1. **类型与单测**：
   - `npx tsc --noEmit` 确认 `getPrintGeometry`/`resolvePrintBinding` 类型推导通过，三处调用点无未使用 import。
   - `npm test -- usePreview` 跑通现有 9 个用例（含 `打印设置启用时按纸张尺寸计算`）。
   - `npm test -- EditorPage` 跑通现有 9 个用例。
   - 新增 `src/utils/__tests__/printGeometry.test.ts`，覆盖：
     - `enabled = false` 返回 `designDims` 原值，`scaleFactor = 1`、`gutterPx = 0`。
     - `enabled = true` + 水平装订（`bindingSide: 'left'`）：`rasterPx.width = Math.round(widthMm * designDims.width / (widthMm - gutterMm))`、`canvasPx.height = designDims.width * heightMm / widthMm`、`scaleFactor = (widthMm - gutterMm) / widthMm`。
     - `enabled = true` + 垂直装订（`bindingSide: 'top'`）：`rasterPx.ppi = designDims.width / widthMm`（**不**按高度求）、`scaleFactor = (heightMm - gutterMm) / heightMm`。
     - `configs[orientation]` 缺失时回退 `configs['resume']`，再缺失回退 `DEFAULT_BINDING`。

2. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程而非只看测试）：
   - 启动 dev server，打开一个 16:9 项目。
   - 进入 `Global Settings` 的 `Print` 标签，开启 Engine，设 `widthMm=210`、`heightMm=297`、`gutterMm=10`，`bindingSide=left`。
   - 确认主视口画布高度按 `210:297` 比例外扩（非 1080），装订阴影出现在左侧，内容区被缩放留出装订区。
   - 切 `bindingSide=top`，确认装订阴影移到顶部，内容缩放比例随之变化。
   - 导出当前页为 PNG，确认导出图尺寸 = `Math.round(210 * 1920 / 200)` × `Math.round(297 * 1920 / 200)` = 2016 × 2851（水平装订，扣装订）。
   - 导出全部页为 PDF，确认 PDF 页面尺寸与 PNG 一致（`jsPDF` format 取 `getExportDimensions`）。
   - 关闭 Engine，确认画布回到 1920×1080，导出图回到 1920×1080。

3. **回归对照**：改造前后对同一组 `printSettings` 各跑一次导出，比对 PNG 像素尺寸与 PDF 页面尺寸应**完全一致**（因算式未变，仅搬迁）。

## 涉及文件

- `src/utils/printGeometry.ts` —— 新增纯函数与类型。
- `src/utils/__tests__/printGeometry.test.ts` —— 新增单元测试。
- `src/pages/EditorPage.tsx`（`L297-L311`）—— `getExportDimensions` 改为调用 `getPrintGeometry`。
- `src/hooks/usePreview.ts`（`L33-L48`）—— `calculateFitZoom` 打印分支改为取 `rasterPx`。
- `src/components/Preview.tsx`（`L45-L64`）—— 画布几何改为解构 `getPrintGeometry` 结果。
