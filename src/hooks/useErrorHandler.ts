import { useCallback } from "react";
import { useToast } from "../context";
import {
  handleError,
  getUserFriendlyMessage,
  getErrorSeverity,
  type ErrorContext,
  type AppError,
} from "../utils/errorUtils";

interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  logError?: boolean;
}

interface ErrorHandlerResult {
  handleError: ({
    error,
    action,
    additionalContext,
    showsToast,
  }: {
    error: unknown;
    action?: string;
    additionalContext?: Record<string, unknown>;
    showsToast?: boolean;
  }) => AppError;
  handleAsyncError: ({
    asyncFn,
    action,
    additionalContext,
    showsToast,
  }: {
    asyncFn: () => Promise<void>;
    action?: string;
    additionalContext?: Record<string, unknown>;
    showsToast?: boolean;
  }) => Promise<void>;
}

/**
 * Custom hook for consistent error handling across components
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): ErrorHandlerResult {
  const { showToast } = useToast();
  const {
    component,
    showToast: shouldShowToast = true,
    logError: shouldLogError = true,
  } = options;

  const handleErrorCallback = useCallback(
    ({
      error,
      action,
      additionalContext,
      showsToast = true,
    }: {
      error: unknown;
      action?: string;
      additionalContext?: Record<string, unknown>;
      showsToast?: boolean;
    }): AppError => {
      const context: ErrorContext = {
        component,
        action,
        additionalData: additionalContext,
      };

      const normalizedError = handleError(error, context, {
        logError: shouldLogError,
      });

      // Show toast notification if enabled
      if (shouldShowToast) {
        const userMessage = getUserFriendlyMessage(normalizedError, context);
        const severity = getErrorSeverity(normalizedError, context);

        // Map severity to toast type
        const toastType =
          severity === "critical" || severity === "high" ? "error" : "warning";
        if (showsToast) showToast(userMessage, { type: toastType });
      }

      return normalizedError;
    },
    [component, shouldShowToast, shouldLogError, showToast]
  );

  const handleAsyncError = useCallback(
    async ({
      asyncFn,
      action,
      additionalContext,
      showsToast = true,
    }: {
      asyncFn: () => Promise<void>;
      action?: string;
      additionalContext?: Record<string, unknown>;
      showsToast?: boolean;
    }): Promise<void> => {
      try {
        await asyncFn();
      } catch (error) {
        handleErrorCallback({ error, action, additionalContext, showsToast });
      }
    },
    [handleErrorCallback]
  );

  return {
    handleError: handleErrorCallback,
    handleAsyncError,
  };
}
