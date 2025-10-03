// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ErrorHandlingOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  fallbackValue?: unknown;
}

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // Database errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',

  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_INVALID: 'FILE_TYPE_INVALID',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Please log in to continue',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid authentication credentials',

  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again',
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the server',

  [ERROR_CODES.DB_CONNECTION_ERROR]: 'Database connection error',
  [ERROR_CODES.DB_QUERY_ERROR]: 'Database query error',
  [ERROR_CODES.DB_CONSTRAINT_ERROR]: 'Data validation error',

  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Maximum size is 5MB',
  [ERROR_CODES.FILE_TYPE_INVALID]:
    'Invalid file type. Please use JPG, PNG, or GIF',
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed. Please try again',

  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.REQUIRED_FIELD_MISSING]: 'Required field is missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format',

  [ERROR_CODES.PERMISSION_DENIED]:
    'You do not have permission to perform this action',
  [ERROR_CODES.INSUFFICIENT_PRIVILEGES]:
    'Insufficient privileges for this operation',

  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.OPERATION_FAILED]: 'Operation failed. Please try again',
} as const;

// Error handling service
export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLog: AppError[] = [];
  private maxErrorLogSize = 100;

  private constructor() {}

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  // Create a standardized error object
  createError(
    code: keyof typeof ERROR_CODES,
    message?: string,
    details?: string,
    context?: Record<string, unknown>
  ): AppError {
    const error: AppError = {
      code: ERROR_CODES[code],
      message: message || ERROR_MESSAGES[code],
      details,
      timestamp: new Date(),
      context,
    };

    this.logError(error);
    return error;
  }

  // Handle different types of errors
  handleError(error: unknown, options: ErrorHandlingOptions = {}): AppError {
    const { showNotification = true, logToConsole = true } = options;

    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
    } else if (this.isSupabaseError(error)) {
      // Type guard to ensure error has required properties
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'details' in error
      ) {
        appError = this.convertSupabaseError(
          error as { message?: string; details?: string; code?: string }
        );
      } else {
        appError = this.createError('UNKNOWN_ERROR', 'Database error occurred');
      }
    } else if (this.isNetworkError(error)) {
      appError = this.createError('NETWORK_ERROR', 'Network error occurred');
    } else {
      appError = this.createError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred'
      );
    }

    // Log to console if requested
    if (logToConsole) {
      console.error('Error handled:', appError);
    }

    // Show notification if requested
    if (showNotification) {
      this.showErrorNotification(appError);
    }

    return appError;
  }

  // Check if error is retryable
  isRetryableError(error: AppError): boolean {
    const retryableCodes = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_CODES.CONNECTION_ERROR,
      ERROR_CODES.DB_CONNECTION_ERROR,
    ] as const;

    return retryableCodes.includes(
      error.code as (typeof retryableCodes)[number]
    );
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: AppError): string {
    return error.message;
  }

  // Get technical error details for debugging
  getTechnicalDetails(error: AppError): string {
    return `${error.code}: ${error.message}${error.details ? ` - ${error.details}` : ''}`;
  }

  // Log error to internal log
  private logError(error: AppError): void {
    this.errorLog.push(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxErrorLogSize);
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check if error is AppError
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'timestamp' in error
    );
  }

  // Check if error is Supabase error
  private isSupabaseError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'details' in error
    );
  }

  // Convert Supabase error to AppError
  private convertSupabaseError(error: {
    message?: string;
    details?: string;
    code?: string;
  }): AppError {
    let code: keyof typeof ERROR_CODES = 'UNKNOWN_ERROR';
    let message = error.message || 'Database error occurred';
    const details = error.details || '';

    // Map Supabase error codes to our error codes
    if (error.code === 'PGRST116') {
      code = 'AUTH_REQUIRED';
      message = 'Authentication required';
    } else if (error.code === 'PGRST301') {
      code = 'PERMISSION_DENIED';
      message = 'Permission denied';
    } else if (error.code === '23505') {
      code = 'DB_CONSTRAINT_ERROR';
      message = 'Data already exists';
    } else if (error.code === '23503') {
      code = 'DB_CONSTRAINT_ERROR';
      message = 'Referenced data not found';
    }

    return this.createError(code, message, details);
  }

  // Check if error is network error
  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      const networkErrorMessages = [
        'network error',
        'fetch failed',
        'connection refused',
        'timeout',
        'aborted',
      ];

      return networkErrorMessages.some((msg) =>
        error.message.toLowerCase().includes(msg)
      );
    }
    return false;
  }

  // Show error notification (placeholder - would integrate with notification system)
  private showErrorNotification(_error: AppError): void {
    // This would integrate with your notification system
    // For now, we'll just log it
  }

  // Retry operation with optimized retry logic
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
  ): Promise<T> {
    const { OptimizedRetryService } = await import(
      '@/services/retry/OptimizedRetryService'
    );

    const result = await OptimizedRetryService.executeWithRetry(operation, {
      maxRetries,
      baseDelay,
      backoffStrategy: 'linear',
      retryCondition: (error) => this.isRetryableError(error as AppError),
    });

    if (!result.success) {
      throw this.handleError(result.error!, { showNotification: false });
    }

    return result.data!;
  }

  // Handle async operations with error handling
  async safeExecute<T>(
    operation: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<{ success: boolean; data?: T; error?: AppError }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const appError = this.handleError(error, options);
      return { success: false, error: appError };
    }
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();

// Utility functions
export function createError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: string,
  context?: Record<string, unknown>
): AppError {
  return errorHandlingService.createError(code, message, details, context);
}

export function handleError(
  error: unknown,
  options?: ErrorHandlingOptions
): AppError {
  return errorHandlingService.handleError(error, options);
}

export function safeExecute<T>(
  operation: () => Promise<T>,
  options?: ErrorHandlingOptions
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  return errorHandlingService.safeExecute(operation, options);
}
