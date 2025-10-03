// Basic audit service for logging security events

interface AuditEvent {
  event: string;
  user?: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const logAuditEvent = (event: AuditEvent): void => {
  try {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', event);
    }

    // In production, log to Supabase monitoring_events table
    if (process.env.NODE_ENV === 'production') {
      // Note: This would require the monitoring service to be properly configured
      // For now, just log to console to avoid errors
      console.log('[AUDIT]', event);
    } else {
      // Development fallback to localStorage
      const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
      auditLog.push({
        ...event,
        id: Date.now().toString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Keep only last 100 events
      if (auditLog.length > 100) {
        auditLog.splice(0, auditLog.length - 100);
      }

      localStorage.setItem('audit_log', JSON.stringify(auditLog));
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to log audit event:', error);
    }
  }
};

export const logAudit = (email: string, success: boolean) => {
  // Log to console for now - can be enhanced later with proper Supabase logging
  console.log('[AUDIT]', { email, success, timestamp: new Date() });
};

// Log every login attempt
export const handleLogin = async (email: string) => {
  try {
    // Mock implementation - replace with actual login
    console.log('Login attempt for:', email);
    logAudit(email, true);
  } catch (err) {
    console.error(err);
    logAudit(email, false);
  }
};
