/**
 * Service for managing sterilization workflow operations.
 * Handles workflow validation, phase transitions, and compliance checks.
 */

interface WorkflowData {
  temperature?: number;
  pressure?: number;
  duration?: number;
  [key: string]: unknown;
}

export class SterilizationWorkflowService {
  /**
   * Validates if a workflow phase transition is allowed.
   */
  static validatePhaseTransition(
    currentPhase: string,
    targetPhase: string
  ): { isValid: boolean; error?: string } {
    const validTransitions: Record<string, string[]> = {
      idle: ['preparation', 'cleaning', 'sterilization'],
      preparation: ['cleaning', 'idle'],
      cleaning: ['sterilization', 'idle'],
      sterilization: ['cooling', 'idle'],
      cooling: ['completion', 'idle'],
      completion: ['idle'],
    };

    const allowedPhases = validTransitions[currentPhase] || [];

    if (!allowedPhases.includes(targetPhase)) {
      return {
        isValid: false,
        error: `Cannot transition from ${currentPhase} to ${targetPhase}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Calculates workflow duration between start and end times.
   */
  static calculateWorkflowDuration(startTime: Date, endTime: Date): number {
    return endTime.getTime() - startTime.getTime();
  }

  /**
   * Checks if workflow meets compliance requirements.
   */
  static checkCompliance(workflowData: WorkflowData): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Add compliance checks here
    if (!workflowData.temperature) {
      issues.push('Temperature monitoring required');
    }

    if (!workflowData.pressure) {
      issues.push('Pressure monitoring required');
    }

    if (!workflowData.duration) {
      issues.push('Duration tracking required');
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }
}
