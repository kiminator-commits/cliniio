import { supabase } from '@/lib/supabaseClient';
import { BIFailureErrorHandler } from './BIFailureErrorHandler';
import {
  BIFailureValidationService,
  QuarantineToolsParams,
  RecordToolUsageParams,
} from './BIFailureValidationService';

/**
 * Quarantined tool interface
 */
export interface QuarantinedTool {
  id: string;
  tool_id: string;
  tool_name: string;
  incident_id: string;
  quarantine_date: string;
  quarantine_location: string;
  quarantine_notes?: string;
  quarantined_by_operator_id: string;
  status: 'quarantined' | 'released' | 'disposed';
  release_date?: string;
  release_notes?: string;
  released_by_operator_id?: string;
}

/**
 * Tool validation result interface
 */
export interface ToolValidationResult {
  canUse: boolean;
  reason: string;
  validationResult: string;
  requiresImmediateAction: boolean;
}

/**
 * Patient exposure report interface
 */
export interface PatientExposureReport {
  incidentNumber: string;
  totalPatientsExposed: number;
  exposureSummary: {
    totalPatientsExposed: number;
    exposureWindowPatients: number;
    quarantineBreachPatients: number;
  };
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  patientDetails?: Array<{
    patientId: string;
    patientName: string;
    riskLevel: 'high' | 'medium' | 'low';
    exposureType: 'exposure_window' | 'quarantine_breach';
    lastProcedureDate: string;
    affectedTools: string[];
  }>;
}

// Add proper types for database results
interface PatientExposureReportDBResult {
  incidentNumber: string;
  totalPatientsExposed: number;
  exposureSummary: {
    totalPatientsExposed: number;
    exposureWindowPatients: number;
    quarantineBreachPatients: number;
  };
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  patientDetails?: Array<{
    patientId: string;
    patientName: string;
    riskLevel: 'high' | 'medium' | 'low';
    exposureType: 'exposure_window' | 'quarantine_breach';
    lastProcedureDate: string;
    affectedTools: string[];
  }>;
}

// QuarantinedToolDBResult interface removed as it's not used

interface WorkflowStepUpdateData {
  step_status: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  assigned_operator_id?: string;
  step_notes?: string;
}

/**
 * Workflow service for BI failure operations
 * Handles resolution workflow management, tool quarantine, and patient exposure tracking
 */
export class BIFailureWorkflowService {
  /**
   * Quarantine tools for a BI failure incident
   */
  static async quarantineTools(params: QuarantineToolsParams): Promise<number> {
    BIFailureValidationService.validateQuarantineToolsParams(params);

    const { data } = await BIFailureErrorHandler.withRetry(async () => {
      const result = await supabase.rpc('quarantine_tools_for_incident', {
        p_incident_id: params.incidentId,
        p_tools: params.tools,
        p_quarantined_by_operator_id: params.quarantinedByOperatorId,
        p_quarantine_location:
          params.quarantineLocation || 'Default Quarantine',
        p_quarantine_notes: params.quarantineNotes || '',
        p_facility_id: params.facilityId,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    }, 'quarantine tools for incident');

    return (data as number) || 0;
  }

  /**
   * Validate if a tool can be used for a patient
   */
  static async validateToolForUse(
    toolId: string,
    facilityId: string,
    patientId: string,
    operatorId?: string,
    roomLocation?: string
  ): Promise<ToolValidationResult> {
    const { data, _error } = await BIFailureErrorHandler.withRetry(async () => {
      const result = await supabase.rpc('validate_tool_for_use', {
        p_tool_id: toolId,
        p_facility_id: facilityId,
        p_patient_id: patientId,
        p_operator_id: operatorId,
        p_room_location: roomLocation,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    }, 'validate tool for use');

    return (
      (data as ToolValidationResult) || {
        canUse: false,
        reason: 'Tool validation failed',
        validationResult: 'error' as const,
        requiresImmediateAction: true,
      }
    );
  }

  /**
   * Generate patient exposure report for an incident
   */
  static async generatePatientExposureReport(
    incidentId: string,
    facilityId: string
  ): Promise<PatientExposureReport> {
    const { data } = await BIFailureErrorHandler.withRetry(async () => {
      const result = await supabase.rpc('generate_patient_exposure_report', {
        p_incident_id: incidentId,
        p_facility_id: facilityId,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    }, 'generate patient exposure report');

    if (!data) {
      throw new Error('No exposure report data returned');
    }

    const dbData = data as PatientExposureReportDBResult;
    return {
      incidentNumber: dbData.incidentNumber ?? '',
      totalPatientsExposed: dbData.totalPatientsExposed ?? 0,
      exposureSummary: dbData.exposureSummary ?? {
        totalPatientsExposed: 0,
        exposureWindowPatients: 0,
        quarantineBreachPatients: 0,
      },
      riskBreakdown: dbData.riskBreakdown ?? {
        high: 0,
        medium: 0,
        low: 0,
      },
      patientDetails: dbData.patientDetails ?? [],
    };
  }

  /**
   * Record tool usage for patient exposure tracking
   */
  static async recordToolUsage(params: RecordToolUsageParams): Promise<void> {
    BIFailureValidationService.validateRecordToolUsageParams(params);

    try {
      const { error } = await BIFailureErrorHandler.withRetry(async () => {
        return await supabase.rpc('record_tool_usage', {
          p_facility_id: params.facilityId,
          p_tool_id: params.toolId,
          p_tool_name: params.toolName,
          p_batch_id: params.batchId,
          p_sterilization_cycle_id: params.sterilizationCycleId,
          p_patient_id: params.patientId,
          p_patient_name: params.patientName,
          p_operator_id: params.operatorId,
          p_room_location: params.roomLocation,
          p_procedure_type: params.procedureType,
          p_procedure_notes: params.procedureNotes,
        });
      }, 'record tool usage');

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(error, 'record tool usage');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'record tool usage');
    }
  }

  /**
   * Get workflow steps for an incident
   */
  static async getWorkflowSteps(incidentId: string): Promise<
    Array<{
      step_id: string;
      workflow_step: string;
      step_status:
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'failed'
        | 'skipped';
      assigned_operator_id?: string;
      started_at?: string;
      completed_at?: string;
      step_notes?: string;
    }>
  > {
    try {
      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase
            .from('bi_resolution_workflows')
            .select('*')
            .eq('bi_failure_incident_id', incidentId)
            .order('created_at', { ascending: true });
        },
        'get workflow steps'
      );

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(error, 'get workflow steps');
      }

      return (data || []).map((item) => ({
        step_id: item.step_id ?? '',
        workflow_step: item.workflow_step ?? '',
        step_status: (item.step_status ?? 'pending') as
          | 'failed'
          | 'skipped'
          | 'completed'
          | 'pending'
          | 'in_progress',
        assigned_operator_id: item.assigned_operator_id ?? '',
        started_at: item.started_at ?? '',
        completed_at: item.completed_at ?? '',
        step_notes: item.step_notes ?? '',
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'get workflow steps');
    }
  }

  /**
   * Update workflow step status
   */
  static async updateWorkflowStep(
    stepId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped',
    operatorId?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData: WorkflowStepUpdateData = {
        step_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (operatorId) {
        updateData.assigned_operator_id = operatorId;
      }

      if (notes) {
        updateData.step_notes = notes;
      }

      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase
            .from('bi_resolution_workflows')
            .update(updateData)
            .eq('id', stepId)
            .select('id')
            .single();
        },
        'update workflow step'
      );

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'update workflow step'
        );
      }

      return !!data;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'update workflow step'
      );
    }
  }

  /**
   * Get quarantined tools for an incident
   */
  static async getQuarantinedTools(): Promise<QuarantinedTool[]> {
    try {
      const { data, error } = await supabase
        .from('quarantined_tools')
        .select('*')
        .order('quarantine_date', { ascending: false });

      if (error) throw error;

      // Type guard to ensure data is an array
      if (!Array.isArray(data)) {
        return [];
      }

      // Validate each item has required properties and map to proper type
      return data.map((item: Record<string, unknown>) => ({
        id: item.id ?? '',
        tool_id: item.tool_id ?? '',
        tool_name: item.tool_name ?? '',
        incident_id: item.incident_id ?? '',
        quarantine_date: item.quarantine_date ?? '',
        quarantine_location: item.quarantine_location ?? '',
        quarantine_notes: item.quarantine_notes ?? '',
        quarantined_by_operator_id: item.quarantined_by_operator_id ?? '',
        status: (item.status ?? 'quarantined') as
          | 'quarantined'
          | 'released'
          | 'disposed',
        release_date: item.release_date ?? '',
        release_notes: item.release_notes ?? '',
        released_by_operator_id: item.released_by_operator_id ?? '',
      }));
    } catch (error) {
      console.error('Failed to fetch quarantined tools:', error);
      return [];
    }
  }

  /**
   * Get quarantined tools count
   */
  static async getQuarantinedToolsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('quarantined_tools')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Failed to get quarantined tools count:', error);
      return 0;
    }
  }

  /**
   * Release tools from quarantine
   */
  static async releaseToolsFromQuarantine(
    incidentId: string,
    toolIds: string[],
    releasedByOperatorId: string,
    facilityId: string,
    releaseNotes?: string
  ): Promise<number> {
    const { data } = await BIFailureErrorHandler.withRetry(async () => {
      const result = await supabase.rpc('release_tools_from_quarantine', {
        p_incident_id: incidentId,
        p_tool_ids: toolIds,
        p_released_by_operator_id: releasedByOperatorId,
        p_release_notes: releaseNotes || '',
        p_facility_id: facilityId,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    }, 'release tools from quarantine');

    return (data as number) || 0;
  }

  /**
   * Subscribe to BI failure updates for real-time notifications
   */
  static subscribeToBIFailureUpdates(facilityId: string) {
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn(
        '⚠️ Supabase client not properly initialized, skipping BI failure workflow subscription'
      );
      return;
    }

    return supabase
      .channel(`bi_failure_updates_${facilityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bi_failure_incidents',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload) => {
          console.log('BI failure update:', payload);
          // Handle real-time updates here
          // This could trigger UI updates, notifications, etc.
        }
      )
      .subscribe();
  }
}

export async function quarantineToolsForIncident(
  incidentId: string,
  toolIds: string[]
) {
  const { data, error } = await supabase
    .from('tools')
    .update({
      status: 'quarantined',
      incident_id: incidentId,
      quarantined_at: new Date().toISOString(),
    })
    .in('id', toolIds)
    .select();

  return { data, error };
}

export async function validateToolForUse(toolId: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('status')
    .eq('id', toolId)
    .maybeSingle();

  if (error) {
    return { valid: false, reason: 'error', error };
  }

  if (!data) {
    return { valid: false, reason: 'not_found' };
  }

  if (data.status === 'quarantined') {
    return { valid: false, reason: 'quarantined' };
  }

  return { valid: true };
}

export async function generatePatientExposureReport(toolId: string) {
  const timestamp = new Date().toISOString();

  // 🔧 Replace this later with a real query to join usage logs or scan history
  return {
    report: {
      tool_id: toolId,
      generated_at: timestamp,
      affected_patients: [], // stubbed — replace with real patient matches later
    },
    error: null,
  };
}

export async function releaseToolsFromQuarantine(toolIds: string[]) {
  const { data, error } = await supabase
    .from('tools')
    .update({
      status: 'available', // or "clean" based on your system
      incident_id: null,
      quarantined_at: null,
    })
    .in('id', toolIds)
    .select();

  return { data, error };
}
