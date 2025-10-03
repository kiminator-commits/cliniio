// ============================================================================
// SIMPLE INVENTORY ERROR SERVICE
// ============================================================================

/**
 * Simple error service for inventory operations
 * Uses direct throws instead of complex error handling
 */
export class InventoryErrorService {
  private static instance: InventoryErrorService;

  private constructor() {}

  public static getInstance(): InventoryErrorService {
    if (!InventoryErrorService.instance) {
      InventoryErrorService.instance = new InventoryErrorService();
    }
    return InventoryErrorService.instance;
  }

  /**
   * Handle CRUD operation errors - just throw them
   */
  handleCrudError(
    operation: string,
    error: Error,
    context?: Record<string, unknown>
  ): never {
    console.error(`❌ CRUD ${operation} failed:`, error, context);
    throw error;
  }

  /**
   * Handle bulk operation errors - just throw them
   */
  handleBulkOperationError(
    operation: string,
    error: Error,
    itemIds: string[],
    context?: Record<string, unknown>
  ): never {
    console.error(
      `❌ Bulk ${operation} failed for ${itemIds.length} items:`,
      error,
      context
    );
    throw error;
  }

  /**
   * Handle scan errors - just throw them
   */
  handleScanError(
    type: string,
    error: Error,
    context?: Record<string, unknown>
  ): never {
    console.error(`❌ Scan ${type} failed:`, error, context);
    throw error;
  }

  /**
   * Handle general errors - just throw them
   */
  handleGeneralError(error: Error, context?: Record<string, unknown>): never {
    console.error(`❌ General error:`, error, context);
    throw error;
  }

  /**
   * Handle validation errors - just throw them
   */
  handleValidationError(
    field: string,
    message: string,
    context?: Record<string, unknown>
  ): never {
    console.error(`❌ Validation error for ${field}:`, message, context);
    throw new Error(`Validation error for ${field}: ${message}`);
  }

  /**
   * Handle network errors - just throw them
   */
  handleNetworkError(error: Error, context?: Record<string, unknown>): never {
    console.error(`❌ Network error:`, error, context);
    throw new Error(
      `Network error: ${error.message}. Please check your connection and try again.`
    );
  }

  /**
   * Handle database errors - just throw them
   */
  handleDatabaseError(error: Error, context?: Record<string, unknown>): never {
    console.error(`❌ Database error:`, error, context);
    throw new Error(`Database operation failed: ${error.message}`);
  }

  /**
   * Handle permission errors - just throw them
   */
  handlePermissionError(
    error: Error,
    context?: Record<string, unknown>
  ): never {
    console.error(`❌ Permission error:`, error, context);
    throw new Error(`Permission denied: ${error.message}`);
  }

  /**
   * Handle timeout errors - just throw them
   */
  handleTimeoutError(error: Error, context?: Record<string, unknown>): never {
    console.error(`❌ Timeout error:`, error, context);
    throw new Error(`Operation timed out: ${error.message}`);
  }

  /**
   * Handle unknown errors - just throw them
   */
  handleUnknownError(error: Error, context?: Record<string, unknown>): never {
    console.error(`❌ Unknown error:`, error, context);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }

  /**
   * Get circuit breaker state - simplified
   */
  getCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
    // Simplified - always return closed
    return 'closed';
  }

  /**
   * Reset circuit breaker - simplified
   */
  resetCircuitBreaker(_operation: string): void {
    // Simplified - no action needed
    console.log(`Circuit breaker reset for operation: ${_operation}`);
  }
}

// Export singleton instance
export const inventoryErrorService = InventoryErrorService.getInstance();
