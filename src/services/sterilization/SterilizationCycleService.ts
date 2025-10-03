import { supabase } from '@/services/supabaseClient';
import { Database } from '@/types/database.types';
import { useLoginStore } from '../../stores/useLoginStore';
import { TransactionManager } from './TransactionManager';
import { ErrorHandler } from '../error/ErrorHandler';
import { ToolService, ToolRow } from '@/services/tools/ToolService';
import { ToolStatus } from '@/types/toolTypes';

async function getCurrentFacilityId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error } = await supabase
    .from('users')
    .select('facility_id')
    .eq('id', user.id)
    .single();

  if (error || !userData) throw new Error('Failed to get user facility');
  return userData.facility_id;
}

/**
 * Safe type conversion utilities to prevent data loss
 */

const safeDate = (value: unknown): Date | undefined => {
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};

export interface SterilizationPhase {
  name: string;
  duration: number;
  temperature?: number;
  pressure?: number;
  order: number;
  title: string;
}

export interface SterilizationCycle {
  id: string;
  cycleId: string;
  facilityId: string;
  cycleType: string;
  status: ToolStatus;
  startTime: Date;
  endTime?: Date;
  temperatureCelsius?: number;
  pressurePsi?: number;
  cycleName?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCycleResult {
  success: boolean;
  message: string;
  cycle?: SterilizationCycle;
  cycleId?: string;
}

/**
 * Sterilization Cycle Service - Handles cycle creation and management
 */
export class SterilizationCycleService {
  // Define the standard sterilization phases
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
      const { data: cycle, error: cycleError } = (await supabase
        .from('sterilization_cycles')
        .insert({
          id: cycleId,
          autoclave_id: 'default', // TODO: Get actual autoclave ID
          operator_id: userId,
          tool_batch_id: `batch_${cycleId}`,
          facility_id: facilityId,
          cycle_type: cycleType,
          status: 'active' as ToolStatus, // Use proper ToolStatus enum value
          start_time: now,
          cycle_name: `Bath 1 Cycle ${cycleId}`,
          notes: notes || `Cycle created for ${toolIds.length} tools`,
          created_at: new Date().toISOString(),
        } as Database['public']['Tables']['sterilization_cycles']['Insert'])
        .select()
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (cycleError) {
        throw new Error(
          `Failed to create sterilization cycle: ${cycleError?.message}`
        );
      }

      const typedCycle =
        cycle as unknown as Database['public']['Tables']['sterilization_cycles']['Row'];

      // Create cycle phases
      const _phaseEntries = this.PHASES.map((phase) => ({
        cycle_id: typedCycle.id as string,
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
        await supabase
          .from('sterilization_cycles')
          .delete()
          .eq('id', typedCycle.id)
          .eq('facility_id', facilityId);
        throw new Error(
          `Failed to create cycle phases: ${phasesError.message}`
        );
      }

      // Update all tools with the cycle ID and status
      try {
        await ToolService.updateToolsCyclePhase(
          toolIds,
          'dirty',
          typedCycle.id as string,
          'bath1'
        );
      } catch (toolsError) {
        // Clean up the cycle if tool update fails
        await supabase
          .from('sterilization_cycles')
          .delete()
          .eq('id', typedCycle.id)
          .eq('facility_id', facilityId);
        throw new Error(
          `Failed to assign tools to cycle: ${toolsError instanceof Error ? toolsError.message : 'Unknown error'}`
        );
      }

      // Create audit log entries for each tool
      const auditEntries = toolIds.map((toolId) => ({
        user_id: userId,
        facility_id: facilityId,
        module: 'sterilization',
        action: 'tool_assigned_to_cycle',
        table_name: 'sterilization_tools',
        record_id: toolId,
        old_values: { status: 'available', current_phase: 'available' },
        new_values: {
          status: 'dirty',
          current_phase: 'bath1',
          current_cycle_id: typedCycle.id,
        },
        metadata: {
          cycle_id: typedCycle.id,
          cycle_name: typedCycle.cycle_number,
          cycle_type: cycleType,
        },
      }));

      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert(
          auditEntries as Database['public']['Tables']['audit_logs']['Insert'][]
        );

      if (auditError) {
        console.warn('Failed to create audit logs:', auditError);
      }

      // Create audit log for cycle creation
      await supabase.from('audit_logs').insert({
        user_id: userId,
        facility_id: facilityId,
        module: 'sterilization',
        action: 'cycle_created',
        table_name: 'sterilization_cycles',
        record_id: typedCycle.id,
        old_values: {},
        new_values: {
          cycle_id: cycleId,
          cycle_type: cycleType,
          status: 'active' as ToolStatus, // Use proper ToolStatus enum value
          tool_count: toolIds.length,
        },
        metadata: {
          cycle_id: typedCycle.id,
          cycle_name: typedCycle.cycle_number,
          tool_ids: toolIds,
        },
      } as Database['public']['Tables']['audit_logs']['Insert']);

      const sterilizationCycle: SterilizationCycle = {
        id: typedCycle.id,
        cycleId: typedCycle.id || '',
        facilityId: typedCycle.facility_id,
        cycleType: typedCycle.cycle_type,
        status: typedCycle.status as ToolStatus,
        startTime: safeDate(typedCycle.start_time) || new Date(),
        endTime: safeDate(typedCycle.end_time),
        temperatureCelsius: typedCycle.temperature_celsius || undefined,
        pressurePsi: typedCycle.pressure_psi || undefined,
        cycleName: typedCycle.cycle_number || undefined,
        notes: typedCycle.notes || undefined,
        createdBy: typedCycle.created_at,
        createdAt: safeDate(typedCycle.created_at) || new Date(),
        updatedAt: safeDate(typedCycle.updated_at) || new Date(),
      };

      return {
        success: true,
        message: `Sterilization cycle created successfully. ${toolIds.length} tool(s) assigned to cycle ${cycleId}`,
        cycle: sterilizationCycle,
        cycleId: cycleId,
      };
    } catch (error) {
      console.error('Error creating sterilization cycle:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create sterilization cycle',
      };
    }
  }

  /**
   * Get cycle by ID
   */
  static async getCycleById(
    cycleId: string
  ): Promise<SterilizationCycle | null> {
    try {
      const facilityId = await getCurrentFacilityId();
      const { data: cycle, error } = (await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (error || !cycle) {
        return null;
      }

      const typedCycle =
        cycle as unknown as Database['public']['Tables']['sterilization_cycles']['Row'];

      return {
        id: typedCycle.id,
        cycleId: typedCycle.id || '',
        facilityId: typedCycle.facility_id,
        cycleType: typedCycle.cycle_type,
        status: typedCycle.status as ToolStatus,
        startTime: safeDate(typedCycle.start_time) || new Date(),
        endTime: safeDate(typedCycle.end_time),
        temperatureCelsius: typedCycle.temperature_celsius || undefined,
        pressurePsi: typedCycle.pressure_psi || undefined,
        cycleName: typedCycle.cycle_number || undefined,
        notes: typedCycle.notes || undefined,
        createdBy: typedCycle.created_at,
        createdAt: safeDate(typedCycle.created_at) || new Date(),
        updatedAt: safeDate(typedCycle.updated_at) || new Date(),
      };
    } catch (error) {
      console.error('Error fetching cycle:', error);
      return null;
    }
  }

  /**
   * Complete cycle and return tools to inventory
   */
  static async completeCycle(
    cycleId: string,
    autoclaveReceiptId?: string
  ): Promise<{ success: boolean; message: string }> {
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

      const userId = user.id;
      const now = new Date().toISOString();

      // Get cycle
      const facilityId = await getCurrentFacilityId();
      const { data: cycle, error: cycleError } = (await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (cycleError || !cycle) {
        throw new Error('Cycle not found');
      }

      const typedCycle =
        cycle as unknown as Database['public']['Tables']['sterilization_cycles']['Row'];

      // Complete final phase - cycle_phases table does not exist
      const phaseError = null;

      if (phaseError) {
        throw new Error(
          `Failed to complete final phase: ${phaseError.message}`
        );
      }

      // Update cycle to completed
      const { error: cycleUpdateError } = await supabase
        .from('sterilization_cycles')
        .update({
          status: 'completed',
          end_time: now,
          updated_at: now,
        } as Database['public']['Tables']['sterilization_cycles']['Update'])
        .eq('id', cycleId)
        .eq('facility_id', facilityId);

      if (cycleUpdateError) {
        throw new Error(
          `Failed to complete cycle: ${cycleUpdateError?.message}`
        );
      }

      // Return all tools to available status
      const { data: tools, error: toolsError } = (await supabase
        .from('tools')
        .select('id, tool_name')
        .eq('current_cycle_id', cycleId)
        .eq('facility_id', facilityId)) as {
        data: Database['public']['Tables']['tools']['Row'][] | null;
        error;
      };

      if (toolsError) {
        throw new Error(`Failed to get cycle tools: ${toolsError?.message}`);
      }

      if (tools && tools.length > 0) {
        const toolIds = (
          tools as unknown as Database['public']['Tables']['tools']['Row'][]
        ).map((tool) => tool.id);

        // Update status using ToolService for each tool
        const toolUpdatePromises = toolIds.map((toolId) =>
          ToolService.updateToolStatus(toolId, 'clean')
        );
        await Promise.all(toolUpdatePromises);

        // Update additional fields that ToolService doesn't handle yet
        await ToolService.clearCycleAssignment(toolIds, 'clean');
      }

      // Create audit log for cycle completion
      await supabase.from('audit_logs').insert({
        user_id: userId,
        facility_id: typedCycle.facility_id,
        module: 'sterilization',
        action: 'cycle_completed',
        table_name: 'sterilization_cycles',
        record_id: cycleId,
        old_values: { status: typedCycle.status },
        new_values: { status: 'completed', end_time: now },
        metadata: {
          cycle_id: cycleId,
          tools_returned: tools?.length || 0,
          autoclave_receipt_id: autoclaveReceiptId,
        },
      } as Database['public']['Tables']['audit_logs']['Insert']);

      return {
        success: true,
        message: `Cycle completed successfully. ${tools?.length || 0} tool(s) returned to inventory.`,
      };
    } catch (error) {
      console.error('Error completing cycle:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to complete cycle',
      };
    }
  }
}

export async function loadDirtyToolsForCycle(): Promise<ToolRow[]> {
  try {
    const dirtyTools = await ToolService.getToolsByStatus('dirty');
    return dirtyTools;
  } catch (error) {
    console.error('Failed to load dirty tools:', error);
    return [];
  }
}
