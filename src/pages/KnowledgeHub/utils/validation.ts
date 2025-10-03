import {
  ContentItem,
  RecentUpdate,
  contentItemSchema,
  recentUpdateSchema,
} from '../types';
import * as yup from 'yup';

// Security constants
const MAX_INPUT_LENGTH = 1000;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
];

/**
 * Sanitizes input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  // eslint-disable-next-line no-control-regex
  let sanitized = input.replace(/[\u0000-\u001F\u007F]/g, '');

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // HTML entity encoding for special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Limit length
  return sanitized.slice(0, MAX_INPUT_LENGTH);
};

/**
 * Sanitizes search query with additional security measures
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') {
    return '';
  }

  // Basic sanitization
  let sanitized = sanitizeInput(query);

  // Remove SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
  ];

  sqlPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized.slice(0, 100); // Limit search query length
};

/**
 * Validates a single content item and returns validation result
 */
export const validateSingleContentItem = (
  data: unknown
): { isValid: boolean; errors?: string[] } => {
  try {
    // Pre-validation sanitization
    if (data && typeof data === 'object') {
      const sanitizedData = { ...data } as Record<string, unknown>;

      if (typeof sanitizedData.title === 'string') {
        sanitizedData.title = sanitizeInput(sanitizedData.title).slice(
          0,
          MAX_TITLE_LENGTH
        );
      }

      if (typeof sanitizedData.description === 'string') {
        sanitizedData.description = sanitizeInput(
          sanitizedData.description
        ).slice(0, MAX_DESCRIPTION_LENGTH);
      }

      data = sanitizedData;
    }

    contentItemSchema.validateSync(data, { abortEarly: false });
    return { isValid: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'inner' in error) {
      const errors = (error as { inner: Array<{ message: string }> }).inner.map(
        (err) => err.message
      );
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [(error as Error).message] };
  }
};

/**
 * Validates an array of content items and returns validation result
 */
export const validateContentItems = (
  data: unknown[]
): {
  isValid: boolean;
  validItems: ContentItem[];
  invalidItems: { index: number; errors: string[] }[];
} => {
  const validItems: ContentItem[] = [];
  const invalidItems: { index: number; errors: string[] }[] = [];

  data.forEach((item, index) => {
    const result = validateSingleContentItem(item);
    if (result.isValid) {
      validItems.push(item as ContentItem);
    } else {
      invalidItems.push({ index, errors: result.errors || [] });
    }
  });

  return {
    isValid: invalidItems.length === 0,
    validItems,
    invalidItems,
  };
};

/**
 * Validates a single recent update and returns validation result
 */
export const validateSingleRecentUpdate = (
  data: unknown
): { isValid: boolean; errors?: string[] } => {
  try {
    // Pre-validation sanitization
    if (data && typeof data === 'object') {
      const sanitizedData = { ...data } as Record<string, unknown>;

      if (typeof sanitizedData.title === 'string') {
        sanitizedData.title = sanitizeInput(sanitizedData.title).slice(
          0,
          MAX_TITLE_LENGTH
        );
      }

      data = sanitizedData;
    }

    recentUpdateSchema.validateSync(data, { abortEarly: false });
    return { isValid: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'inner' in error) {
      const errors = (error as { inner: Array<{ message: string }> }).inner.map(
        (err) => err.message
      );
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [(error as Error).message] };
  }
};

/**
 * Validates an array of recent updates and returns validation result
 */
export const validateRecentUpdates = (
  data: unknown[]
): {
  isValid: boolean;
  validItems: RecentUpdate[];
  invalidItems: { index: number; errors: string[] }[];
} => {
  const validItems: RecentUpdate[] = [];
  const invalidItems: { index: number; errors: string[] }[] = [];

  data.forEach((item, index) => {
    const result = validateSingleRecentUpdate(item);
    if (result.isValid) {
      validItems.push(item as RecentUpdate);
    } else {
      invalidItems.push({ index, errors: result.errors || [] });
    }
  });

  return {
    isValid: invalidItems.length === 0,
    validItems,
    invalidItems,
  };
};

/**
 * Sanitizes and validates content item data from API
 */
export const sanitizeContentItem = (
  data: Record<string, unknown>
): ContentItem | null => {
  try {
    // Comprehensive sanitization
    const sanitized = {
      id: String(data.id || '').trim(),
      title: sanitizeInput(String(data.title || ''))
        .trim()
        .slice(0, MAX_TITLE_LENGTH),
      category: String(data.category || 'Courses'),
      status: String(data.status || 'draft'),
      dueDate: String(data.dueDate || ''),
      progress: Number(data.progress || 0),
      department: data.department
        ? sanitizeInput(String(data.department)).trim()
        : undefined,
      lastUpdated: data.lastUpdated ? String(data.lastUpdated) : undefined,
      description: data.description
        ? sanitizeInput(String(data.description)).slice(
            0,
            MAX_DESCRIPTION_LENGTH
          )
        : undefined,
    };

    // Validate the sanitized data
    return validateContentItem(sanitized);
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Sanitizes and validates recent update data from API
 */
export const sanitizeRecentUpdate = (
  data: Record<string, unknown>
): RecentUpdate | null => {
  try {
    // Comprehensive sanitization
    const sanitized = {
      type: String(data.type || 'new'),
      title: sanitizeInput(String(data.title || ''))
        .trim()
        .slice(0, MAX_TITLE_LENGTH),
      icon: data.icon,
      time: String(data.time || ''),
    };

    // Validate the sanitized data
    return validateRecentUpdate(sanitized);
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Type guard for checking if data is a valid content item
 */
export const isContentItem = (data: unknown): data is ContentItem => {
  return isValidContentItem(data);
};

/**
 * Type guard for checking if data is a valid recent update
 */
export const isRecentUpdate = (data: unknown): data is RecentUpdate => {
  return isValidRecentUpdate(data);
};

// Enhanced validation schemas for user-generated content
export const userContentValidationSchema = yup.object({
  id: yup.string().required('ID is required').min(1, 'ID cannot be empty'),

  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters')
    .trim(),

  category: yup
    .string()
    .oneOf([
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ] as const)
    .required('Category is required'),

  status: yup
    .string()
    .oneOf(['draft', 'review', 'published', 'archived'] as const)
    .required('Status is required'),

  dueDate: yup
    .string()
    .required('Due date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),

  progress: yup
    .mixed()
    .required('Progress is required')
    .transform((value) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    })
    .test('range', 'Progress must be between 0 and 100', function (value) {
      const num = Number(value);
      return num >= 0 && num <= 100;
    }),

  department: yup
    .string()
    .optional()
    .max(100, 'Department name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Department contains invalid characters'),

  description: yup
    .string()
    .optional()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`
    )
    .matches(
      /^[a-zA-Z0-9\s\-_.,!?()\n\r]+$/,
      'Description contains invalid characters'
    ),
});

// Validation for content updates
export const contentUpdateValidationSchema = yup.object({
  id: yup
    .string()
    .required('Content ID is required')
    .uuid('Invalid content ID'),
  status: yup
    .string()
    .oneOf(['Not Started', 'In Progress', 'Completed'] as const)
    .required('Status is required'),
  progress: yup
    .number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100')
    .integer('Progress must be a whole number'),
});

// Validation for search queries
export const searchQueryValidationSchema = yup.object({
  query: yup
    .string()
    .max(100, 'Search query cannot exceed 100 characters')
    .matches(
      /^[a-zA-Z0-9\s\-_.,!?()]+$/,
      'Search query contains invalid characters'
    ),
  category: yup
    .string()
    .oneOf([
      'all',
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ] as const)
    .optional(),
});

// Validation for bulk operations
export const bulkOperationValidationSchema = yup.object({
  itemIds: yup
    .array()
    .of(yup.string().uuid('Invalid item ID'))
    .min(1, 'At least one item must be selected')
    .max(100, 'Cannot process more than 100 items at once'),
  operation: yup
    .string()
    .oneOf(['delete', 'updateStatus', 'export'] as const)
    .required('Operation type is required'),
});

// Rate limiting utility
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(userId: string, operation: string): boolean {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  resetLimit(userId: string, operation: string): void {
    const key = `${userId}:${operation}`;
    this.requests.delete(key);
  }
}

// Export rate limiter instance
export const rateLimiter = new RateLimiter();

// Validation functions
export const validateContentItem = (data: unknown): ContentItem | null => {
  try {
    return userContentValidationSchema.validateSync(data) as ContentItem;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const validateContentUpdate = (data: unknown) => {
  return userContentValidationSchema.validateSync(data);
};

export const validateSearchQuery = (data: unknown) => {
  return yup.string().max(100).validateSync(data);
};

export const validateBulkOperation = (data: unknown) => {
  return yup.array().of(yup.string()).max(100).validateSync(data);
};

export const validateRecentUpdate = (data: unknown): RecentUpdate => {
  return recentUpdateSchema.validateSync(data) as RecentUpdate;
};

export const isValidContentItem = (data: unknown): data is ContentItem => {
  try {
    userContentValidationSchema.validateSync(data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const isValidContentUpdate = (data: unknown): boolean => {
  try {
    userContentValidationSchema.validateSync(data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const isValidRecentUpdate = (data: unknown): boolean => {
  try {
    recentUpdateSchema.validateSync(data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const formatValidationError = (error: yup.ValidationError): string => {
  return error.errors.join(', ');
};
