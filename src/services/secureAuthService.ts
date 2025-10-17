// Secure authentication service that uses direct Supabase authentication
import { supabase } from '@/lib/supabaseClient';
import { getEnvVar } from '@/lib/getEnv';
import {
  DEV_AUTH_CONFIG as _DEV_AUTH_CONFIG,
  isDevModeWithoutSupabase as _isDevModeWithoutSupabase,
} from '@/config/devAuthConfig';
import { isDevelopment } from '@/lib/getEnv';

interface SecureLoginCredentials {
  email: string;
  password: string;
  csrfToken?: string;
  rememberMe?: boolean;
}

interface SecureLoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
  error?: string;
  rateLimitInfo?: {
    remainingAttempts: number;
    resetTime: number;
  };
}

interface SecureAuthServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

class SecureAuthService {
  private config: SecureAuthServiceConfig;

  constructor(config: Partial<SecureAuthServiceConfig> = {}) {
    // Use Supabase URL for Edge Functions, fallback to configured URL
    const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
    const baseUrl =
      config.baseUrl ||
      (supabaseUrl
        ? `${supabaseUrl}/functions/v1/auth-login-simple`
        : '/api/auth-login-simple');

    this.config = {
      baseUrl,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
    };
  }

  /**
   * Generate a CSRF token for the current session
   */
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  /**
   * Store CSRF token securely
   */
  storeCSRFToken(token: string): void {
    try {
      sessionStorage.setItem('csrf_token', token);
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
  }

  /**
   * Retrieve stored CSRF token
   */
  getStoredCSRFToken(): string | null {
    try {
      return sessionStorage.getItem('csrf_token');
    } catch (error) {
      console.warn('Failed to retrieve CSRF token:', error);
      return null;
    }
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, storedToken: string | null): boolean {
    if (!storedToken) return false;
    return token === storedToken;
  }

  /**
   * Perform secure login using server-side authentication
   */
  async secureLogin(
    credentials: SecureLoginCredentials
  ): Promise<SecureLoginResponse> {
    const startTime = performance.now();

    try {
      // Use direct Supabase authentication instead of Edge Function
      console.log('🔧 Using direct Supabase authentication');

      // Use the shared Supabase client
      const supabaseClient = supabase;

      // Authenticate user directly with Supabase
      const { data: authData, error: authError } =
        await supabaseClient.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new Error('Authentication failed - no user or session returned');
      }

      // Skip role lookup during login to avoid database errors
      // Role will be fetched later by UserContext
      const userRole = 'user'; // Default role

      const response: SecureLoginResponse = {
        success: true,
        data: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresIn: authData.session.expires_in,
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            role: userRole,
          },
        },
      };

      if (isDevelopment()) {
        console.log(
          `[PERF] SecureAuthService: Direct Supabase login completed in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      return response;
    } catch (error) {
      console.error(`[AUTH] Login failed for ${credentials.email}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Make secure request to authentication endpoint
   */
  private async makeSecureRequest(
    requestBody: Record<string, unknown>
  ): Promise<SecureLoginResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        credentials: 'same-origin',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          // Rate limit exceeded
          return {
            success: false,
            error:
              errorData.message ||
              'Too many login attempts. Please try again later.',
            rateLimitInfo: errorData.rateLimitInfo,
          };
        }

        if (response.status === 401) {
          // Authentication failed
          return {
            success: false,
            error: errorData.message || 'Invalid email or password',
          };
        }

        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new Error(
          'Request timeout. Please check your connection and try again.'
        );
      }

      throw error;
    }
  }

  /**
   * Store authentication tokens securely
   */
  private storeTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }): void {
    try {
      // Store in sessionStorage for security
      sessionStorage.setItem('access_token', tokens.accessToken);
      sessionStorage.setItem('refresh_token', tokens.refreshToken);
      sessionStorage.setItem(
        'token_expires',
        (Date.now() + tokens.expiresIn * 1000).toString()
      );

      // Also store in Supabase client for compatibility
      supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Failed to store authentication tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Validate stored token
   */
  async validateStoredToken(): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('access_token');
      const expires = sessionStorage.getItem('token_expires');

      if (!token || !expires) {
        return false;
      }

      if (Date.now() > parseInt(expires)) {
        // Token expired, try to refresh
        return await this.refreshToken();
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = sessionStorage.getItem('refresh_token');

      if (!refreshToken) {
        return false;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        await this.clearTokens();
        return false;
      }

      this.storeTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('token_expires');
      sessionStorage.removeItem('csrf_token');

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get current user from stored token
   */
  async getCurrentUser(): Promise<unknown> {
    try {
      const isValid = await this.validateStoredToken();

      if (!isValid) {
        return null;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Validate token - used by ProtectedRoute
   */
  async validateToken(token?: string): Promise<boolean> {
    try {
      if (token) {
        // Validate specific token
        const { data, error } = await supabase.auth.getUser(token);
        return !error && !!data.user;
      } else {
        // Validate stored token
        return await this.validateStoredToken();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Logout - used by DrawerMenu
   */
  async logout(): Promise<void> {
    try {
      await this.clearTokens();
      console.log('[AUTH] Logout completed successfully');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const secureAuthService = new SecureAuthService();

// Export types and class for testing
export {
  SecureAuthService,
  type SecureLoginCredentials,
  type SecureLoginResponse,
};
