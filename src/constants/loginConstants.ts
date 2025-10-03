// Login configuration and error messages

export const LOGIN_LABELS = {
  email: 'Email address',
  password: 'Password',
  rememberMe: 'Remember me',
  rememberDevice: 'Remember device',
  submit: 'Sign in',
  successMessage: 'Login successful!',
  invalidEmail: 'Please enter a valid email address.',
  invalidPassword: 'Password must be at least 6 characters long.',
  passwordStrength: 'Password strength: Good',
  loading: 'Loading...',
  authenticating: 'Authenticating...',
  verifying: 'Verifying credentials...',
  connecting: 'Connecting to server...',
  success: 'Login successful!',
} as const;

export const LOGIN_CONFIG = {
  PROGRESS_STEPS: {
    IDLE: 'idle',
    CONNECTING: 'connecting',
    AUTHENTICATING: 'authenticating',
    VERIFYING: 'verifying',
    SUCCESS: 'success',
  },
  REDIRECT_DELAY_MS: 1000,
  MIN_PASSWORD_LENGTH: 6,
  OTP_LENGTH: 6,
};

export const LOGIN_ERRORS = {
  invalidCredentials: 'Invalid email or password. Please try again.',
  unexpectedError: 'An unexpected error occurred. Please try again.',
  networkError: 'Network error. Please check your connection and try again.',
  accountLocked: 'Account temporarily locked due to multiple failed attempts.',
  invalidEmail: 'Please enter a valid email address.',
  invalidPassword: 'Password must be at least 6 characters long.',
  offline: 'You are currently offline. Please check your internet connection.',
  userNotFound: 'User not found. Please check your email address.',
  weakPassword: 'Password is too weak. Please choose a stronger password.',
  emailNotConfirmed:
    'Email not confirmed. Please check your inbox and confirm your email.',
  tooManyRequests: 'Too many login attempts. Please try again later.',
  serverError: 'Server error. Please try again later.',
  sessionExpired: 'Session expired. Please log in again.',
  accountLockedTemporary: 'Account temporarily locked. Please try again later.',
};
