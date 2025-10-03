import {
  SterilizationCycle,
  SterilizationPhase,
} from '../types/sterilizationCycleTypes';
import { PHASE_CONFIG } from '../../../config/workflowConfig';

// Cycle number generation utility
export const generateCycleNumber = (): string => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  // Get current cycle count from localStorage or start at 0
  const storageKey = `cycle_count_${dateStr}`;
  const currentCount = parseInt(localStorage.getItem(storageKey) || '0');
  const newCount = currentCount + 1;

  // Store the new count
  localStorage.setItem(storageKey, newCount.toString());

  return `CYCLE-${dateStr}-${String(newCount).padStart(3, '0')}`;
};

export const createNewCycle = (operator: string): SterilizationCycle => {
  const cycleId = `cycle_${Date.now()}`;
  const cycleNumber = generateCycleNumber();

  return {
    id: cycleId,
    cycleNumber,
    phases: [],
    tools: [],
    operator,
    startTime: new Date(),
    completedAt: null,
  };
};

export const createPhase = (
  phaseId: string,
  phaseName: string,
  duration: number,
  tools: string[] = []
): SterilizationPhase => {
  return {
    id: phaseId,
    name: phaseName,
    duration,
    tools,
    isActive: false,
    startTime: null,
    endTime: null,
    status: 'pending',
  };
};

export const getPhaseConfig = (phaseId: string) => {
  const phaseConfigs = {
    bath1: {
      name: PHASE_CONFIG.bath1.name,
      duration: PHASE_CONFIG.bath1.duration * 60,
    },
    bath2: {
      name: PHASE_CONFIG.bath2.name,
      duration: PHASE_CONFIG.bath2.duration * 60,
    },
    drying: {
      name: PHASE_CONFIG.drying.name,
      duration: PHASE_CONFIG.drying.duration * 60,
    },
    autoclave: {
      name: PHASE_CONFIG.autoclave.name,
      duration: PHASE_CONFIG.autoclave.duration * 60,
    },
  };

  return phaseConfigs[phaseId as keyof typeof phaseConfigs];
};

export const getNextPhaseId = (currentPhaseId: string): string | null => {
  const phaseOrder = ['bath1', 'bath2', 'drying', 'autoclave'];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhaseId);
  const nextPhaseId = phaseOrder[currentPhaseIndex + 1];

  return nextPhaseId || null;
};

export const isPhaseComplete = (phase: SterilizationPhase): boolean => {
  return phase.status === 'completed' && phase.endTime !== null;
};

export const isPhaseActive = (phase: SterilizationPhase): boolean => {
  return phase.status === 'active' && phase.isActive;
};

export const isPhasePending = (phase: SterilizationPhase): boolean => {
  return phase.status === 'pending';
};

export const hasAutoclavePhase = (cycle: SterilizationCycle): boolean => {
  return cycle.phases.some((phase) => phase.id === 'autoclave');
};

export const getCycleDuration = (cycle: SterilizationCycle): number => {
  if (!cycle.completedAt) return 0;

  const startTime = new Date(cycle.startTime);
  const endTime = new Date(cycle.completedAt);

  return endTime.getTime() - startTime.getTime();
};

export const getPhaseDuration = (phase: SterilizationPhase): number => {
  if (!phase.startTime || !phase.endTime) return 0;

  const startTime = new Date(phase.startTime);
  const endTime = new Date(phase.endTime);

  return endTime.getTime() - startTime.getTime();
};
