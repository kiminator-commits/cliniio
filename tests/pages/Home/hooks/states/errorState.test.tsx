import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectReadyState,
  createErrorMock,
} from '../__mocks__/homePageStateMocks';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Error State', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should return ready state when task loading fails', () => {
    setupMock(createErrorMock('Network error occurred'));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should handle different types of error messages', () => {
    const errorMessages = [
      'Server timeout',
      'Authentication failed',
      'Database connection error',
    ];

    errorMessages.forEach((errorMessage) => {
      setupMock(createErrorMock(errorMessage));

      const { result } = renderHomePageStateHook();

      expectReadyState(result as { current: UseHomePageStateReturn });
    });
  });

  it('should handle null error gracefully', () => {
    setupMock(createErrorMock(''));

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});
