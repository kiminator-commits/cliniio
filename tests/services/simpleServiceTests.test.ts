// Simple tests for key services to improve coverage
import { ErrorReportingService } from '@/services/errorReportingService';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import {
  login,
  validateToken,
  refreshSession,
  logout,
} from '@/services/authService';
import { FacilityService } from '@/services/facilityService';
import {
  getSupabaseErrorMessage,
  checkRateLimit,
  attemptLogin,
} from '@/services/loginService';
import { supabase } from '@/lib/supabaseClient';
import { rateLimitService } from '@/services/rateLimitService';
import { UserSessionService } from '@/services/userSessionService';
import { distributedFacilityCache } from '@/services/cache/DistributedFacilityCache';

// Mock all dependencies
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
    })),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('@/lib/getEnv', () => ({
  getEnvVar: vi.fn().mockImplementation((key) => {
    if (key === 'NODE_ENV') return 'test';
    return 'mock-value';
  }),
  isDevelopment: vi.fn(() => false),
}));

vi.mock('@/services/cache/DistributedFacilityCache', () => ({
  distributedFacilityCache: {
    getFacility: vi.fn(),
    setFacility: vi.fn(),
    clearAll: vi.fn(),
    invalidateFacility: vi.fn(),
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
    deactivateSession: vi.fn(),
    getDeviceInfo: vi.fn(),
    createSession: vi.fn(),
  },
}));

vi.mock('@/config/devAuthConfig', () => ({
  createDevSession: vi.fn(() => ({
    token: 'mock-token',
    expiry: '2024-12-31T23:59:59.000Z',
  })),
  DEV_AUTH_CONFIG: {
    mockUser: { id: 'mock-user', email: 'mock@example.com' },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('Service Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset ErrorReportingService singleton state
    ErrorReportingService.reset();
  });

  describe('ErrorReportingService', () => {
    it('should initialize with default config', () => {
      ErrorReportingService.initialize();
      const status = ErrorReportingService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.config.provider).toBe('console');
    });

    it('should report errors', () => {
      ErrorReportingService.initialize();
      const error = new Error('Test error');
      ErrorReportingService.reportError(error);

      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(1);
    });

    it('should update configuration', () => {
      ErrorReportingService.initialize();
      ErrorReportingService.updateConfig({ maxQueueSize: 20 });

      const status = ErrorReportingService.getStatus();
      expect(status.config.maxQueueSize).toBe(20);
    });

    it('should clear queue', () => {
      ErrorReportingService.initialize();
      const error = new Error('Test error');
      ErrorReportingService.reportError(error);
      ErrorReportingService.clearQueue();

      const status = ErrorReportingService.getStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should shutdown service', () => {
      ErrorReportingService.initialize();
      ErrorReportingService.shutdown();

      const status = ErrorReportingService.getStatus();
      expect(status.isInitialized).toBe(false);
    });
  });

  describe('AuthService', () => {
    it('should handle login with Supabase', async () => {
      // Mock successful fetch response
      const mockFetch = vi.mocked(global.fetch);
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

      const result = await login('test@example.com', 'password');
      expect(result.token).toBe('mock-token');
    });

    it('should handle login errors', async () => {
      // Mock failed fetch response
      const mockFetch = vi.mocked(global.fetch);
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

    it('should validate tokens', async () => {
      // Mock successful fetch response
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({
          valid: true,
          user: { id: 'user-123' },
        }),
      });

      const result = await validateToken('valid-token');
      expect(result.valid).toBe(true);
    });

    it('should refresh sessions', async () => {
      // Mock successful fetch response
      const mockFetch = vi.mocked(global.fetch);
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

    it('should handle logout', async () => {
      // Mock successful fetch response
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue({}),
      });

      // In test mode, the logout function uses mock authentication, not Supabase
      // So we test that the mock logout completes successfully
      await expect(logout('mock-token')).resolves.not.toThrow();

      // Verify that the logout function completes without errors
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

  describe('FacilityService', () => {
    it('should get current facility ID from cache', async () => {
      // Mock successful user fetch
      const mockSupabase = await import('@/lib/supabase');
      const mockGetUser = vi.mocked(mockSupabase.supabase.auth.getUser);
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      distributedFacilityCache.getFacility.mockResolvedValue({
        id: 'facility-123',
        name: 'Test Facility',
      });

      const result = await FacilityService.getCurrentFacilityId();
      expect(result).toBe('facility-123');
    });

    it('should get facility by ID from cache', async () => {
      distributedFacilityCache.getFacility.mockResolvedValue({
        id: 'facility-123',
        name: 'Test Facility',
        type: 'hospital',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await FacilityService.getFacilityById('facility-123');
      expect(result.id).toBe('facility-123');
    });

    it('should get current user ID', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await FacilityService.getCurrentUserId();
      expect(result).toBe('user-123');
    });

    it('should validate facility ID', () => {
      expect(FacilityService.validateFacilityId('valid-id')).toBe(true);
      expect(FacilityService.validateFacilityId('')).toBe(false);
      expect(FacilityService.validateFacilityId('default-facility-id')).toBe(
        false
      );
    });

    it('should clear cache', async () => {
      distributedFacilityCache.clearAll.mockResolvedValue(undefined);

      await FacilityService.clearCache();
      expect(distributedFacilityCache.clearAll).toHaveBeenCalled();
    });
  });

  describe('LoginService', () => {
    it('should map error messages correctly', () => {
      expect(
        getSupabaseErrorMessage({ code: 'INVALID_LOGIN_CREDENTIALS' })
      ).toBe('Invalid email or password. Please try again.');
      expect(getSupabaseErrorMessage({ code: 'USER_NOT_FOUND' })).toBe(
        'User not found. Please check your email address.'
      );
      expect(getSupabaseErrorMessage({ code: 'TOO_MANY_REQUESTS' })).toBe(
        'Too many login attempts. Please try again later.'
      );
      expect(
        getSupabaseErrorMessage({ message: 'Invalid credentials provided' })
      ).toBe('Invalid email or password. Please try again.');
      expect(getSupabaseErrorMessage({ code: 'UNKNOWN_ERROR' })).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should check rate limits', async () => {
      const mockCheckRateLimit = vi.mocked(rateLimitService.checkRateLimit);
      mockCheckRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 2,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      const result = await checkRateLimit('test@example.com');
      expect(result.isAllowed).toBe(true);
    });

    it('should handle rate limit lockout', async () => {
      const mockCheckRateLimit = vi.mocked(rateLimitService.checkRateLimit);
      mockCheckRateLimit.mockResolvedValue({
        isLocked: true,
        attempts: 5,
        maxAttempts: 5,
        lockoutExpiry: new Date(Date.now() + 300000),
        error: 'Account temporarily locked',
      });

      const result = await checkRateLimit('test@example.com');
      expect(result.isAllowed).toBe(false);
    });

    it('should attempt login successfully', async () => {
      rateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_at: 1735689599,
            user: { id: 'user-123', email: 'test@example.com' },
          },
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
              error: null,
            }),
          }),
        }),
      });

      supabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      UserSessionService.getDeviceInfo.mockReturnValue({
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
      });

      UserSessionService.createSession.mockResolvedValue(undefined);

      const result = await attemptLogin({
        email: 'test@example.com',
        password: 'password123',
        stage: 'login',
        rememberMe: false,
        rememberDevice: false,
      });

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should handle login failures', async () => {
      rateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 0,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_LOGIN_CREDENTIALS',
        },
      });

      rateLimitService.recordAttempt.mockResolvedValue(undefined);
      rateLimitService.checkRateLimit.mockResolvedValue({
        isLocked: false,
        attempts: 1,
        maxAttempts: 5,
        lockoutExpiry: null,
      });

      const result = await attemptLogin({
        email: 'test@example.com',
        password: 'wrongpassword',
        stage: 'login',
        rememberMe: false,
        rememberDevice: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password. Please try again.');
    });
  });
});
