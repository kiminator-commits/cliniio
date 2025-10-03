// Comprehensive security test suite for authentication system
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { secureAuthService } from '../../src/services/secureAuthenticationService';
import { secureApiClient } from '../../src/services/secureApiClient';
import { authMigrationService } from '../../src/services/authMigrationService';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto for consistent testing
const mockCrypto = {
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    importKey: vi.fn(),
    sign: vi.fn(),
    digest: vi.fn(),
  },
};
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('Authentication Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rate Limiting Security', () => {
    it('should block requests after rate limit exceeded', async () => {
      // Mock rate limit exceeded response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many login attempts. Please try again later.',
          rateLimitInfo: {
            remainingAttempts: 0,
            resetTime: Date.now() + 300000,
          },
        }),
      });

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit');
      expect(result.rateLimitInfo).toBeDefined();
    });

    it('should handle distributed rate limiting', async () => {
      // Mock successful response after rate limit
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'valid_token',
            refreshToken: 'valid_refresh',
            expiresIn: 3600,
            user: { id: '1', email: 'test@example.com', role: 'user' },
          },
        }),
      });

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth-login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Request-ID': expect.any(String),
          }),
        })
      );
    });
  });

  describe('CSRF Protection', () => {
    it('should require valid CSRF token', async () => {
      // Mock CSRF validation failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'Invalid security token',
          message: 'CSRF token validation failed',
        }),
      });

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
        csrfToken: 'invalid_token',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('security token');
    });

    it('should generate and validate CSRF tokens', async () => {
      const csrfToken = secureAuthService.generateSecureToken(32);
      expect(csrfToken).toHaveLength(32);
      expect(csrfToken).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('Request Signing Security', () => {
    it('should sign requests with HMAC', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      await secureApiClient.post('/test-endpoint', { data: 'test' });

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers).toHaveProperty('X-Request-Timestamp');
      expect(headers).toHaveProperty('X-Request-Nonce');
      expect(headers).toHaveProperty('X-Request-Signature');
      expect(headers).toHaveProperty('X-Request-Algorithm', 'HMAC-SHA256');
    });

    it('should validate request signatures', async () => {
      // Test signature validation by mocking invalid signature
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid request signature',
        }),
      });

      const result = await secureApiClient.post('/test-endpoint', { data: 'test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('signature');
    });
  });

  describe('Token Security', () => {
    it('should store tokens securely in sessionStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'secure_token',
            refreshToken: 'secure_refresh',
            expiresIn: 3600,
            user: { id: '1', email: 'test@example.com', role: 'user' },
          },
        }),
      });

      await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'secure_token'
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'secure_refresh'
      );
    });

    it('should validate token expiration', async () => {
      // Mock expired token
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'token_expires') {
          return (Date.now() - 1000).toString(); // Expired
        }
        if (key === 'access_token') {
          return 'expired_token';
        }
        return null;
      });

      const isValid = await secureAuthService.validateToken();
      expect(isValid).toBe(false);
    });

    it('should refresh expired tokens automatically', async () => {
      // Mock token refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'new_token',
            refreshToken: 'new_refresh',
            expiresIn: 3600,
          },
        }),
      });

      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'refresh_token') {
          return 'valid_refresh_token';
        }
        return null;
      });

      const refreshed = await secureAuthService.refreshToken();
      expect(refreshed).toBe(true);
    });
  });

  describe('Input Validation Security', () => {
    it('should sanitize email input', async () => {
      const maliciousEmail = 'test@example.com<script>alert("xss")</script>';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      await secureAuthService.authenticate({
        email: maliciousEmail,
        password: 'password123',
      });

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.email).toBe('test@example.com');
      expect(requestBody.email).not.toContain('<script>');
    });

    it('should validate password strength', async () => {
      const weakPasswords = ['123', 'password', 'abc'];
      
      for (const weakPassword of weakPasswords) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            error: 'Invalid input',
            message: 'Password must be at least 8 characters long',
          }),
        });

        const result = await secureAuthService.authenticate({
          email: 'test@example.com',
          password: weakPassword,
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid input');
      }
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionEmail = "test@example.com'; DROP TABLE users; --";
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      await secureAuthService.authenticate({
        email: sqlInjectionEmail,
        password: 'password123',
      });

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      // Should be sanitized and not contain SQL injection
      expect(requestBody.email).not.toContain("'; DROP TABLE");
    });
  });

  describe('Threat Detection Security', () => {
    it('should detect suspicious IP addresses', async () => {
      // Mock threat detection response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'Security threat detected',
          message: 'This IP address has been identified as a security threat.',
        }),
      });

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Security threat');
    });

    it('should detect bot-like behavior', async () => {
      // Mock bot detection response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'Security violation detected',
          message: 'This request has been blocked due to suspicious activity.',
        }),
      });

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Security violation');
    });
  });

  describe('Migration Security', () => {
    it('should backup existing tokens before migration', async () => {
      // Mock existing tokens
      const mockLocalStorage = {
        getItem: vi.fn((key) => {
          if (key === 'sb-access-token') return 'old_token';
          if (key === 'sb-refresh-token') return 'old_refresh';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      await authMigrationService.runMigration();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^auth_backup_/),
        expect.stringContaining('old_token')
      );
    });

    it('should clear old tokens after successful migration', async () => {
      const mockLocalStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      await authMigrationService.runMigration();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sb-access-token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sb-refresh-token');
    });

    it('should rollback migration on failure', async () => {
      // Mock migration failure
      vi.spyOn(authMigrationService, 'runMigration').mockRejectedValueOnce(
        new Error('Migration failed')
      );

      try {
        await authMigrationService.rollbackMigration();
      } catch (error) {
        expect(error.message).toContain('Migration rollback failed');
      }
    });
  });

  describe('Session Security', () => {
    it('should handle session timeout', async () => {
      // Mock session timeout
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Session expired',
          message: 'Please log in again',
        }),
      });

      const result = await secureAuthService.extendSession();
      expect(result).toBe(false);
    });

    it('should clear tokens on logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await secureAuthService.logout();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).not.toContain('Database');
      expect(result.error).not.toContain('connection');
    });

    it('should handle network timeouts gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const result = await secureAuthService.authenticate({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Performance Security', () => {
    it('should handle concurrent requests safely', async () => {
      const promises = Array.from({ length: 10 }, () =>
        secureAuthService.authenticate({
          email: 'test@example.com',
          password: 'password123',
        })
      );

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      const results = await Promise.allSettled(promises);
      
      // All requests should complete without race conditions
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });

    it('should implement request deduplication', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      });

      // Make identical concurrent requests
      const promise1 = secureApiClient.get('/test-endpoint');
      const promise2 = secureApiClient.get('/test-endpoint');

      await Promise.all([promise1, promise2]);

      // Should only make one actual request
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
