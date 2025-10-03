import { supabase } from '../../lib/supabaseClient';
import { useLoginStore } from '../../stores/useLoginStore';
import { ToolService } from '../tools/ToolService';

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
const safeString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const safeNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0;
};

const safeDate = (value: unknown): Date | undefined => {
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};

const safeRecord = (value: unknown): Record<string, unknown> => {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
};

export interface CyclePhase {
  id: string;
  cycleId: string;
  phaseName: string;
  phaseOrder: number;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  targetTemperature?: number;
  actualTemperature?: number;
  targetPressure?: number;
  actualPressure?: number;
  phaseStatus: 'pending' | 'running' | 'completed' | 'failed';
  phaseData: Record<string, unknown>;
  createdAt: Date;
}

export interface PhaseTransitionResult {
  success: boolean;
  message: string;
  phase?: CyclePhase;
  toolsRemoved?: string[];
}

/**
 * Sterilization Phase Service - Handles phase transitions and management
 */
export class SterilizationPhaseService {
  /**
   * Transition cycle to next phase
   */
  static async transitionToNextPhase(
    cycleId: string,
    phaseName: string,
    phaseData?: Record<string, unknown>
  ): Promise<PhaseTransitionResult> {
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
      const facilityId = await getCurrentFacilityId();

      // Get current cycle and phase
      const { data: cycle, error: cycleError } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single();

      if (cycleError || !cycle) {
        throw new Error('Cycle not found');
      }

      const typedCycle = cycle;

      // Get current phase - simplified query to avoid deep type instantiation
      const { data: currentPhase, error: phaseError } = await supabase
        .from('sterilization_cycles')
        .select('id, cycle_id, phase_name, facility_id')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single();

      if (phaseError || !currentPhase) {
        throw new Error('Current phase not found');
      }

      const typedCurrentPhase = currentPhase;

      // Complete current phase
      const { error: completeError } = await supabase
        .from('sterilization_cycles')
        .update({
          end_time: now,
          duration_minutes: Math.round(
            (new Date(now).getTime() -
              new Date(typedCurrentPhase.start_time as string).getTime()) /
              60000
          ),
          phase_status: 'completed',
          phase_data: {
            ...((typedCurrentPhase.phase_data as Record<string, unknown>) ??
              {}),
            ...(phaseData ?? {}),
            completed_by: userId,
            completion_time: now,
          },
        })
        .eq('id', typedCurrentPhase.id as string)
        .eq('facility_id', facilityId);

      if (completeError) {
        throw new Error(
          `Failed to complete current phase: ${completeError.message}`
        );
      }

      // Start next phase
      const updateQuery = supabase
        .from('sterilization_cycles')
        .update({
          start_time: now,
          phase_status: 'running',
          phase_data: {
            ...(phaseData ?? {}),
            started_by: userId,
            start_time: now,
          },
        })
        .eq('cycle_id', cycleId)
        .eq('phase_name', phaseName)
        .eq('facility_id', facilityId);

      const { data: nextPhase, error: nextPhaseError } = await updateQuery
        .select()
        .single();

      if (nextPhaseError || !nextPhase) {
        throw new Error(
          `Failed to start next phase: ${nextPhaseError?.message}`
        );
      }

      // Update cycle status
      const { error: cycleUpdateError } = await supabase
        .from('sterilization_cycles')
        .update({
          status: phaseName,
          updated_at: now,
        })
        .eq('id', cycleId)
        .eq('facility_id', facilityId);

      if (cycleUpdateError) {
        throw new Error(
          `Failed to update cycle status: ${cycleUpdateError.message}`
        );
      }

      // Update tools to new phase
      const { data: cycleTools, error: toolsSelectError } = await supabase
        .from('tools')
        .select('id')
        .eq('current_cycle_id', cycleId)
        .eq('facility_id', facilityId);

      if (toolsSelectError) {
        throw new Error(
          `Failed to get cycle tools: ${toolsSelectError.message}`
        );
      }

      if (cycleTools && cycleTools.length > 0) {
        const toolUpdatePromises = (
          cycleTools as unknown as { id: string }[]
        ).map((tool) => ToolService.updateToolPhase(tool.id, phaseName));
        await Promise.all(toolUpdatePromises);
      }

      // Handle P2 tool removal after Bath 2
      let toolsRemoved: string[] = [];
      if (typedCycle.status === 'bath2' && phaseName === 'drying') {
        const { data: p2Tools, error: p2Error } = await supabase
          .from('tools')
          .select('id, tool_name, barcode')
          .eq('current_cycle_id', cycleId)
          .eq('priority', 2) // P2 tools have priority 2
          .eq('facility_id', facilityId);

        if (!p2Error && p2Tools && p2Tools.length > 0) {
          const typedP2Tools = p2Tools as unknown as {
            id: string;
            tool_name: string;
          }[];
          const p2ToolIds = typedP2Tools.map((tool) => tool.id);
          toolsRemoved = typedP2Tools.map((tool) => tool.tool_name);

          // Remove P2 tools from cycle and return to available
          // Update status using ToolService for each tool
          const toolUpdatePromises = p2ToolIds.map((toolId) =>
            ToolService.updateToolStatus(toolId, 'clean')
          );
          await Promise.all(toolUpdatePromises);

          // Update additional fields that ToolService doesn't handle yet
          await ToolService.clearCycleAssignment(p2ToolIds, 'clean');
        }
      }

      // Create audit log for phase transition
      await supabase.from('audit_logs').insert({
        user_id: userId,
        facility_id: typedCycle.facility_id as string,
        module: 'sterilization',
        action: 'phase_transition',
        table_name: 'sterilization_cycles',
        record_id: cycleId,
        old_values: { status: typedCycle.status as string },
        new_values: { status: phaseName },
        metadata: {
          cycle_id: cycleId,
          from_phase: typedCycle.status as string,
          to_phase: phaseName,
          tools_removed: toolsRemoved,
          phase_data: phaseData,
        },
      });

      const typedNextPhase = nextPhase;

      return {
        success: true,
        message: `Successfully transitioned to ${phaseName} phase`,
        phase: {
          id: safeString(typedNextPhase.id),
          cycleId: safeString(typedNextPhase.cycle_id),
          phaseName: safeString(typedNextPhase.phase_name),
          phaseOrder: safeNumber(typedNextPhase.phase_order),
          startTime: safeDate(typedNextPhase.start_time),
          endTime: safeDate(typedNextPhase.end_time),
          durationMinutes:
            safeNumber(typedNextPhase.duration_minutes) || undefined,
          targetTemperature:
            safeNumber(typedNextPhase.target_temperature) || undefined,
          actualTemperature:
            safeNumber(typedNextPhase.actual_temperature) || undefined,
          targetPressure:
            safeNumber(typedNextPhase.target_pressure) || undefined,
          actualPressure:
            safeNumber(typedNextPhase.actual_pressure) || undefined,
          phaseStatus: safeString(typedNextPhase.phase_status) as
            | 'pending'
            | 'running'
            | 'completed'
            | 'failed',
          phaseData: safeRecord(typedNextPhase.phase_data),
          createdAt: safeDate(typedNextPhase.created_at) || new Date(),
        },
        toolsRemoved,
      };
    } catch (error) {
      console.error('Error transitioning phase:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to transition phase',
      };
    }
  }

  /**
   * Get cycle phases
   */
  static async getCyclePhases(cycleId: string): Promise<CyclePhase[]> {
    try {
      const facilityId = await getCurrentFacilityId();
      const { data: cycle, error } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch cycle phases: ${error.message}`);
      }

      // Return a single phase based on the cycle status
      if (!cycle) return [];

      return [
        {
          id: safeString(cycle.id),
          cycleId: safeString(cycle.id),
          phaseName: safeString(cycle.status) || 'bath1',
          phaseOrder: 1,
          startTime: safeDate(cycle.start_time),
          endTime: safeDate(cycle.end_time),
          durationMinutes: safeNumber(cycle.duration_minutes) || undefined,
          targetTemperature: safeNumber(cycle.temperature_celsius) || undefined,
          actualTemperature: safeNumber(cycle.temperature_celsius) || undefined,
          targetPressure: safeNumber(cycle.pressure_psi) || undefined,
          actualPressure: safeNumber(cycle.pressure_psi) || undefined,
          phaseStatus:
            cycle.status === 'completed'
              ? 'completed'
              : ('running' as 'pending' | 'running' | 'completed' | 'failed'),
          phaseData: safeRecord(cycle.parameters),
          createdAt: safeDate(cycle.created_at) || new Date(),
        },
      ];
    } catch (error) {
      console.error('Error fetching cycle phases:', error);
      return [];
    }
  }
}
