// Type Safety Utilities for Legacy Code Migration
// Provides safe property access and type assertions for gradual migration

// ============================================================================
// SAFE PROPERTY ACCESS UTILITIES
// ============================================================================

/**
 * Safely access a property on an object, returning undefined if not found
 */
export function safeGet<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }

  return current as T;
}

/**
 * Safely access a property with type assertion
 */
export function safeGetAs<T>(obj: unknown, path: string, defaultValue: T): T {
  const value = safeGet(obj, path, defaultValue);
  return value as T;
}

/**
 * Check if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return obj !== null && typeof obj === 'object' && key in obj;
}

/**
 * Safely access array elements
 */
export function safeArrayAccess<T>(
  arr: unknown,
  index: number,
  defaultValue?: T
): T | undefined {
  if (Array.isArray(arr) && index >= 0 && index < arr.length) {
    return arr[index] as T;
  }
  return defaultValue;
}

// ============================================================================
// TYPE ASSERTION UTILITIES
// ============================================================================

/**
 * Type assertion with runtime check
 */
export function assertType<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  errorMessage?: string
): T {
  if (!typeGuard(value)) {
    throw new Error(
      errorMessage || `Expected value to be of type ${typeof value}`
    );
  }
  return value;
}

/**
 * Safe type assertion that returns default if assertion fails
 */
export function safeAssertType<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  defaultValue: T
): T {
  return typeGuard(value) ? value : defaultValue;
}

// ============================================================================
// COMMON TYPE GUARDS
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

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// ============================================================================
// LEGACY CODE HELPERS
// ============================================================================

/**
 * Suppress TypeScript errors for legacy code during migration
 * Use sparingly and add TODO comments for future fixes
 */
export function legacySuppress<T>(value: T): T {
  return value;
}

/**
 * Type assertion for unknown values from external APIs
 */
export function asUnknownRecord(value: unknown): Record<string, unknown> {
  return (value as Record<string, unknown>) || {};
}

/**
 * Type assertion for unknown arrays
 */
export function asUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safe JSON parsing with fallback
 */
export function safeJsonParse<T = unknown>(
  jsonString: string,
  defaultValue: T
): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// INVENTORY SPECIFIC HELPERS
// ============================================================================

/**
 * Safely access inventory item properties
 */
export function safeInventoryProperty<T>(
  item: unknown,
  property: string,
  defaultValue: T
): T {
  if (!isObject(item)) {
    return defaultValue;
  }

  // Handle nested properties in data field
  if (property.includes('.') && hasProperty(item, 'data')) {
    return safeGetAs(item.data, property, defaultValue);
  }

  // Handle direct properties
  if (hasProperty(item, property)) {
    return item[property] as T;
  }

  return defaultValue;
}

/**
 * Type guard for inventory items
 */
export function isInventoryItem(
  value: unknown
): value is Record<string, unknown> {
  return isObject(value) && hasProperty(value, 'id');
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Wrap functions to catch and handle type errors gracefully
 */
export function withTypeSafety<T extends unknown[], R>(
  fn: (...args: T) => R,
  fallback: R,
  errorHandler?: (error: Error) => void
) {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      }
      return fallback;
    }
  };
}

/**
 * Create a safe property accessor
 */
export function createSafeAccessor<T>(
  obj: unknown,
  fallback: T
): (path: string) => T {
  return (path: string) => safeGetAs(obj, path, fallback);
}
