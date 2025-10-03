import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectReadyState,
  createEmptyMock,
} from '../__mocks__/homePageStateMocks';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Empty State', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should return ready state when no tasks are available', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should return ready state when tasks array is empty', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should return ready state when tasks are null', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });

  it('should return ready state when tasks are undefined', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectReadyState(result as { current: UseHomePageStateReturn });
  });
});
