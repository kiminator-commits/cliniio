/**
 * Centralized error handling for BI Failure services.
 * Provides consistent error types, validation, and retry mechanisms.
 */

import { BIFailureError, BIFailureErrorCodes } from './BIFailureError';

interface DatabaseError {
  code?: string;
  message?: string;
  details?: string;
}

interface NetworkError {
  code?: string;
  message?: string;
}

interface ErrorWithDetails {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
}

export class BIFailureErrorHandler {
  private static lastError: Error | null = null;
  private static errorCount = 0;
  private static readonly MAX_ERRORS = 100;

  /**
   * Handles database-related errors during BI failure operations
   */
  static handleDatabaseError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): never {
    this.logError('DATABASE_ERROR', error, operation, context);

    // Type guard to check if error has database error properties
    const dbError = error as DatabaseError;

    // Handle specific database error codes
    if (dbError?.code === 'PGRST116') {
      throw new BIFailureError(
        `Database connection error during ${operation}: ${dbError.message || 'Unknown error'}`,
        'DATABASE_CONNECTION_ERROR',
        'critical',
        true
      );
    }

    if (dbError?.code === '23505') {
      throw new BIFailureError(
        `Duplicate record error during ${operation}: ${dbError.message || 'Unknown error'}`,
        'DUPLICATE_RECORD_ERROR',
        'high',
        false
      );
    }

    if (dbError?.code === '23503') {
      throw new BIFailureError(
        `Foreign key constraint error during ${operation}: ${dbError.message || 'Unknown error'}`,
        'FOREIGN_KEY_ERROR',
        'high',
        false
      );
    }

    // Generic database error
    throw new BIFailureError(
      `Database error during ${operation}: ${dbError?.message || 'Unknown error'}`,
      'DATABASE_ERROR',
      'critical',
      true
    );
  }

  /**
   * Handles network-related errors during BI failure operations
   */
  static handleNetworkError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): never {
    this.logError('NETWORK_ERROR', error, operation, context);

    const networkError = error as NetworkError;

    // Handle specific network error codes
    if (
      networkError?.code === 'NETWORK_ERROR' ||
      networkError?.message?.includes('network')
    ) {
      throw new BIFailureError(
        `Network connection failed during ${operation}: ${networkError.message || 'Unknown error'}`,
        'NETWORK_ERROR',
        'high',
        true
      );
    }

    if (networkError?.code === 'PGRST116') {
      throw new BIFailureError(
        `Database connection timeout during ${operation}: ${networkError.message || 'Unknown error'}`,
        'DATABASE_TIMEOUT_ERROR',
        'critical',
        true
      );
    }

    // Generic network error
    throw new BIFailureError(
      `Network error during ${operation}: ${networkError?.message || 'Unknown error'}`,
      'NETWORK_ERROR',
      'high',
      true
    );
  }

  /**
   * Handles validation errors during BI failure operations
   */
  static handleValidationError(
    message: string,
    code: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): never {
    this.logError('VALIDATION_ERROR', { message, code }, 'validation');

    throw new BIFailureError(message, code, severity, false);
  }

  /**
   * Handles authorization errors during BI failure operations
   */
  static handleAuthorizationError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): never {
    this.logError('AUTHORIZATION_ERROR', error, operation, context);

    const authError = error as ErrorWithDetails;

    throw new BIFailureError(
      `Authorization error during ${operation}: ${authError?.message || 'Access denied'}`,
      'AUTHORIZATION_ERROR',
      'high',
      false
    );
  }

  /**
   * Handles critical errors that require immediate attention
   */
  static handleCriticalError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): never {
    this.logError('CRITICAL_ERROR', error, operation, context);

    const criticalError = error as ErrorWithDetails;

    if (
      criticalError?.code === 'CRITICAL_ERROR' ||
      criticalError?.message?.includes('critical')
    ) {
      throw new BIFailureError(
        `Critical error during ${operation}: ${criticalError.message || 'System failure'}`,
        'CRITICAL_ERROR',
        'critical',
        false
      );
    }

    if (
      criticalError?.code === 'HIGH_PRIORITY' ||
      criticalError?.message?.includes('high')
    ) {
      throw new BIFailureError(
        `High priority error during ${operation}: ${criticalError.message || 'High priority issue'}`,
        'HIGH_PRIORITY_ERROR',
        'high',
        false
      );
    }

    if (
      criticalError?.code === 'MEDIUM_PRIORITY' ||
      criticalError?.message?.includes('medium')
    ) {
      throw new BIFailureError(
        `Medium priority error during ${operation}: ${criticalError.message || 'Medium priority issue'}`,
        'MEDIUM_PRIORITY_ERROR',
        'medium',
        false
      );
    }

    // Generic critical error
    throw new BIFailureError(
      `Critical error during ${operation}: ${criticalError?.message || 'Unknown critical error'}`,
      'CRITICAL_ERROR',
      'critical',
      false
    );
  }

  /**
   * Creates a standardized BIFailureError from any error type
   */
  static createStandardizedError(
    error: unknown,
    operation: string,
    defaultType = 'UNKNOWN_ERROR'
  ): BIFailureError {
    const errorWithDetails = error as ErrorWithDetails;

    return new BIFailureError(
      errorWithDetails?.message || `Unknown error during ${operation}`,
      defaultType,
      'medium',
      true,
      {
        name: errorWithDetails?.name || 'UnknownError',
        message: errorWithDetails?.message || 'No message',
        code: errorWithDetails?.code || 'NO_CODE',
        operation,
        stack: errorWithDetails?.stack,
      }
    );
  }

  /**
   * Logs error information for debugging and monitoring
   */
  private static logError(
    errorType: string,
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): void {
    this.errorCount++;

    if (this.errorCount > this.MAX_ERRORS) {
      console.warn('Maximum error count reached, stopping error logging');
      return;
    }

    const errorInfo = {
      type: errorType,
      operation,
      timestamp: new Date().toISOString(),
      context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    console.error('BIFailureErrorHandler:', errorInfo);

    // Store last error for potential retry logic
    if (error instanceof Error) {
      this.lastError = error;
    }
  }

  /**
   * Gets the last error that occurred
   */
  static getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Resets the error handler state
   */
  static reset(): void {
    this.lastError = null;
    this.errorCount = 0;
  }

  /**
   * Checks if an error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (error instanceof BIFailureError) {
      return error.retryable;
    }

    const errorWithDetails = error as ErrorWithDetails;

    // Network errors are generally retryable
    if (
      errorWithDetails?.code === 'NETWORK_ERROR' ||
      errorWithDetails?.message?.includes('network') ||
      errorWithDetails?.message?.includes('timeout')
    ) {
      return true;
    }

    // Database connection errors are retryable
    if (
      errorWithDetails?.code === 'PGRST116' ||
      errorWithDetails?.message?.includes('connection')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Handles unexpected errors during BI failure operations
   */
  static handleUnexpectedError(error: unknown, operation: string): never {
    this.logError('UNEXPECTED_ERROR', error, operation);

    const errorWithDetails = error as ErrorWithDetails;

    throw new BIFailureError(
      `Unexpected error during ${operation}: ${errorWithDetails?.message || 'Unknown error'}`,
      'UNEXPECTED_ERROR',
      'critical',
      false
    );
  }

  /**
   * Retry mechanism for BI failure operations
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: BIFailureError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = this.createStandardizedError(error, operationName);

        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw (
      lastError ||
      new BIFailureError(
        `Operation failed after ${maxRetries} attempts: ${operationName}`,
        'MAX_RETRIES_EXCEEDED',
        'critical',
        false
      )
    );
  }
}

// Export error codes
export { BIFailureErrorCodes };
