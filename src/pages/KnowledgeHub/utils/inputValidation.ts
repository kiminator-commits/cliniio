import * as z from 'zod';
import * as yup from 'yup';
import { ContentStatus } from '../types';

// Validation schemas for user inputs
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .refine(
      (val) => val.trim().length > 0,
      'Search query cannot be empty'
    )
    .refine(
      (val) => val.length <= 1000,
      'Search query is too long'
    )
    .refine(
      (val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val),
      'Invalid characters detected'
    )
    .refine(
      (val) => val.trim().length > 0,
      'Search query cannot be only whitespace'
    )
    .refine(
      (val) => val.length <= 1000,
      'Search query cannot exceed 1000 characters'
    )
    .refine(
      (val) => /^[a-zA-Z0-9\s\-_.,!?()@]+$/.test(val),
      'Search query contains invalid characters'
    ),
});

export const statusUpdateSchema = yup.object({
  id: yup
    .string()
    .required('Content ID is required')
    .test('max-length', 'Content ID cannot exceed 50 characters', (value) => {
      return value ? value.length <= 50 : true;
    })
    .matches(/^[a-zA-Z0-9\-_]+$/, 'Invalid content ID format'),
  status: yup
    .string()
    .oneOf(['Not Started', 'In Progress', 'Completed'] as const)
    .required('Status is required'),
});

export const filterSchema = yup.object({
  statusFilter: yup
    .string()
    .oneOf(['all', 'Not Started', 'In Progress', 'Completed'])
    .required('Status filter is required'),
  categoryFilter: yup
    .string()
    .oneOf([
      'all',
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ])
    .required('Category filter is required'),
});

// Input sanitization functions
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .substring(0, 100); // Limit length
};

export const sanitizeContentId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9\-_]/g, ''); // Only allow alphanumeric, hyphens, and underscores
};

// Validation functions
export const validateSearchQuery = (
  query: string
): { isValid: boolean; error?: string } => {
  try {
    searchQuerySchema.parse({ query });
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Validation failed' };
  }
};

export const validateStatusUpdate = (
  id: string,
  status: string
): { isValid: boolean; error?: string } => {
  try {
    statusUpdateSchema.validateSync({ id, status });
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as yup.ValidationError).message };
  }
};

export const validateFilter = (
  statusFilter: string,
  categoryFilter: string
): { isValid: boolean; error?: string } => {
  try {
    filterSchema.validateSync({ statusFilter, categoryFilter });
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as yup.ValidationError).message };
  }
};

// Rate limiting for user inputs
export const inputRateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),

  checkLimit(userId: string, operation: string): boolean {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, lastAttempt: 0 };

    // Reset if more than 1 minute has passed
    if (now - record.lastAttempt > 60000) {
      record.count = 0;
    }

    // Check if limit exceeded (10 attempts per minute)
    if (record.count >= 10) {
      return false;
    }

    // Update record
    record.count++;
    record.lastAttempt = now;
    this.attempts.set(key, record);

    return true;
  },

  resetLimit(userId: string, operation: string): void {
    const key = `${userId}:${operation}`;
    this.attempts.delete(key);
  },
};

// Define return types for validation functions
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SearchValidationResult extends ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedQuery?: string;
}

export interface StatusUpdateValidationResult extends ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedId?: string;
  status?: ContentStatus;
}

// Input validation hooks
export const useInputValidation = () => {
  const validateAndSanitizeSearch = (
    query: string,
    userId: string
  ): SearchValidationResult => {
    // Check rate limit
    if (!inputRateLimiter.checkLimit(userId, 'search')) {
      return {
        isValid: false,
        error: 'Too many search attempts. Please wait a moment.',
      };
    }

    // Validate input
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return validation;
    }

    // Sanitize input
    const sanitizedQuery = sanitizeSearchQuery(query);
    return { isValid: true, sanitizedQuery };
  };

  const validateAndSanitizeStatusUpdate = (
    id: string,
    status: string,
    userId: string
  ): StatusUpdateValidationResult => {
    // Check rate limit
    if (!inputRateLimiter.checkLimit(userId, 'status_update')) {
      return {
        isValid: false,
        error: 'Too many status update attempts. Please wait a moment.',
      };
    }

    // Validate input
    const validation = validateStatusUpdate(id, status);
    if (!validation.isValid) {
      return validation;
    }

    // Sanitize input
    const sanitizedId = sanitizeContentId(id);
    return { isValid: true, sanitizedId, status: status as ContentStatus };
  };

  return {
    validateAndSanitizeSearch,
    validateAndSanitizeStatusUpdate,
  };
};
