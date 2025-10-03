import { vi } from 'vitest';
import {
  KnowledgeHubLogger,
  LogLevel,
  LogCategory,
} from '@/pages/KnowledgeHub/services/knowledgeHubLogger';

// Mock the audit service
vi.mock('@/services/auditLogService', () => ({
  sendAuditLog: vi.fn().mockResolvedValue({ success: true }),
}));

describe('KnowledgeHubLogger', () => {
  let logger: KnowledgeHubLogger;
  let consoleSpy: vi.SpyInstance;

  beforeEach(() => {
    logger = new KnowledgeHubLogger({
      minLevel: LogLevel.DEBUG,
      enableConsole: true,
      enableAuditService: true,
      enablePerformanceLogging: true,
      enableSecurityLogging: true,
      userId: 'test-user',
      sessionId: 'test-session',
    });

    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message', { test: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 DEBUG')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message', { test: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️ INFO')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log warning messages', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.warn('Test warning message', { test: true });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️ WARN'));
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );

      warnSpy.mockRestore();
    });

    it('should log error messages', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.error('Test error message', { test: true });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ ERROR')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );

      errorSpy.mockRestore();
    });

    it('should log critical messages', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.critical('Test critical message', { test: true });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨 CRITICAL')
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test critical message')
      );

      errorSpy.mockRestore();
    });
  });

  describe('Audit Logging', () => {
    it('should log audit success', () => {
      logger.auditSuccess('TEST_ACTION', 'content', 'content-123', {
        test: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('AUDIT_SUCCESS: TEST_ACTION')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"test":true')
      );
    });

    it('should log audit failure', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.auditFailure(
        'TEST_ACTION',
        'Test failure reason',
        'content',
        'content-123',
        {
          test: true,
        }
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'AUDIT_FAILURE: TEST_ACTION - Test failure reason'
        )
      );

      warnSpy.mockRestore();
    });

    it('should log audit denied', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.auditDenied(
        'TEST_ACTION',
        'Test denied reason',
        ['permission1'],
        'content',
        'content-123',
        { test: true }
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'AUDIT_DENIED: TEST_ACTION - Test denied reason'
        )
      );

      warnSpy.mockRestore();
    });
  });

  describe('Performance Logging', () => {
    it('should log successful performance metrics', () => {
      logger.performance('test_operation', 150.5, true, undefined, {
        test: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'PERFORMANCE: test_operation - 150.50ms - SUCCESS'
        )
      );
    });

    it('should log failed performance metrics', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.performance('test_operation', 250.5, false, 'Test error', {
        test: true,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'PERFORMANCE: test_operation - 250.50ms - FAILURE'
        )
      );

      warnSpy.mockRestore();
    });

    it('should not log performance when disabled', () => {
      const disabledLogger = new KnowledgeHubLogger({
        enablePerformanceLogging: false,
      });

      disabledLogger.performance('test_operation', 150.5, true);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Security Logging', () => {
    it('should log security events with different severities', () => {
      logger.securityEvent(
        'TEST_SECURITY_EVENT',
        'low',
        'Test threat',
        'Test mitigation',
        {
          test: true,
        }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SECURITY: TEST_SECURITY_EVENT - LOW')
      );
    });

    it('should not log security events when disabled', () => {
      const disabledLogger = new KnowledgeHubLogger({
        enableSecurityLogging: false,
      });

      disabledLogger.securityEvent('TEST_SECURITY_EVENT', 'high');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Validation Logging', () => {
    it('should log validation errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.validationError('testField', 'testValue', 'required', {
        test: true,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'VALIDATION_ERROR: testField="testValue" failed rule: required'
        )
      );

      warnSpy.mockRestore();
    });

    it('should log validation success', () => {
      logger.validationSuccess('testField', 'testValue', { test: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'VALIDATION_SUCCESS: testField="testValue" passed validation'
        )
      );
    });
  });

  describe('Configuration', () => {
    it('should respect minimum log level', () => {
      const infoLogger = new KnowledgeHubLogger({
        minLevel: LogLevel.INFO,
      });

      infoLogger.debug('This should not be logged');

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should disable console logging when configured', () => {
      const noConsoleLogger = new KnowledgeHubLogger({
        enableConsole: false,
      });

      noConsoleLogger.info('This should not appear in console');

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should set user and session context', () => {
      logger.setUser('new-user');
      logger.setSession('new-session');

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });
  });

  describe('Request ID Generation', () => {
    it('should generate unique request IDs', () => {
      const logger1 = new KnowledgeHubLogger();
      const logger2 = new KnowledgeHubLogger();

      logger1.info('Test message 1');
      logger2.info('Test message 2');

      const calls = consoleSpy.mock.calls;
      expect(calls[0][0]).toContain('Test message 1');
      expect(calls[1][0]).toContain('Test message 2');
      expect(calls[0][0]).not.toBe(calls[1][0]);
    });
  });

  describe('Context and Metadata', () => {
    it('should include context in log messages', () => {
      logger.info('Test message', {
        userId: 'test-user',
        action: 'test-action',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"test-user"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"test-action"')
      );
    });

    it('should include metadata in log messages', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        category: LogCategory.OPERATION,
        message: 'Test message',
        metadata: { customField: 'customValue' },
      };

      // Access private method for testing
      (logger as unknown as { writeLog: (entry: unknown) => void }).writeLog(
        logEntry
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"customField":"customValue"')
      );
    });
  });
});
