import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4 cyber-card border border-rose-500/40 rounded-2xl bg-black/60 m-4">
          <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-heading font-bold text-foreground">
            Neural Subsystem Interrupted
          </h2>
          <p className="text-xs font-mono text-muted-foreground max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-neon-glow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Subsystem
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" /> Return to Root
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
