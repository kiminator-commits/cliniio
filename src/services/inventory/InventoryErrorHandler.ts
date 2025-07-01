export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory =
  | 'network'
  | 'validation'
  | 'permission'
  | 'data'
  | 'adapter'
  | 'sync'
  | 'unknown';

export interface InventoryError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorHandlerConfig {
  maxRetries: number;
  retryDelay: number;
  logErrors: boolean;
  showUserNotifications: boolean;
  autoRecover: boolean;
}

export interface ErrorRecoveryStrategy {
  canRecover(error: InventoryError): boolean;
  recover(error: InventoryError): Promise<void>;
  getRecoveryMessage(error: InventoryError): string;
}

export interface InventoryErrorHandler {
  // Core error handling
  handleError(error: Error | string, context?: Record<string, unknown>): InventoryError;
  handleAdapterError(adapterName: string, error: Error, operation: string): InventoryError;
  handleValidationError(field: string, value: unknown, rule: string): InventoryError;
  handleNetworkError(endpoint: string, status: number, response?: unknown): InventoryError;

  // Error management
  getErrors(): InventoryError[];
  getErrorsByCategory(category: ErrorCategory): InventoryError[];
  getErrorsBySeverity(severity: ErrorSeverity): InventoryError[];
  clearErrors(): void;
  clearError(errorId: string): void;

  // Error recovery
  canRecover(errorId: string): boolean;
  recoverError(errorId: string): Promise<void>;
  retryOperation<T>(operation: () => Promise<T>, context?: Record<string, unknown>): Promise<T>;

  // Error reporting
  getErrorSummary(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recoverable: number;
    critical: number;
  };

  // Configuration
  updateConfig(config: Partial<ErrorHandlerConfig>): void;
  getConfig(): ErrorHandlerConfig;
}

export class InventoryErrorHandlerImpl implements InventoryErrorHandler {
  private errors: InventoryError[] = [];
  private config: ErrorHandlerConfig;
  private recoveryStrategies: Map<ErrorCategory, ErrorRecoveryStrategy> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      logErrors: true,
      showUserNotifications: true,
      autoRecover: true,
      ...config,
    };

    this.initializeRecoveryStrategies();
  }

  handleError(error: Error | string, context?: Record<string, unknown>): InventoryError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = error instanceof Error ? error.stack : undefined;

    const inventoryError: InventoryError = {
      id: this.generateErrorId(),
      message: errorMessage,
      category: this.categorizeError(error, context),
      severity: this.determineSeverity(error, context),
      timestamp: new Date(),
      context,
      stack,
      recoverable: this.isRecoverable(error, context),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
    };

    this.errors.push(inventoryError);
    this.logError(inventoryError);

    return inventoryError;
  }

  handleAdapterError(adapterName: string, error: Error, operation: string): InventoryError {
    return this.handleError(error, {
      adapter: adapterName,
      operation,
      type: 'adapter_error',
    });
  }

  handleValidationError(field: string, value: unknown, rule: string): InventoryError {
    return this.handleError(`Validation failed for field '${field}': ${rule}`, {
      field,
      value,
      rule,
      type: 'validation_error',
    });
  }

  handleNetworkError(endpoint: string, status: number, response?: unknown): InventoryError {
    const message = `Network error: ${status} for endpoint ${endpoint}`;
    return this.handleError(message, {
      endpoint,
      status,
      response,
      type: 'network_error',
    });
  }

  getErrors(): InventoryError[] {
    return [...this.errors];
  }

  getErrorsByCategory(category: ErrorCategory): InventoryError[] {
    return this.errors.filter(error => error.category === category);
  }

  getErrorsBySeverity(severity: ErrorSeverity): InventoryError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  clearErrors(): void {
    this.errors = [];
  }

  clearError(errorId: string): void {
    this.errors = this.errors.filter(error => error.id !== errorId);
  }

  canRecover(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    return error ? error.recoverable && error.retryCount < error.maxRetries : false;
  }

  async recoverError(errorId: string): Promise<void> {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) {
      throw new Error(`Error with id ${errorId} not found`);
    }

    if (!this.canRecover(errorId)) {
      throw new Error(`Error ${errorId} cannot be recovered`);
    }

    const strategy = this.recoveryStrategies.get(error.category);
    if (strategy && strategy.canRecover(error)) {
      await strategy.recover(error);
      error.retryCount++;
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          const inventoryError = this.handleError(error as Error, {
            ...context,
            attempt: attempt + 1,
            maxAttempts: this.config.maxRetries,
          });

          if (this.config.autoRecover && inventoryError.recoverable) {
            await this.delay(this.config.retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }
        }

        break;
      }
    }

    throw lastError;
  }

  getErrorSummary(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recoverable: number;
    critical: number;
  } {
    const byCategory: Record<ErrorCategory, number> = {
      network: 0,
      validation: 0,
      permission: 0,
      data: 0,
      adapter: 0,
      sync: 0,
      unknown: 0,
    };

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let recoverable = 0;
    let critical = 0;

    this.errors.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
      if (error.recoverable) recoverable++;
      if (error.severity === 'critical') critical++;
    });

    return {
      total: this.errors.length,
      byCategory,
      bySeverity,
      recoverable,
      critical,
    };
  }

  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }

  private categorizeError(error: Error | string, context?: Record<string, unknown>): ErrorCategory {
    const message = typeof error === 'string' ? error : error.message;
    const contextType = context?.type;

    if (
      contextType === 'network_error' ||
      message.includes('network') ||
      message.includes('fetch')
    ) {
      return 'network';
    }
    if (
      contextType === 'validation_error' ||
      message.includes('validation') ||
      message.includes('invalid')
    ) {
      return 'validation';
    }
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return 'permission';
    }
    if (contextType === 'adapter_error' || message.includes('adapter')) {
      return 'adapter';
    }
    if (message.includes('sync') || message.includes('synchronization')) {
      return 'sync';
    }
    if (message.includes('data') || message.includes('database')) {
      return 'data';
    }

    return 'unknown';
  }

  private determineSeverity(
    error: Error | string,
    context?: Record<string, unknown>
  ): ErrorSeverity {
    const message = typeof error === 'string' ? error : error.message;
    const contextType = context?.type;

    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (contextType === 'network_error' || message.includes('network')) {
      return 'high';
    }
    if (contextType === 'validation_error') {
      return 'medium';
    }
    if (message.includes('warning') || message.includes('info')) {
      return 'low';
    }

    return 'medium';
  }

  private isRecoverable(error: Error | string, context?: Record<string, unknown>): boolean {
    const message = typeof error === 'string' ? error : error.message;
    const contextType = context?.type;

    // Network errors are usually recoverable
    if (contextType === 'network_error') {
      return true;
    }

    // Validation errors are not recoverable
    if (contextType === 'validation_error') {
      return false;
    }

    // Permission errors are not recoverable
    if (message.includes('permission') || message.includes('unauthorized')) {
      return false;
    }

    // Critical errors are not recoverable
    if (message.includes('critical') || message.includes('fatal')) {
      return false;
    }

    return true;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: InventoryError): void {
    if (this.config.logErrors) {
      console.error(`[InventoryError] ${error.category.toUpperCase()}: ${error.message}`, {
        id: error.id,
        severity: error.severity,
        context: error.context,
        timestamp: error.timestamp,
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeRecoveryStrategies(): void {
    // Network recovery strategy
    this.recoveryStrategies.set('network', {
      canRecover: error => error.retryCount < error.maxRetries,
      recover: async error => {
        // Wait before retry
        await this.delay(this.config.retryDelay * Math.pow(2, error.retryCount));
      },
      getRecoveryMessage: () => 'Retrying network operation...',
    });

    // Adapter recovery strategy
    this.recoveryStrategies.set('adapter', {
      canRecover: error => error.retryCount < error.maxRetries,
      recover: async error => {
        // Wait before retry
        await this.delay(this.config.retryDelay * Math.pow(2, error.retryCount));
      },
      getRecoveryMessage: () => 'Retrying adapter operation...',
    });

    // Sync recovery strategy
    this.recoveryStrategies.set('sync', {
      canRecover: error => error.retryCount < error.maxRetries,
      recover: async error => {
        // Wait before retry
        await this.delay(this.config.retryDelay * Math.pow(2, error.retryCount));
      },
      getRecoveryMessage: () => 'Retrying synchronization...',
    });
  }
}
