// Input validation for authentication requests
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface LoginRequest {
  email: string;
  password: string;
  csrfToken?: string;
  rememberMe?: boolean;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password',
  '123456',
  'password123',
  'admin',
  'qwerty',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'hello',
  'login',
  'princess',
  'qwertyuiop',
  'solo',
  'passw0rd',
  'starwars',
];

function validateEmail(email: string): string[] {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return errors;
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    errors.push('Email cannot be empty');
  } else if (trimmedEmail.length > 254) {
    errors.push('Email is too long');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push('Invalid email format');
  } else if (trimmedEmail.includes('..')) {
    errors.push('Email contains invalid characters');
  } else if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    errors.push('Email cannot start or end with a dot');
  }

  return errors;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(
      `Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`
    );
  }

  // Check for common weak passwords
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.includes(lowerPassword)) {
    errors.push('Password is too common and easily guessable');
  }

  // Check for basic password strength
  let strengthScore = 0;

  if (/[a-z]/.test(password)) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[0-9]/.test(password)) strengthScore++;
  if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

  if (strengthScore < 3) {
    errors.push(
      'Password must contain at least 3 of: lowercase, uppercase, numbers, special characters'
    );
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
  }

  // Check for sequential patterns
  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    errors.push('Password contains sequential patterns');
  }

  return errors;
}

function validateCSRFToken(token: string | undefined): string[] {
  const errors: string[] = [];

  if (!token) {
    errors.push('CSRF token is required');
    return errors;
  }

  if (typeof token !== 'string') {
    errors.push('CSRF token must be a string');
    return errors;
  }

  if (token.length < 32) {
    errors.push('CSRF token is too short');
  }

  if (token.length > 128) {
    errors.push('CSRF token is too long');
  }

  // Check for valid base64-like format
  if (!/^[a-zA-Z0-9+/=_-]+$/.test(token)) {
    errors.push('CSRF token contains invalid characters');
  }

  return errors;
}

function validateRememberMe(rememberMe: boolean | undefined): string[] {
  const errors: string[] = [];

  if (rememberMe !== undefined && typeof rememberMe !== 'boolean') {
    errors.push('Remember me must be a boolean value');
  }

  return errors;
}

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function validateLoginInput(request: LoginRequest): ValidationResult {
  const errors: string[] = [];

  // Validate email
  const emailErrors = validateEmail(request.email);
  errors.push(...emailErrors);

  // Validate password
  const passwordErrors = validatePassword(request.password);
  errors.push(...passwordErrors);

  // Validate CSRF token
  const csrfErrors = validateCSRFToken(request.csrfToken);
  errors.push(...csrfErrors);

  // Validate remember me
  const rememberMeErrors = validateRememberMe(request.rememberMe);
  errors.push(...rememberMeErrors);

  // Additional security checks
  if (request.email && request.password) {
    // Check if email and password are the same
    if (request.email.toLowerCase().trim() === request.password.toLowerCase()) {
      errors.push('Email and password cannot be the same');
    }

    // Check if password contains the email
    const emailLocalPart = request.email.split('@')[0].toLowerCase();
    if (request.password.toLowerCase().includes(emailLocalPart)) {
      errors.push('Password should not contain your email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeLoginRequest(request: LoginRequest): LoginRequest {
  return {
    email: sanitizeInput(request.email),
    password: request.password, // Don't sanitize password as it might contain special chars
    csrfToken: request.csrfToken ? sanitizeInput(request.csrfToken) : undefined,
    rememberMe: request.rememberMe,
  };
}
