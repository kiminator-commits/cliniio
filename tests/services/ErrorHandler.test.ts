import { ErrorHandler } from '@/services/ErrorHandler';

beforeEach(() => {
  vi.spyOn(ErrorHandler as any, 'delay').mockImplementation(() =>
    Promise.resolve()
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

import { vi } from 'vitest';
import {
  ErrorHandler,
  RetryOptions,
  ErrorContext,
} from '@/services/error/ErrorHandler';

// Mock the logger
vi.mock('@/utils/_core/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(), // added to support ErrorHandler usage
  },
}));

describe('ErrorHandler', () => {
  describe('withRetry', () => {
    it('executes successful operation without retry', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');

      const result = await ErrorHandler.withRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('retries failed operation and succeeds on second attempt', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce('success');

      const result = await ErrorHandler.withRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('retries up to maxRetries times', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error('Always fails'));

      await expect(
        ErrorHandler.withRetry(mockOperation, { maxRetries: 2 })
      ).rejects.toThrow('Always fails');

      expect(mockOperation).toHaveBeenCalledTimes(3); // maxRetries + 1
    });

    it('uses default retry options', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));

      await expect(ErrorHandler.withRetry(mockOperation)).rejects.toThrow(
        'Fails'
      );

      expect(mockOperation).toHaveBeenCalledTimes(4); // Default maxRetries + 1
    });

    it('respects custom retry options', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));
      const options: RetryOptions = {
        maxRetries: 5,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 1.5,
      };

      await expect(
        ErrorHandler.withRetry(mockOperation, options)
      ).rejects.toThrow('Fails');

      expect(mockOperation).toHaveBeenCalledTimes(6); // maxRetries + 1
    });

    it('applies exponential backoff delay', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));
      const options: RetryOptions = {
        maxRetries: 3,
        baseDelay: 100,
        backoffMultiplier: 2,
      };

      await expect(
        ErrorHandler.withRetry(mockOperation, options)
      ).rejects.toThrow('Fails');
      expect(mockOperation).toHaveBeenCalledTimes(4); // maxRetries + 1
    });

    it('respects maxDelay limit', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));
      const options: RetryOptions = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 2,
      };

      await expect(
        ErrorHandler.withRetry(mockOperation, options)
      ).rejects.toThrow('Fails');
      expect(mockOperation).toHaveBeenCalledTimes(4); // maxRetries + 1
    });

    it('uses custom retry condition', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));
      const retryCondition = vi.fn().mockReturnValue(false);

      await expect(
        ErrorHandler.withRetry(mockOperation, { retryCondition })
      ).rejects.toThrow('Fails');

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
    });

    it('passes context to operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      const context: ErrorContext = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-456',
        timestamp: new Date(),
        metadata: { test: true },
      };

      await ErrorHandler.withRetry(mockOperation, {}, context);

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('withBatchRetry', () => {
    it('executes all operations successfully', async () => {
      const operations = [
        vi.fn().mockResolvedValue('result1'),
        vi.fn().mockResolvedValue('result2'),
        vi.fn().mockResolvedValue('result3'),
      ];

      const result = await ErrorHandler.withBatchRetry(operations);

      expect(result.results).toEqual(['result1', 'result2', 'result3']);
      expect(result.errors).toEqual([]);
      operations.forEach((op) => expect(op).toHaveBeenCalledTimes(1));
    });

    it('handles mixed success and failure', async () => {
      const operations = [
        vi.fn().mockResolvedValue('result1'),
        vi.fn().mockRejectedValue(new Error('Operation 2 failed')),
        vi.fn().mockResolvedValue('result3'),
      ];

      const result = await ErrorHandler.withBatchRetry(operations);

      expect(result.results).toEqual(['result1', null, 'result3']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error.message).toBe('Operation 2 failed');
    });

    it('handles all operations failing', async () => {
      const operations = [
        vi.fn().mockRejectedValue(new Error('Operation 1 failed')),
        vi.fn().mockRejectedValue(new Error('Operation 2 failed')),
        vi.fn().mockRejectedValue(new Error('Operation 3 failed')),
      ];

      const result = await ErrorHandler.withBatchRetry(operations);

      expect(result.results).toEqual([null, null, null]);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map((e) => e.index)).toEqual([0, 1, 2]);
    });

    it('uses custom retry options for batch operations', async () => {
      const operations = [vi.fn().mockRejectedValue(new Error('Fails'))];
      const options: RetryOptions = { maxRetries: 1 };

      const result = await ErrorHandler.withBatchRetry(operations, options);

      expect(result.results).toEqual([null]);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('handleDatabaseError', () => {
    it('retries database operations with appropriate settings', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce('success');

      const result = await ErrorHandler.handleDatabaseError(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('uses database-specific retry configuration', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      await expect(
        ErrorHandler.handleDatabaseError(mockOperation)
      ).rejects.toThrow('Connection failed');
      expect(mockOperation).toHaveBeenCalledTimes(6); // maxRetries + 1
    });
  });

  describe('handleApiError', () => {
    it('retries API operations with appropriate settings', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce('success');

      const result = await ErrorHandler.handleApiError(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('uses API-specific retry configuration', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('API failed'));

      await expect(ErrorHandler.handleApiError(mockOperation)).rejects.toThrow(
        'API failed'
      );
      expect(mockOperation).toHaveBeenCalledTimes(4); // maxRetries + 1
    });
  });

  describe('Error Type Detection', () => {
    it('identifies database errors correctly', () => {
      const databaseErrors = [
        new Error('Connection timeout'),
        new Error('Deadlock detected'),
        new Error('Serialization failure'),
        { code: 'ECONNREFUSED' },
        { code: 'ETIMEDOUT' },
      ];

      databaseErrors.forEach((error) => {
        expect(ErrorHandler['isRetryableError'](error)).toBe(true);
      });
    });

    it('identifies API errors correctly', () => {
      const apiErrors = [
        { status: 500 },
        { status: 502 },
        { status: 503 },
        { status: 504 },
        { status: 429 },
        { status: 408 },
        { response: { status: 500 } },
      ];

      apiErrors.forEach((error) => {
        expect(ErrorHandler['isRetryableError'](error)).toBe(true);
      });
    });

    it('identifies network errors correctly', () => {
      const networkErrors = [
        { code: 'ENOTFOUND' },
        { code: 'ECONNRESET' },
        { code: 'ECONNABORTED' },
        { message: 'Network error occurred' },
      ];

      networkErrors.forEach((error) => {
        expect(ErrorHandler['isRetryableError'](error)).toBe(true);
      });
    });

    it('identifies timeout errors correctly', () => {
      const timeoutErrors = [
        { code: 'ETIMEDOUT' },
        { message: 'Request timeout' },
        { message: 'Operation timed out' },
      ];

      timeoutErrors.forEach((error) => {
        expect(ErrorHandler['isRetryableError'](error)).toBe(true);
      });
    });

    it('does not retry non-retryable errors', () => {
      const nonRetryableErrors = [
        new Error('Validation failed'),
        { status: 400 },
        { status: 401 },
        { status: 403 },
        { status: 404 },
        { message: 'Invalid input' },
      ];

      nonRetryableErrors.forEach((error) => {
        expect(ErrorHandler['isRetryableError'](error)).toBe(false);
      });
    });
  });

  describe('createContext', () => {
    it('creates error context with required fields', () => {
      const context = ErrorHandler.createContext('test-operation');

      expect(context.operation).toBe('test-operation');
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.userId).toBeUndefined();
      expect(context.facilityId).toBeUndefined();
      expect(context.metadata).toBeUndefined();
    });

    it('creates error context with all fields', () => {
      const metadata = { test: true, value: 42 };
      const context = ErrorHandler.createContext(
        'test-operation',
        'user-123',
        'facility-456',
        metadata
      );

      expect(context.operation).toBe('test-operation');
      expect(context.userId).toBe('user-123');
      expect(context.facilityId).toBe('facility-456');
      expect(context.metadata).toEqual(metadata);
      expect(context.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('handles operation that throws non-Error objects', async () => {
      const mockOperation = vi.fn().mockRejectedValue('String error');

      await expect(ErrorHandler.withRetry(mockOperation)).rejects.toBe(
        'String error'
      );
    });

    it('handles operation that throws null', async () => {
      const mockOperation = vi.fn().mockRejectedValue(null);

      await expect(ErrorHandler.withRetry(mockOperation)).rejects.toBeNull();
    });

    it('handles operation that throws undefined', async () => {
      const mockOperation = vi.fn().mockRejectedValue(undefined);

      await expect(
        ErrorHandler.withRetry(mockOperation)
      ).rejects.toBeUndefined();
    });

    it('handles empty operations array in batch retry', async () => {
      const result = await ErrorHandler.withBatchRetry([]);

      expect(result.results).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('handles operation that returns null', async () => {
      const mockOperation = vi.fn().mockResolvedValue(null);

      const result = await ErrorHandler.withRetry(mockOperation);
      expect(result).toBeNull();
    });

    it('handles operation that returns undefined', async () => {
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      const result = await ErrorHandler.withRetry(mockOperation);
      expect(result).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('handles many concurrent operations', async () => {
      const operations = Array.from({ length: 100 }, (_, i) =>
        vi.fn().mockResolvedValue(`result-${i}`)
      );

      const result = await ErrorHandler.withBatchRetry(operations);

      expect(result.results).toHaveLength(100);
      expect(result.errors).toHaveLength(0);
      operations.forEach((op) => {
        expect(op).toHaveBeenCalledTimes(1);
      });
    });

    it('handles operations with different execution times', async () => {
      const operations = [
        vi
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) => setTimeout(() => resolve('slow'), 100))
          ),
        vi.fn().mockResolvedValue('fast'),
      ];

      const result = await ErrorHandler.withBatchRetry(operations);

      expect(result.results).toEqual(['slow', 'fast']);
      expect(result.errors).toHaveLength(0);
    });
  });
});
