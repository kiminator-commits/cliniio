/**
 * Security headers and Content Security Policy configuration
 */

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
}

/**
 * Default Content Security Policy for Cliniio
 */
export const DEFAULT_CSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'", // Required for React development
    'https://www.googletagmanager.com', // Google Analytics
    'https://www.google-analytics.com',
    'https://cdn.jsdelivr.net', // CDN for development
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': [
    "'self'",
    'https://*.supabase.co', // Supabase API
    'https://www.google-analytics.com',
    'wss://*.supabase.co', // Supabase realtime
  ],
  'frame-src': [
    "'self'",
    'https://accounts.google.com', // Google OAuth
    'https://login.microsoftonline.com', // Microsoft OAuth
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Production CSP with stricter settings
 */
export const PRODUCTION_CSP = {
  ...DEFAULT_CSP,
  'script-src': [
    "'self'",
    // Remove unsafe-inline and unsafe-eval for production
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': [
    "'self'",
    // Remove unsafe-inline for production if possible
    'https://fonts.googleapis.com',
  ],
};

/**
 * Generate Content Security Policy string
 */
export const generateCSP = (isProduction: boolean = false): string => {
  const csp = isProduction ? PRODUCTION_CSP : DEFAULT_CSP;

  return Object.entries(csp)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

/**
 * Default security headers
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  'Content-Security-Policy': generateCSP(false),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

/**
 * Production security headers with HSTS
 */
export const PRODUCTION_SECURITY_HEADERS: SecurityHeaders = {
  ...DEFAULT_SECURITY_HEADERS,
  'Content-Security-Policy': generateCSP(true),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Apply security headers to response
 */
export const applySecurityHeaders = (
  response: Response,
  isProduction: boolean = false
): Response => {
  const headers = isProduction
    ? PRODUCTION_SECURITY_HEADERS
    : DEFAULT_SECURITY_HEADERS;

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

/**
 * Security middleware for Express/Node.js
 */
export const securityMiddleware = (isProduction: boolean = false) => {
  return (
    req: Record<string, unknown>,
    res: Record<string, unknown>,
    next: () => void
  ) => {
    const headers = isProduction
      ? PRODUCTION_SECURITY_HEADERS
      : DEFAULT_SECURITY_HEADERS;

    Object.entries(headers).forEach(([key, value]) => {
      if (res.setHeader && typeof res.setHeader === 'function') {
        (res as { setHeader: (key: string, value: string) => void }).setHeader(
          key,
          value
        );
      }
    });

    if (next) {
      next();
    }
  };
};

/**
 * Validate CSP directive
 */
export const validateCSPDirective = (
  directive: string,
  sources: string[]
): boolean => {
  const validDirectives = [
    'default-src',
    'script-src',
    'style-src',
    'font-src',
    'img-src',
    'connect-src',
    'frame-src',
    'object-src',
    'base-uri',
    'form-action',
    'frame-ancestors',
    'upgrade-insecure-requests',
  ];

  if (!validDirectives.includes(directive)) {
    return false;
  }

  // Validate source expressions
  const validSourceExpressions = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'none'",
    'data:',
    'blob:',
    'https:',
    'wss:',
  ];

  return sources.every(
    (source) =>
      validSourceExpressions.includes(source) ||
      source.startsWith('https://') ||
      source.startsWith('wss://')
  );
};

/**
 * Parse and validate CSP string
 */
export const parseAndValidateCSP = (
  cspString: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const directives = cspString
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean);

  directives.forEach((directive) => {
    const [name, ...sources] = directive.split(' ').filter(Boolean);

    if (!validateCSPDirective(name, sources)) {
      errors.push(`Invalid CSP directive: ${name}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate nonce for CSP
 */
export const generateNonce = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * Add nonce to CSP
 */
export const addNonceToCSP = (csp: string, nonce: string): string => {
  return csp.replace("'unsafe-inline'", `'unsafe-inline' 'nonce-${nonce}'`);
};

/**
 * Security configuration for different environments
 */
export const SECURITY_CONFIG = {
  development: {
    csp: DEFAULT_CSP,
    headers: DEFAULT_SECURITY_HEADERS,
    allowUnsafeInline: true,
    allowUnsafeEval: true,
  },
  staging: {
    csp: DEFAULT_CSP,
    headers: DEFAULT_SECURITY_HEADERS,
    allowUnsafeInline: false,
    allowUnsafeEval: false,
  },
  production: {
    csp: PRODUCTION_CSP,
    headers: PRODUCTION_SECURITY_HEADERS,
    allowUnsafeInline: false,
    allowUnsafeEval: false,
  },
};

/**
 * Get security configuration for environment
 */
export const getSecurityConfig = (
  environment: keyof typeof SECURITY_CONFIG = 'development'
) => {
  return SECURITY_CONFIG[environment];
};
