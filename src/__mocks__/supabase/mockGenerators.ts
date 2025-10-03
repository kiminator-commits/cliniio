// Mock Data Generators
import {
  User,
  Session,
  AuthResponse,
  PostgrestError,
} from '@supabase/supabase-js';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'mock-user-id',
  email: 'mock@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  ...overrides,
});

export const createMockSession = (user?: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: user || createMockUser(),
});

export const createMockError = (message = 'Mock error'): PostgrestError => ({
  code: 'MOCK_ERROR',
  message,
  details: 'This is a mock error for testing purposes',
  hint: 'Check your mock configuration',
  name: 'PostgrestError',
});

export const createMockAuthError = (message = 'Mock auth error') =>
  ({
    message,
    status: 400,
    code: 'AUTH_ERROR',
    name: 'AuthError',
  }) as AuthError;
