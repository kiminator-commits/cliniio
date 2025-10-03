export interface CleaningPrediction {
  id: string;
  roomId: string;
  facilityId: string;
  predictionDate: string;
  predictedCleaningDate: string;
  confidenceScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedDurationMinutes: number;
  predictedContaminationLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedSuppliesNeeded: string[];
  recommendedStaffCount: number;
  riskFactors: string[];
  aiModelVersion: string;
  expiresAt: string;
}

export interface CleaningPattern {
  id: string;
  roomId: string;
  facilityId: string;
  cleaningDate: string;
  cleaningDurationMinutes: number;
  contaminationLevel: 'low' | 'medium' | 'high' | 'critical';
  footTrafficLevel: 'low' | 'medium' | 'high';
  cleaningType: 'routine' | 'deep' | 'emergency' | 'post_procedure';
  suppliesUsed: string[];
  staffAssigned: string;
  qualityScore: number;
}

export interface RoomUsagePattern {
  id: string;
  roomId: string;
  facilityId: string;
  usageDate: string;
  usageHours: number;
  patientCount: number;
  procedureType: string;
  contaminationRisk: 'low' | 'medium' | 'high' | 'critical';
  specialRequirements: string[];
}

export interface PredictiveCleaningInsights {
  predictions: CleaningPrediction[];
  roomEfficiency: {
    roomId: string;
    averageCleaningTime: number;
    contaminationTrend: 'increasing' | 'decreasing' | 'stable';
    recommendedCleaningFrequency: number;
    riskScore: number;
  }[];
  supplyOptimization: {
    supplyName: string;
    predictedUsage: number;
    recommendedStock: number;
    reorderPoint: number;
  }[];
  staffingRecommendations: {
    date: string;
    recommendedStaffCount: number;
    highPriorityRooms: string[];
    estimatedWorkload: number;
  }[];
  overallEfficiency: number;
  riskAssessment: {
    highRiskRooms: string[];
    criticalContaminationAreas: string[];
    maintenanceAlerts: string[];
  };
}
