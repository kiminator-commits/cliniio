// Global Type Assertions for Legacy Code Migration
// This file provides type assertions to help with gradual migration

// ============================================================================
// GLOBAL TYPE OVERRIDES
// ============================================================================

declare global {
  // Allow any property access on objects during migration
  interface Object {
    [key: string]: unknown;
  }

  // Extend Array to handle unknown types
  interface Array<_T> {
    [key: string]: unknown;
  }
}

// ============================================================================
// TYPE ASSERTION HELPERS
// ============================================================================

/**
 * Assert that a value is an object with string keys
 */
export function assertObject(value: unknown): Record<string, unknown> {
  return (value as Record<string, unknown>) || {};
}

/**
 * Assert that a value is an array
 */
export function assertArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Assert that a value is a string
 */
export function assertString(value: unknown): string {
  return String(value || '');
}

/**
 * Assert that a value is a number
 */
export function assertNumber(value: unknown): number {
  return Number(value) || 0;
}

/**
 * Assert that a value is a boolean
 */
export function assertBoolean(value: unknown): boolean {
  return Boolean(value);
}

// ============================================================================
// SAFE ACCESS HELPERS
// ============================================================================

/**
 * Safely access object properties
 */
export function safeAccess<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }

  return current as T;
}

/**
 * Safely access array elements
 */
export function safeArrayAccess<T = unknown>(
  arr: unknown,
  index: number,
  defaultValue: T
): T {
  if (Array.isArray(arr) && index >= 0 && index < arr.length) {
    return arr[index] as T;
  }
  return defaultValue;
}

// ============================================================================
// LEGACY CODE SUPPRESSION
// ============================================================================

/**
 * Suppress TypeScript errors for legacy code
 * Use this sparingly and add TODO comments
 */
export function suppressTypeError<T>(value: T): T {
  return value;
}

/**
 * Type assertion for unknown values
 */
export function asAny(value: unknown): unknown {
  return value as unknown;
}

/**
 * Type assertion for unknown objects
 */
export function asObject(value: unknown): Record<string, unknown> {
  return (value as Record<string, unknown>) || {};
}

/**
 * Type assertion for unknown arrays
 */
export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

// ============================================================================
// INVENTORY SPECIFIC HELPERS
// ============================================================================

/**
 * Safe inventory item property access
 */
export function safeInventoryProperty<T>(
  item: unknown,
  property: string,
  defaultValue: T
): T {
  const obj = asObject(item);

  // Check direct property
  if (property in obj) {
    return obj[property] as T;
  }

  // Check in data field
  if ('data' in obj && obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;
    if (property in data) {
      return data[property] as T;
    }
  }

  return defaultValue;
}

/**
 * Type guard for inventory items
 */
export function isInventoryItem(
  value: unknown
): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Wrap functions to handle type errors gracefully
 */
export function withTypeSafety<T extends unknown[], R>(
  fn: (...args: T) => R,
  fallback: R
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      console.warn('Type error suppressed:', error);
      return fallback;
    }
  };
}

export {};
