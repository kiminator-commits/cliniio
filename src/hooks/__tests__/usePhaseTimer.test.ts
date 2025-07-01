import { act } from '@testing-library/react';
import { useTimerStore } from '@/store/timerStore';
import { updateToolMetadata } from '@/hooks/usePhaseTimer';

describe('useTimerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTimerStore.setState({
      timeRemaining: 0,
      elapsedTime: 0,
      isRunning: false,
      overexposed: false,
      ciStripIncluded: false,
      biTestPassed: false,
      batchId: null,
    });
  });

  it('should update elapsedTime and timeRemaining correctly', () => {
    act(() => {
      useTimerStore.getState().setElapsedTime(60);
      useTimerStore.getState().setTimeRemaining(120);
    });

    const state = useTimerStore.getState();
    expect(state.elapsedTime).toBe(60);
    expect(state.timeRemaining).toBe(120);
  });

  it('should reset all timer state', () => {
    act(() => {
      useTimerStore.getState().setElapsedTime(80);
      useTimerStore.getState().setIsRunning(true);
      useTimerStore.getState().resetTimer();
    });

    const state = useTimerStore.getState();
    expect(state.elapsedTime).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.overexposed).toBe(false);
  });

  it('should toggle ciStripIncluded and biTestPassed flags', () => {
    act(() => {
      useTimerStore.getState().setCiStripIncluded(true);
      useTimerStore.getState().setBiTestPassed(true);
    });

    const state = useTimerStore.getState();
    expect(state.ciStripIncluded).toBe(true);
    expect(state.biTestPassed).toBe(true);
  });

  it('should store and clear batchId correctly', () => {
    act(() => {
      useTimerStore.getState().setBatchId('TEST1234');
    });

    let state = useTimerStore.getState();
    expect(state.batchId).toBe('TEST1234');

    act(() => {
      useTimerStore.getState().setBatchId(null);
    });

    state = useTimerStore.getState();
    expect(state.batchId).toBeNull();
  });

  it('should reset batchId, ciStripIncluded, and biTestPassed', () => {
    act(() => {
      useTimerStore.getState().setBatchId('1234');
      useTimerStore.getState().setCiStripIncluded(true);
      useTimerStore.getState().setBiTestPassed(true);
      useTimerStore.getState().resetTimer();
    });

    const state = useTimerStore.getState();
    expect(state.batchId).toBeNull();
    expect(state.ciStripIncluded).toBe(false);
    expect(state.biTestPassed).toBe(false);
  });

  it('should log AI metadata updates correctly', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();

    updateToolMetadata({ sanitizedByAi: true });
    updateToolMetadata({ validatedByOperator: true });

    expect(mockConsoleLog).toHaveBeenCalledWith('Updated tool metadata:', expect.any(Object));
    expect(mockConsoleInfo).toHaveBeenCalledWith('AI metadata enrichment complete');
    expect(mockConsoleInfo).toHaveBeenCalledWith('Metadata confirmed by human');

    mockConsoleLog.mockRestore();
    mockConsoleInfo.mockRestore();
  });
});
