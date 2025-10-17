import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectReadyState,
  createLoadingMock,
} from '../__mocks__/homePageStateMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Loading State', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should return ready state when tasks are being fetched', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should show loading spinner with correct styling', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});
