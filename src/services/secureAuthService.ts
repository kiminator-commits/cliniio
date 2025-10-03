// Secure authentication service that uses the new server-side endpoint
import { createClient } from '@supabase/supabase-js';

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
  private supabaseClient: unknown;

  constructor(config: Partial<SecureAuthServiceConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/functions/v1/auth-login',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
    };

    // Initialize Supabase client for token validation only
    this.supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
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
  async secureLogin(credentials: SecureLoginCredentials): Promise<SecureLoginResponse> {
    const startTime = performance.now();
    
    try {
      // Generate and store CSRF token if not provided
      let csrfToken = credentials.csrfToken;
      if (!csrfToken) {
        csrfToken = this.generateCSRFToken();
        this.storeCSRFToken(csrfToken);
      }

      // Validate CSRF token
      const storedToken = this.getStoredCSRFToken();
      if (!this.validateCSRFToken(csrfToken, storedToken)) {
        throw new Error('Invalid security token. Please refresh the page and try again.');
      }

      // Prepare request
      const requestBody = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        csrfToken,
        rememberMe: credentials.rememberMe || false,
      };

      // Make request to secure authentication endpoint
      const response = await this.makeSecureRequest(requestBody);

      if (response.success && response.data) {
        // Store tokens securely
        this.storeTokens(response.data);
        
        // Log successful authentication
        console.log(`[AUTH] Login successful for ${credentials.email} in ${(performance.now() - startTime).toFixed(2)}ms`);
        
        return response;
      } else {
        throw new Error(response.error || 'Authentication failed');
      }

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
  private async makeSecureRequest(requestBody: Record<string, unknown>): Promise<SecureLoginResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
            error: errorData.message || 'Too many login attempts. Please try again later.',
            rateLimitInfo: errorData.rateLimitInfo,
          };
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
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
      sessionStorage.setItem('token_expires', (Date.now() + tokens.expiresIn * 1000).toString());
      
      // Also store in Supabase client for compatibility
      this.supabaseClient.auth.setSession({
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
      
      const { data, error } = await this.supabaseClient.auth.refreshSession({
        refresh_token: refreshToken,
      });
      
      if (error || !data.session) {
        this.clearTokens();
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
      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    try {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('token_expires');
      sessionStorage.removeItem('csrf_token');
      
      this.supabaseClient.auth.signOut();
      
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
      
      const { data: { user } } = await this.supabaseClient.auth.getUser();
      return user;
      
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
}

// Export singleton instance
export const secureAuthService = new SecureAuthService();

// Export types and class for testing
export { SecureAuthService, type SecureLoginCredentials, type SecureLoginResponse };