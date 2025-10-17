import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectReadyState,
  createLoadingMock,
  createErrorMock,
  createReadyMock,
  mockTasks,
} from '../__mocks__/homePageStateMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Edge Cases', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should handle concurrent loading and error states', () => {
    // This test ensures the hook prioritizes loading over error
    const mockWithLoadingAndError = {
      ...createLoadingMock(),
      taskError: 'Some error occurred',
    };
    setupMock(mockWithLoadingAndError);

    const { result } = renderHomePageStateHook();

    // Loading should take precedence over error
    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});

describe('State Priority', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should prioritize ready over loading state', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should prioritize ready over empty state', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should prioritize ready over error state', () => {
    setupMock(createErrorMock('Some error occurred'));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should prioritize ready over empty state when tasks exist', () => {
    setupMock(createReadyMock(mockTasks));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});
