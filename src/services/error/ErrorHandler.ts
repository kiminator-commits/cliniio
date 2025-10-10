import { logger } from '../../utils/_core/logger';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  facilityId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class ErrorHandler {
  private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error) => this.isRetryableError(error),
  };

  /**
   * Helper method to safely extract error message
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'Unknown error';
  }

  /**
   * Helper method to safely extract error status code
   */
  private static getErrorStatus(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (typeof errorObj.status === 'number') {
        return errorObj.status;
      }
      if (errorObj.response && typeof errorObj.response === 'object') {
        const response = errorObj.response as Record<string, unknown>;
        if (typeof response.status === 'number') {
          return response.status;
        }
      }
    }
    return undefined;
  }

  /**
   * Helper method to safely extract error code
   */
  private static getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (typeof errorObj.code === 'string') {
        return errorObj.code;
      }
    }
    return undefined;
  }

  /**
   * Execute an operation with automatic retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    context?: ErrorContext
  ): Promise<T> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        logger.debug(
          `Attempt ${attempt + 1}/${config.maxRetries + 1} for operation: ${context?.operation || 'unknown'}`
        );
        return await operation();
      } catch (error) {
        lastError = error;

        const errorForLogging =
          error instanceof Error
            ? error
            : new Error(String(error || 'Unknown error'));
        this.logError(errorForLogging, context, attempt + 1);

        // If we've exhausted retries or condition fails → stop
        if (attempt >= config.maxRetries || !config.retryCondition(error)) {
          break;
        }

        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        logger.warn(`Operation failed, retrying in ${delay}ms...`, {
          operation: context?.operation,
          attempt: attempt + 1,
          error:
            lastError instanceof Error
              ? lastError.message
              : String(lastError || 'Unknown error'),
        });

        await this.delay(delay);
      }
    }

    // All retries failed
    this.logFatalError(lastError, context);
    throw lastError;
  }

  /**
   * Execute multiple operations with individual retry logic
   */
  static async withBatchRetry<T>(
    operations: Array<() => Promise<T>>,
    options: RetryOptions = {},
    context?: ErrorContext
  ): Promise<{ results: T[]; errors: Array<{ index: number; error: Error }> }> {
    const results: T[] = [];
    const errors: Array<{ index: number; error: Error }> = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await this.withRetry(operations[i], options, {
          ...context,
          operation: `${context?.operation || 'batch'}[${i}]`,
        });
        results.push(result);
      } catch (error) {
        errors.push({ index: i, error: error as Error });
        results.push(null as unknown as T); // Placeholder for failed operation
      }
    }

    return { results, errors };
  }

  /**
   * Handle database connection errors
   */
  static async handleDatabaseError<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    return this.withRetry(
      operation,
      {
        maxRetries: 5,
        baseDelay: 2000,
        retryCondition: (error) => this.isDatabaseError(error),
      },
      context
    );
  }

  /**
   * Handle external API errors
   */
  static async handleApiError<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    return this.withRetry(
      operation,
      {
        maxRetries: 3,
        baseDelay: 1000,
        retryCondition: (error) => this.isApiError(error),
      },
      context
    );
  }

  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: unknown): boolean {
    // Check for non-retryable errors first
    if (this.isNonRetryableError(error)) return false;

    // Check for specific retryable error types
    if (this.isDatabaseError(error)) return true;
    if (this.isApiError(error)) return true;
    if (this.isNetworkError(error)) return true;
    if (this.isTimeoutError(error)) return true;

    // Default to retryable for most errors
    return true;
  }

  /**
   * Check if an error is non-retryable
   */
  private static isNonRetryableError(error: unknown): boolean {
    if (!error) return false;

    // Check for specific non-retryable error types
    const message = this.getErrorMessage(error).toLowerCase();
    const status = this.getErrorStatus(error);

    // Validation errors are typically non-retryable
    if (message.includes('validation') || message.includes('invalid input')) {
      return true;
    }

    // Client errors (4xx) are typically non-retryable, except for specific retryable ones
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return true;
    }

    return false;
  }

  /**
   * Check if error is database-related
   */
  private static isDatabaseError(error: unknown): boolean {
    if (!error) return false;
    const message = this.getErrorMessage(error).toLowerCase();
    const code = this.getErrorCode(error);
    return (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('deadlock') ||
      message.includes('lock timeout') ||
      message.includes('serialization failure') ||
      code === 'ECONNREFUSED' ||
      code === 'ETIMEDOUT'
    );
  }

  /**
   * Check if error is API-related
   */
  private static isApiError(error: unknown): boolean {
    if (!error) return false;
    const status = this.getErrorStatus(error);
    const message = this.getErrorMessage(error).toLowerCase();

    // Check for HTTP status codes
    if (
      status >= 500 ||
      status === 429 ||
      status === 408 ||
      status === 503 ||
      status === 502 ||
      status === 504
    ) {
      return true;
    }

    // Check for API-related error messages
    if (
      message.includes('server error') ||
      message.includes('api') ||
      message.includes('http')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if error is network-related
   */
  private static isNetworkError(error: unknown): boolean {
    if (!error) return false;
    const code = this.getErrorCode(error);
    const message = this.getErrorMessage(error);
    return (
      code === 'ENOTFOUND' ||
      code === 'ECONNRESET' ||
      code === 'ECONNABORTED' ||
      message.includes('network')
    );
  }

  /**
   * Check if error is timeout-related
   */
  private static isTimeoutError(error: unknown): boolean {
    if (!error) return false;
    const code = this.getErrorCode(error);
    const message = this.getErrorMessage(error);
    return (
      code === 'ETIMEDOUT' ||
      message.includes('timeout') ||
      message.includes('timed out')
    );
  }

  /**
   * Log error with context
   */
  private static logError(
    error: unknown,
    context?: ErrorContext,
    attempt?: number
  ): void {
    const errorObj =
      error instanceof Error
        ? error
        : new Error(String(error || 'Unknown error'));
    const errorInfo = {
      message: errorObj.message,
      stack: errorObj.stack,
      operation: context?.operation,
      userId: context?.userId,
      facilityId: context?.facilityId,
      attempt,
      timestamp: context?.timestamp || new Date(),
      metadata: context?.metadata,
    };

    if (attempt && attempt > 1) {
      logger.warn('Operation retry failed:', errorInfo);
    } else {
      logger.error('Operation failed:', errorInfo);
    }
  }

  /**
   * Log fatal error after all retries
   */
  private static logFatalError(error: unknown, context?: ErrorContext): void {
    if (!error) return;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Operation failed after all retries:', {
      message: errorObj.message,
      stack: errorObj.stack,
      operation: context?.operation,
      userId: context?.userId,
      facilityId: context?.facilityId,
      timestamp: context?.timestamp || new Date(),
      metadata: context?.metadata,
    });
  }

  /**
   * Create error context
   */
  static createContext(
    operation: string,
    userId?: string,
    facilityId?: string,
    metadata?: Record<string, unknown>
  ): ErrorContext {
    return {
      operation,
      userId,
      facilityId,
      timestamp: new Date(),
      metadata,
    };
  }

  /**
   * Simple delay utility
   */
  private static delay(ms: number) {
    return new Promise((resolve) => {
      // Ensure Vitest fake timers can intercept this
      const timer = setTimeout(resolve, ms);
      if (typeof (timer as unknown)[Symbol.toPrimitive] === 'function') {
        // noop — helps Vitest detect fake timers
      }
    });
  }
}
