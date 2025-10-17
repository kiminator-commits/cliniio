import {
  clearMocks,
  setupMock,
  renderHomePageStateHook,
  expectNullComponent,
  createLoadingMock,
  createErrorMock,
  createEmptyMock,
  createReadyMock,
  mockTasks,
} from '../__mocks__/homePageStateMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

describe('Component Rendering', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should render null component for loading state', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectNullComponent(result as { current: UseHomePageStateReturn });
  });

  it('should render null component for error state', () => {
    setupMock(createErrorMock('Some error occurred'));

    const { result } = renderHomePageStateHook();

    expectNullComponent(result as { current: UseHomePageStateReturn });
  });

  it('should render null component for empty state', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectNullComponent(result as { current: UseHomePageStateReturn });
  });

  it('should return null component for ready state', () => {
    setupMock(createReadyMock(mockTasks));

    const { result } = renderHomePageStateHook();

    expectNullComponent(result as { current: UseHomePageStateReturn });
  });
});
