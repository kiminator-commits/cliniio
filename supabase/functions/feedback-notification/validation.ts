// Input validation and sanitization
export interface FeedbackInput {
  feedback_id: string;
  feedback_type: string;
  title: string;
  priority: string;
  facility_name?: string;
}

export interface ValidationResult {
  isValid: boolean;
  data?: FeedbackInput;
  errors: string[];
}

// Sanitize string input
export const sanitizeString = (
  input: any,
  maxLength: number = 1000
): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .substring(0, maxLength);
};

// Validate feedback ID
export const validateFeedbackId = (id: any): boolean => {
  if (typeof id !== 'string') return false;
  // UUID v4 format or alphanumeric with hyphens
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const alphanumericRegex = /^[a-zA-Z0-9-_]{1,50}$/;
  return uuidRegex.test(id) || alphanumericRegex.test(id);
};

// Validate feedback type
export const validateFeedbackType = (type: any): boolean => {
  if (typeof type !== 'string') return false;
  const validTypes = [
    'bug',
    'feature',
    'improvement',
    'question',
    'complaint',
    'other',
  ];
  return validTypes.includes(type.toLowerCase());
};

// Validate priority
export const validatePriority = (priority: any): boolean => {
  if (typeof priority !== 'string') return false;
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  return validPriorities.includes(priority.toLowerCase());
};

// Validate facility name
export const validateFacilityName = (name: any): boolean => {
  if (name === null || name === undefined) return true; // Optional field
  if (typeof name !== 'string') return false;
  // Allow alphanumeric, spaces, hyphens, apostrophes, and periods
  const facilityRegex = /^[a-zA-Z0-9\s\-'\.]{1,100}$/;
  return facilityRegex.test(name);
};

// Comprehensive input validation
export const validateFeedbackInput = (input: any): ValidationResult => {
  const errors: string[] = [];

  // Check if input is an object
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid input: Expected JSON object'],
    };
  }

  // Validate required fields
  if (!input.feedback_id) {
    errors.push('Missing required field: feedback_id');
  } else if (!validateFeedbackId(input.feedback_id)) {
    errors.push('Invalid feedback_id format');
  }

  if (!input.feedback_type) {
    errors.push('Missing required field: feedback_type');
  } else if (!validateFeedbackType(input.feedback_type)) {
    errors.push(
      'Invalid feedback_type. Must be one of: bug, feature, improvement, question, complaint, other'
    );
  }

  if (!input.title) {
    errors.push('Missing required field: title');
  } else if (
    typeof input.title !== 'string' ||
    input.title.trim().length === 0
  ) {
    errors.push('Invalid title: Must be a non-empty string');
  } else if (input.title.length > 200) {
    errors.push('Invalid title: Must be 200 characters or less');
  }

  if (!input.priority) {
    errors.push('Missing required field: priority');
  } else if (!validatePriority(input.priority)) {
    errors.push(
      'Invalid priority. Must be one of: low, medium, high, critical'
    );
  }

  // Validate optional fields
  if (
    input.facility_name !== undefined &&
    !validateFacilityName(input.facility_name)
  ) {
    errors.push('Invalid facility_name format');
  }

  // Check for unexpected fields
  const allowedFields = [
    'feedback_id',
    'feedback_type',
    'title',
    'priority',
    'facility_name',
  ];
  const unexpectedFields = Object.keys(input).filter(
    (key) => !allowedFields.includes(key)
  );
  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields detected: ${unexpectedFields.join(', ')}`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Sanitize and return validated data
  return {
    isValid: true,
    data: {
      feedback_id: sanitizeString(input.feedback_id, 50),
      feedback_type: sanitizeString(input.feedback_type, 20).toLowerCase(),
      title: sanitizeString(input.title, 200),
      priority: sanitizeString(input.priority, 20).toLowerCase(),
      facility_name: input.facility_name
        ? sanitizeString(input.facility_name, 100)
        : undefined,
    },
  };
};
