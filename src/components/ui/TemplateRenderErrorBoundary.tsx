import React, { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  templateId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TemplateRenderErrorBoundary extends Component<Props, State> {
  declare state: State;
  declare props: Readonly<Props>;
  declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;
  
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TemplateRender] Error in template:', this.props.templateId, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="text-center p-8 space-y-4">
            <AlertCircle size={48} className="mx-auto text-red-500" />
            <div>
              <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">模板渲染错误</h3>
              <p className="text-xs text-red-600 mt-2">{this.state.error?.message}</p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-500 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-600 transition"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
