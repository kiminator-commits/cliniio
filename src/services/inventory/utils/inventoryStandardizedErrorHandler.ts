/**
 * Simple error handling for Inventory services
 * Standardizes error handling without over-engineering
 */
export class InventoryStandardizedErrorHandler {
  /**
   * Handle operation errors consistently - just throw them
   */
  static handleOperationError(
    error: unknown,
    operation: string,
    defaultMessage: string = 'Operation failed'
  ): never {
    console.error(`❌ ${operation} failed:`, error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`${operation}: ${defaultMessage}`);
  }

  /**
   * Handle validation errors - throw with clear message
   */
  static handleValidationError(field: string, message: string): never {
    throw new Error(`Validation error for ${field}: ${message}`);
  }

  /**
   * Handle database errors - throw with context
   */
  static handleDatabaseError(error: unknown, operation: string): never {
    console.error(`❌ Database error in ${operation}:`, error);

    if (error instanceof Error) {
      throw new Error(`Database operation failed: ${error.message}`);
    }

    throw new Error(`Database operation failed: ${operation}`);
  }

  /**
   * Handle network errors - throw with retry suggestion
   */
  static handleNetworkError(error: unknown, operation: string): never {
    console.error(`❌ Network error in ${operation}:`, error);
    throw new Error(
      `Network error in ${operation}. Please check your connection and try again.`
    );
  }

  /**
   * Simple validation helpers
   */
  static validateRequired(value: unknown, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName} is required`);
    }
  }

  static validateStringLength(
    value: string,
    fieldName: string,
    maxLength: number
  ): void {
    if (value.length > maxLength) {
      throw new Error(`${fieldName} must be ${maxLength} characters or less`);
    }
  }

  static validateNumericRange(
    value: number,
    fieldName: string,
    min: number,
    max: number
  ): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
  }
}
