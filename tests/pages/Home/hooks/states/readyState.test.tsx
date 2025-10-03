import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectReadyState,
  createReadyMock,
  mockTasks,
} from '../__mocks__/homePageStateMocks';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Ready State', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should return ready state when tasks are available', () => {
    setupMock(createReadyMock(mockTasks));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should handle mixed task states correctly', () => {
    setupMock(createReadyMock(mockTasks));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});
