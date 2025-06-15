/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Normalize different error types into a consistent format
 */
export function normalizeError(error: unknown): AppError {
  const timestamp = new Date();

  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
      details: error.stack,
      timestamp,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      timestamp,
    };
  }

  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    return {
      message: (errorObj.message as string) || "An unexpected error occurred",
      code: (errorObj.code as string) || (errorObj.name as string),
      details: errorObj,
      timestamp,
    };
  }

  return {
    message: "An unknown error occurred",
    timestamp,
  };
}

/**
 * Get user-friendly error messages for common error scenarios
 */
export function getUserFriendlyMessage(
  error: AppError,
  context?: ErrorContext
): string {
  const { message, code } = error;
  const action = context?.action || "";

  // Network and connectivity errors
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    code === "NetworkError"
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Authentication errors
  if (
    code === "AuthError" ||
    message.includes("authentication") ||
    message.includes("unauthorized")
  ) {
    return "Your session has expired. Please log in again to continue.";
  }

  // Permission errors
  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    code === "PermissionError"
  ) {
    return "You don't have permission to perform this action.";
  }

  // Database errors
  if (message.includes("database") || message.includes("PostgrestError")) {
    if (action.includes("save") || action.includes("create")) {
      return "Unable to save your changes. Please try again.";
    }
    if (action.includes("load") || action.includes("fetch")) {
      return "Unable to load data. Please refresh the page and try again.";
    }
    return "A database error occurred. Please try again.";
  }

  // Validation errors
  if (message.includes("validation") || message.includes("invalid")) {
    return "Please check your input and try again.";
  }

  // File upload errors
  if (action.includes("upload") || message.includes("file")) {
    return "File upload failed. Please check the file size and format, then try again.";
  }

  // Audio/voice errors
  if (
    message.includes("audio") ||
    message.includes("voice") ||
    action.includes("voice")
  ) {
    return "Audio playback is currently unavailable. You can continue without audio.";
  }

  // Scenario/dialogue specific errors
  if (action.includes("scenario") || action.includes("dialogue")) {
    if (action.includes("load")) {
      return "Unable to load the scenario. Please try selecting a different one.";
    }
    if (action.includes("save") || action.includes("complete")) {
      return "Unable to save your progress. Please try again.";
    }
  }

  // Progress/scoring errors
  if (action.includes("progress") || action.includes("score")) {
    return "Unable to update your progress. Your responses have been saved locally.";
  }

  // Generic fallback based on action
  if (action) {
    return `Unable to ${action}. Please try again.`;
  }

  // Last resort - clean up the original message if it's technical
  if (
    message.length > 100 ||
    message.includes("Error:") ||
    message.includes("Exception:")
  ) {
    return "Something went wrong. Please try again or contact support if the problem persists.";
  }

  return message;
}

/**
 * Determine error severity for logging and UI purposes
 */
export function getErrorSeverity(
  error: AppError,
  context?: ErrorContext
): ErrorSeverity {
  const { message, code } = error;
  const action = context?.action || "";

  // Critical errors that break core functionality
  if (
    code === "AuthError" ||
    message.includes("authentication") ||
    message.includes("database connection") ||
    action.includes("login") ||
    action.includes("signup")
  ) {
    return "critical";
  }

  // High severity errors that significantly impact user experience
  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    action.includes("save") ||
    action.includes("complete") ||
    action.includes("progress")
  ) {
    return "high";
  }

  // Medium severity errors that impact specific features
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    action.includes("load") ||
    action.includes("upload")
  ) {
    return "medium";
  }

  // Low severity errors for non-critical features
  return "low";
}

/**
 * Log errors for debugging and monitoring
 */
export function logError(
  error: AppError,
  context?: ErrorContext,
  severity?: ErrorSeverity
): void {
  const logLevel = severity || getErrorSeverity(error, context);

  // In development, always log to console
  if (import.meta.env.DEV) {
    console.group(`🚨 ${logLevel.toUpperCase()} Error`);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Context:", context);
    console.error("Details:", error.details);
    console.groupEnd();
  }

  // In production, you might want to send to an error tracking service
  if (import.meta.env.PROD && logLevel === "critical") {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(logData);
  }
}

/**
 * Handle errors consistently across the application
 */
export function handleError(
  error: unknown,
  context?: ErrorContext,
  options?: {
    showToast?: boolean;
    logError?: boolean;
    fallbackMessage?: string;
  }
): AppError {
  const normalizedError = normalizeError(error);
  const severity = getErrorSeverity(normalizedError, context);

  // Log the error if enabled (default: true)
  if (options?.logError !== false) {
    logError(normalizedError, context, severity);
  }

  return normalizedError;
}

/**
 * Create error context for better error tracking
 */
export function createErrorContext(
  component: string,
  action: string,
  additionalData?: Record<string, unknown>
): ErrorContext {
  return {
    component,
    action,
    additionalData,
  };
}
