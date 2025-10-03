// Content Security Policy utilities for security hardening

export const CSP_POLICIES = {
  // Default CSP for login forms
  LOGIN_FORM: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
    'style-src': ["'self'", "'unsafe-inline'"], // Allow inline styles for React
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': [
      "'self'",
      'https:',
      'https://*.supabase.co',
      'wss://*.supabase.co',
    ],
    'form-action': ["'self'"], // Restrict form submissions
    'base-uri': ["'self'"], // Restrict base URI
    'object-src': ["'none'"], // Block plugins
    'media-src': ["'self'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': [], // Force HTTPS
  },

  // Strict CSP for production
  PRODUCTION: {
    'default-src': ["'self'"],
    'script-src': ["'self'"], // No unsafe-inline in production
    'style-src': ["'self'"], // No unsafe-inline in production
    'img-src': ["'self'", 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': [
      "'self'",
      'https:',
      'https://*.supabase.co',
      'wss://*.supabase.co',
    ],

    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': [],
  },
};

export const generateCSPHeader = (
  policy: keyof typeof CSP_POLICIES = 'LOGIN_FORM'
): string => {
  const selectedPolicy = CSP_POLICIES[policy];

  return Object.entries(selectedPolicy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

export const applyCSP = (
  policy: keyof typeof CSP_POLICIES = 'LOGIN_FORM'
): void => {
  if (typeof window === 'undefined') return;

  try {
    // Add CSP meta tag if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = generateCSPHeader(policy);
      document.head.appendChild(meta);
    }
  } catch (err) {
    console.error(err);
    // Silent fail - CSP is primarily a server-side concern
  }
};

export const validateCSPCompliance = (): boolean => {
  if (typeof window === 'undefined') return true;

  try {
    // Check if we're running on HTTPS
    const isHttps =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // Check for CSP header
    const hasCSP = !!document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );

    return isHttps && hasCSP;
  } catch (err) {
    console.error(err);
    return false;
  }
};
