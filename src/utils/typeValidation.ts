// Type Validation Utilities
// Provides runtime type checking and validation for external data

import { Json } from '../types/supabase/generated';

// ============================================================================
// BASIC TYPE GUARDS
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// ============================================================================
// JSON TYPE VALIDATION
// ============================================================================

export function isValidJson(value: unknown): value is Json {
  if (isString(value) || isNumber(value) || isBoolean(value) || isNull(value)) {
    return true;
  }

  if (isArray(value)) {
    return value.every((item) => isValidJson(item));
  }

  if (isObject(value)) {
    return Object.values(value).every((val) => isValidJson(val));
  }

  return false;
}

// ============================================================================
// DATABASE ROW VALIDATION
// ============================================================================

export function validateDatabaseRow<T extends Record<string, unknown>>(
  data: unknown,
  requiredFields: (keyof T)[]
): data is T {
  if (!isObject(data)) {
    return false;
  }

  return requiredFields.every((field) => field in data);
}

// ============================================================================
// SAFE PROPERTY ACCESS
// ============================================================================

export function safeGet<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: T
): T {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current as T;
}

export function safeGetString(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: string = ''
): string {
  const value = safeGet(obj, path, defaultValue);
  return isString(value) ? value : defaultValue;
}

export function safeGetNumber(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: number = 0
): number {
  const value = safeGet(obj, path, defaultValue);
  return isNumber(value) ? value : defaultValue;
}

export function safeGetBoolean(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: boolean = false
): boolean {
  const value = safeGet(obj, path, defaultValue);
  return isBoolean(value) ? value : defaultValue;
}

// ============================================================================
// ARRAY VALIDATION
// ============================================================================

export function validateArray<T>(
  value: unknown,
  validator: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(validator);
}

// ============================================================================
// API RESPONSE VALIDATION
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export function isValidApiResponse<T>(
  value: unknown,
  dataValidator?: (data: unknown) => data is T
): value is ApiResponse<T> {
  if (!isObject(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;

  // Check required fields
  if (!('data' in response) || !('error' in response)) {
    return false;
  }

  // Validate error field
  if (!isNull(response.error) && !isString(response.error)) {
    return false;
  }

  // Validate data field
  if (!isNull(response.data) && dataValidator) {
    return dataValidator(response.data);
  }

  return true;
}

// ============================================================================
// TYPE ASSERTION HELPERS
// ============================================================================

export function assertIsString(value: unknown, fieldName: string): string {
  if (!isString(value)) {
    throw new Error(
      `Expected ${fieldName} to be a string, got ${typeof value}`
    );
  }
  return value;
}

export function assertIsNumber(value: unknown, fieldName: string): number {
  if (!isNumber(value)) {
    throw new Error(
      `Expected ${fieldName} to be a number, got ${typeof value}`
    );
  }
  return value;
}

export function assertIsObject(
  value: unknown,
  fieldName: string
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(
      `Expected ${fieldName} to be an object, got ${typeof value}`
    );
  }
  return value;
}

export function assertIsArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown) => item is T
): T[] {
  if (!isArray(value)) {
    throw new Error(
      `Expected ${fieldName} to be an array, got ${typeof value}`
    );
  }

  if (itemValidator && !value.every(itemValidator)) {
    throw new Error(`Expected ${fieldName} to be an array of valid items`);
  }

  return value as T[];
}
