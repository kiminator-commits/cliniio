import { vi } from 'vitest';
import React from 'react';
import {
  MockRegistry,
  setupMocks,
  resetAllMocks,
} from '../__mocks__/mockRegistry';

/**
 * Standardized Test Utilities
 *
 * Provides consistent setup/teardown and mock management
 * across all test files.
 */

// ============================================================================
// TEST SETUP UTILITIES
// ============================================================================

/**
 * Standard test setup that should be called in beforeEach
 * Sets up all mocks and clears previous state
 */
export const setupTest = () => {
  // Initialize mock registry
  const registry = setupMocks();

  // Clear all mocks to ensure clean state
  resetAllMocks();

  // Clear DOM
  document.body.innerHTML = '';

  return registry;
};

/**
 * Standard test cleanup that should be called in afterEach
 * Cleans up mocks and DOM
 */
export const cleanupTest = () => {
  // Reset all mocks
  resetAllMocks();

  // Clear DOM
  document.body.innerHTML = '';

  // Clear all timers
  vi.clearAllTimers();
};

/**
 * Setup function for tests that need specific mocks
 * @param mockOverrides - Object with service names and their mock overrides
 */
export const setupTestWithMocks = (mockOverrides: Record<string, any> = {}) => {
  const registry = setupTest();

  // Apply mock overrides
  Object.entries(mockOverrides).forEach(([serviceName, mockOverride]) => {
    registry.registerFactory(serviceName, () => mockOverride);
  });

  return registry;
};

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Get a mock for a specific service
 * @param serviceName - Name of the service to get mock for
 */
export const getMock = (serviceName: string) => {
  const registry = MockRegistry.getInstance();
  return registry.getMock(serviceName);
};

/**
 * Override a specific mock function
 * @param serviceName - Name of the service
 * @param functionName - Name of the function to override
 * @param implementation - New implementation
 */
export const overrideMock = (
  serviceName: string,
  functionName: string,
  implementation: any
) => {
  const mock = getMock(serviceName);
  if (mock && mock[functionName]) {
    mock[functionName].mockImplementation(implementation);
  }
};

/**
 * Reset a specific mock
 * @param serviceName - Name of the service
 * @param functionName - Name of the function to reset
 */
export const resetMock = (serviceName: string, functionName: string) => {
  const mock = getMock(serviceName);
  if (mock && mock[functionName]) {
    mock[functionName].mockClear();
  }
};

// ============================================================================
// COMMON TEST PATTERNS
// ============================================================================

/**
 * Setup for login tests with proper mocks
 */
export const setupLoginTest = () => {
  return setupTestWithMocks({
    loginService: {
      attemptLogin: vi.fn().mockResolvedValue({
        success: true,
        session: {
          access_token: 'test-token',
          user: { id: 'test-user' },
          expires_at: Date.now() + 3600000,
        },
      }),
    },
    router: {
      navigate: vi.fn(),
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/test' }),
      useParams: () => ({}),
      MemoryRouter: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          'div',
          { 'data-testid': 'memory-router' },
          children
        ),
    },
  });
};

/**
 * Setup for component tests with UI mocks
 */
export const setupComponentTest = () => {
  return setupTestWithMocks({
    '@mdi/react': {
      Icon: ({ path, size = 1, color, className, ...props }: any) =>
        React.createElement(
          'svg',
          {
            'data-testid': 'icon',
            width: size * 24,
            height: size * 24,
            className,
            style: { color },
            ...props,
          },
          React.createElement('path', { d: path })
        ),
    },
  });
};

/**
 * Setup for integration tests with all mocks
 */
export const setupIntegrationTest = () => {
  return setupTestWithMocks({
    '@mdi/react': {
      Icon: ({ path, size = 1, color, className, ...props }: any) =>
        React.createElement(
          'svg',
          {
            'data-testid': 'icon',
            width: size * 24,
            height: size * 24,
            className,
            style: { color },
            ...props,
          },
          React.createElement('path', { d: path })
        ),
    },
    SimplifiedKnowledgeHubProvider: {
      SimplifiedKnowledgeHubProvider: ({
        children,
      }: {
        children: React.ReactNode;
      }) =>
        React.createElement(
          'div',
          { 'data-testid': 'mock-simplified-knowledge-hub-provider' },
          children
        ),
      useSimplifiedKnowledgeHub: () => ({
        selectedCategory: 'Courses',
        selectedContent: [],
        isLoading: false,
        error: null,
        validationError: null,
        setSelectedCategory: vi.fn(),
        getCategoryCount: vi.fn(() => 0),
        refetchContent: vi.fn(),
        deleteContent: vi.fn(),
        updateContentStatus: vi.fn(),
        updateContent: vi.fn(),
        clearValidationError: vi.fn(),
      }),
    },
  });
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Wait for a mock to be called with specific arguments
 * @param mockFn - The mock function to wait for
 * @param expectedArgs - Expected arguments
 * @param timeout - Timeout in ms (default: 5000)
 */
export const waitForMockCall = async (
  mockFn: any,
  expectedArgs: any[],
  timeout: number = 5000
) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (
      mockFn.mock.calls.some(
        (call: any[]) =>
          call.length === expectedArgs.length &&
          call.every((arg, index) => arg === expectedArgs[index])
      )
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `Mock was not called with expected arguments: ${JSON.stringify(expectedArgs)}`
  );
};

/**
 * Assert that a mock was called with specific arguments
 * @param mockFn - The mock function
 * @param expectedArgs - Expected arguments
 */
export const expectMockCalledWith = (mockFn: any, expectedArgs: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

// ============================================================================
// VITEST HOOKS
// ============================================================================

/**
 * Standard beforeEach hook for all tests
 * Call this in your test files: beforeEach(setupTest)
 */
export const standardBeforeEach = () => {
  setupTest();
};

/**
 * Standard afterEach hook for all tests
 * Call this in your test files: afterEach(cleanupTest)
 */
export const standardAfterEach = () => {
  cleanupTest();
};
