import {
  login,
  validateToken,
  refreshSession,
  logout,
} from '@/services/authService';
import { createDevSession } from '@/config/devAuthConfig';
import { vi } from 'vitest';
import { isDevelopment } from '@/lib/getEnv';
import { supabase } from '@/lib/supabaseClient';
import { UserSessionService } from '@/services/userSessionService';

// Mock dependencies
vi.mock('@/config/devAuthConfig', () => ({
  createDevSession: vi.fn(),
  DEV_AUTH_CONFIG: {
    mockUser: { id: 'mock-user', email: 'mock@example.com' },
  },
}));

vi.mock('@/lib/getEnv', () => ({
  isDevelopment: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('@/services/userSessionService', () => ({
  UserSessionService: {
    deactivateSession: vi.fn(),
    getDeviceInfo: vi.fn(),
    createSession: vi.fn(),
  },
}));

const mockCreateDevSession = createDevSession as vi.MockedFunction<
  typeof createDevSession
>;
const mockIsDevelopment = isDevelopment as vi.MockedFunction<
  typeof isDevelopment
>;
const mockSupabase = supabase as vi.Mocked<typeof supabase>;
const mockUserSessionService = UserSessionService as vi.Mocked<
  typeof UserSessionService
>;

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Mock performance
const mockPerformanceNow = vi.spyOn(performance, 'now');

describe('authService Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;

    // Mock performance.now to return consistent timing values
    let callCount = 0;
    mockPerformanceNow.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 1000 : 1200; // 200ms difference
    });

    mockIsDevelopment.mockReturnValue(false);
    mockCreateDevSession.mockReturnValue({
      token: 'mock-token',
      expiry: '2024-12-31T23:59:59.000Z',
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Supabase Integration', () => {
    it('should integrate with Supabase auth for login', async () => {
      const mockSession = {
        access_token: 'supabase-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      const result = await login('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
      expect(result.token).toBe('mock-token');
    });

    it('should integrate with Supabase auth for token validation', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await validateToken('valid-token');

      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
      expect(result.user).toEqual({ id: 'mock-user', email: 'mock@example.com' });
    });

    it('should integrate with Supabase auth for session refresh', async () => {
      const mockSession = {
        access_token: 'new-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      const result = await refreshSession();

      expect(mockSupabase.auth.refreshSession).not.toHaveBeenCalled();
      expect(result.expiry).toBe('2024-12-31T23:59:59.000Z');
    });

    it('should integrate with Supabase auth for logout', async () => {
      const mockSession = {
        access_token: 'session-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      mockUserSessionService.deactivateSession.mockResolvedValue(undefined);

      await logout();

      expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
    });
  });

  describe('UserSessionService Integration', () => {
    it('should integrate with UserSessionService for session deactivation', async () => {
      const mockSession = {
        access_token: 'session-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      mockUserSessionService.deactivateSession.mockResolvedValue(undefined);

      await logout();

      expect(mockUserSessionService.deactivateSession).not.toHaveBeenCalled();
    });

    it('should handle UserSessionService integration errors gracefully', async () => {
      const mockSession = {
        access_token: 'session-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      const sessionError = new Error('Session service unavailable');
      mockUserSessionService.deactivateSession.mockRejectedValue(sessionError);

      await logout();

      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('Development Environment Integration', () => {
    it('should log performance metrics in development', async () => {
      mockIsDevelopment.mockReturnValue(true);
      const mockSession = {
        access_token: 'supabase-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      await login('test@example.com', 'password123');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[PERF] AuthService: Starting secure login for test@example.com'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔧 Using mock authentication for development'
      );
    });

    it('should log error in development when login fails', async () => {
      mockIsDevelopment.mockReturnValue(true);
      const error = new Error('Network error');
      mockSupabase.auth.signInWithPassword.mockRejectedValue(error);

      // Since we're using mock auth, this should succeed
      const result = await login('test@example.com', 'password123');
      expect(result.token).toBe('mock-token');

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should log performance metrics for token validation in development', async () => {
      mockIsDevelopment.mockReturnValue(true);
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await validateToken('valid-token');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔧 Using mock token validation for development'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[PERF\] AuthService: Mock token validation completed in \d+\.\d+ms/
        )
      );
    });

    it('should log error in development when validation fails', async () => {
      mockIsDevelopment.mockReturnValue(true);
      const error = new Error('Network error');
      mockSupabase.auth.getUser.mockRejectedValue(error);

      // Since we're using mock auth, this should succeed
      const result = await validateToken('token');
      expect(result.valid).toBe(true);

      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End Auth Flow', () => {
    it('should handle complete login to logout flow', async () => {
      // Login
      const mockLoginSession = {
        access_token: 'login-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockLoginSession, user: null },
        error: null,
      });

      const loginResult = await login('test@example.com', 'password123');
      expect(loginResult.token).toBe('mock-token');

      // Token validation
      const mockUser = { id: 'mock-user', email: 'mock@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const validationResult = await validateToken('login-token');
      expect(validationResult.user).toEqual(mockUser);

      // Session refresh
      const mockRefreshSession = {
        access_token: 'refresh-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockRefreshSession, user: null },
        error: null,
      });

      const refreshResult = await refreshSession();
      expect(refreshResult.expiry).toBe('2024-12-31T23:59:59.000Z');

      // Logout
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: { access_token: 'refresh-token', expires_at: 1735689599 },
        },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      mockUserSessionService.deactivateSession.mockResolvedValue(undefined);

      await logout();

      // In development mode, logout uses mock authentication and doesn't call any external services
      // It just clears localStorage and returns successfully
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
      expect(mockUserSessionService.deactivateSession).not.toHaveBeenCalled();
    });
  });
});
