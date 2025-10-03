import { attemptLogin, LoginAttemptData } from '@/services/loginService';
import { supabase } from '@/lib/supabaseClient';
import { vi } from 'vitest';
import { rateLimitService } from '@/services/rateLimitService';
import { UserSessionService } from '@/services/userSessionService';

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
const mockUserSessionService = UserSessionService as vi.Mocked<
  typeof UserSessionService
>;

// Mock console methods
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('loginService - Supabase Integration and Session Handling', () => {
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
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('attemptLogin - Supabase Integration', () => {
    it('should handle user profile update errors gracefully', async () => {
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

      // Mock the select call for getting user profile
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-123' },
            error: null,
          }),
        }),
      });

      // Mock the upsert call for updating user profile - this should fail
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Profile update failed' },
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      });

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin(mockCredentials);

      expect(result.success).toBe(true);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to update user profile:',
        expect.any(Object)
      );
    });

    it('should handle session creation errors gracefully', async () => {
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

      // Mock the select call for getting user profile
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-123' },
            error: null,
          }),
        }),
      });

      // Mock the upsert call for updating user profile - this should succeed
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      });

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      // This should fail to trigger the session creation error
      mockUserSessionService.createSession.mockRejectedValue(
        new Error('Session creation failed')
      );

      const result = await attemptLogin(mockCredentials);

      expect(result.success).toBe(true);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to create user session:',
        expect.any(Error)
      );
    });

    it('should handle unexpected errors', async () => {
      // Mock rate limit service to throw error (should fail open)
      mockRateLimitService.checkRateLimit.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Mock successful authentication
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      // Mock the select call for getting user profile
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-123' },
            error: null,
          }),
        }),
      });

      // Mock the upsert call for updating user profile
      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      });

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin(mockCredentials);

      // Should succeed because checkRateLimit fails open
      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockSession);
      expect(result.user).toEqual(mockUser);

      // Should log the rate limit error
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Rate limit check failed:',
        expect.any(Error)
      );
    });
  });

  describe('External Service Interactions', () => {
    it('should integrate with facility scoping correctly', async () => {
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

      // Mock facility-specific data retrieval
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-456', role: 'admin' },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      });

      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'mobile',
        browser: 'safari',
        os: 'ios',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin(mockCredentials);

      expect(result.success).toBe(true);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should handle device information integration', async () => {
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

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-123' },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      });

      // Test different device configurations
      mockUserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'tablet',
        browser: 'firefox',
        os: 'android',
      });

      mockUserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin(mockCredentials);

      expect(result.success).toBe(true);
      expect(mockUserSessionService.getDeviceInfo).toHaveBeenCalled();
      expect(mockUserSessionService.createSession).toHaveBeenCalled();
    });
  });
});
