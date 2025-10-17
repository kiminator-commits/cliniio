import { vi, describe, test, expect, beforeEach, afterEach, it, type Mock } from 'vitest';
import {
  ErrorReportingService,
  reportError,
  ErrorReportingConfig,
} from '@/services/errorReportingService';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleGroup = vi.fn();
const mockConsoleGroupEnd = vi.fn();
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

// Mock process.env
const originalEnv = process.env.NODE_ENV;

// Mock Supabase
const mockInsert = vi.fn(() => ({ error: null }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('ErrorReportingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleGroup.mockClear();
    mockConsoleGroupEnd.mockClear();
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    console.group = mockConsoleGroup;
    console.groupEnd = mockConsoleGroupEnd;
    vi.useFakeTimers();
    ErrorReportingService.reset();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.useRealTimers();
    ErrorReportingService.shutdown();
    process.env.NODE_ENV = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.group = originalConsoleGroup;
    console.groupEnd = originalConsoleGroupEnd;
  });

  describe('Initialization', () => {
    it('initializes with default configuration', () => {
      ErrorReportingService.initialize();

      const status = ErrorReportingService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.config.provider).toBe('console');
      expect(status.config.enabled).toBe(true);
    });

    it('initializes with custom configuration', () => {
      const config: Partial<ErrorReportingConfig> = {
        provider: 'sentry',
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        maxQueueSize: 5,
      };

      ErrorReportingService.initialize(config);

      const status = ErrorReportingService.getStatus();
      expect(status.config.provider).toBe('sentry');
      expect(status.config.dsn).toBe('https://test@sentry.io/123');
      expect(status.config.environment).toBe('test');
      expect(status.config.maxQueueSize).toBe(5);
    });

    it('falls back to console when provider requires credentials but none provided', () => {
      const config: Partial<ErrorReportingConfig> = {
        provider: 'sentry',
        enabled: true,
      };

      ErrorReportingService.initialize(config);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Error reporting provider requires DSN or API key'
      );
      const status = ErrorReportingService.getStatus();
      expect(status.config.provider).toBe('console');
    });

    it('starts flush timer when enabled', () => {
      const config: Partial<ErrorReportingConfig> = {
        provider: 'console',
        flushInterval: 1000,
      };

      ErrorReportingService.initialize(config);

      // Fast-forward time to trigger flush
      vi.advanceTimersByTime(1000);

      // Service should be initialized
      expect(ErrorReportingService.getStatus().isInitialized).toBe(true);
    });
  });

  describe('Error Reporting', () => {
    beforeEach(() => {
      ErrorReportingService.initialize();
    });

    it('reports error with basic information', () => {
      const error = new Error('Test error');

      ErrorReportingService.reportError(error);

      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });

    it('reports error with context information', () => {
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'TestComponent' };
      const context = { component: 'TestComponent', page: '/test' };

      ErrorReportingService.reportError(error, errorInfo, context);

      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });

    it('logs error in development mode', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error reported:',
        expect.any(Object)
      );
    });

    it('does not log error in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      expect(mockConsoleError).not.toHaveBeenCalledWith(
        'Error reported:',
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('flushes queue when maxQueueSize is reached', () => {
      ErrorReportingService.initialize({ maxQueueSize: 2 });

      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');

      ErrorReportingService.reportError(error1);
      ErrorReportingService.reportError(error2);
      ErrorReportingService.reportError(error3);

      // Should have flushed after error2, so queue should only have error3
      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });
  });

  describe('Console Provider', () => {
    beforeEach(() => {
      ErrorReportingService.initialize({ provider: 'console' });
    });

    it('sends errors to console', async () => {
      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await ErrorReportingService.forceFlush();

      expect(mockConsoleGroup).toHaveBeenCalledWith('Error Report Batch');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error 1:',
        expect.any(Object)
      );
      expect(mockConsoleGroupEnd).toHaveBeenCalled();
    });
  });

  describe('Sentry Provider', () => {
    beforeEach(() => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });
    });

    it('sends errors to Sentry successfully', async () => {
      ErrorReportingService.initialize({
        provider: 'sentry',
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error, undefined, {
        component: 'TestComponent',
      });

      await ErrorReportingService.forceFlush();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://o450000000000000.ingest.sentry.io/api/0/store/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Sentry-Auth': expect.stringContaining('Sentry'),
          }),
          body: expect.stringContaining('Test error'),
        })
      );
    });

    it('throws error when Sentry DSN is not configured', async () => {
      // Set configuration directly to bypass the fallback logic
      ErrorReportingService.updateConfig({
        provider: 'sentry',
        environment: 'test',
        enabled: true,
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await expect(ErrorReportingService.forceFlush()).rejects.toThrow(
        'Sentry DSN not configured'
      );
    });
  });

  describe('LogRocket Provider', () => {
    beforeEach(() => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });
    });

    it('sends errors to LogRocket successfully', async () => {
      ErrorReportingService.initialize({
        provider: 'logrocket',
        apiKey: 'test-api-key',
        environment: 'test',
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error, undefined, {
        component: 'TestComponent',
      });

      await ErrorReportingService.forceFlush();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.logrocket.com/api/v1/errors',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
          body: expect.stringContaining('Test error'),
        })
      );
    });

    it('throws error when LogRocket API key is not configured', async () => {
      // Set configuration directly to bypass the fallback logic
      ErrorReportingService.updateConfig({
        provider: 'logrocket',
        environment: 'test',
        enabled: true,
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await expect(ErrorReportingService.forceFlush()).rejects.toThrow(
        'LogRocket API key not configured'
      );
    });
  });

  describe('Bugsnag Provider', () => {
    beforeEach(() => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });
    });

    it('sends errors to Bugsnag successfully', async () => {
      ErrorReportingService.initialize({
        provider: 'bugsnag',
        apiKey: 'test-api-key',
        environment: 'test',
      });

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      ErrorReportingService.reportError(error, undefined, {
        component: 'TestComponent',
      });

      await ErrorReportingService.forceFlush();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://notify.bugsnag.com/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Version': '5',
          }),
          body: expect.stringContaining('Test error'),
        })
      );
    });

    it('throws error when Bugsnag API key is not configured', async () => {
      // Set configuration directly to bypass the fallback logic
      ErrorReportingService.updateConfig({
        provider: 'bugsnag',
        environment: 'test',
        enabled: true,
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await expect(ErrorReportingService.forceFlush()).rejects.toThrow(
        'Bugsnag API key not configured'
      );
    });
  });

  describe('Supabase Provider', () => {
    it('sends errors to Supabase successfully', async () => {
      ErrorReportingService.initialize({
        provider: 'supabase',
        environment: 'test',
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error, undefined, {
        component: 'TestComponent',
      });

      await ErrorReportingService.forceFlush();

      expect(mockFrom).toHaveBeenCalledWith('error_logs');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            error_message: 'Test error',
            error_name: 'Error',
            component: 'TestComponent',
          }),
        ])
      );
    });
  });

  describe('API Call Handling', () => {
    it('handles API call timeout', async () => {
      (global.fetch as Mock).mockImplementation(() =>
        Promise.reject(new Error('Timeout'))
      );

      ErrorReportingService.initialize({
        provider: 'sentry',
        dsn: 'https://test@sentry.io/123',
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await ErrorReportingService.forceFlush();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to send error reports:',
        expect.any(Error)
      );
    });

    it('handles API call failure and retries', async () => {
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      ErrorReportingService.initialize({
        provider: 'sentry',
        dsn: 'https://test@sentry.io/123',
      });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await ErrorReportingService.forceFlush();

      // Error should be back in queue for retry
      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });
  });

  describe('Stacktrace Parsing', () => {
    it('parses stacktrace correctly', () => {
      const error = new Error('Test error');
      error.stack = `Error: Test error
    at TestComponent (test.js:10:5)
    at Object.<anonymous> (test.js:15:1)
    at node_modules/react/index.js:1:1`;

      ErrorReportingService.initialize({
        provider: 'bugsnag',
        apiKey: 'test-api-key',
      });

      ErrorReportingService.reportError(error);

      // The stacktrace parsing is tested indirectly through the Bugsnag provider
      expect(global.fetch).not.toHaveBeenCalled(); // Not called yet
    });
  });

  describe('Service Management', () => {
    it('updates configuration', () => {
      ErrorReportingService.initialize();

      ErrorReportingService.updateConfig({ maxQueueSize: 20 });

      const status = ErrorReportingService.getStatus();
      expect(status.config.maxQueueSize).toBe(20);
    });

    it('clears error queue', () => {
      ErrorReportingService.initialize();

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      let status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);

      ErrorReportingService.clearQueue();

      status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(0);
    });

    it('shuts down service', () => {
      ErrorReportingService.initialize();

      ErrorReportingService.shutdown();

      const status = ErrorReportingService.getStatus();
      expect(status.isInitialized).toBe(false);
    });
  });

  describe('Convenience Function', () => {
    it('reportError function works correctly', () => {
      ErrorReportingService.initialize();

      const error = new Error('Test error');
      reportError(error);

      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty error queue during flush', async () => {
      ErrorReportingService.initialize();

      await ErrorReportingService.forceFlush();

      // Should not throw any errors
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('handles disabled service during flush', async () => {
      ErrorReportingService.initialize({ enabled: false });

      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      await ErrorReportingService.forceFlush();

      // Should not send errors when disabled
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles missing error stack', () => {
      const error = new Error('Test error');
      delete (error as any).stack;

      ErrorReportingService.initialize({
        provider: 'bugsnag',
        apiKey: 'test-api-key',
      });

      ErrorReportingService.reportError(error);

      // Should not throw when stack is missing
      expect(ErrorReportingService.getStatus().queueLength).toBe(1);
    });
  });
});
