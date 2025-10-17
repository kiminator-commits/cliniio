import {
  attemptLogin,
  logLoginAttempt,
  logLoginFailure,
  logLoginSuccess,
  LoginAttemptData,
} from '@/services/loginService';
import { supabase } from '@/lib/supabaseClient';
import { vi, describe, test, expect, beforeEach, afterEach, it, type Mock } from 'vitest';
import { rateLimitService } from '@/services/rateLimitService';
import { sessionManager } from '@/lib/sessionManager';
import { UserSessionService } from '@/services/userSessionService';
import { LOGIN_ERRORS } from '@/constants/loginConstants';
import { LoginAnalyticsData } from '@/hooks/useLoginAnalytics';

// Mock dependencies
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/services/rateLimitService', () => ({
  rateLimitService: {
    checkRateLimit: vi.fn(),
    recordAttempt: vi.fn(),
    resetRateLimit: vi.fn(),
  },
}));

vi.mock('@/lib/sessionManager', () => ({
  sessionManager: {
    setRememberMe: vi.fn(),
  },
}));

vi.mock('@/services/userSessionService', () => ({
  UserSessionService: {
    getDeviceInfo: vi.fn(),
    createSession: vi.fn(),
  },
}));

const mockSupabase = supabase as vi.Mocked<typeof supabase>;
const mockRateLimitService = rateLimitService as vi.Mocked<
  typeof rateLimitService
>;
const mockSessionManager = sessionManager as vi.Mocked<typeof sessionManager>;
const mockUserSessionService = UserSessionService as vi.Mocked<
  typeof UserSessionService
>;

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleInfo = vi.fn();
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
});

describe('loginService - Authentication Flow', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockSession = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_at: 1735689599,
    user: mockUser,
  };

  const mockCredentials: LoginAttemptData = {
    email: 'test@example.com',
    password: 'password123',
    stage: 'login',
    rememberMe: false,
    rememberDevice: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleInfo.mockClear();
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    console.info = mockConsoleInfo;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  });

  describe('attemptLogin - Successful Authentication', () => {
    it('should return success when login is successful', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
              error: null,
            }),
          }),
        }),
      } as any);

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any);

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin(mockCredentials);

      expect(result).toEqual({
        success: true,
        session: mockSession,
        user: mockUser,
      });

      expect(mockRateLimitService.recordAttempt).toHaveBeenCalledWith(
        'test@example.com',
        true
      );
      expect(mockRateLimitService.resetRateLimit).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should configure session manager based on rememberMe preference', async () => {
      const credentialsWithRememberMe = {
        ...mockCredentials,
        rememberMe: true,
      };

      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
              error: null,
            }),
          }),
        }),
      } as any);

      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any);

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      await attemptLogin(credentialsWithRememberMe);

      expect(mockSessionManager.setRememberMe).toHaveBeenCalledWith(true);
    });
  });

  describe('attemptLogin - Failure Scenarios', () => {
    it('should return error when rate limit check fails', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: true,
        attempts: 5,
        maxAttempts: 5,
        lockoutExpiry: new Date(Date.now() + 300000),
        error: 'Account temporarily locked',
      });

      const result = await attemptLogin(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Account temporarily locked',
        rateLimitInfo: {
          isLocked: true,
          attempts: 5,
          maxAttempts: 5,
          lockoutExpiry: expect.any(Date),
          error: 'Account temporarily locked',
        },
      });
    });

    it('should return error when Supabase authentication fails', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_LOGIN_CREDENTIALS',
        },
      });

      mockRateLimitService.recordAttempt.mockResolvedValue(undefined);
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 1,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      const result = await attemptLogin(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: LOGIN_ERRORS.invalidCredentials,
        rateLimitInfo: {
          isLocked: false,
          attempts: 1,
          maxAttempts: 5,
          lockoutExpiry: null,
        },
      });

      expect(mockRateLimitService.recordAttempt).toHaveBeenCalledWith(
        'test@example.com',
        false
      );
    });

    it('should return error when account gets locked after failed attempt', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' },
      });

      mockRateLimitService.recordAttempt.mockResolvedValue(undefined);
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: true,
        attempts: 5,
        maxAttempts: 5,
        lockoutExpiry: new Date(Date.now() + 300000),
        error: 'Account temporarily locked',
      });

      const result = await attemptLogin(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Account temporarily locked',
        rateLimitInfo: {
          isLocked: true,
          attempts: 5,
          maxAttempts: 5,
          lockoutExpiry: expect.any(Date),
          error: 'Account temporarily locked',
        },
      });
    });

    it('should return error when no session is returned', async () => {
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: mockUser },
        error: null,
      });

      const result = await attemptLogin(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: LOGIN_ERRORS.unexpectedError,
      });
    });
  });

  describe('Login Logging Functions', () => {
    it('should log login attempt with correct data', () => {
      const data: LoginAnalyticsData = {
        email: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        stage: 'login',
      };

      logLoginAttempt(data);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        'Login attempt initiated for email: test@example.com',
        {
          timestamp: '2024-01-01T00:00:00.000Z',
          email: 'test@example.com',
          ipAddress: 'client-side',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          stage: 'login',
        }
      );
    });

    it('should log login failure with correct data', () => {
      const data: LoginAnalyticsData = {
        email: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        stage: 'login',
        error: 'Invalid credentials',
      };

      logLoginFailure(data);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Login failed for email: test@example.com',
        {
          timestamp: '2024-01-01T00:00:00.000Z',
          email: 'test@example.com',
          error: 'Invalid credentials',
          ipAddress: 'client-side',
          userAgent: 'Mozilla/5.0 (Test Browser)',
        }
      );
    });

    it('should log successful login with correct data', () => {
      const data: LoginAnalyticsData = {
        email: 'test@example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        stage: 'login',
        userId: 'user-123',
      };

      logLoginSuccess(data);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        'Login successful for email: test@example.com',
        {
          timestamp: '2024-01-01T00:00:00.000Z',
          email: 'test@example.com',
          userId: 'user-123',
          ipAddress: 'client-side',
          userAgent: 'Mozilla/5.0 (Test Browser)',
        }
      );
    });
  });
});
