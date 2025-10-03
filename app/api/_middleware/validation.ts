import { NextResponse } from 'next/server';
import { logger } from '@/utils/_core/logger';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: unknown;
}

/**
 * Validates facility_id format and content
 */
export function validateFacilityId(facilityId: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof facilityId !== 'string') {
    errors.push({
      field: 'facility_id',
      message: 'Facility ID must be a string',
      value: facilityId,
    });
    return { isValid: false, errors };
  }

  // UUID v4 format validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(facilityId)) {
    errors.push({
      field: 'facility_id',
      message: 'Facility ID must be a valid UUID v4 format',
      value: facilityId,
    });
  }

  // Length validation
  if (facilityId.length !== 36) {
    errors.push({
      field: 'facility_id',
      message: 'Facility ID must be exactly 36 characters',
      value: facilityId,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? facilityId.trim() : null,
  };
}

/**
 * Validates the complete request body for dev seeding
 */
export function validateSeedRequest(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if body is an object
  if (typeof body !== 'object' || body === null) {
    errors.push({
      field: 'body',
      message: 'Request body must be a valid JSON object',
      value: body,
    });
    return { isValid: false, errors };
  }

  const bodyObj = body as Record<string, unknown>;
  const sanitizedData: Record<string, unknown> = {};

  // Validate facility_id if provided
  if ('facility_id' in bodyObj) {
    const facilityValidation = validateFacilityId(bodyObj.facility_id);
    if (!facilityValidation.isValid) {
      errors.push(...facilityValidation.errors);
    } else {
      sanitizedData.facility_id = facilityValidation.sanitizedData;
    }
  }

  // Check for unexpected fields
  const allowedFields = ['facility_id'];
  const unexpectedFields = Object.keys(bodyObj).filter(
    (key) => !allowedFields.includes(key)
  );

  if (unexpectedFields.length > 0) {
    errors.push({
      field: 'body',
      message: `Unexpected fields found: ${unexpectedFields.join(', ')}. Only 'facility_id' is allowed.`,
      value: unexpectedFields,
    });
  }

  // If no facility_id provided, use default (this is allowed)
  if (!('facility_id' in bodyObj)) {
    sanitizedData.facility_id = null; // Will use default
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : null,
  };
}

/**
 * Creates a standardized validation error response
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  endpoint: string
): NextResponse {
  logger.warn('API: Validation failed', {
    endpoint,
    errors: errors.map((e) => ({ field: e.field, message: e.message })),
  });

  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors.map((e) => ({
        field: e.field,
        message: e.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Sanitizes string input to prevent injection attacks
 */
export function sanitizeString(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>"'%;()&+]/g, '') // Remove common injection characters
    .substring(0, 1000); // Limit length
}
