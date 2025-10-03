import { vi } from 'vitest';
import React from 'react';

/**
 * Centralized Mock Registry
 *
 * This is the single source of truth for all test mocks.
 * Prevents mock pollution by ensuring consistent implementations
 * across all test files.
 */

// ============================================================================
// CORE MOCK FACTORIES
// ============================================================================

/**
 * Creates a consistent @mdi/react Icon mock
 */
export const createIconMock = () => ({
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
});

/**
 * Creates a consistent SimplifiedKnowledgeHubProvider mock
 */
export const createSimplifiedKnowledgeHubProviderMock = () => ({
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
});

/**
 * Creates a consistent login service mock
 */
export const createLoginServiceMock = () => ({
  attemptLogin: vi.fn().mockResolvedValue({
    success: true,
    session: {
      access_token: 'test-token',
      user: { id: 'test-user' },
      expires_at: Date.now() + 3600000, // 1 hour from now
    },
  }),
});

/**
 * Creates a consistent API service mock
 */
export const createApiServiceMock = () => ({
  submitLoginForm: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 'test-user-id' },
  }),
});

/**
 * Creates a consistent router mock
 */
export const createRouterMock = () => {
  const mockNavigate = vi.fn();
  return {
    navigate: mockNavigate,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test' }),
    useParams: () => ({}),
    MemoryRouter: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'memory-router' }, children),
  };
};

/**
 * Creates a consistent user context mock
 */
export const createUserContextMock = () => ({
  user: { id: 'test-user', email: 'test@example.com' },
  refreshUserData: vi.fn().mockResolvedValue(undefined),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
});

/**
 * Creates a consistent login store mock
 */
export const createLoginStoreMock = () => ({
  formData: {
    email: '',
    password: '',
    rememberMe: false,
    rememberDevice: false,
    otp: '',
    stage: 'credentials' as const,
  },
  errors: {},
  loading: false,
  setField: vi.fn(),
  setErrors: vi.fn(),
  setLoading: vi.fn(),
  setStage: vi.fn(),
  setSessionExpiry: vi.fn(),
  setAuthToken: vi.fn(),
  reset: vi.fn(),
});

// ============================================================================
// MOCK REGISTRY CLASS
// ============================================================================

export class MockRegistry {
  private static instance: MockRegistry;
  private mocks: Map<string, any> = new Map();
  private mockFactories: Map<string, () => any> = new Map();

  static getInstance(): MockRegistry {
    if (!MockRegistry.instance) {
      MockRegistry.instance = new MockRegistry();
    }
    return MockRegistry.instance;
  }

  /**
   * Register a mock factory for a service
   */
  registerFactory(serviceName: string, factory: () => any): void {
    this.mockFactories.set(serviceName, factory);
  }

  /**
   * Get a mock instance for a service
   */
  getMock(serviceName: string): any {
    if (!this.mocks.has(serviceName)) {
      const factory = this.mockFactories.get(serviceName);
      if (factory) {
        this.mocks.set(serviceName, factory());
      }
    }
    return this.mocks.get(serviceName);
  }

  /**
   * Reset all mocks to their default state
   */
  resetAllMocks(): void {
    this.mocks.forEach((mock) => {
      if (typeof mock === 'object' && mock !== null) {
        Object.values(mock).forEach((fn) => {
          if (typeof fn === 'function' && 'mockClear' in fn) {
            fn.mockClear();
          }
        });
      }
    });
  }

  /**
   * Clear all registered mocks
   */
  clearAllMocks(): void {
    this.mocks.clear();
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.mockFactories.keys());
  }
}

// ============================================================================
// PREDEFINED MOCK CONFIGURATIONS
// ============================================================================

/**
 * Initialize the registry with all standard mocks
 */
export const initializeMockRegistry = () => {
  const registry = MockRegistry.getInstance();

  // Register all standard mock factories
  registry.registerFactory('@mdi/react', createIconMock);
  registry.registerFactory(
    'SimplifiedKnowledgeHubProvider',
    createSimplifiedKnowledgeHubProviderMock
  );
  registry.registerFactory('loginService', createLoginServiceMock);
  registry.registerFactory('apiService', createApiServiceMock);
  registry.registerFactory('router', createRouterMock);
  registry.registerFactory('userContext', createUserContextMock);
  registry.registerFactory('loginStore', createLoginStoreMock);

  return registry;
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get a mock for a specific service (convenience function)
 */
export const getMock = (serviceName: string) => {
  const registry = MockRegistry.getInstance();
  return registry.getMock(serviceName);
};

/**
 * Reset all mocks (convenience function)
 */
export const resetAllMocks = () => {
  const registry = MockRegistry.getInstance();
  registry.resetAllMocks();
};

/**
 * Setup all mocks for a test (convenience function)
 */
export const setupMocks = () => {
  const registry = initializeMockRegistry();
  return registry;
};
