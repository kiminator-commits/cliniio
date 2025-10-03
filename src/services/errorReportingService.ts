/**
 * Comprehensive error reporting service
 * Supports multiple external error reporting providers
 */

let _provider = process.env.ERROR_REPORTING_PROVIDER || 'console';

// Force console provider when running under Vitest / test environments
if (typeof vi !== 'undefined' || process.env.NODE_ENV === 'test') {
  _provider = 'console';
}

// Error reporting provider types
export type ErrorReportingProvider =
  | 'sentry'
  | 'logrocket'
  | 'bugsnag'
  | 'supabase'
  | 'console';

// Configuration interface
export interface ErrorReportingConfig {
  provider: ErrorReportingProvider;
  enabled: boolean;
  dsn?: string; // Data Source Name for providers like Sentry
  apiKey?: string; // API key for providers like LogRocket, Bugsnag
  environment?: string;
  release?: string;
  maxQueueSize?: number;
  flushInterval?: number; // milliseconds
}

export interface ErrorReport {
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: {
    component?: string;
    page?: string;
    userId?: string;
    timestamp: string;
  };
}

export class ErrorReportingService {
  private static isInitialized = false;
  private static errorQueue: ErrorReport[] = [];
  private static config: ErrorReportingConfig = {
    provider: 'console',
    enabled: true,
    environment: process.env.NODE_ENV || 'development',
    maxQueueSize: 10,
    flushInterval: 5000, // 5 seconds
  };
  private static flushTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize error reporting service with configuration
   */
  static initialize(config?: Partial<ErrorReportingConfig>): void {
    // Merge configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Validate configuration
    if (
      this.config.enabled &&
      this.config.provider !== 'console' &&
      this.config.provider !== 'supabase'
    ) {
      if (!this.config.dsn && !this.config.apiKey) {
        console.warn('Error reporting provider requires DSN or API key');
        this.config.provider = 'console';
      }
    }

    this.isInitialized = true;

    // Start flush timer
    if (this.config.enabled && this.config.flushInterval) {
      this.flushTimer = setInterval(() => {
        this.flushQueue();
      }, this.config.flushInterval);
    }
  }

  /**
   * Report an error
   */
  static reportError(
    error: Error,
    errorInfo?: React.ErrorInfo,
    context?: Record<string, unknown>
  ): void {
    const errorReport: ErrorReport = {
      error,
      errorInfo,
      context: {
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // Add to queue for batch processing
    this.errorQueue.push(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorReport);
    }

    // Flush queue if it's getting large
    if (
      this.config?.maxQueueSize &&
      this.errorQueue.length >= this.config.maxQueueSize
    ) {
      this.flushQueue();
    }
  }

  /**
   * Flush error queue to external service
   */
  private static async flushQueue(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.config.enabled) {
      return;
    }

    const errors = this.errorQueue.splice(0, this.errorQueue.length);

    try {
      switch (this.config.provider) {
        case 'sentry':
          await this.sendToSentry(errors);
          break;
        case 'logrocket':
          await this.sendToLogRocket(errors);
          break;
        case 'bugsnag':
          await this.sendToBugsnag(errors);
          break;
        case 'supabase':
          await this.sendToSupabase(errors);
          break;
        case 'console':
        default:
          this.sendToConsole(errors);
          break;
      }
    } catch (error) {
      console.error('Failed to send error reports:', error);

      // Re-throw configuration errors (missing credentials)
      if (
        error instanceof Error &&
        (error.message.includes('not configured') ||
          error.message.includes('DSN') ||
          error.message.includes('API key'))
      ) {
        throw error;
      }

      // Put errors back in queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Send errors to Sentry
   */
  private static async sendToSentry(errors: ErrorReport[]): Promise<void> {
    if (!this.config.dsn) {
      throw new Error('Sentry DSN not configured');
    }

    // In a real implementation, you would use the Sentry SDK
    // For now, we'll simulate the API call
    const sentryPayload = {
      dsn: this.config.dsn,
      environment: this.config.environment,
      release: this.config.release,
      events: errors.map((errorReport) => ({
        message: errorReport.error.message,
        level: 'error',
        timestamp: errorReport.context?.timestamp,
        tags: {
          component: errorReport.context?.component,
          page: errorReport.context?.page,
        },
        extra: {
          stack: errorReport.error.stack,
          errorInfo: errorReport.errorInfo,
        },
      })),
    };

    // Simulate API call to Sentry
    await this.makeApiCall(
      'https://o450000000000000.ingest.sentry.io/api/0/store/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7,sentry_key=${this.config.dsn.split('@')[0]},sentry_client=cliniio/1.0`,
        },
        body: JSON.stringify(sentryPayload),
      }
    );
  }

  /**
   * Send errors to LogRocket
   */
  private static async sendToLogRocket(errors: ErrorReport[]): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('LogRocket API key not configured');
    }

    // In a real implementation, you would use the LogRocket SDK
    const logRocketPayload = {
      apiKey: this.config.apiKey,
      environment: this.config.environment,
      errors: errors.map((errorReport) => ({
        message: errorReport.error.message,
        stack: errorReport.error.stack,
        timestamp: errorReport.context?.timestamp,
        metadata: {
          component: errorReport.context?.component,
          page: errorReport.context?.page,
          userId: errorReport.context?.userId,
        },
      })),
    };

    // Simulate API call to LogRocket
    await this.makeApiCall('https://api.logrocket.com/api/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(logRocketPayload),
    });
  }

  /**
   * Send errors to Bugsnag
   */
  private static async sendToBugsnag(errors: ErrorReport[]): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Bugsnag API key not configured');
    }

    // In a real implementation, you would use the Bugsnag SDK
    const bugsnagPayload = {
      apiKey: this.config.apiKey,
      notifier: {
        name: 'cliniio-error-reporter',
        version: '1.0.0',
      },
      events: errors.map((errorReport) => ({
        payloadVersion: '5',
        exceptions: [
          {
            errorClass: errorReport.error.name,
            message: errorReport.error.message,
            stacktrace: this.parseStacktrace(errorReport.error.stack),
          },
        ],
        breadcrumbs: [],
        context: errorReport.context?.component,
        user: errorReport.context?.userId
          ? { id: errorReport.context.userId }
          : undefined,
        metadata: {
          page: errorReport.context?.page,
          component: errorReport.context?.component,
        },
      })),
    };

    // Simulate API call to Bugsnag
    await this.makeApiCall('https://notify.bugsnag.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Version': '5',
      },
      body: JSON.stringify(bugsnagPayload),
    });
  }

  /**
   * Send errors to Supabase
   */
  private static async sendToSupabase(errors: ErrorReport[]): Promise<void> {
    try {
      const { supabase } = await import('@/lib/supabase');

      const errorRecords = errors.map((errorReport) => ({
        error_message: errorReport.error.message,
        error_stack: errorReport.error.stack,
        error_name: errorReport.error.name,
        component: errorReport.context?.component,
        page: errorReport.context?.page,
        user_id: errorReport.context?.userId,
        timestamp: errorReport.context?.timestamp,
        environment: this.config.environment,
        metadata: JSON.stringify(errorReport.errorInfo || {}),
      }));

      const { error } = await supabase.from('error_logs').insert(errorRecords);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to send errors to Supabase:', error);
      throw error;
    }
  }

  /**
   * Send errors to console (fallback)
   */
  private static sendToConsole(errors: ErrorReport[]): void {
    console.group('Error Report Batch');
    errors.forEach((errorReport, index) => {
      console.error(`Error ${index + 1}:`, errorReport);
    });
    console.groupEnd();
  }

  /**
   * Make API call with timeout and retry logic
   */
  private static async makeApiCall(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse stacktrace for Bugsnag format
   */
  private static parseStacktrace(stack?: string): Array<{
    file: string;
    lineNumber: number;
    columnNumber?: number;
    method?: string;
  }> {
    if (!stack) return [];

    return stack
      .split('\n')
      .slice(1) // Skip the first line (error message)
      .map((line) => {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          return {
            method: match[1],
            file: match[2],
            lineNumber: parseInt(match[3]),
            columnNumber: parseInt(match[4]),
          };
        }
        return { file: line.trim(), lineNumber: 0 };
      })
      .filter((frame) => frame.file && !frame.file.includes('node_modules'));
  }

  /**
   * Get error reporting status
   */
  static getStatus(): {
    isInitialized: boolean;
    queueLength: number;
    config: ErrorReportingConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      queueLength: this.errorQueue.length,
      config: this.config,
    };
  }

  /**
   * Update configuration
   */
  static updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
    this.isInitialized = true; // Ensure service is initialized
  }

  /**
   * Force flush the error queue
   */
  static async forceFlush(): Promise<void> {
    await this.flushQueue();
  }

  /**
   * Clear the error queue
   */
  static clearQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Shutdown the service
   */
  static shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.isInitialized = false;
  }

  /**
   * Reset the service to initial state
   */
  static reset(): void {
    this.shutdown();
    this.clearQueue();
    this.config = {
      provider: 'console',
      enabled: true,
      environment: process.env.NODE_ENV || 'development',
      maxQueueSize: 10,
      flushInterval: 5000,
    };
  }
}

// Export convenience function
export const reportError = ErrorReportingService.reportError.bind(
  ErrorReportingService
);
