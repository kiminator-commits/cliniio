import '@testing-library/jest-dom';

import { vi } from 'vitest';
import React from 'react';

vi.mock('@/hooks/useInventoryDataAccess', () => ({
  useInventoryDataAccess: () => ({
    fetchData: vi.fn(),
    saveData: vi.fn(),
    deleteData: vi.fn(),
  }),
}));

vi.mock('@/hooks/useInventoryDataManager', () => ({
  useInventoryDataManager: () => ({
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn(),
  }),
}));

import { beforeEach } from 'vitest';
// import { resetMocks } from './tests/utils/testUtils';

// Create mock functions that can be accessed from tests
let mockDeleteContent: ReturnType<typeof vi.fn>;
let mockUpdateContentStatus: ReturnType<typeof vi.fn>;
let mockRefetchContent: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Recreate mock functions for each test
  mockDeleteContent = vi.fn();
  mockUpdateContentStatus = vi.fn();
  mockRefetchContent = vi.fn();

  // Reset other mocks
  vi.resetModules();
});

vi.mock(
  '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider',
  () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-simplified-knowledge-hub-provider' },
        children
      ),
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
    useSimplifiedKnowledgeHub: vi.fn(() => ({
      deleteContent: mockDeleteContent,
      updateContentStatus: mockUpdateContentStatus,
      validationError: null,
      clearValidationError: vi.fn(),
      selectedCategory: '',
      selectedContent: [],
      isLoading: false,
      error: null,
      refetchContent: mockRefetchContent,
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    })),
  })
);

// Export the mock functions for use in tests
export { mockDeleteContent, mockUpdateContentStatus, mockRefetchContent };

// Mock supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  },
}));

// Mock logger
vi.mock('@/utils/_core/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    realtime: vi.fn(),
    perf: vi.fn(),
    security: vi.fn(),
    audit: vi.fn(),
    verbose: vi.fn(),
    getLevel: vi.fn(() => 'DEBUG'),
    isEnabled: vi.fn(() => true),
  },
}));

// Mock Icon component
vi.mock('@/components/Icon/Icon', () => ({
  default: ({ icon, ...props }: { icon: string; [key: string]: unknown }) =>
    React.createElement('div', { 'data-testid': 'icon', ...props }, icon),
}));

// Mock @mdi/react Icon component
vi.mock('@mdi/react', () => ({
  default: ({ path, ...props }: { path: string; [key: string]: unknown }) =>
    React.createElement('div', { 'data-testid': 'mdi-icon', ...props }, path),
}));

// Mock fetch for authentication service tests
global.fetch = vi.fn().mockImplementation((url, _options) => {
  // Handle relative URLs by converting them to absolute URLs
  const _absoluteUrl = url.startsWith('/') ? `http://localhost:3000${url}` : url;
  
  // Mock different responses based on URL
  if (url.includes('/auth-login')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          accessToken: 'supabase-token',
          expiresIn: 1735689599 - Math.floor(Date.now() / 1000), // Calculate seconds until 2024-12-31T23:59:59Z
        },
      }),
      text: () => Promise.resolve('OK'),
    });
  }
  
  if (url.includes('/auth-validate')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        success: true,
        data: {
          valid: true,
          user: { id: 'user-123', email: 'test@example.com' },
        },
      }),
      text: () => Promise.resolve('OK'),
    });
  }
  
  // Handle Supabase API requests
  if (url.includes('supabase.co') || url.includes('supabase')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [], error: null }),
      text: () => Promise.resolve('{"data":[],"error":null}'),
    });
  }
  
  // Default response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('OK'),
  });
});
