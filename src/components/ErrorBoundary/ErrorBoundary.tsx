import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import {
  normalizeError,
  logError,
  createErrorContext,
} from "../../utils/errorUtils";
import "./ErrorBoundary.scss";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    const normalizedError = normalizeError(error);
    const context = createErrorContext("ErrorBoundary", "componentDidCatch", {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    logError(normalizedError, context, "critical");

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <AlertTriangle size={64} />
            </div>

            <div className="error-boundary__content">
              <h1 className="error-boundary__title">Something went wrong</h1>

              <p className="error-boundary__message">
                We're sorry, but something unexpected happened. The error has
                been logged and we'll work to fix it as soon as possible.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="error-boundary__details">
                  <summary>Error Details (Development)</summary>
                  <pre className="error-boundary__error-text">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="error-boundary__actions">
                <button onClick={this.handleRetry} className="btn btn-primary">
                  <RefreshCw size={20} />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="btn btn-secondary"
                >
                  <Home size={20} />
                  Go Home
                </button>

                <button onClick={this.handleReload} className="btn">
                  <RefreshCw size={20} />
                  Reload Page
                </button>
              </div>

              {this.state.errorId && (
                <p className="error-boundary__error-id">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
