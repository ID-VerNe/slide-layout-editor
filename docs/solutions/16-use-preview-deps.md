# 5.2 usePreview 依赖解耦

> 对应 `docs/code-review-report.md` 第 819-843 行 5.2 节。
> 关联 3.2 节(`calcPrintLayoutGeometry` 纯函数抽离)。

## 事实核对

核对 `src/hooks/usePreview.ts` 当前实现:

1. **`calculateFitZoom` 依赖全量 `pages`**:属实。`usePreview.ts:54` 依赖数组为 `[pages, currentPageIndex, printSettings, isLoaded]`。函数体(`usePreview.ts:32-33`)仅读取 `pages[currentPageIndex].aspectRatio` 一个标量,从不遍历 `pages`——整个数组引用进依赖列表纯属冗余。
2. **`useEffect` 因 `calculateFitZoom` 变动而重建 `ResizeObserver`**:属实。`usePreview.ts:82` 依赖数组为 `[isAutoFit, calculateFitZoom, isLoaded]`,`calculateFitZoom` 是 `useCallback` 返回值,其引用随 `pages` 变更而变更,触发 effect cleanup(`observer.disconnect()`)后重建 observer。
3. **打字触发链路**:5.1 节已核证 `EditorPage` 经 `useProject` 订阅 `pages`,每次键入即获新 `pages` 引用并重渲染 `usePreview`。路径成立。

**与 report 描述一致。** 一处补充:`useEffect` 内部 `setTimeout(..., 100)` 防抖只压住 observer 回调到 `setPreviewZoom` 的频率,未压住 effect 自身因 `calculateFitZoom` 引用变更而执行的 teardown/rebuild——这是 report 未点明的第二层抖动。

## 根因

`calculateFitZoom` 真正需要的状态只有三个标量:

- 当前页宽高比 `aspectRatio`(字符串)
- `printSettings`(印刷配置)
- `isLoaded`(挂载门控)

却把承载全量幻灯片的 `pages` 数组写进 `useCallback` 依赖。`pages` 在内容编辑、撤销重做、拖拽排序等场景下都会被替换为新引用,导致:

1. `calculateFitZoom` 引用按键频率失效;
2. 依赖它的 `ResizeObserver` effect 每次都走 cleanup → `disconnect()` → `new ResizeObserver()` → `observe()`;
3. observer 重建会触发一次初始回调(部分浏览器在 `observe` 后立即派发尺寸事件),叠加 100ms 防抖,表现为缩放值在打字间隙被反复重算——即 report 所称视口计算抖动。

同时该 effect 把 `isAutoFit` 也写进依赖,切换自动适配/手动缩放也会无谓拆装 observer。

## 解决方案

两步:

1. 把 `pages[currentPageIndex].aspectRatio` 在 hook 顶层提为标量 `currentRatio`,`calculateFitZoom` 依赖改为 `[currentRatio, printSettings, isLoaded]`。
2. 拆分 effect:observer effect 只依赖 `[isLoaded]`,内部经 ref 调用最新计算函数与最新 `isAutoFit`;另设一个 effect 专责页面切换/印刷设置变更时重算,不触碰 observer。

几何计算改走 3.2 节抽离的 `calcPrintLayoutGeometry`,与本 hook 解耦。

> 前置:`src/utils/printGeometry.ts`(3.2 节)须先落地。若该纯函数尚未存在,本方案无法编译——须与 3.2 协同推进。

### 实现代码

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { AspectRatioType } from '../constants/layout';
import { PrintSettings } from '../types';
import { calcPrintLayoutGeometry } from '../utils/printGeometry';

interface UsePreviewOptions {
  pages: any[];
  currentPageIndex: number;
  printSettings: PrintSettings;
  isLoaded?: boolean;
  minimalCounter?: boolean;
}

export function usePreview({ pages, currentPageIndex, printSettings, isLoaded = true }: UsePreviewOptions) {
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [pagesOverflow, setPagesOverflow] = useState<Record<string, boolean>>({});

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 仅取标量宽高比,切断对全量 pages 数组的依赖
  const currentRatio = (pages[currentPageIndex]?.aspectRatio || '16:9') as AspectRatioType;

  const calculateFitZoom = useCallback(() => {
    if (!isLoaded || !previewContainerRef.current) return 0.5;
    const rect = previewContainerRef.current.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return 0.5;

    // 印刷几何统一走纯函数,消除三处同构计算
    const { preview } = calcPrintLayoutGeometry(currentRatio, printSettings);
    const padding = 120;
    const scaleX = (rect.width - padding) / preview.canvasWidth;
    const scaleY = (rect.height - padding) / preview.canvasHeight;
    return Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
  }, [currentRatio, printSettings, isLoaded]);

  // 暂存最新计算函数与适配开关,避免其引用变动时重建 observer
  const fitZoomRef = useRef(calculateFitZoom);
  fitZoomRef.current = calculateFitZoom;
  const autoFitRef = useRef(isAutoFit);
  autoFitRef.current = isAutoFit;

  // 1. observer 仅依赖 isLoaded,挂载期单次建立,打字不再拆装
  useEffect(() => {
    if (!previewContainerRef.current || !isLoaded) return;

    let timeoutId: any;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (autoFitRef.current) {
          setPreviewZoom(fitZoomRef.current());
        }
      }, 100);
    });

    observer.observe(previewContainerRef.current);

    const initTimer = setTimeout(() => {
      if (autoFitRef.current) setPreviewZoom(fitZoomRef.current());
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [isLoaded]);

  // 2. 页面切换或印刷设置变化时重算,独立于 observer 生命周期
  useEffect(() => {
    if (!isLoaded || !isAutoFit) return;
    setPreviewZoom(calculateFitZoom());
  }, [calculateFitZoom, isAutoFit]);

  const handleManualZoom = (value: number) => {
    setIsAutoFit(false);
    setPreviewZoom(value);
  };

  const toggleFit = () => {
    setIsAutoFit(!isAutoFit);
  };

  const handleOverflowChange = (pageId: string, isOverflowing: boolean) => {
    setPagesOverflow(prev => {
      if (prev[pageId] === isOverflowing) return prev;
      return { ...prev, [pageId]: isOverflowing };
    });
  };

  return {
    previewZoom,
    setPreviewZoom,
    isAutoFit,
    setIsAutoFit,
    pagesOverflow,
    previewRef,
    previewContainerRef,
    handleManualZoom,
    toggleFit,
    handleOverflowChange
  };
}
```

## Before / After

### 依赖列表对比

| 位置 | Before | After |
|------|--------|-------|
| `calculateFitZoom` | `[pages, currentPageIndex, printSettings, isLoaded]` | `[currentRatio, printSettings, isLoaded]` |
| observer effect | `[isAutoFit, calculateFitZoom, isLoaded]` | `[isLoaded]` |
| 页面切换 effect | `[currentPageIndex, isAutoFit, isLoaded, calculateFitZoom]` | `[calculateFitZoom, isAutoFit]` |

### 行为对比

| 场景 | Before | After |
|------|--------|-------|
| 键入一个字符 | `pages` 新引用 → `calculateFitZoom` 失效 → observer teardown/rebuild → 100ms 后重算 zoom | `currentRatio` 标量不变 → `calculateFitZoom` 引用稳定 → observer 不动 |
| 切换自动适配 | observer teardown/rebuild | observer 不动,仅 effect #2 重算一次 |
| 切页 | effect #2 重算 | effect #2 重算(等价) |
| 改印刷设置 | observer teardown/rebuild + 重算 | observer 不动,仅 effect #2 重算 |

## 风险与回滚

- **前置依赖**:`calcPrintLayoutGeometry` 须由 3.2 节先抽离至 `src/utils/printGeometry.ts`。若 3.2 未落地,本方案不可单独合入。
- **render 期 ref 赋值**:`fitZoomRef.current = calculateFitZoom` 在渲染期写入 ref,属 React 社区惯用模式(useEvent 等价写法),非副作用外泄。若团队规范禁用,可改为 `useEffect(() => { fitZoomRef.current = calculateFitZoom; }, [calculateFitZoom])`,代价是多一次 effect 调度。
- **行为差异**:切换 `isAutoFit` 不再触发 observer 重建,改由 effect #2 在 `isAutoFit` 翻 true 时重算。`toggleFit` 测试已覆盖该路径。
- **`printSettings` 引用稳定性**:本方案假定 `useStore(s => s.printSettings)` 在非印刷设置编辑时返回同一引用(Zustand 选择器语义)。若 5.1 节后续把 `useProject` 改为返回聚合新对象且未对 `printSettings` 做浅比较,则 `printSettings` 引用会随每次键入变更,本方案降级——须 5.1 同步保证 `printSettings` 选择器返回稳定引用。
- **回滚**:`git checkout -- src/hooks/usePreview.ts` 即可还原;无数据迁移、无持久化。

## 验证方式

1. **既有测试全过**:`src/hooks/__tests__/usePreview.test.ts` 共 8 例,覆盖默认 0.5、ResizeObserver 重算、`isLoaded=false` 不计算、手动缩放、`toggleFit`、印刷设置启用、溢出状态同一性、切页重算。依赖列表变更不破坏其中任何一例——`currentRatio` 在样本页中随 `currentPageIndex` 变化,等价触发原 `currentPageIndex` 路径。

2. **新增回归测试(建议)**:在 `usePreview.test.ts` 增一例,模拟键入——传入同一 `aspectRatio` 但 `pages` 数组引用每次新建的 `rerender`,断言 `ResizeObserver.disconnect` 调用次数为 0(或 `calculateFitZoom` 引用未变)。该例直接锁死本节回归。

3. **手动验证**:编辑器中连续键入文字,DevTools Performance 录制——Before 可见 observer 周期性 teardown/rebuild 节点;After 仅余 100ms 防抖回调。缩放值在键入过程中保持稳定。

4. **关联验证**:3.2 节落地后,`Preview.tsx`、`EditorPage.getExportDimensions`、`usePreview` 三处共用 `calcPrintLayoutGeometry`,几何结果须一致——可加一表驱动测试对三处输出做交叉断言。
