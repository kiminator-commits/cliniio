// Core data structures for sterilization AI service
export interface ToolHistory {
  id: string;
  tool_id: string;
  cycle_id?: string;
  usage_count: number;
  last_sterilization: string;
  condition_rating: string;
  wear_level: number;
}

export interface SterilizationCycle {
  id: string;
  duration_minutes: number;
  temperature: number;
  pressure: number;
  cycle_type: string;
  status: string;
  created_at: string;
}

export interface EquipmentData {
  id: string;
  name: string;
  type: string;
  status: string;
  last_maintenance: string;
  efficiency_rating: number;
}

export interface TrendData {
  efficiency: number[];
  quality: number[];
  duration: number[];
  temperature: number[];
}

// AI Service Interfaces
export interface SterilizationAIInsight {
  id: string;
  type:
    | 'cycle_optimization'
    | 'quality_assurance'
    | 'maintenance_prediction'
    | 'compliance_alert'
    | 'efficiency_improvement';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
  facility_id: string;
}

export interface ToolConditionAssessment {
  success: boolean;
  toolId?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  wearLevel: 'minimal' | 'moderate' | 'significant' | 'critical';
  cleaningQuality: 'excellent' | 'good' | 'fair' | 'poor';
  damageDetected: boolean;
  damageTypes?: string[];
  confidence: number;
  recommendations: string[];
  error?: string;
}

export interface CycleOptimization {
  cycleId: string;
  currentEfficiency: number;
  predictedEfficiency: number;
  optimizationSuggestions: string[];
  estimatedTimeSavings: number;
  recommendedParameters: {
    temperature?: number;
    pressure?: number;
    duration?: number;
    toolGrouping?: string[];
  };
  confidence: number;
}

export interface PredictiveAnalytics {
  equipmentMaintenance?: {
    equipmentId: string;
    nextMaintenanceDue: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    predictedIssues: string[];
  }[];
  cycleEfficiency?: {
    trend: 'improving' | 'stable' | 'declining';
    factors: string[];
    recommendations: string[];
  };
  qualityMetrics?: {
    currentQuality: number;
    predictedQuality: number;
    riskFactors: string[];
    improvementActions: string[];
  };
}

export interface SmartWorkflowSuggestion {
  toolId: string;
  recommendedWorkflow: 'clean' | 'dirty' | 'problem' | 'packaging';
  confidence: number;
  reasoning: string[];
  alternativeWorkflows: Array<{
    workflow: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface ComplianceAnalysis {
  cycleId: string;
  complianceScore: number;
  riskFactors: string[];
  requiredActions: string[];
  auditRecommendations: string[];
  regulatoryUpdates: string[];
}

export interface SterilizationAISettings {
  id?: string;
  facility_id: string;
  ai_enabled: boolean;
  ai_version: string;
  computer_vision_enabled: boolean;
  tool_condition_assessment: boolean;
  barcode_quality_detection: boolean;
  tool_type_recognition: boolean;
  cleaning_validation: boolean;
  predictive_analytics_enabled: boolean;
  cycle_optimization: boolean;
  failure_prediction: boolean;
  efficiency_optimization: boolean;
  resource_planning: boolean;
  smart_workflow_enabled: boolean;
  intelligent_workflow_selection: boolean;
  automated_problem_detection: boolean;
  smart_phase_transitions: boolean;
  batch_optimization: boolean;
  quality_assurance_enabled: boolean;
  biological_indicator_analysis: boolean;
  compliance_monitoring: boolean;
  audit_trail_enhancement: boolean;
  risk_assessment: boolean;
  scanner_intelligence_enabled: boolean;
  multi_format_barcode_support: boolean;
  tool_history_integration: boolean;
  smart_validation: boolean;
  error_prevention: boolean;
  real_time_monitoring_enabled: boolean;
  anomaly_detection: boolean;
  predictive_maintenance: boolean;
  quality_drift_detection: boolean;
  smart_notifications: boolean;
  ai_confidence_threshold: number;
  ai_data_retention_days: number;
  real_time_processing_enabled: boolean;
  batch_processing_enabled: boolean;
  openai_api_key_encrypted?: string;
  google_vision_api_key_encrypted?: string;
  azure_computer_vision_key_encrypted?: string;
  data_sharing_enabled: boolean;
  local_ai_processing_enabled: boolean;
  encrypted_data_transmission: boolean;
  ai_model_training: boolean;
  auto_optimization_enabled: boolean;
  performance_monitoring: boolean;
  resource_optimization: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Vision API Response Types
export interface GoogleVisionResponse {
  success: boolean;
  labels: string[];
  text: string[];
  objects: string[];
}

export interface AzureVisionResponse {
  success: boolean;
  description: string;
  tags: string[];
  confidence: number;
}

export interface VisionObject {
  name: string;
  confidence: number;
  boundingPoly: {
    vertices: Array<{ x: number; y: number }>;
  };
}
