/**
 * @deprecated This service is deprecated in favor of authMigrationService
 * Use authMigrationService from '@/services/authMigrationService' instead
 *
 * Migration guide and utilities for transitioning from old to new authentication
 */
import { secureAuthService } from './secureAuthenticationService';
import { authMigrationService } from './authMigrationService';

/**
 * AUTHENTICATION MIGRATION GUIDE
 *
 * This file provides utilities and guidance for migrating from the old
 * client-side Supabase authentication to the new secure server-side system.
 */

// Legacy authentication service wrapper for backward compatibility
class LegacyAuthService {
  private isMigrated = false;

  constructor() {
    this.checkMigrationStatus();
  }

  private async checkMigrationStatus(): Promise<void> {
    try {
      this.isMigrated = authMigrationService.isMigrationComplete();
    } catch (error) {
      console.warn('Failed to check migration status:', error);
    }
  }

  // Legacy login method - redirects to new system
  async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    expiry: string;
  }> {
    if (!this.isMigrated) {
      throw new Error(
        'Authentication system migration required. Please refresh the page.'
      );
    }

    const result = await secureAuthService.authenticate({
      email,
      password,
    });

    if (result.success && result.data) {
      return {
        token: result.data.accessToken,
        expiry: new Date(
          Date.now() + result.data.expiresIn * 1000
        ).toISOString(),
      };
    } else {
      throw new Error(result.error || 'Login failed');
    }
  }

  // Legacy token validation - redirects to new system
  async validateToken(token: string): Promise<boolean> {
    if (!this.isMigrated) {
      return false;
    }

    const currentToken = secureAuthService.getAccessToken();
    return currentToken === token && (await secureAuthService.validateToken());
  }
}

// Export legacy service for backward compatibility
export const legacyAuthService = new LegacyAuthService();

// Migration utilities
export class AuthMigrationUtilities {
  /**
   * Check if the application needs migration
   */
  static async needsMigration(): Promise<boolean> {
    try {
      // Check for old Supabase tokens
      const hasOldTokens = [
        'sb-access-token',
        'sb-refresh-token',
        'auth_token',
      ].some((key) => localStorage.getItem(key) !== null);

      // Check if new system is initialized
      const isNewSystemReady = authMigrationService.isMigrationComplete();

      return hasOldTokens || !isNewSystemReady;
    } catch (error) {
      console.error('Failed to check migration status:', error);
      return true; // Assume migration needed on error
    }
  }

  /**
   * Run the authentication migration
   */
  static async runMigration(): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const status = await authMigrationService.runMigration();
      return {
        success: status.isComplete,
        errors: status.errors,
        warnings: status.warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  /**
   * Get migration status
   */
  static getMigrationStatus() {
    return authMigrationService.getMigrationStatus();
  }

  /**
   * Rollback migration if needed
   */
  static async rollbackMigration(): Promise<void> {
    await authMigrationService.rollbackMigration();
  }

  /**
   * Clean up old authentication data
   */
  static async cleanupOldAuth(): Promise<void> {
    try {
      // Clear all old authentication tokens
      const oldKeys = [
        'sb-access-token',
        'sb-refresh-token',
        'sb-expires-at',
        'sb-user',
        'auth_token',
        'auth_expiry',
        'user_data',
        'login_token',
        'session_token',
        'supabase.auth.token',
        'supabase.auth.refresh_token',
      ];

      oldKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear any global Supabase references
      if (typeof window !== 'undefined') {
        delete (window as Record<string, unknown>).supabase;
        delete (window as Record<string, unknown>).supabaseClient;
      }

      console.log('Old authentication data cleaned up');
    } catch (error) {
      console.error('Failed to cleanup old auth data:', error);
      throw error;
    }
  }

  /**
   * Validate new authentication system
   */
  static async validateNewSystem(): Promise<boolean> {
    try {
      const isAuthenticated = await secureAuthService.isAuthenticated();
      const user = await secureAuthService.getCurrentUser();

      return isAuthenticated && user !== null;
    } catch (error) {
      console.error('New system validation failed:', error);
      return false;
    }
  }
}

// Component migration helpers
export class ComponentMigrationHelpers {
  /**
   * Replace old useLoginService with new useSecureAuth
   */
  static getMigrationInstructions(): string {
    return `
MIGRATION INSTRUCTIONS:

1. Replace old authentication imports:
   OLD: import { useLoginService } from './hooks/useLoginService';
   NEW: import { useSecureAuth } from './hooks/useSecureAuth';

2. Update component authentication logic:
   OLD: const { login, isLoading, error } = useLoginService();
   NEW: const { login, isLoading, error, user, isAuthenticated } = useSecureAuth();

3. Update login function calls:
   OLD: await login(email, password);
   NEW: await login({ email, password, rememberMe: false });

4. Replace direct Supabase calls:
   OLD: const { data, error } = await supabase.auth.signInWithPassword({...});
   NEW: const result = await secureAuthService.authenticate({...});

5. Update token handling:
   OLD: localStorage.setItem('auth_token', token);
   NEW: Tokens are automatically managed by secureAuthService

6. Update user data access:
   OLD: const user = await supabase.auth.getUser();
   NEW: const user = await secureAuthService.getCurrentUser();

7. Update logout handling:
   OLD: await supabase.auth.signOut();
   NEW: await secureAuthService.logout();
    `;
  }

  /**
   * Generate migration checklist
   */
  static getMigrationChecklist(): string[] {
    return [
      'Replace all direct Supabase auth calls with secureAuthService',
      'Update all useLoginService hooks to useSecureAuth',
      'Remove client-side rate limiting (now server-side)',
      'Remove direct database operations from client',
      'Update error handling for new response format',
      'Test authentication flow with new system',
      'Verify token refresh functionality',
      'Test logout and session management',
      'Validate security features (rate limiting, CSRF protection)',
      'Update any custom authentication logic',
    ];
  }
}

// Service replacement mappings
export const SERVICE_REPLACEMENTS = {
  // Old service -> New service
  'supabase.auth.signInWithPassword': 'secureAuthService.authenticate',
  'supabase.auth.signOut': 'secureAuthService.logout',
  'supabase.auth.getUser': 'secureAuthService.getCurrentUser',
  'supabase.auth.refreshSession': 'secureAuthService.refreshToken',
  useLoginService: 'useSecureAuth',
  loginService: 'secureAuthService',
  authService: 'secureAuthService',
};

// Error code mappings for backward compatibility
export const ERROR_CODE_MAPPINGS = {
  invalid_credentials: 'Invalid email or password',
  rate_limit_exceeded: 'Too many login attempts. Please try again later.',
  csrf_token_invalid: 'Security token invalid. Please refresh the page.',
  threat_detected: 'Security threat detected. Access denied.',
  account_locked: 'Account temporarily locked due to security concerns.',
};

// Migration status constants
export const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLBACK_REQUIRED: 'rollback_required',
} as const;

export type MigrationStatus =
  (typeof MIGRATION_STATUS)[keyof typeof MIGRATION_STATUS];

// Export everything for easy migration
export {
  secureAuthService,
  authMigrationService,
  AuthMigrationUtilities as MigrationUtils,
  ComponentMigrationHelpers as ComponentHelpers,
};
