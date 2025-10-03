/**
 * Type definitions for sterilization operations and workflows.
 */

export interface SterilizationWorkflow {
  id: string;
  name: string;
  currentPhase: WorkflowPhase;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  temperature?: number;
  pressure?: number;
  duration?: number;
}

export type WorkflowPhase =
  | 'idle'
  | 'preparation'
  | 'cleaning'
  | 'sterilization'
  | 'cooling'
  | 'completion';

export interface WorkflowPhaseConfig {
  phase: WorkflowPhase;
  name: string;
  description: string;
  duration: number;
  temperature: number;
  pressure: number;
}

export interface SterilizationCompliance {
  compliant: boolean;
  issues: string[];
  lastCheck: Date;
  nextCheck: Date;
}

export interface WorkflowTransition {
  fromPhase: WorkflowPhase;
  toPhase: WorkflowPhase;
  timestamp: Date;
  operator: string;
  notes?: string;
}
