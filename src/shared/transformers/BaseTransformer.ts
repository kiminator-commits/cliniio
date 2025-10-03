/**
 * Shared transformation utilities for consistent data handling across modules
 * Provides safe type conversion and common field mapping patterns
 */

/**
 * Safe type conversion utilities to prevent data loss
 */
export const safeString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const safeNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0;
};

export const safeBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false;
};

export const safeStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
};

export const safeDate = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return '';
};

export const safeRecord = (value: unknown): Record<string, unknown> => {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
};

/**
 * Common field mapping patterns
 */
export const mapTimestampFields = (data: Record<string, unknown>) => ({
  createdAt: safeString(data.created_at || data.createdAt),
  updatedAt: safeString(data.updated_at || data.updatedAt || data.last_updated),
});

export const mapIdFields = (data: Record<string, unknown>) => ({
  id: safeString(data.id),
});

export const mapNameFields = (data: Record<string, unknown>) => ({
  name: safeString(data.name || data.title),
  title: safeString(data.title || data.name),
});

export const mapDescriptionFields = (data: Record<string, unknown>) => ({
  description: safeString(data.description || data.summary || data.content),
  summary: safeString(data.summary || data.description),
});

/**
 * Base transformer class with common functionality
 */
export abstract class BaseTransformer {
  /**
   * Transform from database format to internal format
   */
  static transformFromDatabase(): Record<string, unknown> {
    // Base implementation - override in subclasses
    return {};
  }

  /**
   * Transform from internal format to database format
   */
  static transformToDatabase(): Record<string, unknown> {
    // Base implementation - override in subclasses
    return {};
  }

  /**
   * Validate transformation data
   */
  static validateData(data: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Data is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize data for transformation
   */
  static sanitizeData<T>(data: Partial<T>): Partial<T> {
    // Remove undefined values and null values
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );
    return sanitized as Partial<T>;
  }

  static transformArray<T>(items: T[]): T[] {
    return items.map(() => ({}) as T);
  }
}
