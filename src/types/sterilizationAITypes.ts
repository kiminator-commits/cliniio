// Simple type definitions for sterilization AI components
export interface SterilizationAIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendations: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
  priority?: string;
  actionable?: boolean;
  confidence?: number;
  created_at?: string;
  data?: Record<string, unknown>;
}

export interface PredictiveAnalytics {
  equipmentMaintenance: Array<{
    data?: {
      equipmentId?: string;
      maintenanceDate?: string;
      priority?: string;
    };
  }>;
  cycleEfficiency: {
    recommendations: string[];
    trend?: string;
  };
  qualityMetrics: {
    improvementActions: string[];
    currentQuality?: number;
    predictedQuality?: number;
  };
}
