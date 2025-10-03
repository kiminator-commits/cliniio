import { vi } from 'vitest';
import React from 'react';

/**
 * Mock Templates and Standards
 *
 * Provides templates for common mock patterns to ensure consistency
 * across all test files.
 */

// ============================================================================
// MOCK TEMPLATES
// ============================================================================

/**
 * Template for React component mocks
 */
export const createComponentMock = (
  displayName: string,
  testId: string = 'mock-component'
) => ({
  [displayName]: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': testId, ...props }, children),
});

/**
 * Template for hook mocks
 */
export const createHookMock = (hookName: string, returnValue: any) => ({
  [hookName]: vi.fn().mockReturnValue(returnValue),
});

/**
 * Template for service mocks
 */
export const createServiceMock = (
  serviceName: string,
  methods: Record<string, any>
) => ({
  [serviceName]: methods,
});

/**
 * Template for API response mocks
 */
export const createApiResponseMock = (
  success: boolean,
  data?: any,
  error?: string
) => ({
  success,
  ...(data && { data }),
  ...(error && { error }),
});

/**
 * Template for error mocks
 */
export const createErrorMock = (message: string, code?: string) => ({
  message,
  ...(code && { code }),
  stack: `Error: ${message}\n    at mock (test:1:1)`,
});

// ============================================================================
// COMMON MOCK PATTERNS
// ============================================================================

/**
 * Standard React Router mock pattern
 */
export const createRouterMockPattern = () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/test', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  MemoryRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'memory-router' }, children),
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'browser-router' }, children),
});

/**
 * Standard Supabase mock pattern
 */
export const createSupabaseMockPattern = () => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    csv: vi.fn(),
    geojson: vi.fn(),
    explain: vi.fn(),
    rollback: vi.fn(),
    returns: vi.fn().mockReturnThis(),
    then: vi.fn(),
  })),
});

/**
 * Standard context provider mock pattern
 */
export const createContextProviderMockPattern = (
  contextName: string,
  defaultValue: any
) => ({
  [`${contextName}Provider`]: ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      'div',
      { 'data-testid': `mock-${contextName.toLowerCase()}-provider` },
      children
    ),
  [`use${contextName}`]: vi.fn().mockReturnValue(defaultValue),
});

// ============================================================================
// MOCK STANDARDS
// ============================================================================

/**
 * Mock naming conventions
 */
export const MOCK_NAMING_CONVENTIONS = {
  // Component mocks should end with "Mock"
  component: (name: string) => `${name}Mock`,

  // Hook mocks should start with "mock"
  hook: (name: string) => `mock${name.charAt(0).toUpperCase() + name.slice(1)}`,

  // Service mocks should end with "ServiceMock"
  service: (name: string) => `${name}ServiceMock`,

  // Test IDs should be kebab-case
  testId: (name: string) =>
    name
      .toLowerCase()
      .replace(/([A-Z])/g, '-$1')
      .replace(/^-/, ''),
};

/**
 * Mock data standards
 */
export const MOCK_DATA_STANDARDS = {
  // User data should always include id and email
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },

  // Session data should include access_token and expires_at
  session: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Date.now() + 3600000, // 1 hour from now
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  },

  // Error messages should be descriptive
  error: {
    message: 'Test error message',
    code: 'TEST_ERROR',
  },
};

/**
 * Mock behavior standards
 */
export const MOCK_BEHAVIOR_STANDARDS = {
  // All mocks should be reset between tests
  resetBetweenTests: true,

  // All async mocks should resolve by default
  defaultAsyncBehavior: 'resolve',

  // All mocks should include proper TypeScript types
  includeTypes: true,

  // All mocks should be consistent across test files
  consistencyRequired: true,
};

// ============================================================================
// MOCK VALIDATION
// ============================================================================

/**
 * Validate that a mock follows the standards
 */
export const validateMock = (
  mock: any,
  type: 'component' | 'hook' | 'service'
): boolean => {
  if (type === 'component') {
    return (
      typeof mock === 'function' || (typeof mock === 'object' && mock !== null)
    );
  }

  if (type === 'hook') {
    return typeof mock === 'function' && 'mockReturnValue' in mock;
  }

  if (type === 'service') {
    return typeof mock === 'object' && mock !== null;
  }

  return false;
};

/**
 * Get mock validation errors
 */
export const getMockValidationErrors = (
  mock: any,
  type: 'component' | 'hook' | 'service'
): string[] => {
  const errors: string[] = [];

  if (type === 'component') {
    if (
      typeof mock !== 'function' &&
      (typeof mock !== 'object' || mock === null)
    ) {
      errors.push('Component mock must be a function or object');
    }
  }

  if (type === 'hook') {
    if (typeof mock !== 'function') {
      errors.push('Hook mock must be a function');
    }
    if (!('mockReturnValue' in mock)) {
      errors.push('Hook mock must have mockReturnValue method');
    }
  }

  if (type === 'service') {
    if (typeof mock !== 'object' || mock === null) {
      errors.push('Service mock must be an object');
    }
  }

  return errors;
};
