import { isDevelopment } from '@/lib/getEnv';

export interface SecurityAuditLog {
  event: string;
  userId?: string;
  email: string;
  ipAddress?: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  securityFlags: string[];
  metadata: Record<string, unknown>;
}

export class AuthAuditProvider {
  /**
   * Get client IP address with proper fallbacks
   */
  async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would get the client IP from headers
      // For client-side usage, we can use a combination of factors
      if (typeof window !== 'undefined') {
        // Use a combination of factors for client identification
        const userAgent = navigator.userAgent;
        const language = navigator.language;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Create a pseudo-IP based on client characteristics
        // In production, this should be replaced with actual IP from server headers
        const clientFingerprint = btoa(
          `${userAgent}:${language}:${timezone}`
        ).slice(0, 16);
        return clientFingerprint;
      }

      // Server-side fallback
      return '127.0.0.1';
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  /**
   * Log security events with SSR safety
   */
  logSecurityEvent(
    event: string,
    email: string,
    success: boolean,
    securityFlags: string[],
    metadata: Record<string, unknown> = {}
  ): void {
    try {
      const auditLog: SecurityAuditLog = {
        event,
        email,
        userAgent: this.getUserAgent(),
        timestamp: new Date().toISOString(),
        success,
        securityFlags,
        metadata,
      };

      // Log to console in development
      if (isDevelopment()) {
        console.log('[SECURITY_AUDIT]', auditLog);
      }

      // In production, send to your audit logging service
      // await this.sendToAuditService(auditLog);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Get user agent with SSR safety
   */
  private getUserAgent(): string {
    try {
      if (typeof window !== 'undefined' && navigator?.userAgent) {
        return navigator.userAgent;
      }
      return 'unknown';
    } catch (err) {
      console.error(err);
      return 'unknown';
    }
  }
}
