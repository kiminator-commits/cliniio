import { renderHook, act } from '@testing-library/react';
import { useAccurateTimer } from '../useAccurateTimer';

jest.useFakeTimers();

describe('useAccurateTimer', () => {
  it('counts elapsed time and completes when duration is reached', () => {
    const { result } = renderHook(() => useAccurateTimer(5, true));

    expect(result.current.elapsed).toBe(0);
    expect(result.current.remaining).toBe(5);
    expect(result.current.isComplete).toBe(false);

    act(() => {
      jest.advanceTimersByTime(6000); // Advance more than the duration
    });

    expect(result.current.elapsed).toBeGreaterThanOrEqual(4);
    expect(result.current.remaining).toBeLessThanOrEqual(1);
    expect(result.current.isComplete).toBe(true);
  });
});
