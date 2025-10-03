import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useCleanup } from './useCleanup';

describe('useCleanup', () => {
  it('should call cleanup function on unmount', () => {
    const cleanupFn = vi.fn();
    const { unmount } = renderHook(() => useCleanup(cleanupFn));

    expect(cleanupFn).not.toHaveBeenCalled();

    unmount();

    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it('should call cleanup function when cleanupFn changes', () => {
    const cleanupFn1 = vi.fn();
    const cleanupFn2 = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ cleanupFn }) => useCleanup(cleanupFn),
      { initialProps: { cleanupFn: cleanupFn1 } }
    );

    expect(cleanupFn1).not.toHaveBeenCalled();
    expect(cleanupFn2).not.toHaveBeenCalled();

    rerender({ cleanupFn: cleanupFn2 });

    expect(cleanupFn1).toHaveBeenCalledTimes(1);
    expect(cleanupFn2).not.toHaveBeenCalled();

    unmount();

    expect(cleanupFn2).toHaveBeenCalledTimes(1);
  });

  it('should handle cleanup function that throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cleanupFn = vi.fn(() => {
      throw new Error('Cleanup error');
    });

    const { unmount } = renderHook(() => useCleanup(cleanupFn));

    // The cleanup function throwing is expected behavior, but React should handle it gracefully
    // We expect the unmount to not throw, even if the cleanup function throws
    expect(() => unmount()).not.toThrow();
    expect(cleanupFn).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
