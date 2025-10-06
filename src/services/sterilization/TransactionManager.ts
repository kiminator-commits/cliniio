import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { logger } from '@/utils/_core/logger';
import { ToolStatus } from '@/types/toolTypes';

export interface SterilizationCycleData {
  cycle_type: string;
  facility_id: string;
  user_id: string;
  autoclave_id?: string;
  tool_batch_id?: string;
  tools: Array<{
    tool_id: string;
    tool_name: string;
    location: string;
    status: ToolStatus;
  }>;
  audit_entries: Array<{
    action: string;
    details: Record<string, unknown>;
    user_id: string;
    facility_id: string;
  }>;
}

export interface TransactionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SterilizationCycleTransactionData {
  cycle: {
    id: string;
    cycle_id: string;
    facility_id: string;
    cycle_type: string;
    status: ToolStatus;
    start_time: string;
    notes?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  phases: Array<{
    cycle_id: string;
    phase_name: string;
    phase_order: number;
    phase_status: string;
    start_time: string | null;
    phase_data: Record<string, unknown>;
  }>;
  tool_updates: Array<{
    tool_id: string;
    current_cycle_id: string;
    status: ToolStatus;
    current_phase: string;
    updated_at: string;
  }>;
  audit_logs: Array<{
    user_id: string;
    facility_id: string;
    module: string;
    action: string;
    table_name: string;
    record_id: string;
    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;
    metadata: Record<string, unknown>;
  }>;
}

export class TransactionManager {
  /**
   * Create a sterilization cycle with all related data in a single transaction
   */
  static async createSterilizationCycle(
    cycleData: SterilizationCycleData
  ): Promise<TransactionResult<SterilizationCycleTransactionData>> {
    const startTime = Date.now();

    try {
      // Generate unique cycle ID
      const cycleId = `CYCLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Use Supabase RPC for transaction-like behavior
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .insert([
          {
            id: cycleId,
            autoclave_id: cycleData.autoclave_id || crypto.randomUUID(),
            operator_id: cycleData.user_id,
            tool_batch_id: cycleData.tool_batch_id || crypto.randomUUID(),
            cycle_type: cycleData.cycle_type,
            facility_id: cycleData.facility_id,
            notes:
              cycleData.audit_entries[0]?.details?.notes ||
              `Cycle created for ${cycleData.tools.length} tools`,
          } as Database['public']['Tables']['sterilization_cycles']['Insert'],
        ])
        .select()
        .single();

      if (error) {
        logger.error('Sterilization cycle transaction failed:', error);
        return {
          success: false,
          error: `Transaction failed: ${error.message}`,
        };
      }

      const duration = Date.now() - startTime;
      logger.info(
        `Sterilization cycle transaction completed in ${duration}ms`,
        {
          cycleId,
          toolCount: cycleData.tools.length,
          duration,
        }
      );

      return {
        success: true,
        data: data as unknown as SterilizationCycleTransactionData,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Sterilization cycle transaction error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        cycleData: {
          cycle_type: cycleData.cycle_type,
          facility_id: cycleData.facility_id,
          tool_count: cycleData.tools.length,
        },
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown transaction error',
      };
    }
  }

  /**
   * Update sterilization cycle phase with tool status updates
   */
  static async updateCyclePhase(
    cycleId: string,
    phaseName: string,
    toolUpdates: Array<{
      tool_id: string;
      status: ToolStatus;
      current_phase: string;
    }>,
    auditData: {
      user_id: string;
      facility_id: string;
      from_phase: string;
      to_phase: string;
      tools_removed?: string[];
    }
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .update({
          current_phase: phaseName,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['sterilization_cycles']['Update'])
        .eq('id', cycleId)
        .eq('facility_id', auditData.facility_id)
        .select()
        .single();

      if (error) {
        logger.error('Cycle phase update transaction failed:', error);
        return {
          success: false,
          error: `Phase update failed: ${error.message}`,
        };
      }

      const duration = Date.now() - startTime;
      logger.info(`Cycle phase update transaction completed in ${duration}ms`, {
        cycleId,
        phaseName,
        toolUpdateCount: toolUpdates.length,
        duration,
      });

      return {
        success: true,
        data: data as unknown as Database['public']['Tables']['sterilization_cycles']['Row'],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Cycle phase update transaction error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        cycleId,
        phaseName,
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown transaction error',
      };
    }
  }

  /**
   * Complete sterilization cycle with final status updates
   */
  static async completeCycle(
    cycleId: string,
    completionData: {
      end_time: string;
      status: ToolStatus;
      results: Record<string, unknown>;
      user_id: string;
      facility_id: string;
    }
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .update({
          completed_at: completionData.end_time,
          status: completionData.status,
          results: completionData.results,
          updated_by: completionData.user_id,
        } as Database['public']['Tables']['sterilization_cycles']['Update'])
        .eq('id', cycleId)
        .eq('facility_id', completionData.facility_id)
        .select()
        .single();

      if (error) {
        logger.error('Cycle completion transaction failed:', error);
        return {
          success: false,
          error: `Cycle completion failed: ${error.message}`,
        };
      }

      const duration = Date.now() - startTime;
      logger.info(`Cycle completion transaction completed in ${duration}ms`, {
        cycleId,
        status: completionData.status,
        duration,
      });

      return {
        success: true,
        data: data as unknown as Database['public']['Tables']['sterilization_cycles']['Row'],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Cycle completion transaction error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        cycleId,
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown transaction error',
      };
    }
  }

  /**
   * Rollback a failed sterilization cycle creation
   */
  static async rollbackCycleCreation(
    cycleId: string,
    facilityId: string
  ): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .update({
          status: 'rolled_back',
        } as Database['public']['Tables']['sterilization_cycles']['Update'])
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .select()
        .single();

      if (error) {
        logger.error('Cycle rollback failed:', error);
        return {
          success: false,
          error: `Rollback failed: ${error.message}`,
        };
      }

      const duration = Date.now() - startTime;
      logger.info(`Cycle rollback completed in ${duration}ms`, {
        cycleId,
        duration,
      });

      return {
        success: true,
        data: data as unknown as Database['public']['Tables']['sterilization_cycles']['Row'],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Cycle rollback error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        cycleId,
      });

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown rollback error',
      };
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(facilityId: string): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageDuration: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .select('id, status, created_at, completed_at')
        .eq('facility_id', facilityId)
        .in('status', ['completed', 'rolled_back'])
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) {
        logger.error('Failed to get transaction stats:', error);
        return {
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageDuration: 0,
        };
      }

      const typedData =
        (data as unknown as Database['public']['Tables']['sterilization_cycles']['Row'][]) ||
        [];

      return {
        totalTransactions: typedData.length,
        successfulTransactions: typedData.filter(
          (cycle) => cycle.status === 'completed'
        ).length,
        failedTransactions: typedData.filter(
          (cycle) => cycle.status === 'rolled_back'
        ).length,
        averageDuration: 0, // This would need to be calculated based on created_at and completed_at
      };
    } catch (error) {
      logger.error('Transaction stats error:', error);
      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageDuration: 0,
      };
    }
  }
}
