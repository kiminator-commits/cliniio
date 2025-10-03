import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Basic helper to render with providers (expand later if needed)
export const renderWithProviders = (ui: React.ReactElement) => render(ui);

// Reset mocks between tests
export const resetMocks = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

// Test environment setup functions
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
  resetMocks();
};
