import { supabase } from '@/lib/supabaseClient';

interface Session {
  id: string;
  createdAt: number;
  expiresAt: number;
  userId: string;
}

export class AuthSessionProvider {
  private sessionStore = new Map<
    string,
    { session: Session; lastActivity: number }
  >();
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(
    private logSecurityEvent: (
      event: string,
      email: string,
      success: boolean,
      securityFlags: string[],
      metadata?: Record<string, unknown>
    ) => void
  ) {}

  /**
   * Secure logout with session cleanup
   */
  async secureLogout(sessionId: string): Promise<void> {
    try {
      const sessionData = this.sessionStore.get(sessionId);
      if (sessionData) {
        // Log logout event
        this.logSecurityEvent('logout', '', true, ['user_initiated'], {
          sessionId,
          sessionAge: Date.now() - sessionData.session.createdAt,
        });

        // Clean up session
        this.sessionStore.delete(sessionId);

        // Sign out from Supabase
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error(err);
      console.error('Secure logout error');
    }
  }

  /**
   * Validate session and check for security issues
   */
  validateSession(sessionId: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const sessionData = this.sessionStore.get(sessionId);

    if (!sessionData) {
      return { isValid: false, warnings: ['Session not found'] };
    }

    const now = Date.now();
    const sessionAge = now - sessionData.session.createdAt;
    const inactivityTime = now - sessionData.lastActivity;

    // Check session timeout
    if (sessionAge > this.SESSION_TIMEOUT) {
      this.sessionStore.delete(sessionId);
      return { isValid: false, warnings: ['Session expired'] };
    }

    // Check inactivity timeout
    if (inactivityTime > this.INACTIVITY_TIMEOUT) {
      this.sessionStore.delete(sessionId);
      return { isValid: false, warnings: ['Session inactive for too long'] };
    }

    // Update last activity
    sessionData.lastActivity = now;

    // Check for suspicious activity
    if (sessionAge > 4 * 60 * 60 * 1000) {
      // 4 hours
      warnings.push('Session has been active for a long time');
    }

    return { isValid: true, warnings };
  }

  /**
   * Refresh session with security checks
   */
  async refreshSession(
    sessionId: string
  ): Promise<{ success: boolean; session?: Session | null; error?: string }> {
    try {
      const sessionData = this.sessionStore.get(sessionId);
      if (!sessionData) {
        return { success: false, error: 'Session not found' };
      }

      // Validate current session
      const validation = this.validateSession(sessionId);
      if (!validation.isValid) {
        return { success: false, error: 'Session validation failed' };
      }

      // Refresh Supabase session
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        this.logSecurityEvent(
          'session_refresh_failure',
          '', // Email not available in Session interface
          false,
          ['refresh_failed'],
          { error }
        );
        return { success: false, error: error.message };
      }

      // Update session data
      // Cannot assign to session property as it doesn't exist
      sessionData.lastActivity = Date.now();

      this.logSecurityEvent('session_refresh_success', '', true, [
        'refresh_success',
      ]);

      return { success: true, session: undefined };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false, error: 'Session refresh failed' };
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [key, sessionData] of this.sessionStore.entries()) {
      const sessionAge = now - sessionData.session.createdAt;
      const inactivityTime = now - sessionData.lastActivity;

      if (
        sessionAge > this.SESSION_TIMEOUT ||
        inactivityTime > this.INACTIVITY_TIMEOUT
      ) {
        this.sessionStore.delete(key);
      }
    }
  }

  /**
   * Get session store
   */
  getSessionStore(): Map<string, { session: Session; lastActivity: number }> {
    return this.sessionStore;
  }

  /**
   * Set session store (for initialization from other providers)
   */
  setSessionStore(
    sessionStore: Map<string, { session: Session; lastActivity: number }>
  ): void {
    this.sessionStore = sessionStore;
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    activeSessions: number;
    totalSessions: number;
  } {
    return {
      activeSessions: this.sessionStore.size,
      totalSessions: this.sessionStore.size, // In a real app, this would track total sessions
    };
  }
}
