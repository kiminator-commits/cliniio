import { vi } from 'vitest';

// Test configuration constants
export const TEST_CONFIG = {
  TIMEOUTS: {
    DEFAULT: 5000,
    LONG: 10000,
    SHORT: 2000,
  },
  MOCK_DELAYS: {
    FAST: 50,
    NORMAL: 100,
    SLOW: 500,
  },
  TEST_DATA: {
    USER_ID: 'test-user-id',
    FACILITY_ID: 'test-facility-id',
    SESSION_TOKEN: 'test-session-token',
  },
};

// Global test setup
export const setupGlobalTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.VITE_API_BASE_URL = 'http://test-api.example.com';
  process.env.VITE_APP_ENV = 'test';

  // Mock global objects that might not exist in test environment
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as vi.MockedClass<typeof ResizeObserver>;

  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as vi.MockedClass<typeof IntersectionObserver>;

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock fetch
  global.fetch = vi.fn() as vi.MockedFunction<typeof fetch>;

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock crypto.randomUUID
  Object.defineProperty(global, 'crypto', {
    value: {
      ...global.crypto,
      randomUUID: vi.fn(() => 'mock-uuid'),
    },
    writable: true,
  });

  // Mock console methods to reduce test noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
};

// Global test teardown
export const teardownGlobalTestEnvironment = () => {
  // Restore console methods
  vi.restoreAllMocks();

  // Clear all mocks
  vi.clearAllMocks();

  // Clear timers
  if (vi.isMockFunction(setTimeout)) {
    vi.clearAllTimers();
  }

  // Reset fetch mock
  if (global.fetch) {
    (global.fetch as vi.Mock).mockClear();
  }
};

// Test data factories
export const createTestData = {
  user: (overrides = {}) => ({
    id: TEST_CONFIG.TEST_DATA.USER_ID,
    email: 'test@example.com',
    name: 'Test User',
    role: 'User',
    title: 'Mr./Ms.',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  session: (overrides = {}) => ({
    access_token: TEST_CONFIG.TEST_DATA.SESSION_TOKEN,
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: createTestData.user(),
    ...overrides,
  }),

  facility: (overrides = {}) => ({
    id: TEST_CONFIG.TEST_DATA.FACILITY_ID,
    name: 'Test Facility',
    type: 'hospital',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
    country: 'Test Country',
    phone: '+1-555-123-4567',
    email: 'facility@test.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  task: (overrides = {}) => ({
    id: 'test-task-id',
    title: 'Test Task',
    description: 'Test task description',
    category: 'general',
    points: 10,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  homeTask: (overrides = {}) => ({
    id: 'test-home-task-id',
    title: 'Test Home Task',
    description: 'Test home task description',
    category: 'general',
    points: 15,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),
};

// Mock function factories
export const createMockFunctions = {
  sync: <T>(returnValue?: T) => vi.fn().mockReturnValue(returnValue),

  async: <T>(returnValue?: T, delay = TEST_CONFIG.MOCK_DELAYS.NORMAL) =>
    vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<T>((resolve) =>
            setTimeout(() => resolve(returnValue as T), delay)
          )
      ),

  error: (errorMessage = 'Mock error') =>
    vi
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error(errorMessage))
      ) as vi.MockedFunction<() => Promise<never>>,

  networkError: () =>
    vi
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      ) as vi.MockedFunction<() => Promise<never>>,
};

// Test assertion helpers
export const testAssertions = {
  expectElementToBeVisible: (element: HTMLElement) => {
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
  },

  expectElementToBeHidden: (element: HTMLElement) => {
    expect(element).toBeInTheDocument();
    expect(element).not.toBeVisible();
  },

  expectElementToHaveText: (element: HTMLElement, text: string) => {
    expect(element).toHaveTextContent(text);
  },

  expectElementToHaveAttribute: (
    element: HTMLElement,
    attribute: string,
    value: string
  ) => {
    expect(element).toHaveAttribute(attribute, value);
  },

  expectElementToHaveClass: (element: HTMLElement, className: string) => {
    expect(element).toHaveClass(className);
  },

  expectElementToBeDisabled: (element: HTMLElement) => {
    expect(element).toBeDisabled();
  },

  expectElementToBeEnabled: (element: HTMLElement) => {
    expect(element).not.toBeDisabled();
  },
};

// Test cleanup utilities
export const testCleanup = {
  clearMocks: () => {
    vi.clearAllMocks();
  },

  clearStorage: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
  },

  clearTimers: () => {
    if (vi.isMockFunction(setTimeout)) {
      vi.clearAllTimers();
    }
  },

  resetAll: () => {
    testCleanup.clearMocks();
    testCleanup.clearStorage();
    testCleanup.clearTimers();
  },
};

// Export everything
export default {
  TEST_CONFIG,
  setupGlobalTestEnvironment,
  teardownGlobalTestEnvironment,
  createTestData,
  createMockFunctions,
  testAssertions,
  testCleanup,
};
