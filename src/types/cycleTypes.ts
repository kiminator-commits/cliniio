export type WorkflowType =
  | 'standard'
  | 'express'
  | 'biological_indicator'
  | 'pre_vacuum'
  | 'clean'
  | 'dirty'
  | 'problem'
  | 'import'
  | 'packaging';

export interface SterilizationPhase {
  id: string;
  name: string;
  duration: number;
  tools: string[];
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
}

export interface SterilizationCycle {
  id: string;
  operator: string;
  startTime: Date;
  completedAt: string | null;
  phases: SterilizationPhase[];
  tools: string[];
}

export interface SterilizationSettings {
  defaultPhases: SterilizationPhase[];
  maxCycleDuration: number;
  temperatureTolerance: number;
  pressureTolerance: number;
  autoStartEnabled: boolean;
  notificationsEnabled: boolean;
}
