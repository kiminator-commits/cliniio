import { supabase } from '@/lib/supabaseClient';
import {
  sanitizeInput,
  detectSuspiciousInput,
  generateSecureToken,
  csrfProtection,
} from '@/utils/securityUtils';
// import { isDevelopment } from '@/lib/getEnv';

// Helper function to validate password strength
const validatePasswordStrength = (
  password: string
): { isValid: boolean; score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password must contain at least one lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password must contain at least one uppercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Password must contain at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Password must contain at least one special character');

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

interface Session {
  id: string;
  createdAt: number;
  expiresAt: number;
  userId: string;
}

interface User {
  id: string;
  email: string;
  role?: string;
}

export interface SecureLoginCredentials {
  email: string;
  password: string;
  csrfToken?: string;
  rememberMe?: boolean;
  deviceFingerprint?: string;
}

export interface SecureLoginResponse {
  success: boolean;
  session?: Session;
  user?: User;
  error?: string;
  securityWarnings?: string[];
  requiresMFA?: boolean;
  mfaToken?: string;
}

export class AuthLoginProvider {
  private rateLimiter: Map<
    string,
    { attempts: number; lastAttempt: number; blocked: boolean }
  > = new Map();
  private sessionStore = new Map<
    string,
    { session: Session; lastActivity: number }
  >();
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    private logSecurityEvent: (
      event: string,
      email: string,
      success: boolean,
      securityFlags: string[],
      metadata?: Record<string, unknown>
    ) => void,
    private getClientIP: () => Promise<string>,
    private checkMFARequirement: () => Promise<boolean>
  ) {}

  /**
   * Check if rate limiting allows the request
   */
  private isRateLimitAllowed(identifier: string): boolean {
    const now = Date.now();
    const data = this.rateLimiter.get(identifier);

    if (!data) return true;

    // Check if still blocked
    if (data.blocked && now - data.lastAttempt < this.BLOCK_DURATION) {
      return false;
    }

    // Reset if block period expired
    if (data.blocked && now - data.lastAttempt >= this.BLOCK_DURATION) {
      this.rateLimiter.delete(identifier);
      return true;
    }

    // Check if within rate limit window
    if (now - data.lastAttempt < this.RATE_LIMIT_WINDOW) {
      return data.attempts < this.MAX_LOGIN_ATTEMPTS;
    }

    // Reset if outside rate limit window
    this.rateLimiter.delete(identifier);
    return true;
  }

  /**
   * Record a rate limit attempt
   */
  private recordRateLimitAttempt(identifier: string): void {
    const now = Date.now();
    const data = this.rateLimiter.get(identifier);

    if (data) {
      data.attempts++;
      data.lastAttempt = now;
      if (data.attempts >= this.MAX_LOGIN_ATTEMPTS) {
        data.blocked = true;
      }
    } else {
      this.rateLimiter.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        blocked: false,
      });
    }
  }

  /**
   * Secure login with comprehensive security checks
   */
  async secureLogin(
    credentials: SecureLoginCredentials
  ): Promise<SecureLoginResponse> {
    const startTime = performance.now();
    const securityWarnings: string[] = [];
    const securityFlags: string[] = [];

    try {
      // 1. Input sanitization and validation
      const sanitizedEmail = sanitizeInput(credentials.email, 'email');
      if (!sanitizedEmail) {
        this.logSecurityEvent('login_attempt', credentials.email, false, [
          'invalid_email_format',
        ]);
        return { success: false, error: 'Invalid email format' };
      }

      // 2. Check for suspicious input
      const emailThreats = detectSuspiciousInput(credentials.email);
      const passwordThreats = detectSuspiciousInput(credentials.password);

      if (emailThreats.isSuspicious || passwordThreats.isSuspicious) {
        const threats = [...emailThreats.threats, ...passwordThreats.threats];
        this.logSecurityEvent(
          'login_attempt',
          credentials.email,
          false,
          ['suspicious_input'],
          {
            threats,
          }
        );
        return {
          success: false,
          error: 'Suspicious input detected',
          securityWarnings: threats,
        };
      }

      // 3. Rate limiting check
      const rateLimitKey = `${sanitizedEmail}:${await this.getClientIP()}`;
      if (!this.isRateLimitAllowed(rateLimitKey)) {
        this.logSecurityEvent('login_attempt', sanitizedEmail, false, [
          'rate_limited',
        ]);
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.',
        };
      }

      // 4. CSRF protection (if token provided)
      if (credentials.csrfToken) {
        const storedToken = csrfProtection.getStoredToken();
        if (
          !csrfProtection.validateToken(
            credentials.csrfToken,
            storedToken || ''
          )
        ) {
          this.logSecurityEvent('login_attempt', sanitizedEmail, false, [
            'csrf_violation',
          ]);
          return { success: false, error: 'Invalid security token' };
        }
      }

      // 5. Password strength validation
      const passwordValidation = validatePasswordStrength(credentials.password);
      if (!passwordValidation.isValid) {
        securityWarnings.push('Weak password detected');
        securityFlags.push('weak_password');
      }

      // 6. Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: credentials.password,
      });

      if (error) {
        // Record failed attempt
        this.recordRateLimitAttempt(rateLimitKey);

        // Log security event
        this.logSecurityEvent(
          'login_failure',
          sanitizedEmail,
          false,
          ['auth_failed'],
          {
            error: error.message,
            code: error.status,
          }
        );

        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        this.logSecurityEvent('login_failure', sanitizedEmail, false, [
          'no_session',
        ]);
        return {
          success: false,
          error: 'Authentication failed - no session returned',
        };
      }

      // 7. Success - record successful login
      // Reset rate limiter (simplified for now)

      // 8. Session security checks
      const sessionId = generateSecureToken(16);

      // Store session securely
      this.sessionStore.set(sessionId, {
        session: {
          id: sessionId,
          createdAt: Date.now(),
          expiresAt: Date.now() + this.SESSION_TIMEOUT,
          userId: data.user?.id || '',
        },
        lastActivity: Date.now(),
      });

      // 9. Check if MFA is required
      const requiresMFA = await this.checkMFARequirement();
      if (requiresMFA) {
        const mfaToken = generateSecureToken(32);
        // Store MFA token temporarily
        this.sessionStore.set(mfaToken, {
          session: {
            id: mfaToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.SESSION_TIMEOUT,
            userId: data.user?.id || '',
          },
          lastActivity: Date.now(),
        });

        this.logSecurityEvent(
          'login_success',
          sanitizedEmail,
          true,
          ['mfa_required'],
          {
            sessionId,
            requiresMFA: true,
          }
        );

        return {
          success: true,
          requiresMFA: true,
          mfaToken,
          securityWarnings,
        };
      }

      // 10. Log successful login
      this.logSecurityEvent(
        'login_success',
        sanitizedEmail,
        true,
        securityFlags,
        {
          sessionId,
          loginTime: performance.now() - startTime,
          requiresMFA: false,
        }
      );

      return {
        success: true,
        session: {
          id: sessionId,
          createdAt: Date.now(),
          expiresAt: Date.now() + this.SESSION_TIMEOUT,
          userId: data.user?.id || '',
        },
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email || '',
              role: data.user.role,
            }
          : undefined,
        securityWarnings,
      };
    } catch (error) {
      console.error('Secure login error:', error);
      this.logSecurityEvent(
        'login_error',
        credentials.email,
        false,
        ['unexpected_error'],
        {
          error,
        }
      );

      return {
        success: false,
        error: 'An unexpected error occurred during login',
        securityWarnings,
      };
    }
  }

  /**
   * Get rate limiter for cleanup
   */
  getRateLimiter(): Map<string, { attempts: number; lastAttempt: number; blocked: boolean }> {
    return this.rateLimiter;
  }

  /**
   * Get session store for cleanup
   */
  getSessionStore(): Map<string, { session: Session; lastActivity: number }> {
    return this.sessionStore;
  }
}
