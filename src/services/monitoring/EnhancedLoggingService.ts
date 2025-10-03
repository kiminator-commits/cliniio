import { logger } from '../../utils/_core/logger';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  facilityId?: string;
  sessionId?: string;
  requestId?: string;
  operation?: string;
  service?: string;
  component?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context: LogContext;
  metadata?: Record<string, unknown>;
  stack?: string;
}

export interface LogFilter {
  level?: string[];
  service?: string[];
  component?: string[];
  userId?: string;
  facilityId?: string;
  timeRange?: {
    start: number;
    end: number;
  };
  search?: string;
}

export interface LogStats {
  totalLogs: number;
  levelCounts: Record<string, number>;
  serviceCounts: Record<string, number>;
  componentCounts: Record<string, number>;
  timeRange: {
    start: number;
    end: number;
  };
}

export class EnhancedLoggingService {
  private static instance: EnhancedLoggingService;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 50000;
  private correlationIdCounter = 0;

  private constructor() {
    this.startCleanupTimer();
  }

  static getInstance(): EnhancedLoggingService {
    if (!EnhancedLoggingService.instance) {
      EnhancedLoggingService.instance = new EnhancedLoggingService();
    }
    return EnhancedLoggingService.instance;
  }

  /**
   * Generate a new correlation ID
   */
  generateCorrelationId(): string {
    return `corr_${Date.now()}_${++this.correlationIdCounter}`;
  }

  /**
   * Log with context
   */
  log(
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        correlationId: this.generateCorrelationId(),
        ...context,
      },
      metadata,
      stack:
        level === 'error' || level === 'fatal'
          ? this.getStackTrace()
          : undefined,
    };

    // Store log entry
    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.splice(0, this.logs.length - this.MAX_LOGS);
    }

    // Also log to console with enhanced formatting
    this.logToConsole(logEntry);
  }

  /**
   * Debug log
   */
  debug(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    this.log('debug', message, context, metadata);
  }

  /**
   * Info log
   */
  info(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    this.log('info', message, context, metadata);
  }

  /**
   * Warning log
   */
  warn(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    this.log('warn', message, context, metadata);
  }

  /**
   * Error log
   */
  error(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    this.log('error', message, context, metadata);
  }

  /**
   * Fatal log
   */
  fatal(
    message: string,
    context: LogContext = {},
    metadata?: Record<string, unknown>
  ): void {
    this.log('fatal', message, context, metadata);
  }

  /**
   * Log API request
   */
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: LogContext = {}
  ): void {
    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this.log(
      level,
      `API ${method} ${url}`,
      {
        ...context,
        operation: 'api_request',
        service: 'api',
      },
      {
        method,
        url,
        statusCode,
        duration,
      }
    );
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    rowsAffected: number,
    context: LogContext = {}
  ): void {
    this.log(
      'info',
      `Database ${operation} on ${table}`,
      {
        ...context,
        operation: 'database',
        service: 'database',
      },
      {
        table,
        duration,
        rowsAffected,
      }
    );
  }

  /**
   * Log user action
   */
  logUserAction(
    action: string,
    userId: string,
    facilityId?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.log(
      'info',
      `User action: ${action}`,
      {
        operation: 'user_action',
        service: 'auth',
        userId,
        facilityId,
      },
      metadata
    );
  }

  /**
   * Log performance metric
   */
  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context: LogContext = {}
  ): void {
    this.log(
      'info',
      `Performance metric: ${metric}`,
      {
        ...context,
        operation: 'performance',
        service: 'monitoring',
      },
      {
        metric,
        value,
        unit,
      }
    );
  }

  /**
   * Query logs
   */
  queryLogs(filter: LogFilter = {}): LogEntry[] {
    let filteredLogs = [...this.logs];

    // Filter by level
    if (filter.level && filter.level.length > 0) {
      filteredLogs = filteredLogs.filter((log) =>
        filter.level!.includes(log.level)
      );
    }

    // Filter by service
    if (filter.service && filter.service.length > 0) {
      filteredLogs = filteredLogs.filter((log) =>
        filter.service!.includes(log.context.service || '')
      );
    }

    // Filter by component
    if (filter.component && filter.component.length > 0) {
      filteredLogs = filteredLogs.filter((log) =>
        filter.component!.includes(log.context.component || '')
      );
    }

    // Filter by user ID
    if (filter.userId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.userId === filter.userId
      );
    }

    // Filter by facility ID
    if (filter.facilityId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context.facilityId === filter.facilityId
      );
    }

    // Filter by time range
    if (filter.timeRange) {
      const start = new Date(filter.timeRange.start).getTime();
      const end = new Date(filter.timeRange.end).getTime();
      filteredLogs = filteredLogs.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= start && logTime <= end;
      });
    }

    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.context).toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs;
  }

  /**
   * Get log statistics
   */
  getLogStats(timeRange?: { start: number; end: number }): LogStats {
    let logsToAnalyze = this.logs;

    if (timeRange) {
      const start = new Date(timeRange.start).getTime();
      const end = new Date(timeRange.end).getTime();
      logsToAnalyze = this.logs.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= start && logTime <= end;
      });
    }

    const levelCounts: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};
    const componentCounts: Record<string, number> = {};

    logsToAnalyze.forEach((log) => {
      levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;

      const service = log.context.service || 'unknown';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;

      const component = log.context.component || 'unknown';
      componentCounts[component] = (componentCounts[component] || 0) + 1;
    });

    return {
      totalLogs: logsToAnalyze.length,
      levelCounts,
      serviceCounts,
      componentCounts,
      timeRange: {
        start:
          logsToAnalyze.length > 0
            ? new Date(logsToAnalyze[0].timestamp).getTime()
            : 0,
        end:
          logsToAnalyze.length > 0
            ? new Date(
                logsToAnalyze[logsToAnalyze.length - 1].timestamp
              ).getTime()
            : 0,
      },
    };
  }

  /**
   * Export logs
   */
  exportLogs(filter: LogFilter = {}): LogEntry[] {
    return this.queryLogs(filter);
  }

  /**
   * Clear old logs
   */
  clearOldLogs(maxAge: number = 24 * 60 * 60 * 1000): void {
    // 24 hours
    const cutoff = Date.now() - maxAge;
    const originalLength = this.logs.length;

    this.logs = this.logs.filter(
      (log) => new Date(log.timestamp).getTime() > cutoff
    );

    const removedCount = originalLength - this.logs.length;
    if (removedCount > 0) {
      logger.info(`Cleared ${removedCount} old log entries`);
    }
  }

  /**
   * Get correlation ID from current context
   */
  getCurrentCorrelationId(): string | undefined {
    // In a real implementation, this would get the correlation ID from the current request context
    return undefined;
  }

  /**
   * Log to console with enhanced formatting
   */
  private logToConsole(logEntry: LogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const level = logEntry.level.toUpperCase().padEnd(5);
    const correlationId = logEntry.context.correlationId
      ? `[${logEntry.context.correlationId}]`
      : '';
    const context = this.formatContext(logEntry.context);

    const message = `${timestamp} ${level} ${correlationId} ${logEntry.message} ${context}`;

    switch (logEntry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        if (logEntry.stack) {
          console.error(logEntry.stack);
        }
        break;
    }
  }

  /**
   * Format context for console output
   */
  private formatContext(context: LogContext): string {
    const relevantKeys = [
      'userId',
      'facilityId',
      'operation',
      'service',
      'component',
    ];
    const relevantContext = Object.entries(context)
      .filter(([key]) => relevantKeys.includes(key))
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    return relevantContext ? `[${relevantContext}]` : '';
  }

  /**
   * Get stack trace
   */
  private getStackTrace(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2).join('\n') : '';
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    // Clean up old logs every hour
    setInterval(
      () => {
        this.clearOldLogs();
      },
      60 * 60 * 1000
    );
  }
}

// Singleton instance
export const enhancedLoggingService = EnhancedLoggingService.getInstance();
