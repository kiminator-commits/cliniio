export interface Tool {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  lastUsed?: Date;
  maintenanceDue?: Date;
}

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
  cycleNumber: string;
  phases: SterilizationPhase[];
  tools: string[];
  operator: string;
  startTime: Date;
  completedAt: string | null;
  batchId?: string;
}

export interface CycleStats {
  totalCycles: number;
  completedCycles: number;
  averageCycleTime: number;
  biPassRate: number;
  biPassRateTrend: {
    direction: 'up' | 'down' | 'warning';
    value: string;
  } | null;
  cycleTrend: {
    direction: 'up' | 'down';
    value: string;
  } | null;
  efficiencyScore: {
    score: number;
    trend: {
      direction: 'up' | 'down';
      value: string;
    } | null;
  };
}

// Shared interface for action creators
export interface SterilizationState {
  currentCycle: SterilizationCycle | null;
  cycles: SterilizationCycle[];
  error: string | null;
  [key: string]: unknown;
}

export interface SterilizationCycleState extends SterilizationState {
  setCurrentCycle: (cycle: SterilizationCycle | null) => void;
  setError: (error: string | null) => void;
  startNewCycle: (operator: string) => void;
  addToolToCycle: (toolId: string) => void;
  addPhaseToCycle: (
    phaseId: string,
    phaseName: string,
    duration: number
  ) => void;
  startPhase: (phaseId: string) => void;
  completePhase: (phaseId: string) => void;
  pausePhase: (phaseId: string) => void;
  moveToolToNextPhase: (toolId: string) => void;
  resetPhase: (phaseId: string) => void;
  loadCycles: (facilityId: string) => Promise<void>;
  getCycleStats: () => CycleStats;
}

export interface TrendData {
  direction: 'up' | 'down' | 'warning';
  value: string;
}

export interface EfficiencyScore {
  score: number;
  trend: {
    direction: 'up' | 'down';
    value: string;
  } | null;
  breakdown?: {
    sterilization: {
      completionRate: number;
      timeEfficiency: number;
      resourceUtilization: number;
      qualityScore: number;
      throughputEfficiency: number;
    };
    inventory: {
      efficiency: number;
      lowStockItems: number;
      totalItems: number;
      expiringItems: number;
      accuracy: number;
    };
    environmentalClean: {
      efficiency: number;
      cleaningEfficiency: number;
      totalRooms: number;
      cleanRooms: number;
      complianceScore: number;
    };
  };
}

export interface PhaseConfig {
  name: string;
  duration: number;
}

export interface CycleFilters {
  startDate: Date;
  endDate: Date;
  includeAutoclave: boolean;
}
