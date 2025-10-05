// User-friendly error message constants
export const LOGIN_ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS:
    'Invalid email or password. Please check your credentials and try again.',
  USER_NOT_FOUND:
    'No account found with this email address. Please contact your administrator.',
  INCORRECT_PASSWORD:
    "Incorrect password. Please try again or contact your administrator if you've forgotten your password.",
  ACCOUNT_DISABLED:
    'Your account has been disabled. Please contact your administrator.',
  ACCOUNT_LOCKED:
    'Your account has been temporarily locked due to multiple failed login attempts. Please contact your administrator.',

  // Network errors
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your internet connection and try again.',
  CONNECTION_TIMEOUT:
    'Connection timed out. Please try again in a few moments.',
  SERVER_ERROR:
    'Server communication error. Please try again in a few moments.',
  SERVICE_UNAVAILABLE:
    'Service temporarily unavailable. Please try again in a few minutes.',

  // Validation errors
  EMAIL_REQUIRED: 'Please enter your email address.',
  PASSWORD_REQUIRED: 'Please enter your password.',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements.',

  // System errors
  INTERNAL_ERROR:
    'An internal error occurred. Our technical team has been notified. Please try again later.',
  DATABASE_ERROR:
    'Database connection error. Please try again in a few moments.',
  UNEXPECTED_ERROR:
    'An unexpected error occurred. Please try again or contact technical support if the problem persists.',

  // Generic fallbacks
  LOGIN_FAILED:
    'Login failed. Please try again or contact technical support if the problem persists.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

export const ERROR_CATEGORIES = {
  AUTH: 'auth',
  NETWORK: 'network',
  VALIDATION: 'validation',
  SYSTEM: 'system',
  UNKNOWN: 'unknown',
} as const;

export const ERROR_ACTIONS = {
  ADMIN: 'admin',
  SUPPORT: 'support',
  RETRY: 'retry',
  NONE: 'none',
} as const;

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Error escalation mapping
export const ERROR_ESCALATION = {
  [ERROR_CATEGORIES.AUTH]: ERROR_ACTIONS.ADMIN,
  [ERROR_CATEGORIES.NETWORK]: ERROR_ACTIONS.SUPPORT,
  [ERROR_CATEGORIES.VALIDATION]: ERROR_ACTIONS.RETRY,
  [ERROR_CATEGORIES.SYSTEM]: ERROR_ACTIONS.SUPPORT,
  [ERROR_CATEGORIES.UNKNOWN]: ERROR_ACTIONS.SUPPORT,
} as const;
