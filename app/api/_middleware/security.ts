import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/_core/logger';

/**
 * Adds security headers to API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
  );

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

/**
 * Logs API request details for security auditing
 */
export function logApiRequest(
  req: NextRequest,
  response: NextResponse,
  additionalData?: Record<string, unknown>
): void {
  const requestId = req.headers.get('x-request-id') || generateRequestId();
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'Unknown';

  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    ip,
    userAgent,
    statusCode: response.status,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  if (response.status >= 400) {
    logger.warn('API: Request completed with error', logData);
  } else {
    logger.info('API: Request completed successfully', logData);
  }
}

/**
 * Logs security events for monitoring
 */
export function logSecurityEvent(
  eventType: string,
  req: NextRequest,
  details: Record<string, unknown> = {}
): void {
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'Unknown';

  logger.warn('SECURITY: Security event detected', {
    eventType,
    endpoint: req.url,
    method: req.method,
    ip,
    userAgent: req.headers.get('user-agent') || 'Unknown',
    timestamp: new Date().toISOString(),
    ...details,
  });
}

/**
 * Validates request origin and headers
 */
export function validateRequest(req: NextRequest): {
  isValid: boolean;
  reason?: string;
} {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr',
  ];

  for (const header of suspiciousHeaders) {
    if (req.headers.get(header)) {
      logSecurityEvent('suspicious_header', req, { header });
      return { isValid: false, reason: 'Suspicious header detected' };
    }
  }

  // Check for basic request validation
  if (req.method !== 'POST' && req.method !== 'GET') {
    return { isValid: false, reason: 'Invalid HTTP method' };
  }

  // Check content type for POST requests
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { isValid: false, reason: 'Invalid content type' };
    }
  }

  return { isValid: true };
}

/**
 * Generates a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitizes sensitive data from logs
 */
export function sanitizeLogData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'token',
    'key',
    'secret',
    'authorization',
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
