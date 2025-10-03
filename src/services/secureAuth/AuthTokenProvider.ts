import { generateSecureToken } from '@/utils/securityUtils';

interface Session {
  id: string;
  createdAt: number;
  expiresAt: number;
  userId: string;
}

export class AuthTokenProvider {
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

  /**
   * Generate secure session token
   */
  generateSessionToken(): string {
    return generateSecureToken(16);
  }

  /**
   * Generate secure MFA token
   */
  generateMFAToken(): string {
    return generateSecureToken(32);
  }

  /**
   * Create session object
   */
  createSession(userId: string, sessionId?: string): Session {
    const id = sessionId || this.generateSessionToken();
    return {
      id,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT,
      userId,
    };
  }

  /**
   * Create MFA session object
   */
  createMFASession(userId: string, mfaToken?: string): Session {
    const id = mfaToken || this.generateMFAToken();
    return {
      id,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT,
      userId,
    };
  }
}
