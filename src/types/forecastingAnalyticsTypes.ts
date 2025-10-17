import type { Json } from './database.types';
import { ToolStatus } from './toolTypes';

// Analytics filters interface
export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  facilityId?: string;
  category?: string;
}

// Database row interfaces
export interface _SterilizationCycleRow {
  id: string;
  facility_id: string;
  tool_batch_id: string | null;
  autoclave_id?: string;
  operator_id?: string;
  user_id?: string;
  cycle_date: string;
  cycle_type: string;
  temperature: number | null;
  temperature_celsius?: number;
  pressure: number | null;
  pressure_psi?: number;
  duration: number | null;
  duration_minutes?: number;
  status: ToolStatus;
  created_at: string;
  updated_at: string;
}

export interface _InventoryItemRow {
  id: string;
  facility_id: string;
  name: string;
  quantity: number | null;
  data: Json;
  created_at: string;
  updated_at: string;
}

// Intelligence forecasting interfaces
export interface ToolReplacementForecast {
  toolBatchId: string;
  toolName: string;
  currentLifecycle: number;
  predictedEndOfLife: string;
  confidence: number;
  recommendedReorderDate: string;
  supplierSuggestion: string;
  estimatedCost: number;
}

export interface AutoclaveCapacityForecast {
  autoclaveId: string;
  currentLoadPercentage: number;
  queueLength: number;
  predictedOverloadDate: string;
  recommendedAction: 'add_autoclave' | 'extend_hours' | 'optimize_schedule';
  timeline: string;
  projectedPatientLoad: number;
}

export interface InventoryInflationForecast {
  category: string;
  currentPrice: number;
  priceIncrease: number;
  inflationRate: number;
  projectedYearEndPrice: number;
  cheaperSupplierExists: boolean;
  alternativeSupplier?: string;
  costSavings?: number;
}

export interface ClinicalStaffingForecast {
  currentFTE: number;
  recommendedFTE: number;
  timeline: string;
  workloadIncrease: number;
  skillsetGaps: string[];
  trainingRecommendations: string[];
  estimatedCost: number;
}

export interface AdminStaffingForecast {
  currentWorkload: number;
  projectedWorkload: number;
  workloadExcess: number;
  recommendedCoverage: string;
  qualityIncidents: number;
  resolutionLag: number;
  priority: 'low' | 'medium' | 'high';
}

export interface TheftLossEstimate {
  estimatedLossPercentage: number;
  estimatedLossValue: number;
  flaggedItems: string[];
  repeatOffenders: string[];
  riskFactors: string[];
  recommendedActions: string[];
  confidence: number;
}

export interface SupplyDepletionForecast {
  itemName: string;
  currentStock: number;
  depletionDate: string;
  reorderUrgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedReorderDate: string;
  currentCost: number;
  historicalCosts: number[];
  costTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface ToolTurnoverUtilization {
  toolBatchId: string;
  toolName: string;
  dailyCycleCount: number;
  weeklyUtilization: number;
  averageCyclesPerDay: number;
  peakUsageHours: string[];
  utilizationEfficiency: number;
  turnoverRate: number; // How many times it's used per day
  idleTimePercentage: number;
  recommendedOptimization: string;
  bottleneckIndicators: string[];
  performanceScore: number;
}

export interface AuditRiskScore {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    severity: number;
    description: string;
  }>;
  skippedIndicators: number;
  incompleteCycles: number;
  policyDrift: number;
  recommendedActions: string[];
}

export interface TrainingKnowledgeGaps {
  usersWithGaps: Array<{
    userId: string;
    userName: string;
    failedSteps: string[];
    skippedContent: string[];
    recommendedTraining: string[];
    performanceMetrics: {
      totalCycles: number;
      successRate: number;
      averageDuration: number;
    };
  }>;
  overallGapScore: number;
  criticalGaps: string[];
  knowledgeHubRecommendations: string[];
}

export interface EfficiencyROITracker {
  timeSavedHours: number;
  estimatedLaborSavings: number;
  aiFeatureUsage: {
    feature: string;
    usageCount: number;
    timeSaved: number;
  }[];
  automationEfficiency: number;
  moduleContributions: Array<{
    module: string;
    timeSaved: number;
    costSavings: number;
    efficiency: number;
  }>;
  projectedAnnualSavings: number;
}

export interface IntelligenceSummary {
  toolReplacement: ToolReplacementForecast[];
  autoclaveCapacity: AutoclaveCapacityForecast[];
  inventoryInflation: InventoryInflationForecast[];
  clinicalStaffing: ClinicalStaffingForecast;
  adminStaffing: AdminStaffingForecast;
  theftLoss: TheftLossEstimate;
  supplyDepletion: SupplyDepletionForecast[];
  toolTurnoverUtilization: ToolTurnoverUtilization[];
  auditRisk: AuditRiskScore;
  trainingGaps: TrainingKnowledgeGaps;
  efficiencyROI: EfficiencyROITracker;
  // Add missing metrics for optimization tips
  sterilization: {
    biPassRate: number;
    cycleEfficiency: number;
    qualityScore: number;
  };
  inventory: {
    turnoverRate: number;
    stockLevel: number;
    reorderEfficiency: number;
  };
  lastUpdated: string;
  confidence: number;
}
