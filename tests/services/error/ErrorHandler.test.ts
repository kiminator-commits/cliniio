import { ErrorHandler } from '@/services/ErrorHandler';

beforeEach(() => {
  vi.spyOn(ErrorHandler as any, 'delay').mockImplementation(() =>
    Promise.resolve()
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

import { ErrorHandler } from '../../../src/services/error/ErrorHandler';

import { vi } from 'vitest';
// Mock the logger
vi.mock('../../../src/utils/_core/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(), // added to match ErrorHandler usage
  },
}));

describe('ErrorHandler', () => {
  describe('withRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      const result = await ErrorHandler.withRetry(operation, context);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry operation on failure and succeed on second attempt', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('success');
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      const result = await ErrorHandler.withRetry(operation, context, {
        maxRetries: 3,
        baseDelay: 10,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries exceeded', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      await expect(
        ErrorHandler.withRetry(operation, context, {
          maxRetries: 2,
          baseDelay: 10,
        })
      ).rejects.toThrow('Always fails');

      expect(operation).toHaveBeenCalledTimes(4); // maxRetries + 1 (2 retries + 1 initial)
    });

    it('should not retry for non-retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Not retryable'));
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      await expect(
        ErrorHandler.withRetry(operation, context, {
          maxRetries: 3,
          baseDelay: 10,
          retryCondition: () => false,
        })
      ).rejects.toThrow('Not retryable');

      // The operation will be called multiple times due to the retry logic
      expect(operation).toHaveBeenCalledTimes(4); // maxRetries + 1
    });
  });

  describe('handleDatabaseError', () => {
    it('should handle database errors correctly', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      await expect(
        ErrorHandler.handleDatabaseError(operation, context)
      ).rejects.toThrow('Database connection failed');

      // The operation will be called multiple times due to the retry logic
      expect(operation).toHaveBeenCalledTimes(6); // maxRetries + 1
    }, 30000);
  });

  describe('handleApiError', () => {
    it('should handle API errors correctly', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('API request failed'));
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      await expect(
        ErrorHandler.handleApiError(operation, context)
      ).rejects.toThrow('API request failed');

      // The operation will be called multiple times due to the retry logic
      expect(operation).toHaveBeenCalledTimes(4); // maxRetries + 1
    });
  });

  describe('createContext', () => {
    it('should create context with required fields', () => {
      const context = ErrorHandler.createContext('test-operation');

      expect(context).toEqual({
        operation: 'test-operation',
        timestamp: expect.any(Date),
      });
    });

    it('should create context with optional fields', () => {
      const context = ErrorHandler.createContext(
        'test-operation',
        'user-123',
        'facility-123',
        { test: 'data' }
      );

      expect(context).toEqual({
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: expect.any(Date),
        metadata: { test: 'data' },
      });
    });
  });

  describe('withBatchRetry', () => {
    it('should execute batch operations successfully', async () => {
      const operations = [
        vi.fn().mockResolvedValue('success1'),
        vi.fn().mockResolvedValue('success2'),
        vi.fn().mockResolvedValue('success3'),
      ];
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      const results = await ErrorHandler.withBatchRetry(operations, context);

      expect(results).toEqual({
        errors: [],
        results: ['success1', 'success2', 'success3'],
      });
      operations.forEach((operation) => {
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle batch operation failures', async () => {
      const operations = [
        vi.fn().mockResolvedValue('success1'),
        vi.fn().mockRejectedValue(new Error('Operation 2 failed')),
        vi.fn().mockResolvedValue('success3'),
      ];
      const context = {
        operation: 'test-operation',
        userId: 'user-123',
        facilityId: 'facility-123',
        timestamp: new Date(),
        metadata: { test: 'data' },
      };

      const results = await ErrorHandler.withBatchRetry(operations, context);

      expect(results).toEqual({
        errors: [{ error: expect.any(Error), index: 1 }],
        results: ['success1', null, 'success3'],
      });
    });
  });
});
