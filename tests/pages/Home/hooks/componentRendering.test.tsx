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
} from './__mocks__/homePageStateMocks';

describe('Component Rendering', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should render null component for loading state', () => {
    setupMock(createLoadingMock());

    const { result } = renderHomePageStateHook();

    expectNullComponent(result);
  });

  it('should render null component for error state', () => {
    setupMock(createErrorMock('Some error occurred'));

    const { result } = renderHomePageStateHook();

    expectNullComponent(result);
  });

  it('should render null component for empty state', () => {
    setupMock(createEmptyMock());

    const { result } = renderHomePageStateHook();

    expectNullComponent(result);
  });

  it('should return null component for ready state', () => {
    setupMock(createReadyMock(mockTasks));

    const { result } = renderHomePageStateHook();

    expectNullComponent(result);
  });
});
