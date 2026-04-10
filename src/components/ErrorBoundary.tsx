import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      console.error("Unhandled rendering error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base px-6">
          <div className="max-w-xl text-center">
            <h1 className="font-display text-text-primary text-4xl mb-4">Something went wrong</h1>
            <p className="font-mono-body text-text-secondary text-sm mb-8">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-mono-label text-xs uppercase tracking-[0.12em] bg-accent-primary text-bg-base px-6"
              style={{ height: "44px" }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;