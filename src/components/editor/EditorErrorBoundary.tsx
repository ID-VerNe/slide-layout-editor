import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * EditorPanel 局部错误边界
 * 仅替换右侧编辑面板,保留工作区其余部分与 store,避免顶层 EB 全屏清空
 * 切页复位由父级通过 React key 变化触发重挂实现,无需组件内部状态同步
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

