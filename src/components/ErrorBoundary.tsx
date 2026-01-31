"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
};

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UI crash caught by ErrorBoundary", error, info);
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Что-то пошло не так</h1>
          <p className="text-sm text-muted-foreground">
            Попробуйте обновить страницу. Если проблема повторяется, проверьте ввод или сеть.
          </p>
          {this.state.errorMessage && (
            <p className="text-xs text-muted-foreground">
              Детали: {this.state.errorMessage}
            </p>
          )}
          <button
            type="button"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-foreground/60"
            onClick={this.handleReload}
          >
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
