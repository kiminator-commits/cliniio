// ============================================================================
// SIMPLE INVENTORY ERROR HANDLER
// ============================================================================

/**
 * Simple error handler for inventory operations
 * Uses direct throws instead of complex wrappers
 */
export class InventoryErrorHandler {
  /**
   * Handle an operation with simple error handling
   */
  static async handleOperation<T>(
    operation: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await operationFn();
    } catch (error) {
      console.error(`❌ ${operation} failed:`, error);
      throw error; // Let caller handle
    }
  }

  /**
   * Execute operation with simple retry logic
   */
  static async executeWithRetry<T>(
    operation: string,
    operationFn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operationFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error;
        }

        // Log retry attempt
        console.warn(
          `Retry attempt ${attempt}/${maxAttempts} for operation: ${operation}`
        );

        // Simple delay before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('Operation failed after all retry attempts');
  }

  /**
   * Simple delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
