// Security monitoring and alerting
export interface SecurityEvent {
  type:
    | 'unauthorized_origin'
    | 'rate_limit_exceeded'
    | 'validation_failed'
    | 'invalid_config'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  clientId: string;
  origin: string | null;
}

// Security event store (in production, use external monitoring service)
const securityEvents: SecurityEvent[] = [];

// Log security event
export const logSecurityEvent = (
  event: Omit<SecurityEvent, 'timestamp' | 'clientId' | 'origin'>
) => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    clientId: 'unknown', // Will be set by caller
    origin: null, // Will be set by caller
  };

  securityEvents.push(securityEvent);

  // Keep only last 1000 events to prevent memory issues
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }

  // Log to console with appropriate level
  const logMessage = `🚨 SECURITY EVENT [${event.severity.toUpperCase()}]: ${event.type}`;
  const logData = {
    ...event.details,
    timestamp: securityEvent.timestamp,
  };

  switch (event.severity) {
    case 'critical':
    case 'high':
      console.error(logMessage, logData);
      break;
    case 'medium':
      console.warn(logMessage, logData);
      break;
    case 'low':
      console.log(logMessage, logData);
      break;
  }
};

// Get security metrics
export const getSecurityMetrics = () => {
  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;

  const recentEvents = securityEvents.filter(
    (event) => new Date(event.timestamp).getTime() > last24Hours
  );

  const metrics = {
    totalEvents: recentEvents.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byOrigin: {} as Record<string, number>,
    topOrigins: [] as Array<{ origin: string; count: number }>,
    criticalEvents: recentEvents.filter((e) => e.severity === 'critical')
      .length,
    rateLimitViolations: recentEvents.filter(
      (e) => e.type === 'rate_limit_exceeded'
    ).length,
    unauthorizedOrigins: recentEvents.filter(
      (e) => e.type === 'unauthorized_origin'
    ).length,
  };

  // Count by type and severity
  recentEvents.forEach((event) => {
    metrics.byType[event.type] = (metrics.byType[event.type] || 0) + 1;
    metrics.bySeverity[event.severity] =
      (metrics.bySeverity[event.severity] || 0) + 1;

    if (event.origin) {
      metrics.byOrigin[event.origin] =
        (metrics.byOrigin[event.origin] || 0) + 1;
    }
  });

  // Get top origins
  metrics.topOrigins = Object.entries(metrics.byOrigin)
    .map(([origin, count]) => ({ origin, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return metrics;
};

// Detect suspicious activity patterns
export const detectSuspiciousActivity = (
  clientId: string,
  origin: string | null
): boolean => {
  const now = Date.now();
  const lastHour = now - 60 * 60 * 1000;

  const recentEvents = securityEvents.filter(
    (event) =>
      new Date(event.timestamp).getTime() > lastHour &&
      (event.clientId === clientId || event.origin === origin)
  );

  // Check for multiple failed attempts
  const failedAttempts = recentEvents.filter(
    (event) =>
      event.type === 'validation_failed' || event.type === 'unauthorized_origin'
  ).length;

  // Check for rapid rate limit violations
  const rateLimitViolations = recentEvents.filter(
    (event) => event.type === 'rate_limit_exceeded'
  ).length;

  // Flag as suspicious if multiple failures or rapid violations
  if (failedAttempts >= 5 || rateLimitViolations >= 3) {
    logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      details: {
        clientId,
        origin,
        failedAttempts,
        rateLimitViolations,
        recentEventsCount: recentEvents.length,
      },
    });
    return true;
  }

  return false;
};
