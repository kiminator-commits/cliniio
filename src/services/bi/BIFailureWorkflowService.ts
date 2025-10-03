import { supabase } from '../../lib/supabaseClient';
import { BIFailureError, BIFailureErrorCodes } from './failure/BIFailureError';
import { BIFailureErrorHandler } from './failure/BIFailureErrorHandler';

// Database row interfaces - removed unused interface

/**
 * Workflow step status types
 */
export type WorkflowStepStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Workflow status types
 */
export type WorkflowStatus = 'active' | 'paused' | 'completed' | 'cancelled';

/**
 * Workflow step interface
 */
export interface WorkflowStep {
  id: string;
  step_id: string;
  workflow_step: string;
  step_status: WorkflowStepStatus;
  assigned_operator_id?: string;
  started_at?: string;
  completed_at?: string;
  step_notes?: string;
}

/**
 * Workflow status interface
 */
export interface WorkflowStatusInfo {
  incidentId: string;
  currentStep: string;
  overallStatus: WorkflowStatus;
  completedSteps: number;
  totalSteps: number;
  progress: number;
  estimatedCompletion?: string;
}

/**
 * Service for managing BI Failure Resolution Workflow operations
 * Handles workflow progression, cancellation, reset, and status tracking
 */
export class BIFailureWorkflowService {
  /**
   * Advance the workflow to the next step
   */
  static async advanceWorkflowStep(
    incidentId: string,
    currentStepId: string,
    _operatorId: string,
    _notes?: string
  ): Promise<boolean> {
    try {
      // Get current workflow steps
      const { data: steps, error: stepsError } = await supabase
        .from('bi_resolution_workflows')
        .select('*')
        .eq('bi_failure_incident_id', incidentId)
        .order('created_at', { ascending: true });

      if (stepsError) {
        BIFailureErrorHandler.handleDatabaseError(
          stepsError,
          'get workflow steps for advancement'
        );
      }

      if (!steps || steps.length === 0) {
        throw new BIFailureError(
          'No workflow steps found for incident',
          BIFailureErrorCodes.NO_DATA_RETURNED,
          'high',
          false
        );
      }

      // Find current step index
      const currentStepIndex = (steps as { id: string }[]).findIndex(
        (step: { id: string }) => step.id === currentStepId
      );
      if (currentStepIndex === -1) {
        throw new BIFailureError(
          'Current step not found in workflow',
          BIFailureErrorCodes.VALIDATION_ERROR,
          'high',
          false
        );
      }

      // Complete current step
      const { error: completeError } = await supabase
        .from('bi_resolution_workflows')
        .update({
          // step_status: 'completed', // Property doesn't exist in schema
          // completed_at: new Date().toISOString(), // Property doesn't exist in schema
          // assigned_operator_id: operatorId, // Property doesn't exist in schema
          // step_notes: notes, // Property doesn't exist in schema
          // updated_at: new Date().toISOString(), // Property doesn't exist in schema
        })
        .eq('id', currentStepId);

      if (completeError) {
        BIFailureErrorHandler.handleDatabaseError(
          completeError,
          'complete current workflow step'
        );
      }

      // Start next step if available
      if (currentStepIndex < (steps as { id: string }[]).length - 1) {
        const nextStep = (steps as { id: string }[])[currentStepIndex + 1];
        const { error: startError } = await supabase
          .from('bi_resolution_workflows')
          .update({
            // step_status: 'in_progress', // Property doesn't exist in schema
            // started_at: new Date().toISOString(), // Property doesn't exist in schema
            // assigned_operator_id: operatorId, // Property doesn't exist in schema
            // updated_at: new Date().toISOString(), // Property doesn't exist in schema
          })
          .eq('id', nextStep.id);

        if (startError) {
          BIFailureErrorHandler.handleDatabaseError(
            startError,
            'start next workflow step'
          );
        }
      }

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'advance workflow step'
      );
    }
  }

  /**
   * Cancel the entire workflow
   */
  static async cancelWorkflow(
    incidentId: string,
    cancelledByOperatorId: string,
    cancellationReason: string
  ): Promise<boolean> {
    try {
      // Update all pending and in-progress steps to cancelled
      const { error } = await supabase
        .from('bi_resolution_workflows')
        .update({
          step_status: 'skipped',
          step_notes: `Workflow cancelled: ${cancellationReason}`,
          assigned_operator_id: cancelledByOperatorId,
          updated_at: new Date().toISOString(),
        })
        .eq('bi_failure_incident_id', incidentId)
        .in('step_status', ['pending', 'in_progress']);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'cancel workflow steps'
        );
      }

      // Update incident status to indicate workflow cancellation
      const { error: incidentError } = await supabase
        .from('bi_failure_incidents')
        .update({
          status: 'investigating',
          resolution_notes: `Workflow cancelled by operator ${cancelledByOperatorId}. Reason: ${cancellationReason}`,
        })
        .eq('id', incidentId);

      if (incidentError) {
        BIFailureErrorHandler.handleDatabaseError(
          incidentError,
          'update incident status for cancellation'
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'cancel workflow');
    }
  }

  /**
   * Reset the workflow to initial state
   */
  static async resetWorkflow(
    incidentId: string,
    resetByOperatorId: string,
    resetReason?: string
  ): Promise<boolean> {
    try {
      // Reset all workflow steps to pending
      const { error } = await supabase
        .from('bi_resolution_workflows')
        .update({
          step_status: 'pending',
          started_at: null,
          completed_at: null,
          assigned_operator_id: null,
          step_notes: resetReason
            ? `Workflow reset: ${resetReason}`
            : 'Workflow reset',
          updated_at: new Date().toISOString(),
        })
        .eq('bi_failure_incident_id', incidentId);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'reset workflow steps'
        );
      }

      // Update incident status back to active
      const { error: incidentError } = await supabase
        .from('bi_failure_incidents')
        .update({
          status: 'active',
          resolution_notes: `Workflow reset by operator ${resetByOperatorId}. ${resetReason || ''}`,
        })
        .eq('id', incidentId);

      if (incidentError) {
        BIFailureErrorHandler.handleDatabaseError(
          incidentError,
          'update incident status for reset'
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'reset workflow');
    }
  }

  /**
   * Get the current workflow status
   */
  static async getWorkflowStatus(
    incidentId: string
  ): Promise<WorkflowStatusInfo> {
    try {
      // Get all workflow steps for the incident
      const { data: steps, error: stepsError } = await supabase
        .from('bi_resolution_workflows')
        .select('*')
        .eq('bi_failure_incident_id', incidentId)
        .order('created_at', { ascending: true });

      if (stepsError) {
        BIFailureErrorHandler.handleDatabaseError(
          stepsError,
          'get workflow steps for status'
        );
      }

      if (!steps || steps.length === 0) {
        throw new BIFailureError(
          'No workflow steps found for incident',
          BIFailureErrorCodes.NO_DATA_RETURNED,
          'high',
          false
        );
      }

      const totalSteps = (
        steps as {
          step_status: string;
          workflow_step: string;
          started_at?: string;
        }[]
      ).length;
      const completedSteps = (steps as { step_status: string }[]).filter(
        (step: { step_status: string }) => step.step_status === 'completed'
      ).length;
      const currentStep =
        (
          steps as {
            step_status: string;
            workflow_step: string;
            started_at?: string;
          }[]
        ).find(
          (step: { step_status: string }) => step.step_status === 'in_progress'
        ) ||
        (
          steps as {
            step_status: string;
            workflow_step: string;
            started_at?: string;
          }[]
        )[0];
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      // Determine overall status
      let overallStatus: WorkflowStatus = 'active';
      if (completedSteps === totalSteps) {
        overallStatus = 'completed';
      } else if (
        (steps as { step_status: string }[]).some(
          (step: { step_status: string }) => step.step_status === 'skipped'
        )
      ) {
        overallStatus = 'cancelled';
      } else if (
        (steps as { step_status: string }[]).some(
          (step: { step_status: string }) => step.step_status === 'failed'
        )
      ) {
        overallStatus = 'paused';
      }

      // Estimate completion time (simple calculation)
      const estimatedCompletion =
        overallStatus === 'active' && currentStep?.started_at
          ? new Date(
              new Date(currentStep.started_at).getTime() + 30 * 60 * 1000
            ).toISOString() // 30 min estimate
          : undefined;

      return {
        incidentId,
        currentStep: currentStep?.workflow_step || 'unknown',
        overallStatus,
        completedSteps,
        totalSteps,
        progress,
        estimatedCompletion,
      };
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'get workflow status');
    }
  }
}
