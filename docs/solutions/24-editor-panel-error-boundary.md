# 6.4 EditorPanel 局部 Error Boundary

## 事实核对

报告 6.4 节描述与实际代码一致,无错误前提。

1. **顶层 EB 存在且会清空工作区**:`src/App.tsx:46` 用 `<ErrorBoundary>` 包裹整个应用。该 EB 来自 `src/components/ErrorBoundary.tsx`,其 fallback 渲染 `min-h-screen` 全屏遮罩,仅提供 `Reload`(强制 `window.location.reload()`)与 `Home`(跳转 `#/`)两个按钮。一旦触发,整棵 React 树被替换,store 在内存中的未保存编辑随之丢弃。
2. **画布层 EB 存在**:`src/templates/schemas/LayoutRenderer.tsx:40` 用 `<TemplateErrorBoundary>` 包裹 `LayoutRendererInternal`,画布侧已有局部隔离。
3. **EditorPanel 确实裸奔**:`src/components/editor/EditorPanel.tsx` L1-46 全文无任何 Boundary。其内部 `<Editor>`(`src/components/Editor.tsx`)通过 `@tanstack/react-virtual` 虚拟化渲染 `FieldRenderer` → `componentMap` 中 30 余个字段组件(含 `ResumeContentHub` 多层树解析、`BentoField` 动态网格计算等)。任一字段在渲染期抛错,异常会沿 `FieldRenderer → Editor → EditorPanel → EditorPage → 顶层 ErrorBoundary` 一路上冒,最终触发全屏白屏。
4. **自动保存协同点**:`src/pages/EditorPage.tsx:109-120` 实现 3s 防抖自动保存,触发条件为 `hasUnsavedChanges`。顶层 EB 触发后唯一的 `Reload` 恢复路径会丢弃「最后一次编辑后未满 3s」的内存数据。`TopNav`(`src/components/editor/TopNav.tsx:70-71`)的 Undo/Redo 按钮位于 EditorPanel 之外,本可在崩溃后继续使用,但顶层 EB 已把整棵树替换掉,Undo 无从触发。

补充一处报告未点明的细节:`EditorPanel` 在 `EditorPage` 中是常驻单实例,跨页切换不重新挂载。因此局部 Boundary 必须在切换 `currentPage` 时自动复位,否则一页崩溃会连累所有后续页都停留在降级 UI。

## 根因

EditorPanel 缺少局部 Error Boundary,导致渲染期异常的错误传播半径等于「整个应用」。

- 渲染期异常一旦越过 EditorPanel,就没有任何中间层能截断:`Editor` 与 `FieldRenderer` 都是普通函数组件,不具备错误捕获能力。
- 顶层 EB 的 fallback 设计目标是「不可恢复的致命错误」,其恢复手段(`Reload`/`Home`)天然会清空工作区,把它当作编辑面板的兜底等于把局部控件故障升级成全局灾难。
- 自动保存与 Undo 这两条数据恢复通道都依赖 React 树存活:顶层 EB 替换整棵树后,两条通道同时失效。崩溃发生时,用户最近一次编辑若未满 3s 防抖窗口,数据彻底丢失。

## 解决方案

在 EditorPanel 内部为 `<Editor>` 包裹一个专用的局部 Boundary:降级 UI 只替换右侧 400px 面板,不动 PreviewArea / Sidebar / TopNav / store。配合 `key={currentPage.id}` 实现切页自动复位,并在 fallback 中提示用户使用 TopNav 的 Undo 后点击 Retry,与现有自动保存/Undo 通道协同完成数据恢复。

### 新增组件:`src/components/editor/EditorErrorBoundary.tsx`

```tsx
import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  // 用于在 page 切换时强制重新挂载,清空历史错误态
  resetKey: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * EditorPanel 局部错误边界
 * 仅替换右侧编辑面板,保留工作区其余部分与 store,避免顶层 EB 全屏清空
 */
export class EditorErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('[EditorPanel] render crash:', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center"
        >
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-950">
              Field crashed
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              此页编辑面板渲染失败。可在顶部工具栏 Undo 后重试,工作区其他部分不受影响。
            </p>
          </div>
          <pre className="w-full max-w-full overflow-auto bg-slate-50 p-3 rounded-md text-[10px] font-mono text-slate-500 break-all">
            {this.state.error?.message ?? 'Unknown error'}
          </pre>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-5 py-3 bg-[#264376] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

`resetKey` 不在组件内部消费,仅作为 React `key` 的载体由父级使用(见下文),用最小的生命周期干预实现「切页即复位」。无需 `componentDidUpdate` 比较前后 prop,避免引入额外的状态同步逻辑。

### 改造:`src/components/editor/EditorPanel.tsx`

```tsx
import React from 'react';
import { Type } from 'lucide-react';
import Editor from '../Editor';
import { PageData, CustomFont } from '../../types';
import { EditorErrorBoundary } from './EditorErrorBoundary';

interface EditorPanelProps {
  currentPage: PageData;
  onUpdatePage: (page: PageData, silent?: boolean) => void;
  onRemovePage: (id: string) => void;
  customFonts: CustomFont[];
  pages?: PageData[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentPage,
  onUpdatePage,
  customFonts,
  pages,
}) => {
  return (
    <div className="w-[400px] h-full bg-white flex flex-col border-l border-slate-950">
      <div className="h-16 px-6 border-b border-slate-950 bg-white flex justify-between items-center shrink-0">
        <h2 className="font-black text-slate-950 flex items-center gap-3 uppercase text-sm tracking-[0.2em]">
          <Type size={16} strokeWidth={3} className="text-slate-950" />
          Editor
        </h2>
      </div>

      <div id="editor-scroll-container" className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
        {/* 切页时通过 key 重置 Boundary 错误态,避免上一页的错误连累新页 */}
        <EditorErrorBoundary resetKey={currentPage.id} key={currentPage.id}>
          <Editor
            page={currentPage}
            onUpdate={onUpdatePage}
            customFonts={customFonts}
            pages={pages}
          />
        </EditorErrorBoundary>
      </div>
    </div>
  );
};

export default EditorPanel;
```

`onRemovePage` 在原实现中解构后未使用,本方案保持现状不动,不引入与本问题无关的清理(如需处理应单开 issue)。

### 恢复链路(与自动保存协同)

崩溃发生时,`EditorErrorBoundary` 截断异常,store 与 `EditorPage` 的自动保存 effect 仍存活:

1. 用户最近一次编辑若未满 3s 防抖窗口 → store 中的 bad data 尚未落盘,TopNav 的 Undo(`src/components/editor/TopNav.tsx:70`)可回退到上一个 history 项。
2. Undo 后 store 中 `currentPage` 引用变化,但 `currentPage.id` 不变 → Boundary 仍停留在降级态(这是期望行为:避免每次编辑都强制复位),用户点击 Retry,Editor 以回退后的数据重新挂载。
3. 若 bad data 已被自动保存落盘,Undo 仍可从 history 栈恢复(undo/redo 操作 store 的 past/future 快照,与 DB 落盘相互独立)。
4. 切换到其他页 → `key` 变化 → Boundary 重新挂载,自动清空错误态。

## Before / After

### Before

```
Field 抛错
  └─> Editor (函数组件,无捕获)
        └─> EditorPanel (无捕获)
              └─> EditorPage
                    └─> 顶层 ErrorBoundary
                          └─> 全屏白屏 + Reload/Home
                                └─> window.location.reload()
                                      └─> 内存 store 丢失,未满 3s 的编辑全丢
```

### After

```
Field 抛错
  └─> Editor
        └─> EditorErrorBoundary (截断)
              └─> 仅 400px 面板替换为降级 UI (Retry)
                    └─> PreviewArea / Sidebar / TopNav / store 继续存活
                          └─> 用户 Undo 回退 bad data → Retry 重新挂载 Editor
                                └─> 自动保存 effect 仍在运行,可正常落盘回退后的数据
```

## 风险与回滚

- **风险一:Boundary 粒度只到 EditorPanel,字段级异常仍会让整列字段一起降级。**
  这是刻意选择的最简实现:字段级 Boundary 需要在 `FieldRenderer` 或 `Editor` 的虚拟化行渲染中逐个包裹,会显著增加复杂度且与 `@tanstack/react-virtual` 的 `measureElement` 行为耦合。当前需求是「不清空工作区、保留可恢复路径」,EditorPanel 级隔离已满足。若后续某字段频繁崩溃影响其他字段操作,再单独为其加 Boundary。

- **风险二:`key={currentPage.id}` 在页面 id 变化时强制重挂,会丢弃 Boundary 内部一切瞬时态。**
  但 Boundary 内部只有 `Editor`,其状态源自 store prop,无自持状态,重挂无副作用。`Editor` 是 `React.memo`,本就随 `page` 变化重渲染。

- **风险三:Retry 仅重置 Boundary state,不重新执行导致崩溃的副作用。**
  渲染期异常通常是纯函数渲染错误(读 undefined 字段等),Retry 等价于以相同 props 重新渲染。若 props 未变(用户未 Undo),Retry 会再次崩溃 → 用户停留在降级态,需先 Undo。这与方案设计的恢复链路一致,不是缺陷。

- **回滚**:删除 `EditorErrorBoundary.tsx`,还原 `EditorPanel.tsx` 的两行改动即可。无对外 API、无 store 改动、无类型变更,回滚成本等于本次改动行数。

## 验证方式

### 单元测试:新增 `src/components/editor/__tests__/EditorErrorBoundary.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EditorErrorBoundary } from '../EditorErrorBoundary';

const Thrower: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

describe('EditorErrorBoundary', () => {
  it('子组件抛错时渲染降级 UI 且不清空父级', () => {
    const { container } = render(
      <div data-testid="parent">
        <EditorErrorBoundary resetKey="p1">
          <Thrower message="boom" />
        </EditorErrorBoundary>
      </div>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    // 父级存活:未发生整树替换
    expect(container.querySelector('[data-testid="parent"]')).not.toBeNull();
  });

  it('点击 Retry 后重置错误态并尝试重新渲染子组件', () => {
    render(
      <EditorErrorBoundary resetKey="p1">
        <Thrower message="boom" />
      </EditorErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Retry/));
    // Retry 后子组件再次抛错,Boundary 应仍能捕获并渲染降级 UI
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('resetKey 变化时重新挂载,清空历史错误态', () => {
    const Good: React.FC = () => <div data-testid="good">ok</div>;
    const { rerender } = render(
      <EditorErrorBoundary resetKey="p1">
        <Thrower message="boom" />
      </EditorErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <EditorErrorBoundary resetKey="p2">
        <Good />
      </EditorErrorBoundary>
    );
    // key 变化触发重挂,Good 正常渲染
    expect(screen.getByTestId('good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

### 现有测试影响评估

- `src/pages/__tests__/EditorPage.test.tsx:176` 用 `vi.mock` 整体替换 `EditorPanel`,本改动在 EditorPanel 内部,不影响该 mock。
- `src/components/editor/__tests__/FieldRenderer.test.tsx` 直接渲染 `FieldRenderer`,不经过 EditorPanel,不受影响。
- 不存在 `EditorPanel.test.tsx`,无需更新。

### 手工验证

1. `pnpm dev` 启动编辑器,打开一个 Resume 模板页。
2. 在 DevTools 中给 `ResumeContentHub` 注入运行时抛错(或临时在某 Field 顶部加 `throw new Error('test')`)。
3. 确认:右侧面板显示降级 UI,左侧画布、Sidebar、TopNav 继续可交互。
4. 点击 TopNav Undo,再点击面板内 Retry,确认编辑面板恢复正常。
5. 切换到另一页再切回,确认降级态已自动清空。
6. `pnpm lint` 与 `pnpm test` 全量通过。
