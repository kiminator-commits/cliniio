// Validation rules and error messages
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIMEZONE: /^[A-Za-z_]+(\/[A-Za-z_]+)*$/,
  LANGUAGE: /^[a-z]{2}(-[A-Z]{2})?$/,
};

// Validation rules for basic info form
export const BASIC_INFO_VALIDATION_RULES: ValidationRules = {
  first_name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  last_name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.EMAIL,
  },
  phone: {
    pattern: VALIDATION_PATTERNS.PHONE,
    custom: (value) => {
      if (
        value &&
        !VALIDATION_PATTERNS.PHONE.test(
          (value as string).replace(/[\s\-()]/g, '')
        )
      ) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
  },
  department: {
    maxLength: 100,
  },
  position: {
    maxLength: 100,
  },
  date_of_birth: {
    pattern: VALIDATION_PATTERNS.DATE,
    custom: (value) => {
      if (value && typeof value === 'string') {
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();

        if (date > now) {
          return 'Date of birth cannot be in the future';
        }
        if (age > 120) {
          return 'Please enter a valid date of birth';
        }
      }
      return null;
    },
  },
  bio: {
    maxLength: 500,
  },
  preferred_language: {
    pattern: VALIDATION_PATTERNS.LANGUAGE,
  },
  timezone: {
    pattern: VALIDATION_PATTERNS.TIMEZONE,
  },
};

// Validation rules for preferences form
export const PREFERENCES_VALIDATION_RULES: ValidationRules = {
  theme: {
    required: true,
    custom: (value) => {
      const validThemes = ['light', 'dark', 'auto'];
      if (typeof value !== 'string' || !validThemes.includes(value)) {
        return 'Please select a valid theme';
      }
      return null;
    },
  },
  'notifications.push': {
    custom: (value) => {
      if (typeof value !== 'boolean') {
        return 'Push notifications must be enabled or disabled';
      }
      return null;
    },
  },
  'notifications.sound': {
    custom: (value) => {
      const validSounds = ['gentle-chime', 'notification', 'bell', 'none'];
      if (typeof value !== 'string' || !validSounds.includes(value)) {
        return 'Please select a valid sound';
      }
      return null;
    },
  },
  'notifications.volume': {
    custom: (value) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        return 'Volume must be between 0 and 100';
      }
      return null;
    },
  },
  'notifications.vibration': {
    custom: (value) => {
      const validVibrations = ['short-pulse', 'long-pulse', 'pattern', 'none'];
      if (typeof value !== 'string' || !validVibrations.includes(value)) {
        return 'Please select a valid vibration pattern';
      }
      return null;
    },
  },
  'notifications.vibrationEnabled': {
    custom: (value) => {
      if (typeof value !== 'boolean') {
        return 'Vibration must be enabled or disabled';
      }
      return null;
    },
  },
};

// Main validation function
export function validateForm(
  data: Record<string, unknown>,
  rules: ValidationRules
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = getNestedValue(data, field);
    const error = validateField(value, rule, field);

    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

// Validate a single field
function validateField(
  value: unknown,
  rule: ValidationRule,
  fieldName: string
): string | null {
  // Required check
  if (rule.required && (!value || value.toString().trim() === '')) {
    return `${getFieldDisplayName(fieldName)} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null;
  }

  // Min length check
  if (rule.minLength && value.toString().length < rule.minLength) {
    return `${getFieldDisplayName(fieldName)} must be at least ${rule.minLength} characters`;
  }

  // Max length check
  if (rule.maxLength && value.toString().length > rule.maxLength) {
    return `${getFieldDisplayName(fieldName)} must be no more than ${rule.maxLength} characters`;
  }

  // Pattern check
  if (rule.pattern && !rule.pattern.test(value.toString())) {
    return `${getFieldDisplayName(fieldName)} format is invalid`;
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

// Get nested object values (e.g., 'notifications.push' -> data.notifications.push)
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string): unknown => {
    return current &&
      typeof current === 'object' &&
      current !== null &&
      key in current
      ? (current as Record<string, unknown>)[key]
      : null;
  }, obj);
}

// Convert field names to display names
function getFieldDisplayName(fieldName: string): string {
  const displayNames: { [key: string]: string } = {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    phone: 'Phone number',
    department: 'Department',
    position: 'Position',
    date_of_birth: 'Date of birth',
    bio: 'Bio',
    preferred_language: 'Preferred language',
    timezone: 'Timezone',
    theme: 'Theme',
    'notifications.push': 'Push notifications',
    'notifications.sound': 'Notification sound',
    'notifications.volume': 'Volume',
    'notifications.vibration': 'Vibration pattern',
    'notifications.vibrationEnabled': 'Vibration',
  };

  return (
    displayNames[fieldName] ||
    fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

// Validate basic info form
export function validateBasicInfoForm(
  data: Record<string, unknown>
): ValidationErrors {
  return validateForm(data, BASIC_INFO_VALIDATION_RULES);
}

// Validate preferences form
export function validatePreferencesForm(
  data: Record<string, unknown>
): ValidationErrors {
  return validateForm(data, PREFERENCES_VALIDATION_RULES);
}

// Check if form is valid
export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

// Get first error message
export function getFirstErrorMessage(errors: ValidationErrors): string | null {
  const firstErrorKey = Object.keys(errors)[0];
  return firstErrorKey ? errors[firstErrorKey] : null;
}

// Format validation errors for display
export function formatValidationErrors(errors: ValidationErrors): string[] {
  return Object.values(errors);
}
