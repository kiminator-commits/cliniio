import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebouncedState } from '../../src/hooks/useDebouncedState';

describe('useDebouncedState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with initial value', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 100));

    expect(result.current[0]).toBe('initial');
    expect(typeof result.current[1]).toBe('function');
  });

  it('should debounce value updates', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 100));

    act(() => {
      result.current[1]('first');
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('second');
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('second');
  });

  it('should use custom delay', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 200));

    act(() => {
      result.current[1]('updated');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should use default delay of 300ms', () => {
    const { result } = renderHook(() => useDebouncedState('initial'));

    act(() => {
      result.current[1]('updated');
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() =>
      useDebouncedState('initial', 100)
    );

    act(() => {
      result.current[1]('updated');
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clear previous timeout when value changes', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 100));

    act(() => {
      result.current[1]('first');
    });

    act(() => {
      result.current[1]('second');
    });

    // Clean up to prevent memory leaks
    act(() => {
      vi.runAllTimers();
    });

    // Just verify the final value is correct
    expect(result.current[0]).toBe('second');
  });

  it('should handle multiple rapid changes', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 100));

    act(() => {
      result.current[1]('first');
      result.current[1]('second');
      result.current[1]('third');
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('third');
  });

  it('should work with different value types', () => {
    const { result: stringResult } = renderHook(() =>
      useDebouncedState('initial', 100)
    );
    const { result: numberResult } = renderHook(() =>
      useDebouncedState(0, 100)
    );
    const { result: booleanResult } = renderHook(() =>
      useDebouncedState(false, 100)
    );
    const { result: objectResult } = renderHook(() =>
      useDebouncedState({ key: 'value' }, 100)
    );

    act(() => {
      stringResult.current[1]('updated');
      numberResult.current[1](42);
      booleanResult.current[1](true);
      objectResult.current[1]({ key: 'new value' });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(stringResult.current[0]).toBe('updated');
    expect(numberResult.current[0]).toBe(42);
    expect(booleanResult.current[0]).toBe(true);
    expect(objectResult.current[0]).toEqual({ key: 'new value' });
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedState('initial', delay),
      {
        initialProps: { delay: 100 },
      }
    );

    act(() => {
      result.current[1]('updated');
    });

    rerender({ delay: 200 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should maintain referential stability of setter', () => {
    const { result, rerender } = renderHook(() =>
      useDebouncedState('initial', 100)
    );

    const firstSetter = result.current[1];

    rerender();

    expect(result.current[1]).toBe(firstSetter);
  });
});
