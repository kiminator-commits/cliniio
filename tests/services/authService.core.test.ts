import {
  login,
  validateToken,
  refreshSession,
  logout,
} from '@/services/authService';
import { createDevSession } from '@/config/devAuthConfig';
import { vi, describe, expect, beforeEach, afterEach, it, type Mock } from 'vitest';
import { isDevelopment } from '@/lib/getEnv';

// Mock dependencies
vi.mock('@/config/devAuthConfig', () => ({
  createDevSession: vi.fn(),
  DEV_AUTH_CONFIG: {
    mockUser: { id: 'mock-user', email: 'mock@example.com' },
  },
}));

vi.mock('@/lib/getEnv', () => ({
  getEnvVar: vi.fn().mockImplementation((key) => {
    if (key === 'NODE_ENV') return 'test';
    return 'mock-value';
  }),
  isDevelopment: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCreateDevSession = createDevSession as Mock<
  typeof createDevSession
>;
const mockIsDevelopment = isDevelopment as Mock<
  typeof isDevelopment
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
    mockFetch.mockClear();
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
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          token: 'mock-token',
          expiry: '2024-12-31T23:59:59.000Z',
        }),
      });

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual({
        token: 'mock-token',
        expiry: '2024-12-31T23:59:59.000Z',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        signal: expect.any(AbortSignal),
      });
    });

    it('should throw error when Supabase login fails', async () => {
      // Mock failed fetch response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          message: 'Invalid credentials',
        }),
      });

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error when no session is returned', async () => {
      // Mock successful fetch but with no session data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          message: 'No session returned from authentication',
        }),
      });

      await expect(login('test@example.com', 'password123')).rejects.toThrow(
        'No session returned from authentication'
      );
    });
  });

  describe('validateToken', () => {
    it('should validate token with Supabase successfully', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          valid: true,
          user: { id: 'user-123', email: 'test@example.com' },
        }),
      });

      const result = await validateToken('valid-token');

      expect(result).toEqual({
        valid: true,
        user: { id: 'user-123', email: 'test@example.com' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/validate', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      });
    });

    it('should throw error when token validation fails', async () => {
      // Mock failed fetch response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          error: 'Invalid token',
        }),
      });

      const result = await validateToken('invalid-token');

      expect(result).toEqual({
        valid: false,
        error: 'Invalid token',
      });
    });
  });

  describe('refreshSession', () => {
    it('should refresh session with Supabase successfully', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          token: 'new-token',
          expiry: '2024-12-31T23:59:59.000Z',
        }),
      });

      const result = await refreshSession('valid-token');

      expect(result).toEqual({
        token: 'new-token',
        expiry: '2024-12-31T23:59:59.000Z',
        refreshedAt: expect.any(String),
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/refresh', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      });
    });

    it('should throw error when refresh fails', async () => {
      // Mock failed fetch response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          error: 'Session refresh failed',
        }),
      });

      await expect(refreshSession('invalid-token')).rejects.toThrow(
        'Token refresh failed'
      );
    });

    it('should throw error when no session is returned from refresh', async () => {
      // Mock successful fetch but with no session data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          error: 'No session returned from refresh',
        }),
      });

      await expect(refreshSession('valid-token')).rejects.toThrow(
        'No session returned from refresh'
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully with session deactivation', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
        }),
      });

      await logout('session-token');

      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer session-token' },
      });
    });

    it('should logout successfully without session token', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          success: true,
        }),
      });

      await logout('');

      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' },
      });
    });

    it('should throw error when Supabase signOut fails', async () => {
      // Mock failed fetch response
      mockFetch.mockRejectedValueOnce(new Error('Logout failed'));

      await expect(logout('valid-token')).rejects.toThrow('Logout failed');
    });
  });
});
