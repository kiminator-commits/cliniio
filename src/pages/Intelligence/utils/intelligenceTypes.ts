// Core intelligence summary types
export interface IntelligenceSummary {
  toolReplacement?: ToolReplacement[];
  autoclaveCapacity?: AutoclaveCapacity[];
  supplyDepletion?: SupplyDepletion[];
  toolTurnoverUtilization?: ToolTurnoverUtilization[];
  auditRisk?: AuditRisk | null;
  theftLoss?: TheftLoss | null;
  trainingGaps?: TrainingGaps | null;
  efficiencyROI?: EfficiencyROI | null;
}

// Tool replacement types
export interface ToolReplacement {
  toolName: string;
  toolBatchId: string;
  currentLifecycle: number;
  predictedEndOfLife: string;
  recommendedReorderDate: string;
  confidence: number;
  estimatedCost: number;
  supplierSuggestion: string;
}

// Autoclave capacity types
export interface AutoclaveCapacity {
  autoclaveId: string;
  currentLoadPercentage: number;
  queueLength: number;
  predictedOverloadDate: string;
  recommendedAction: string;
  timeline: string;
}

// Supply depletion types
export interface SupplyDepletion {
  itemName: string;
  currentStock: number;
  depletionDate: string;
  recommendedReorderDate: string;
  reorderUrgency: 'low' | 'medium' | 'high' | 'critical';
  costTrend: string;
}

// Tool turnover utilization types
export interface ToolTurnoverUtilization {
  toolName: string;
  toolBatchId: string;
  performanceScore: number;
  dailyCycleCount: number;
  weeklyUtilization: number;
  averageCyclesPerDay: number;
  turnoverRate: number;
  utilizationEfficiency: number;
  idleTimePercentage: number;
  peakUsageHours: string[];
  recommendedOptimization: string;
  bottleneckIndicators: string[];
}

// Audit risk types
export interface AuditRisk {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  skippedIndicators: number;
  incompleteCycles: number;
  riskFactors?: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  description: string;
  severity: number;
}

// Theft loss types
export interface TheftLoss {
  estimatedLossPercentage: number;
  estimatedLossValue: number;
  flaggedItems: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

// Training gaps types
export interface TrainingGaps {
  overallGapScore: number;
  usersWithGaps?: UserTrainingGap[];
  criticalGaps?: string[];
}

export interface UserTrainingGap {
  userId: string;
  userName: string;
  performanceMetrics: PerformanceMetrics;
  failedSteps: string[];
  recommendedTraining: string[];
}

export interface PerformanceMetrics {
  successRate: number;
  totalCycles: number;
  averageDuration: number;
}

// Efficiency ROI types
export interface EfficiencyROI {
  automationEfficiency: number;
  timeSavedHours: number;
  estimatedLaborSavings: number;
  projectedAnnualSavings: number;
  aiFeatureUsage?: AIFeatureUsage[];
  moduleContributions?: ModuleContribution[];
}

export interface AIFeatureUsage {
  feature: string;
  timeSaved: number;
}

export interface ModuleContribution {
  module: string;
  efficiency: number;
}

// Intelligence recommendation types
export interface IntelligenceRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  confidence: number;
  category: string;
  impact: RecommendationImpact;
  actionItems: string[];
}

export interface RecommendationImpact {
  costSavings?: number;
  timeSavings?: number;
  riskReduction?: number;
}

// Optimization tip types
export interface OptimizationTip {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  currentState: string;
  recommendedAction: string;
  expectedOutcome: string;
  estimatedEffort: string;
}

// Integration metrics types
export interface IntegrationMetrics {
  knowledgeHubArticles: number;
  activeSuppliers: number;
  recentAuditActions: number;
  integrationHealth: number;
  lastSync: string;
}

// Action item types
export interface UrgentAction {
  type: 'critical_supply' | 'audit_risk';
  message: string;
  items?: SupplyDepletion[];
  riskScore?: AuditRisk;
}

// Tab types
export type IntelligenceTab =
  | 'overview'
  | 'forecasting'
  | 'risks'
  | 'actions'
  | 'insights'
  | 'integrations';

// Component prop types
export interface IntelligenceTabProps {
  summary: IntelligenceSummary;
}

export interface IntelligenceOverviewTabProps extends IntelligenceTabProps {
  hasHighRiskItems: () => boolean;
  getUrgentActions: () => UrgentAction[];
  getUrgencyColor: (urgency: string) => string;
  getRiskLevelColor: (level: string) => string;
  setActiveTab: (tab: string) => void;
}

export interface IntelligenceForecastingTabProps extends IntelligenceTabProps {
  getRiskLevelColor: (level: string) => string;
}

export interface IntelligenceRisksTabProps extends IntelligenceTabProps {
  getRiskLevelColor: (level: string) => string;
}

export interface IntelligenceActionsTabProps extends IntelligenceTabProps {
  getUrgentActions: () => UrgentAction[];
}

export interface IntelligenceInsightsTabProps {
  actionableInsights: Record<string, unknown>;
  insightsSummary: Record<string, unknown>;
  recommendations: IntelligenceRecommendation[];
  optimizationTips: OptimizationTip[];
  getPriorityColor: (priority: string) => string;
}

export interface IntelligenceIntegrationsTabProps {
  integrationMetrics: IntegrationMetrics | null;
}

// Utility function types
export type ColorGetter = (value: string) => string;
export type RiskAssessor = (summary: IntelligenceSummary) => boolean;
export type ActionGetter = (summary: IntelligenceSummary) => UrgentAction[];
