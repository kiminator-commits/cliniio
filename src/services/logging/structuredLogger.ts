import { supabase } from '@/lib/supabaseClient';

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  module: string;
  facilityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SecurityContext {
  facilityId?: string;
  userId?: string;
  module: string;
}

/**
 * Structured Logging Service
 * Replaces console logging with secure, structured logging
 * Prevents secret leakage and provides audit trails
 */
export class StructuredLogger {
  private static instance: StructuredLogger;
  private logLevel: string;

  private constructor() {
    this.logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Log an error message
   */
  error(message: string, context: SecurityContext, metadata?: Record<string, unknown>): void {
    this.log('error', message, context, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context: SecurityContext, metadata?: Record<string, unknown>): void {
    this.log('warn', message, context, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, context: SecurityContext, metadata?: Record<string, unknown>): void {
    this.log('info', message, context, metadata);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context: SecurityContext, metadata?: Record<string, unknown>): void {
    this.log('debug', message, context, metadata);
  }

  /**
   * Core logging method
   */
  private log(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    context: SecurityContext,
    metadata?: Record<string, unknown>
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message: this.sanitizeMessage(message),
      module: context.module,
      facilityId: context.facilityId,
      userId: context.userId,
      metadata: this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString()
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console[level](`[${context.module}] ${message}`, metadata);
    }

    // Store in database for production audit trail
    this.storeLogEntry(logEntry);
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Sanitize message to prevent secret leakage
   */
  private sanitizeMessage(message: string): string {
    return message
      .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_API_KEY]')
      .replace(/Bearer [a-zA-Z0-9._-]+/g, '[REDACTED_TOKEN]')
      .replace(/password["\s]*[:=]["\s]*[^"\s,}]+/gi, 'password: [REDACTED]')
      .replace(/api[_-]?key["\s]*[:=]["\s]*[^"\s,}]+/gi, 'api_key: [REDACTED]')
      .substring(0, 1000); // Limit message length
  }

  /**
   * Sanitize metadata to prevent secret leakage
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      
      // Skip sensitive keys
      if (lowerKey.includes('password') || 
          lowerKey.includes('secret') || 
          lowerKey.includes('token') || 
          lowerKey.includes('key') ||
          lowerKey.includes('auth')) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeMessage(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Store log entry in database
   */
  private async storeLogEntry(logEntry: LogEntry): Promise<void> {
    try {
      await supabase.from('system_logs').insert({
        level: logEntry.level,
        message: logEntry.message,
        module: logEntry.module,
        facility_id: logEntry.facilityId,
        user_id: logEntry.userId,
        metadata: logEntry.metadata,
        created_at: logEntry.timestamp
      });
    } catch (error) {
      // Fail silently to prevent logging loops
      if (import.meta.env.DEV) {
        console.error('Failed to store log entry:', error);
      }
    }
  }

  /**
   * Validate environment configuration
   */
  static validateEnvironment(): void {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Check for potential secret leakage in specific environment variables
    // Note: VITE_OPENAI_API_KEY removed from check as API keys are now managed server-side
    const sensitiveVars = [
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_SERVICE_ROLE_KEY',
      'VITE_GOOGLE_VISION_API_KEY',
      'VITE_AZURE_VISION_API_KEY'
    ];

    for (const varName of sensitiveVars) {
      const value = import.meta.env[varName];
      if (value && (value.includes('sk-') || value.includes('Bearer '))) {
        console.warn(`Potential secret leakage detected in environment variable: ${varName}`);
      }
    }
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance();

// Validate environment on import
StructuredLogger.validateEnvironment();
