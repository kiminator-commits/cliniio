// KnowledgeHub Logging Service - Comprehensive logging strategy
// Provides structured logging, audit logging, performance logging, and security event logging

import { sendAuditLog } from '@/services/auditLogService';

// ============================================================================
// LOG LEVELS
// ============================================================================
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

// ============================================================================
// LOG CATEGORIES
// ============================================================================
export enum LogCategory {
  OPERATION = 'operation',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  VALIDATION = 'validation',
  ERROR = 'error',
  DEBUG = 'debug',
}

// ============================================================================
// LOG INTERFACES
// ============================================================================
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry extends LogEntry {
  category: LogCategory.AUDIT;
  action: string;
  resource?: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'denied';
  permissions?: string[];
}

export interface PerformanceLogEntry extends LogEntry {
  category: LogCategory.PERFORMANCE;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface SecurityLogEntry extends LogEntry {
  category: LogCategory.SECURITY;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threat?: string;
  mitigation?: string;
}

// ============================================================================
// LOGGER CONFIGURATION
// ============================================================================
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableAuditService: boolean;
  enablePerformanceLogging: boolean;
  enableSecurityLogging: boolean;
  sessionId?: string;
  userId?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableAuditService: true,
  enablePerformanceLogging: true,
  enableSecurityLogging: true,
};

// ============================================================================
// KNOWLEDGE HUB LOGGER CLASS
// ============================================================================
export class KnowledgeHubLogger {
  private config: LoggerConfig;
  private requestId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.requestId = this.generateRequestId();
  }

  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (level < this.config.minLevel) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(logEntry);
  }

  private writeLog(logEntry: LogEntry): void {
    // Console logging
    if (this.config.enableConsole) {
      this.writeToConsole(logEntry);
    }

    // Audit service logging for audit and security events
    if (
      this.config.enableAuditService &&
      (logEntry.category === LogCategory.AUDIT ||
        logEntry.category === LogCategory.SECURITY)
    ) {
      this.writeToAuditService(logEntry);
    }
  }

  private writeToConsole(logEntry: LogEntry): void {
    const levelEmoji = this.getLevelEmoji(logEntry.level);
    const levelName = LogLevel[logEntry.level];
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    const logMessage = `[${levelEmoji} ${levelName}] [${logEntry.category.toUpperCase()}] ${logEntry.message}`;
    const contextString = logEntry.context
      ? ` | Context: ${JSON.stringify(logEntry.context)}`
      : '';
    const metadataString = logEntry.metadata
      ? ` | Metadata: ${JSON.stringify(logEntry.metadata)}`
      : '';

    const fullMessage = `${timestamp} ${logMessage}${contextString}${metadataString}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(fullMessage);
        break;
    }
  }

  private async writeToAuditService(logEntry: LogEntry): Promise<void> {
    try {
      await sendAuditLog({
        module: 'KnowledgeHub',
        timestamp: logEntry.timestamp,
        action: logEntry.message,
        item: {
          level: LogLevel[logEntry.level],
          category: logEntry.category,
          context: logEntry.context,
          metadata: logEntry.metadata,
          userId: logEntry.userId,
          sessionId: logEntry.sessionId,
          requestId: logEntry.requestId,
        },
      });
    } catch (error) {
      console.error('Failed to send audit log:', error);
    }
  }

  // ============================================================================
  // PUBLIC LOGGING METHODS
  // ============================================================================
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, LogCategory.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, LogCategory.OPERATION, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, LogCategory.OPERATION, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, LogCategory.ERROR, message, context);
  }

  critical(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, LogCategory.ERROR, message, context);
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================
  auditSuccess(
    action: string,
    resource?: string,
    resourceId?: string,
    context?: Record<string, unknown>
  ): void {
    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.AUDIT,
      message: `AUDIT_SUCCESS: ${action}`,
      action,
      resource,
      resourceId,
      outcome: 'success',
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(auditEntry);
  }

  auditFailure(
    action: string,
    reason: string,
    resource?: string,
    resourceId?: string,
    context?: Record<string, unknown>
  ): void {
    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: LogCategory.AUDIT,
      message: `AUDIT_FAILURE: ${action} - ${reason}`,
      action,
      resource,
      resourceId,
      outcome: 'failure',
      context: { ...context, reason },
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(auditEntry);
  }

  auditDenied(
    action: string,
    reason: string,
    permissions?: string[],
    resource?: string,
    resourceId?: string,
    context?: Record<string, unknown>
  ): void {
    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: LogCategory.AUDIT,
      message: `AUDIT_DENIED: ${action} - ${reason}`,
      action,
      resource,
      resourceId,
      outcome: 'denied',
      permissions,
      context: { ...context, reason },
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(auditEntry);
  }

  // ============================================================================
  // PERFORMANCE LOGGING
  // ============================================================================
  performance(
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    context?: Record<string, unknown>
  ): void {
    if (!this.config.enablePerformanceLogging) return;

    const performanceEntry: PerformanceLogEntry = {
      timestamp: new Date().toISOString(),
      level: success ? LogLevel.INFO : LogLevel.WARN,
      category: LogCategory.PERFORMANCE,
      message: `PERFORMANCE: ${operation} - ${duration.toFixed(2)}ms - ${success ? 'SUCCESS' : 'FAILURE'}`,
      operation,
      duration,
      success,
      error,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(performanceEntry);
  }

  // ============================================================================
  // SECURITY LOGGING
  // ============================================================================
  securityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    threat?: string,
    mitigation?: string,
    context?: Record<string, unknown>
  ): void {
    if (!this.config.enableSecurityLogging) return;

    const securityEntry: SecurityLogEntry = {
      timestamp: new Date().toISOString(),
      level: this.getSecurityLogLevel(severity),
      category: LogCategory.SECURITY,
      message: `SECURITY: ${event} - ${severity.toUpperCase()}`,
      event,
      severity,
      threat,
      mitigation,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      requestId: this.requestId,
    };

    this.writeLog(securityEntry);
  }

  // ============================================================================
  // VALIDATION LOGGING
  // ============================================================================
  validationError(
    field: string,
    value: string,
    rule: string,
    context?: Record<string, unknown>
  ): void {
    this.log(
      LogLevel.WARN,
      LogCategory.VALIDATION,
      `VALIDATION_ERROR: ${field}="${value}" failed rule: ${rule}`,
      {
        field,
        value,
        rule,
        ...context,
      }
    );
  }

  validationSuccess(
    field: string,
    value: string,
    context?: Record<string, unknown>
  ): void {
    this.log(
      LogLevel.DEBUG,
      LogCategory.VALIDATION,
      `VALIDATION_SUCCESS: ${field}="${value}" passed validation`,
      {
        field,
        value,
        ...context,
      }
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.CRITICAL:
        return '🚨';
      default:
        return '📝';
    }
  }

  private getSecurityLogLevel(severity: string): LogLevel {
    switch (severity) {
      case 'low':
        return LogLevel.INFO;
      case 'medium':
        return LogLevel.WARN;
      case 'high':
        return LogLevel.ERROR;
      case 'critical':
        return LogLevel.CRITICAL;
      default:
        return LogLevel.WARN;
    }
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUser(userId: string): void {
    this.config.userId = userId;
  }

  setSession(sessionId: string): void {
    this.config.sessionId = sessionId;
  }
}

// ============================================================================
// DEFAULT LOGGER INSTANCE
// ============================================================================
export const knowledgeHubLogger = new KnowledgeHubLogger();

// ============================================================================
// HOOK FOR REACT COMPONENTS
// ============================================================================
export const useKnowledgeHubLogger = (userId?: string, sessionId?: string) => {
  const logger = new KnowledgeHubLogger();

  if (userId) logger.setUser(userId);
  if (sessionId) logger.setSession(sessionId);

  return logger;
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================
export const logOperation = (
  operation: string,
  context?: Record<string, unknown>
) => {
  knowledgeHubLogger.info(`OPERATION: ${operation}`, context);
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  knowledgeHubLogger.error(`ERROR: ${error.message}`, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logSecurity = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: Record<string, unknown>
) => {
  knowledgeHubLogger.securityEvent(
    event,
    severity,
    undefined,
    undefined,
    context
  );
};

export default knowledgeHubLogger;
