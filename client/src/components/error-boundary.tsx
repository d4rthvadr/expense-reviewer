"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chart Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent {...this.state} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: ErrorBoundaryState) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-muted-foreground mb-4">
        Failed to load chart data
      </p>
      {error && (
        <p className="text-xs text-muted-foreground mb-4">{error.message}</p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

export default ErrorBoundary;
