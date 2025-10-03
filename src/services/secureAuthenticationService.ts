// Secure authentication service replacing direct Supabase calls
import { secureApiClient } from './secureApiClient';

interface AuthenticationCredentials {
  email: string;
  password: string;
  csrfToken?: string;
  rememberMe?: boolean;
}

interface AuthenticationResult {
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
  message?: string;
  rateLimitInfo?: {
    remainingAttempts: number;
    resetTime: number;
  };
}

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  userEmail: string;
  userRole: string;
}

interface SecurityContext {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceFingerprint?: string;
}

class SecureAuthenticationService {
  private tokenInfo: TokenInfo | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Load stored tokens
      await this.loadStoredTokens();
      
      // Validate existing token
      if (this.tokenInfo) {
        const isValid = await this.validateToken();
        if (!isValid) {
          await this.clearTokens();
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize secure authentication:', error);
      await this.clearTokens();
      this.isInitialized = true;
    }
  }

  private async loadStoredTokens(): Promise<void> {
    try {
      const accessToken = sessionStorage.getItem('access_token');
      const refreshToken = sessionStorage.getItem('refresh_token');
      const expiresAt = sessionStorage.getItem('token_expires');
      const userId = sessionStorage.getItem('user_id');
      const userEmail = sessionStorage.getItem('user_email');
      const userRole = sessionStorage.getItem('user_role');

      if (accessToken && refreshToken && expiresAt && userId && userEmail && userRole) {
        this.tokenInfo = {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt),
          userId,
          userEmail,
          userRole,
        };
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
    }
  }

  private async storeTokens(tokenData: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string; role: string };
  }): Promise<void> {
    try {
      const expiresAt = Date.now() + (tokenData.expiresIn * 1000);
      
      this.tokenInfo = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt,
        userId: tokenData.user.id,
        userEmail: tokenData.user.email,
        userRole: tokenData.user.role,
      };

      // Store in sessionStorage for security
      sessionStorage.setItem('access_token', tokenData.accessToken);
      sessionStorage.setItem('refresh_token', tokenData.refreshToken);
      sessionStorage.setItem('token_expires', expiresAt.toString());
      sessionStorage.setItem('user_id', tokenData.user.id);
      sessionStorage.setItem('user_email', tokenData.user.email);
      sessionStorage.setItem('user_role', tokenData.user.role);

    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      this.tokenInfo = null;
      
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('token_expires');
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_role');
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('api_signing_key');
      
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  private storeCSRFToken(token: string): void {
    try {
      sessionStorage.setItem('csrf_token', token);
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
  }

  private getStoredCSRFToken(): string | null {
    try {
      return sessionStorage.getItem('csrf_token');
    } catch (error) {
      console.warn('Failed to retrieve CSRF token:', error);
      return null;
    }
  }

  private generateDeviceFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
      ].join('|');
      
      return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    } catch {
      return 'unknown_device';
    }
  }

  private getSecurityContext(): SecurityContext {
    return {
      ipAddress: 'unknown', // Would be set by server
      userAgent: navigator.userAgent,
      sessionId: this.generateSessionId(),
      deviceFingerprint: this.generateDeviceFingerprint(),
    };
  }

  private generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationResult> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    try {
      // Generate and store CSRF token if not provided
      let csrfToken = credentials.csrfToken;
      if (!csrfToken) {
        csrfToken = this.generateCSRFToken();
        this.storeCSRFToken(csrfToken);
      }

      // Validate CSRF token
      const storedToken = this.getStoredCSRFToken();
      if (!storedToken || csrfToken !== storedToken) {
        throw new Error('Invalid security token. Please refresh the page and try again.');
      }

      // Prepare authentication request
      const authRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        csrfToken,
        rememberMe: credentials.rememberMe || false,
        securityContext: this.getSecurityContext(),
      };

      // Make secure authentication request
      const response = await secureApiClient.authenticate(authRequest);

      if (response.success && response.data) {
        // Store tokens securely
        await this.storeTokens(response.data);
        
        console.log(`[AUTH] Authentication successful for ${credentials.email}`);
        
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.error || 'Authentication failed');
      }

    } catch (error) {
      console.error(`[AUTH] Authentication failed for ${credentials.email}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        rateLimitInfo: response?.metadata?.rateLimitInfo,
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    if (!this.tokenInfo) {
      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    if (!this.tokenInfo) {
      return false;
    }

    try {
      const response = await secureApiClient.refreshToken(this.tokenInfo.refreshToken);

      if (response.success && response.data) {
        // Update stored tokens
        await this.storeTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          user: {
            id: this.tokenInfo.userId,
            email: this.tokenInfo.userEmail,
            role: this.tokenInfo.userRole,
          },
        });

        console.log('[AUTH] Token refreshed successfully');
        return true;
      } else {
        console.warn('[AUTH] Token refresh failed:', response.error);
        await this.clearTokens();
        return false;
      }

    } catch (error) {
      console.error('[AUTH] Token refresh error:', error);
      await this.clearTokens();
      return false;
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.tokenInfo) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > this.tokenInfo.expiresAt) {
      // Try to refresh
      return await this.refreshToken();
    }

    return true;
  }

  async logout(): Promise<void> {
    try {
      if (this.tokenInfo) {
        // Notify server of logout
        await secureApiClient.logout();
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      await this.clearTokens();
      console.log('[AUTH] User logged out');
    }
  }

  async getCurrentUser(): Promise<{
    id: string;
    email: string;
    role: string;
  } | null> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    if (!this.tokenInfo) {
      return null;
    }

    const isValid = await this.validateToken();
    if (!isValid) {
      return null;
    }

    return {
      id: this.tokenInfo.userId,
      email: this.tokenInfo.userEmail,
      role: this.tokenInfo.userRole,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    if (!this.tokenInfo) {
      return false;
    }

    return await this.validateToken();
  }

  getAccessToken(): string | null {
    return this.tokenInfo?.accessToken || null;
  }

  getTokenInfo(): TokenInfo | null {
    return this.tokenInfo;
  }

  private async waitForInitialization(): Promise<void> {
    const maxWait = 5000; // 5 seconds
    const startTime = Date.now();

    while (!this.isInitialized && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.isInitialized) {
      throw new Error('Authentication service initialization timeout');
    }
  }

  // Security utilities
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Session management
  async extendSession(): Promise<boolean> {
    if (!this.tokenInfo) {
      return false;
    }

    try {
      // Make a lightweight request to extend session
      const response = await secureApiClient.get('/auth-extend');
      return response.success;
    } catch (error) {
      console.warn('Session extension failed:', error);
      return false;
    }
  }

  // Security event reporting
  async reportSecurityEvent(eventType: string, details: Record<string, unknown>): Promise<void> {
    try {
      await secureApiClient.post('/security-event', {
        eventType,
        details,
        timestamp: Date.now(),
        securityContext: this.getSecurityContext(),
      });
    } catch (error) {
      console.warn('Failed to report security event:', error);
    }
  }
}

// Export singleton instance
export const secureAuthService = new SecureAuthenticationService();

// Export types and class for testing
export { SecureAuthenticationService, type AuthenticationCredentials, type AuthenticationResult, type TokenInfo };
