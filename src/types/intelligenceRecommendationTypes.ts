export interface IntelligenceRecommendation {
  id: string;
  type:
    | 'cost_savings'
    | 'risk_mitigation'
    | 'efficiency'
    | 'training'
    | 'capacity'
    | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    costSavings?: number;
    timeSavings?: number;
    riskReduction?: number;
    efficiencyGain?: number;
  };
  actionItems: string[];
  timeline: string;
  confidence: number;
  category: string;
  relatedMetrics: string[];
}

export interface OptimizationTip {
  id: string;
  category: 'sterilization' | 'inventory' | 'staffing' | 'compliance' | 'cost';
  title: string;
  description: string;
  currentState: string;
  recommendedAction: string;
  expectedOutcome: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedEffort: string;
  priority: number;
}

export interface RiskAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  riskFactors: string[];
  immediateActions: string[];
  longTermSolutions: string[];
  escalationPath: string;
  deadline: string;
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
}
