import { handleSupabaseError } from '../../../lib/supabase';

/**
 * Simple error handling operations for inventory services
 * Standardizes error handling without over-engineering
 */
export class InventoryErrorOperations {
  /**
   * Handle Supabase errors consistently
   */
  static handleError(error: unknown, operation: string): never {
    console.error(`❌ ${operation} failed:`, error);

    if (error && typeof error === 'object' && 'message' in error) {
      throw handleSupabaseError(error as Error);
    }

    throw new Error(`${operation} failed: ${error}`);
  }

  /**
   * Handle Supabase response with consistent error checking
   */
  static handleResponse<T>(
    response: { data: T; error: unknown },
    operation: string
  ): T {
    if (response.error) {
      this.handleError(response.error, operation);
    }
    return response.data;
  }

  /**
   * Log operation start
   */
  static logStart(operation: string, details?: string): void {
    const _message = details ? `${operation}: ${details}` : operation;
  }

  /**
   * Log operation success
   */
  static logSuccess(operation: string, details?: string): void {
    const _message = details ? `${operation}: ${details}` : operation;
  }

  /**
   * Log operation failure
   */
  static logFailure(operation: string, error: unknown): void {
    console.error(`❌ ${operation} failed:`, error);
  }
}
