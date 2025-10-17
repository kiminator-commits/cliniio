import { renderHook } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { useErrorHandler } from '../../src/hooks/useErrorHandler';

// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock window methods
const mockConfirm = vi.fn();
const mockAlert = vi.fn();

Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

import { logger } from '../../src/utils/logger';

const mockLogger = logger as vi.Mocked<typeof logger>;

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return handleError function', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(typeof result.current.handleError).toBe('function');
  });

  it('should log error with context', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');
    const context = 'test context';

    result.current.handleError(error, context);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error in test context:',
      error
    );
  });

  it('should show alert when no retry function provided', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');
    const context = 'test context';

    result.current.handleError(error, context);

    expect(mockAlert).toHaveBeenCalledWith(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should show confirm dialog when retry function provided', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');
    const context = 'test context';
    const retryFn = vi.fn();

    mockConfirm.mockReturnValue(true);

    result.current.handleError(error, context, retryFn);

    expect(mockConfirm).toHaveBeenCalledWith(
      'An unexpected error occurred. Please try again.\n\nWould you like to try again?'
    );
    expect(retryFn).toHaveBeenCalled();
  });

  it('should not call retry function when user cancels', () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error('Test error');
    const context = 'test context';
    const retryFn = vi.fn();

    mockConfirm.mockReturnValue(false);

    result.current.handleError(error, context, retryFn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(retryFn).not.toHaveBeenCalled();
  });

  describe('getErrorMessage', () => {
    it('should return task-specific messages for task context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current.handleError(error, 'task load');
      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to load tasks. Please check your internet connection.'
      );

      result.current.handleError(error, 'task complete');
      expect(mockAlert).toHaveBeenCalledWith(
        'Task completion failed. Try again or contact support.'
      );

      result.current.handleError(error, 'task update');
      expect(mockAlert).toHaveBeenCalledWith(
        'Task completion failed. Try again or contact support.'
      );

      result.current.handleError(error, 'task operation');
      expect(mockAlert).toHaveBeenCalledWith(
        'Task operation failed. Please try again.'
      );
    });

    it('should return network-specific messages for network context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current.handleError(error, 'network error');
      expect(mockAlert).toHaveBeenCalledWith(
        'Network error. Please check your internet connection.'
      );

      result.current.handleError(error, 'connection failed');
      expect(mockAlert).toHaveBeenCalledWith(
        'Network error. Please check your internet connection.'
      );
    });

    it('should return validation-specific messages for validation context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current.handleError(error, 'validation error');
      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid input provided. Please check your data and try again.'
      );

      result.current.handleError(error, 'input validation');
      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid input provided. Please check your data and try again.'
      );
    });

    it('should return fallback message for unknown context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current.handleError(error, 'unknown context');
      expect(mockAlert).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.'
      );
    });
  });

  it('should handle different error types', () => {
    const { result } = renderHook(() => useErrorHandler());

    // String error
    result.current.handleError('String error', 'test');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error in test:',
      'String error'
    );

    // Object error
    result.current.handleError({ message: 'Object error' }, 'test');
    expect(mockLogger.error).toHaveBeenCalledWith('Error in test:', {
      message: 'Object error',
    });

    // Null error
    result.current.handleError(null, 'test');
    expect(mockLogger.error).toHaveBeenCalledWith('Error in test:', null);

    // Undefined error
    result.current.handleError(undefined, 'test');
    expect(mockLogger.error).toHaveBeenCalledWith('Error in test:', undefined);
  });

  it('should maintain referential stability', () => {
    const { result, rerender } = renderHook(() => useErrorHandler());

    const firstHandleError = result.current.handleError;

    rerender();

    expect(result.current.handleError).toBe(firstHandleError);
  });
});
