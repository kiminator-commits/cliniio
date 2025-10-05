// Security monitoring and threat detection
interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

interface SuspiciousActivityResult {
  detected: boolean;
  severity: 'medium' | 'high' | 'critical';
  patterns: string[];
}

// In-memory storage for security events (in production, use a proper database)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS_IN_MEMORY = 1000;

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Add timestamp if not present
    if (!event.details.timestamp) {
      event.details.timestamp = new Date().toISOString();
    }

    // Store in memory (in production, save to database)
    securityEvents.push(event);

    // Keep only recent events in memory
    if (securityEvents.length > MAX_EVENTS_IN_MEMORY) {
      securityEvents.splice(0, securityEvents.length - MAX_EVENTS_IN_MEMORY);
    }

    // Log to console for monitoring
    console.log(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, {
      timestamp: event.details.timestamp,
      details: event.details,
    });

    // In production, you would also:
    // 1. Save to a secure audit database
    // 2. Send alerts for high/critical severity events
    // 3. Integrate with monitoring systems
    // 4. Generate security reports
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

export async function detectSuspiciousActivity(
  email: string,
  ipAddress: string,
  clientId: string
): Promise<SuspiciousActivityResult> {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Get recent security events
  const recentEvents = securityEvents.filter(
    (event) => new Date(event.details.timestamp).getTime() > oneHourAgo
  );

  const suspiciousPatterns: string[] = [];
  let maxSeverity: 'medium' | 'high' | 'critical' = 'medium';

  // Pattern 1: Multiple failed attempts from same IP
  const failedAttemptsFromIP = recentEvents.filter(
    (event) =>
      event.type === 'login_failure' && event.details.ipAddress === ipAddress
  );

  if (failedAttemptsFromIP.length >= 10) {
    suspiciousPatterns.push('Multiple failed attempts from same IP');
    maxSeverity = 'high';
  }

  // Pattern 2: Multiple different emails from same IP
  const uniqueEmailsFromIP = new Set(
    recentEvents
      .filter((event) => event.details.ipAddress === ipAddress)
      .map((event) => event.details.email)
  );

  if (uniqueEmailsFromIP.size >= 5) {
    suspiciousPatterns.push('Multiple different emails from same IP');
    maxSeverity = 'critical';
  }

  // Pattern 3: Rapid successive attempts
  const rapidAttempts = recentEvents.filter(
    (event) =>
      event.type === 'login_failure' &&
      event.details.email === email &&
      new Date(event.details.timestamp).getTime() > now - 5 * 60 * 1000 // Last 5 minutes
  );

  if (rapidAttempts.length >= 3) {
    suspiciousPatterns.push('Rapid successive login attempts');
    maxSeverity = 'high';
  }

  // Pattern 4: Unusual user agent patterns
  const userAgents = recentEvents
    .filter((event) => event.details.ipAddress === ipAddress)
    .map((event) => event.details.userAgent)
    .filter(Boolean);

  const uniqueUserAgents = new Set(userAgents);
  if (uniqueUserAgents.size >= 3) {
    suspiciousPatterns.push('Multiple different user agents from same IP');
    maxSeverity = 'medium';
  }

  // Pattern 5: Geographic anomalies (if IP geolocation is available)
  // This would require IP geolocation service integration

  // Pattern 6: Known malicious IP ranges
  if (isKnownMaliciousIP(ipAddress)) {
    suspiciousPatterns.push('Known malicious IP address');
    maxSeverity = 'critical';
  }

  // Pattern 7: Bot-like behavior (rapid requests with similar patterns)
  const botPatterns = detectBotBehavior(recentEvents, ipAddress);
  if (botPatterns.length > 0) {
    suspiciousPatterns.push(...botPatterns);
    maxSeverity = 'high';
  }

  return {
    detected: suspiciousPatterns.length > 0,
    severity: maxSeverity,
    patterns: suspiciousPatterns,
  };
}

function isKnownMaliciousIP(ipAddress: string): boolean {
  // In production, integrate with threat intelligence feeds
  // For now, check against a simple list of known bad IPs
  const maliciousIPs = [
    // Add known malicious IP ranges here
    // '192.168.1.100',
    // '10.0.0.50',
  ];

  return maliciousIPs.includes(ipAddress);
}

function detectBotBehavior(
  events: SecurityEvent[],
  ipAddress: string
): string[] {
  const patterns: string[] = [];

  // Check for very regular timing patterns (bot-like)
  const ipEvents = events.filter(
    (event) => event.details.ipAddress === ipAddress
  );

  if (ipEvents.length >= 5) {
    const timestamps = ipEvents
      .map((event) => new Date(event.details.timestamp).getTime())
      .sort((a, b) => a - b);

    // Check for very regular intervals (within 1 second tolerance)
    let regularIntervals = 0;
    for (let i = 1; i < timestamps.length; i++) {
      const interval = timestamps[i] - timestamps[i - 1];
      if (interval >= 29000 && interval <= 31000) {
        // ~30 seconds
        regularIntervals++;
      }
    }

    if (regularIntervals >= 3) {
      patterns.push('Regular timing patterns detected (bot-like behavior)');
    }
  }

  return patterns;
}

export async function getSecurityMetrics(): Promise<{
  totalEvents: number;
  eventsBySeverity: Record<string, number>;
  recentThreats: string[];
}> {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const recentEvents = securityEvents.filter(
    (event) => new Date(event.details.timestamp).getTime() > oneHourAgo
  );

  const eventsBySeverity = recentEvents.reduce(
    (acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recentThreats = recentEvents
    .filter(
      (event) => event.severity === 'high' || event.severity === 'critical'
    )
    .map((event) => `${event.type} (${event.severity})`)
    .slice(0, 10); // Last 10 threats

  return {
    totalEvents: securityEvents.length,
    eventsBySeverity,
    recentThreats,
  };
}
