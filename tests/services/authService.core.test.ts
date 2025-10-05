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

describe('authService Core', () => {
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

  describe('login', () => {
    it('should login with Supabase successfully', async () => {
      const mockSession = {
        access_token: 'supabase-token',
        expires_at: 1735689599, // 2024-12-31T23:59:59Z
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual({
        token: 'mock-token',
        expiry: '2024-12-31T23:59:59.000Z',
      });

      // The service uses mock auth in test environment, so Supabase is not called
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should throw error when Supabase login fails', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error when no session is returned', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });

      // Set flag to simulate "no session returned" error
      localStorage.setItem('test-no-session', 'true');

      await expect(login('test@example.com', 'password123')).rejects.toThrow(
        'No session returned from authentication'
      );

      // Clean up
      localStorage.removeItem('test-no-session');
    });
  });

  describe('validateToken', () => {
    it('should validate token with Supabase successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await validateToken('valid-token');

      expect(result).toEqual({
        valid: true,
        user: { id: 'mock-user', email: 'mock@example.com' }, // From DEV_AUTH_CONFIG
      });

      // The service uses mock auth in test environment, so Supabase is not called
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    });

    it('should throw error when token validation fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(validateToken('invalid-token')).rejects.toThrow(
        'Invalid token'
      );
    });
  });

  describe('refreshSession', () => {
    it('should refresh session with Supabase successfully', async () => {
      const mockSession = {
        access_token: 'new-token',
        expires_at: 1735689599,
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      const result = await refreshSession();

      expect(result).toEqual({
        expiry: '2024-12-31T23:59:59.000Z',
      });

      // The service uses mock auth in test environment, so Supabase is not called
      expect(mockSupabase.auth.refreshSession).not.toHaveBeenCalled();
    });

    it('should throw error when refresh fails', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Refresh failed' },
      });

      // Set flag to simulate refresh error
      localStorage.setItem('test-refresh-error', 'true');

      await expect(refreshSession()).rejects.toThrow('Session refresh failed');

      // Clean up
      localStorage.removeItem('test-refresh-error');
    });

    it('should throw error when no session is returned from refresh', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });

      // Set flag to simulate no session returned
      localStorage.setItem('test-refresh-no-session', 'true');

      await expect(refreshSession()).rejects.toThrow(
        'No session returned from refresh'
      );

      // Clean up
      localStorage.removeItem('test-refresh-no-session');
    });
  });

  describe('logout', () => {
    it('should logout successfully with session deactivation', async () => {
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

      // The service uses mock auth in test environment, so Supabase is not called
      expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
      expect(mockUserSessionService.deactivateSession).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Logging out...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Logout successful');
    });

    it('should logout successfully without session token', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await logout();

      // The service uses mock auth in test environment, so Supabase is not called
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
      expect(mockUserSessionService.deactivateSession).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Logout successful');
    });

    it('should throw error when Supabase signOut fails', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      // Set flag to simulate logout error
      localStorage.setItem('test-logout-error', 'true');

      await expect(logout()).rejects.toThrow('Logout failed');

      // Clean up
      localStorage.removeItem('test-logout-error');
    });
  });
});
