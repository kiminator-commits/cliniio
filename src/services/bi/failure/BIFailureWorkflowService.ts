import { supabase } from '@/lib/supabaseClient';

export interface WorkflowStep {
  id: string;
  incident_id: string;
  step_id: 'quarantine' | 're-sterilization' | 'new-bi-test' | 'documentation';
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed';
  completed_by_user_id?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowProgress {
  step_id: string;
  step_order: number;
  status: string;
  completed_by_user_id?: string;
  completed_at?: string;
  notes?: string;
}

export interface CompleteStepParams {
  incidentId: string;
  stepId: string;
  userId: string;
  notes?: string;
}

export interface StartStepParams {
  incidentId: string;
  stepId: string;
  userId: string;
}

/**
 * Service for managing BI failure workflow steps
 * Enables multi-user collaboration on incident resolution
 */
export class BIFailureWorkflowService {
  /**
   * Get workflow progress for a specific incident
   */
  static async getWorkflowProgress(
    incidentId: string
  ): Promise<WorkflowProgress[]> {
    try {
      const { data, error } = await supabase
        .from('bi_failure_workflow_steps')
        .select('*')
        .eq('incident_id', incidentId)
        .order('step_order');

      if (error) {
        console.error('Failed to get workflow progress:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting workflow progress:', error);
      throw error;
    }
  }

  /**
   * Start a workflow step (mark as in_progress)
   * Only allows starting the next available step in sequence
   */
  static async startStep(params: StartStepParams): Promise<WorkflowStep> {
    try {
      // Get current workflow progress
      const progress = await this.getWorkflowProgress(params.incidentId);

      // Find the next available step
      const nextStep = progress.find((step) => step.status === 'pending');

      if (!nextStep || nextStep.step_id !== params.stepId) {
        throw new Error(
          `Step ${params.stepId} is not available. Next step should be ${nextStep?.step_id || 'none'}`
        );
      }

      // Update step to in_progress
      const { data, error } = await supabase
        .from('bi_failure_workflow_steps')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('incident_id', params.incidentId)
        .eq('step_id', params.stepId)
        .select()
        .single();

      if (error) {
        console.error('Failed to start workflow step:', error);
        throw error;
      }

      console.log(
        `✅ Started workflow step: ${params.stepId} for incident: ${params.incidentId}`
      );
      return data;
    } catch (error) {
      console.error('Error starting workflow step:', error);
      throw error;
    }
  }

  /**
   * Complete a workflow step
   * Only allows completing steps that are currently in_progress
   */
  static async completeStep(params: CompleteStepParams): Promise<WorkflowStep> {
    try {
      // Update step to completed
      const { data, error } = await supabase
        .from('bi_failure_workflow_steps')
        .update({
          status: 'completed',
          completed_by_user_id: params.userId,
          completed_at: new Date().toISOString(),
          notes: params.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('incident_id', params.incidentId)
        .eq('step_id', params.stepId)
        .select()
        .single();

      if (error) {
        console.error('Failed to complete workflow step:', error);
        throw error;
      }

      console.log(
        `✅ Completed workflow step: ${params.stepId} for incident: ${params.incidentId}`
      );
      return data;
    } catch (error) {
      console.error('Error completing workflow step:', error);
      throw error;
    }
  }

  /**
   * Check if a step can be started (is next in sequence)
   */
  static async canStartStep(
    incidentId: string,
    stepId: string
  ): Promise<boolean> {
    try {
      const progress = await this.getWorkflowProgress(incidentId);
      const nextStep = progress.find((step) => step.status === 'pending');
      return nextStep?.step_id === stepId;
    } catch (error) {
      console.error('Error checking if step can be started:', error);
      return false;
    }
  }

  /**
   * Check if a step can be completed (is currently in_progress)
   */
  static async canCompleteStep(
    incidentId: string,
    stepId: string
  ): Promise<boolean> {
    try {
      const progress = await this.getWorkflowProgress(incidentId);
      const step = progress.find((s) => s.step_id === stepId);
      return step?.status === 'in_progress';
    } catch (error) {
      console.error('Error checking if step can be completed:', error);
      return false;
    }
  }

  /**
   * Get workflow completion percentage
   */
  static async getWorkflowCompletion(incidentId: string): Promise<number> {
    try {
      const progress = await this.getWorkflowProgress(incidentId);
      const completedSteps = progress.filter(
        (step) => step.status === 'completed'
      ).length;
      const totalSteps = progress.length;

      return totalSteps > 0
        ? Math.round((completedSteps / totalSteps) * 100)
        : 0;
    } catch (error) {
      console.error('Error getting workflow completion:', error);
      return 0;
    }
  }

  /**
   * Check if workflow is fully completed
   */
  static async isWorkflowCompleted(incidentId: string): Promise<boolean> {
    try {
      const progress = await this.getWorkflowProgress(incidentId);
      return progress.every((step) => step.status === 'completed');
    } catch (error) {
      console.error('Error checking if workflow is completed:', error);
      return false;
    }
  }

  /**
   * Get current user's active step (if any)
   */
  static async getUserActiveStep(
    incidentId: string,
    userId: string
  ): Promise<WorkflowStep | null> {
    try {
      const { data, error } = await supabase
        .from('bi_failure_workflow_steps')
        .select('*')
        .eq('incident_id', incidentId)
        .eq('completed_by_user_id', userId)
        .eq('status', 'in_progress')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Failed to get user active step:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error getting user active step:', error);
      return null;
    }
  }
}
