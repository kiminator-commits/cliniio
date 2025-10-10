import React, { ReactElement } from 'react';
import { vi } from 'vitest';
import { render, RenderOptions, act, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIProvider } from '@/contexts/UIContext';
import { UserProvider } from '@/contexts/UserContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { setupSupabaseMocks } from '@/__mocks__/supabaseMock';

// Custom render function that includes all necessary providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  supabaseScenario?: 'success' | 'failure' | 'networkError';
}

const AllTheProviders = ({
  children,
  route = '/',
  supabaseScenario = 'success',
}: {
  children: React.ReactNode;
  route?: string;
  supabaseScenario?: 'success' | 'failure' | 'networkError';
}) => {
  // Set up Supabase mocks for the test
  setupSupabaseMocks(supabaseScenario);

  return (
    <MemoryRouter initialEntries={[route]}>
      <UIProvider>
        <UserProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </UserProvider>
      </UIProvider>
    </MemoryRouter>
  );
};

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { route, supabaseScenario, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders route={route} supabaseScenario={supabaseScenario}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything from testing library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Explicitly export commonly used functions
export { act, screen, fireEvent, waitFor };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'User',
  title: 'Mr./Ms.',
  avatar_url: null,
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test task description',
  category: 'general',
  points: 10,
  isCompleted: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockHomeTask = (overrides = {}) => ({
  id: 'test-home-task-id',
  title: 'Test Home Task',
  description: 'Test home task description',
  category: 'general',
  points: 15,
  isCompleted: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Test constants
export const TEST_CONSTANTS = {
  ROUTES: {
    HOME: '/home',
    LOGIN: '/login',
    INVENTORY: '/inventory',
    STERILIZATION: '/sterilization',
    KNOWLEDGE_HUB: '/knowledge-hub',
    SETTINGS: '/settings',
  },
  USER_IDS: {
    DEFAULT: '550e8400-e29b-41d4-a716-446655440001',
    ADMIN: 'admin-user-id',
    REGULAR: 'regular-user-id',
  },
  FACILITY_IDS: {
    DEFAULT: 'default-facility-id',
    TEST: 'test-facility-id',
  },
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    TASKS: '/api/tasks',
    USERS: '/api/users',
  },
};

// Mock function factories
export const createMockFunction = (returnValue?: unknown) =>
  vi.fn().mockReturnValue(returnValue);

export const createMockAsyncFunction = (
  returnValue?: unknown,
  delay: number = 0
) =>
  vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(returnValue), delay);
      })
  );

// Test cleanup utilities
export const cleanupTestData = () => {
  // Clear all mocks
  vi.clearAllMocks();

  // Clear localStorage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }

  // Clear any test timers
  if (vi.isMockFunction(setTimeout)) {
    vi.clearAllTimers();
  }
};

// Test assertion helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToBeHidden = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).not.toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveAttribute = (
  element: HTMLElement,
  attribute: string,
  value: string
) => {
  expect(element).toHaveAttribute(attribute, value);
};

// Test setup and teardown helpers
export const setupTestEnvironment = () => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

  // Mock console methods to reduce test noise
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
};

export const teardownTestEnvironment = () => {
  // Restore console methods
  vi.restoreAllMocks();

  // Clean up test data
  cleanupTestData();
};

// Export default render for convenience
export default customRender;
