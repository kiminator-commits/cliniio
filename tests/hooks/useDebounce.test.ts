import { renderHook, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 100));

    // Call the debounced function multiple times
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have been called once with the last arguments
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('arg3');
  });

  it('should clear previous timeout when called again', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 100));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      result.current('second');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('second');
  });

  it('should handle different delay values', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 200));

    act(() => {
      result.current('test');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('test');
  });

  it('should handle multiple arguments', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 100));

    act(() => {
      result.current('arg1', 'arg2', 'arg3');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should handle zero delay', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 0));

    act(() => {
      result.current('test');
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockCallback).toHaveBeenCalledWith('test');
  });

  it('should work with different callback functions', () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ callback }) => useDebounce(callback, 100),
      {
        initialProps: { callback: mockCallback1 },
      }
    );

    act(() => {
      result.current('test1');
    });

    rerender({ callback: mockCallback2 });

    act(() => {
      result.current('test2');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalledWith('test2');
  });
});
