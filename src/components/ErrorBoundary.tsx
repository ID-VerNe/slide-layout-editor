import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-inner">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Something went wrong</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                The editor encountered an unexpected crash.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-left">
              <p className="text-[10px] font-mono text-slate-500 break-all opacity-70">
                {this.state.error?.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 py-4 bg-[#264376] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#264376]/20 active:scale-95"
              >
                <RefreshCcw size={14} /> Reload
              </button>
              <button
                onClick={() => window.location.href = '#/'}
                className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#264376]/30 hover:text-[#264376] transition-all active:scale-95"
              >
                <Home size={14} /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
