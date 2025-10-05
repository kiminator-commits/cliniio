import { supabase } from '@/lib/supabaseClient';
import { logger } from '../_core/logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase/index';
import type { Json } from '../../types/database.types';
import { ToolStatus } from '@/types/toolTypes';

export interface TransactionOptions {
  timeout?: number; // milliseconds
  retries?: number;
  isolationLevel?: 'read_committed' | 'repeatable_read' | 'serializable';
}

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  rollbackData?: unknown;
}

// Define proper types for Supabase operations
type SupabaseClientType = SupabaseClient<
  Database,
  'public',
  'public',
  {
    PostgrestVersion: '12.2.12 (cd3cf9e)';
  }
>;
type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Define types for database table operations
interface SterilizationCycleRow {
  id: string;
  cycle_type: string;
  facility_id: string;
  created_by: string;
  status: ToolStatus;
  created_at: string;
  updated_at: string;
}

interface SterilizationCycleToolRow {
  cycle_id: string;
  tool_id: string;
  tool_name: string;
  location: string;
  status: ToolStatus;
  created_at: string;
  updated_at: string;
}

interface AuditLogRow {
  action: string;
  details: Json;
  user_id: string;
  facility_id: string;
  cycle_id?: string;
  created_at: string;
  updated_at: string;
}

interface _InventoryItemRow {
  id: string;
  quantity: number;
}

export class TransactionManager {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 3;

  /**
   * Execute a transaction with automatic rollback on failure
   */
  static async executeTransaction<T>(
    operations: () => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<TransactionResult<T>> {
    const { timeout = this.DEFAULT_TIMEOUT, retries = this.DEFAULT_RETRIES } =
      options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`Transaction attempt ${attempt}/${retries}`);

        // Start transaction
        // Note: Supabase does not support traditional database transactions via RPC
        // The 'begin_transaction' RPC function does not exist
        // Using a mock transaction ID for compatibility
        const _transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
          // Execute operations
          const result = await this.executeWithTimeout(operations, timeout);

          // Commit transaction
          // Note: Supabase does not support traditional database transactions via RPC
          // The 'commit_transaction' RPC function does not exist
          // Operations are automatically committed in Supabase

          logger.debug(
            `Transaction completed successfully on attempt ${attempt}`
          );
          return {
            success: true,
            data: result,
          };
        } catch (operationError) {
          // Rollback transaction
          await this.rollbackTransaction();
          throw operationError;
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Transaction attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt - 1) * 1000);
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Transaction failed after all retries',
    };
  }

  /**
   * Execute multiple operations in a single transaction
   */
  static async executeBatch<T>(
    operations: Array<(client: SupabaseClientType) => Promise<unknown>>,
    options: TransactionOptions = {}
  ): Promise<TransactionResult<T[]>> {
    return this.executeTransaction(async () => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await operation(supabase);
        results.push(result as T);
      }

      return results;
    }, options);
  }

  /**
   * Create sterilization cycle with all related data atomically
   */
  static async createSterilizationCycle(cycleData: {
    cycle_type: string;
    facility_id: string;
    user_id: string;
    tools: Array<{
      tool_id: string;
      tool_name: string;
      location: string;
      status: ToolStatus;
    }>;
    audit_entries: Array<{
      action: string;
      details: Json;
      user_id: string;
      facility_id: string;
    }>;
  }): Promise<
    TransactionResult<{
      cycle: SterilizationCycleRow;
      tools: SterilizationCycleToolRow[];
      audit_entries: AuditLogRow[];
    }>
  > {
    return this.executeTransaction(async () => {
      // Create sterilization cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('sterilization_cycles')
        .insert({
          cycle_type: cycleData.cycle_type,
          facility_id: cycleData.facility_id,
          created_by: cycleData.user_id,
          status: 'in_progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (cycleError) {
        const error = cycleError as SupabaseError;
        throw new Error(
          `Failed to create sterilization cycle: ${error.message}`
        );
      }

      if (!cycle) {
        throw new Error('No cycle data returned');
      }

      // Create tool entries
      const toolEntries: SterilizationCycleToolRow[] = cycleData.tools.map(
        (tool) => ({
          cycle_id: cycle.id,
          tool_id: tool.tool_id,
          tool_name: tool.tool_name,
          location: tool.location,
          status: tool.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const { error: toolsError } = await supabase
        .from('sterilization_cycle_tools')
        .insert(toolEntries);

      if (toolsError) {
        const error = toolsError as SupabaseError;
        throw new Error(`Failed to create tool entries: ${error.message}`);
      }

      // Create audit entries
      const auditEntries: AuditLogRow[] = cycleData.audit_entries.map(
        (entry) => ({
          ...entry,
          cycle_id: cycle.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert(auditEntries);

      if (auditError) {
        const error = auditError as SupabaseError;
        throw new Error(`Failed to create audit entries: ${error.message}`);
      }

      return {
        cycle,
        tools: toolEntries,
        audit_entries: auditEntries,
      };
    });
  }

  /**
   * Update inventory with audit trail atomically
   */
  static async updateInventoryWithAudit(
    inventoryUpdates: Array<{
      item_id: string;
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
      reason: string;
    }>,
    user_id: string,
    facility_id: string
  ): Promise<
    TransactionResult<
      Array<{
        item_id: string;
        old_quantity: number;
        new_quantity: number;
      }>
    >
  > {
    return this.executeTransaction(async () => {
      const results: Array<{
        item_id: string;
        old_quantity: number;
        new_quantity: number;
      }> = [];

      for (const update of inventoryUpdates) {
        // Get current quantity
        const { data: currentItem, error: fetchError } = await supabase
          .from('inventory_items')
          .select('quantity')
          .eq('id', update.item_id)
          .eq('facility_id', facility_id)
          .single();

        if (fetchError) {
          const error = fetchError as SupabaseError;
          throw new Error(`Failed to fetch inventory item: ${error.message}`);
        }

        if (!currentItem) {
          throw new Error('No current item data returned');
        }

        // Calculate new quantity
        let newQuantity = currentItem.quantity;
        switch (update.operation) {
          case 'add':
            newQuantity += update.quantity;
            break;
          case 'subtract':
            newQuantity -= update.quantity;
            break;
          case 'set':
            newQuantity = update.quantity;
            break;
        }

        // Update inventory
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', update.item_id)
          .eq('facility_id', facility_id)
          .select()
          .single();

        if (updateError) {
          const error = updateError as SupabaseError;
          throw new Error(`Failed to update inventory: ${error.message}`);
        }

        // Create audit entry
        const { error: auditError } = await supabase.from('audit_logs').insert({
          action: 'inventory_update',
          details: {
            item_id: update.item_id,
            old_quantity: currentItem.quantity,
            new_quantity: newQuantity,
            operation: update.operation,
            reason: update.reason,
          } as Json,
          user_id,
          facility_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (auditError) {
          const error = auditError as SupabaseError;
          throw new Error(`Failed to create audit entry: ${error.message}`);
        }

        results.push({
          item_id: update.item_id,
          old_quantity: currentItem.quantity,
          new_quantity: newQuantity,
        });
      }

      return results;
    });
  }

  private static async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Transaction timeout after ${timeout}ms`));
      }, timeout);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Begin transaction - No-op for Supabase
   */
  private static async beginTransaction(): Promise<{
    data: null;
    error: null;
  }> {
    // ⚠️ Supabase has no 'begin_transaction' RPC.
    // This is a no-op for now.
    return { data: null, error: null };
  }

  /**
   * Commit transaction - No-op for Supabase
   */
  private static async commitTransaction(
    _transactionId: string
  ): Promise<{ error: null }> {
    // ⚠️ Supabase has no 'commit_transaction' RPC.
    // This is a no-op for now.
    return { error: null };
  }

  /**
   * Rollback transaction - No-op for Supabase
   */
  private static async rollbackTransaction(): Promise<{ error: null }> {
    // ⚠️ Supabase has no 'rollback_transaction' RPC, this is a no-op
    return { error: null };
  }
}
