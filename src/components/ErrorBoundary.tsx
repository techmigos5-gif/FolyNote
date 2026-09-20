import React from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: null };

  static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  componentDidCatch(err: unknown, info: React.ErrorInfo) {
    console.error('FolyNote crashed inside an error boundary:', err, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, message: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFCFE] dark:bg-[#141118] text-gray-900 dark:text-gray-100 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-[#1E1729] p-8 text-center shadow-xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              FolyNote hit an unexpected error. Your data is safe — everything is stored
              locally and in your private cloud space.
            </p>
            {this.state.message && (
              <p className="text-xs font-mono text-gray-400 dark:text-gray-500 break-words pt-1">
                {this.state.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition cursor-pointer"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Reload FolyNote</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            <span>Your files. Your thoughts. Your space.</span>
          </p>
        </div>
      </div>
    );
  }
}
