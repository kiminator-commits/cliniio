import { WorkflowPhase, WorkflowPhaseConfig } from '../types';

/**
 * Utility functions for sterilization operations.
 */

/**
 * Formats workflow duration in a human-readable format.
 */
export const formatWorkflowDuration = (durationMs: number): string => {
  const minutes = Math.floor(durationMs / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Gets the default configuration for a workflow phase.
 */
export const getPhaseConfig = (phase: WorkflowPhase): WorkflowPhaseConfig => {
  const configs: Record<WorkflowPhase, WorkflowPhaseConfig> = {
    idle: {
      phase: 'idle',
      name: 'Idle',
      description: 'System is ready for new workflow',
      duration: 0,
      temperature: 25,
      pressure: 1,
    },
    preparation: {
      phase: 'preparation',
      name: 'Preparation',
      description: 'Preparing tools and equipment',
      duration: 5 * 60 * 1000, // 5 minutes
      temperature: 25,
      pressure: 1,
    },
    cleaning: {
      phase: 'cleaning',
      name: 'Cleaning',
      description: 'Cleaning tools and equipment',
      duration: 10 * 60 * 1000, // 10 minutes
      temperature: 60,
      pressure: 1,
    },
    sterilization: {
      phase: 'sterilization',
      name: 'Sterilization',
      description: 'High-temperature sterilization process',
      duration: 30 * 60 * 1000, // 30 minutes
      temperature: 121,
      pressure: 2,
    },
    cooling: {
      phase: 'cooling',
      name: 'Cooling',
      description: 'Cooling down after sterilization',
      duration: 15 * 60 * 1000, // 15 minutes
      temperature: 40,
      pressure: 1,
    },
    completion: {
      phase: 'completion',
      name: 'Completion',
      description: 'Workflow completed successfully',
      duration: 0,
      temperature: 25,
      pressure: 1,
    },
  };

  return configs[phase];
};

/**
 * Validates temperature and pressure values for a given phase.
 */
export const validatePhaseParameters = (
  phase: WorkflowPhase,
  temperature: number,
  pressure: number
): { isValid: boolean; errors: string[] } => {
  const config = getPhaseConfig(phase);
  const errors: string[] = [];

  const tempTolerance = 5; // ±5°C tolerance
  if (Math.abs(temperature - config.temperature) > tempTolerance) {
    errors.push(
      `Temperature should be ${config.temperature}°C ±${tempTolerance}°C`
    );
  }

  const pressureTolerance = 0.2; // ±0.2 bar tolerance
  if (Math.abs(pressure - config.pressure) > pressureTolerance) {
    errors.push(
      `Pressure should be ${config.pressure} bar ±${pressureTolerance} bar`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
