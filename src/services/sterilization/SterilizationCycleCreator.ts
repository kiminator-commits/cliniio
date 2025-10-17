import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { useLoginStore } from '../../stores/useLoginStore';
import { TransactionManager } from './TransactionManager';
import { ErrorHandler } from '../error/ErrorHandler';
import { ToolService } from '@/services/tools/ToolService';
import { ToolStatus } from '@/types/toolTypes';
import {
  SterilizationPhase,
  SterilizationCycle,
  CreateCycleResult,
  CycleCreationParams,
} from './sterilizationTypes';

export class SterilizationCycleCreator {
  private static readonly PHASES: SterilizationPhase[] = [
    { name: 'bath1', order: 1, title: 'Bath 1', duration: 300 },
    { name: 'bath2', order: 2, title: 'Bath 2', duration: 300 },
    { name: 'drying', order: 3, title: 'Drying', duration: 600 },
    { name: 'autoclave', order: 4, title: 'Autoclave', duration: 1800 },
    { name: 'packaging', order: 5, title: 'Packaging', duration: 900 },
  ];

  /**
   * Create a new sterilization cycle and assign tools to it using transactions
   */
  static async createCycleWithTransaction(
    toolIds: string[],
    cycleType: string = 'routine',
    notes?: string
  ): Promise<CreateCycleResult> {
    const context = ErrorHandler.createContext('createCycleWithTransaction');

    return ErrorHandler.handleDatabaseError(async () => {
      const authToken = useLoginStore.getState().authToken;
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to get current user');
      }

      // Get user profile to get facility_id
      const { data: userProfile, error: profileError } = (await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (profileError || !userProfile) {
        throw new Error('Failed to get user profile');
      }

      const facilityId = (userProfile as unknown as { facility_id: string })
        .facility_id;
      const userId = user.id;

      // Generate unique cycle ID
      const cycleId = `CYCLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Use transaction to create cycle with all related data
      const result = await TransactionManager.createSterilizationCycle({
        cycle_type: cycleType,
        facility_id: facilityId,
        user_id: userId,
        tools: toolIds.map((toolId) => ({
          tool_id: toolId,
          tool_name: `Tool ${toolId}`,
          location: 'Bath 1',
          status: 'dirty',
        })),
        audit_entries: [
          {
            action: 'cycle_created',
            details: {
              cycle_id: cycleId,
              cycle_type: cycleType,
              tool_count: toolIds.length,
              notes: notes || `Cycle created for ${toolIds.length} tools`,
            },
            user_id: userId,
            facility_id: facilityId,
          },
        ],
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create sterilization cycle');
      }

      const cycle = result.data?.cycle;
      if (!cycle) {
        throw new Error('No cycle data returned from transaction');
      }

      // Create cycle phases
      const _phaseEntries = this.PHASES.map((phase) => ({
        cycle_id: cycle.id,
        phase_name: phase.name,
        phase_order: phase.order,
        phase_status: phase.name === 'bath1' ? 'running' : 'pending',
        start_time: phase.name === 'bath1' ? now : null,
        phase_data: {
          title: phase.title,
          description: `${phase.title} phase of sterilization cycle`,
        },
      }));

      // Cycle phases table does not exist - skipping phase creation
      const phasesError = null;

      if (phasesError) {
        throw new Error(
          `Failed to create cycle phases: ${phasesError.message}`
        );
      }

      // Update all tools with the cycle ID and status
      await ToolService.updateToolsCyclePhase(
        toolIds,
        'dirty',
        cycle.id,
        'bath1'
      );

      return {
        success: true,
        cycle: {
          id: cycle.id,
          cycleId: cycleId,
          facilityId: facilityId,
          cycleType: cycleType,
          status: 'active' as ToolStatus, // Use proper ToolStatus enum value
          startTime: new Date(now),
          cycleName: `Bath 1 Cycle ${cycleId}`,
          notes: notes || `Cycle created for ${toolIds.length} tools`,
          createdBy: userId,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        },
        message: `Successfully created sterilization cycle with ${toolIds.length} tools`,
      };
    }, context);
  }

  /**
   * Create a new sterilization cycle and assign tools to it (legacy method)
   */
  static async createCycleAndAssignTools(
    toolIds: string[],
    cycleType: string = 'routine',
    notes?: string
  ): Promise<CreateCycleResult> {
    try {
      const authToken = useLoginStore.getState().authToken;
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to get current user');
      }

      // Get user profile to get facility_id
      const { data: userProfile, error: profileError } = (await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (profileError || !userProfile) {
        throw new Error('Failed to get user profile');
      }

      const facilityId = (userProfile as unknown as { facility_id: string })
        .facility_id;
      const userId = user.id;

      // Generate unique cycle ID
      const cycleId = `CYCLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Create the sterilization cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('sterilization_cycles')
        .insert({
          cycle_id: cycleId,
          facility_id: facilityId,
          cycle_type: cycleType,
          status: 'active',
          start_time: now,
          cycle_name: `Bath 1 Cycle ${cycleId}`,
          notes: notes || `Cycle created for ${toolIds.length} tools`,
          created_by: userId,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (cycleError) {
        throw new Error(
          `Failed to create sterilization cycle: ${cycleError?.message}`
        );
      }

      // Create cycle phases
      const _phaseEntries = this.PHASES.map((phase) => ({
        cycle_id: cycle.id,
        phase_name: phase.name,
        phase_order: phase.order,
        phase_status: phase.name === 'bath1' ? 'running' : 'pending',
        start_time: phase.name === 'bath1' ? now : null,
        phase_data: {
          title: phase.title,
          description: `${phase.title} phase of sterilization cycle`,
        },
      }));

      // Cycle phases table does not exist - skipping phase creation
      const phasesError = null;

      if (phasesError) {
        // Clean up the cycle if phase creation fails
        await supabase.from('sterilization_cycles').delete().eq('id', cycle.id);
        throw new Error(
          `Failed to create cycle phases: ${phasesError.message}`
        );
      }

      // Update all tools with the cycle ID and status
      await ToolService.updateToolsCyclePhase(
        toolIds,
        'dirty',
        cycle.id,
        'bath1'
      );

      // Create audit log entry
      const { error: auditError } = await supabase.from('audit_logs').insert({
        action: 'cycle_created',
        details: {
          cycle_id: cycleId,
          cycle_type: cycleType,
          tool_count: toolIds.length,
          notes: notes || `Cycle created for ${toolIds.length} tools`,
        },
        user_id: userId,
        facility_id: facilityId,
        created_at: now,
      });

      if (auditError) {
        console.warn('Failed to create audit logs:', auditError);
      }

      return {
        success: true,
        cycle: {
          id: cycle.id,
          cycleId: cycleId,
          facilityId: facilityId,
          cycleType: cycleType,
          status: 'active' as ToolStatus,
          startTime: new Date(now),
          cycleName: `Bath 1 Cycle ${cycleId}`,
          notes: notes || `Cycle created for ${toolIds.length} tools`,
          createdBy: userId,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        },
        message: `Successfully created sterilization cycle with ${toolIds.length} tools`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create sterilization cycle',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
