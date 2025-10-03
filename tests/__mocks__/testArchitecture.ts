import { vi } from 'vitest';
import React from 'react';

/**
 * Centralized Test Architecture
 *
 * This file provides a sustainable foundation for all tests by:
 * 1. Centralizing all mocks in one place
 * 2. Providing consistent mock implementations
 * 3. Preventing mock pollution between tests
 * 4. Making tests maintainable and predictable
 */

// ============================================================================
// CORE SERVICE MOCKS
// ============================================================================

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

export const createApiServiceMock = () => ({
  submitLoginForm: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 'test-user-id' },
  }),
});

// ============================================================================
// ROUTER MOCKS
// ============================================================================

export const createRouterMocks = () => ({
  navigate: vi.fn(),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test' }),
  useParams: () => ({}),
});

// ============================================================================
// CONTEXT MOCKS
// ============================================================================

export const createUserContextMock = () => ({
  user: { id: 'test-user', email: 'test@example.com' },
  refreshUserData: vi.fn().mockResolvedValue(undefined),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
});

// ============================================================================
// STORE MOCKS
// ============================================================================

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
// TEST UTILITIES
// ============================================================================

export class TestMockManager {
  private static instance: TestMockManager;
  private mocks: Map<string, any> = new Map();

  static getInstance(): TestMockManager {
    if (!TestMockManager.instance) {
      TestMockManager.instance = new TestMockManager();
    }
    return TestMockManager.instance;
  }

  /**
   * Register a mock for a specific service
   */
  registerMock(serviceName: string, mockImplementation: any): void {
    this.mocks.set(serviceName, mockImplementation);
  }

  /**
   * Get a mock for a specific service
   */
  getMock(serviceName: string): any {
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
}

// ============================================================================
// MOCK SETUP FUNCTIONS
// ============================================================================

/**
 * Setup all core mocks for a test
 */
export const setupCoreMocks = () => {
  const mockManager = TestMockManager.getInstance();

  // Register core mocks
  mockManager.registerMock('loginService', createLoginServiceMock());
  mockManager.registerMock('apiService', createApiServiceMock());
  mockManager.registerMock('router', createRouterMocks());
  mockManager.registerMock('userContext', createUserContextMock());
  mockManager.registerMock('loginStore', createLoginStoreMock());

  return mockManager;
};

/**
 * Clean up all mocks after a test
 */
export const cleanupCoreMocks = () => {
  const mockManager = TestMockManager.getInstance();
  mockManager.resetAllMocks();
};

// ============================================================================
// VITEST MOCK IMPLEMENTATIONS
// ============================================================================

// Centralized mock for @mdi/react
export const mdiReactMock = {
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
};

// Centralized mock for SimplifiedKnowledgeHubProvider
export const simplifiedKnowledgeHubProviderMock = {
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
};
