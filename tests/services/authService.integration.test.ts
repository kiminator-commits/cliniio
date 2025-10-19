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

vi.mock('@/services/userSessionService', () => ({
  UserSessionService: {
    deactivateSession: vi.fn(),
    getDeviceInfo: vi.fn(),
    createSession: vi.fn(),
  },
}));

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

describe('authService Integration', () => {
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

  describe('API Integration', () => {
    it('should integrate with API for login', async () => {
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

      expect(result.token).toBe('mock-token');
    });

    it('should integrate with API for token validation', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          valid: true,
          user: { id: 'mock-user', email: 'mock@example.com' },
        }),
      });

      const result = await validateToken('valid-token');

      expect(result.user).toEqual({
        id: 'mock-user',
        email: 'mock@example.com',
      });
    });

    it('should integrate with API for session refresh', async () => {
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

      expect(result.expiry).toBe('2024-12-31T23:59:59.000Z');
    });

    it('should integrate with API for logout', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({}),
      });

      await logout('mock-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/logout'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });


});
