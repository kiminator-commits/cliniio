export interface SterilizationCycle {
  id: string;
  cycleId: string;
  facilityId: string;
  cycleType: string;
  status: string;
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

export interface CreateCycleResult {
  success: boolean;
  message: string;
  cycle?: SterilizationCycle;
  cycleId?: string;
}

export interface PhaseTransitionResult {
  success: boolean;
  message: string;
  phase?: CyclePhase;
  toolsRemoved?: string[];
}

export interface ToolStatus {
  id: string;
  name: string;
  barcode: string;
  toolType: string;
  priority: 'P1' | 'P2';
  status: string;
  currentPhase: string;
  currentCycleId?: string;
}

export interface SterilizationPhase {
  name: string;
  order: number;
  title: string;
}
