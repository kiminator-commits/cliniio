// Core data structures for environmental AI service
export interface RoomData {
  id: string;
  room_id: string;
  room_name: string;
  room_type: string;
  last_cleaned: string;
  cleaning_frequency: number;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  contamination_risk: number;
  usage_pattern: Record<string, unknown>;
  maintenance_status: string;
}

export interface CleaningSession {
  id: string;
  room_id: string;
  session_type: string;
  duration_minutes: number;
  cleaning_quality_score: number;
  resources_used: Record<string, unknown>;
  staff_assigned: string[];
  completion_status: string;
  created_at: string;
}

export interface ContaminationData {
  id: string;
  room_id: string;
  contamination_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
  source: string;
  mitigation_actions: string[];
  resolved: boolean;
}

export interface ResourceUsage {
  cleaning_supplies: number;
  staff_hours: number;
  equipment_usage: number;
  water_usage: number;
  energy_consumption: number;
}

// AI Service Interfaces
export interface EnvironmentalAIInsight {
  id: string;
  type:
    | 'predictive_cleaning'
    | 'contamination_prediction'
    | 'resource_optimization'
    | 'smart_scheduling'
    | 'risk_assessment'
    | 'trend_analysis'
    | 'anomaly_detection'
    | 'quality_assurance';
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

export interface PredictiveCleaningResult {
  id: string;
  facility_id: string;
  room_id: string;
  predicted_cleaning_date: string;
  confidence_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  cleaning_type: 'routine' | 'deep' | 'emergency' | 'maintenance';
  estimated_duration: number;
  required_resources: string[];
  risk_factors: string[];
  optimization_suggestions: string[];
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface ContaminationPredictionResult {
  id: string;
  facility_id: string;
  room_id: string;
  contamination_probability: number;
  predicted_contamination_type: string;
  risk_factors: string[];
  prevention_measures: string[];
  early_warning_signs: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface ResourceOptimizationResult {
  id: string;
  facility_id: string;
  optimization_type:
    | 'staff_scheduling'
    | 'supply_management'
    | 'cost_reduction'
    | 'efficiency';
  current_usage: ResourceUsage;
  optimized_usage: ResourceUsage;
  savings_percentage: number;
  cost_savings: number;
  efficiency_improvement: number;
  recommended_actions: string[];
  implementation_timeline: string;
  risk_assessment: 'low' | 'medium' | 'high';
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface SmartSchedulingResult {
  id: string;
  facility_id: string;
  room_id: string;
  optimal_cleaning_time: string;
  staff_recommendations: string[];
  resource_requirements: string[];
  conflict_avoidance: string[];
  efficiency_score: number;
  cost_optimization: number;
  quality_assurance: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface RiskAssessmentResult {
  id: string;
  facility_id: string;
  room_id: string;
  overall_risk_score: number;
  risk_categories: {
    contamination: number;
    compliance: number;
    safety: number;
    efficiency: number;
  };
  risk_factors: string[];
  mitigation_strategies: string[];
  priority_actions: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface TrendAnalysisResult {
  id: string;
  facility_id: string;
  analysis_type:
    | 'cleaning_efficiency'
    | 'resource_usage'
    | 'quality_trends'
    | 'cost_analysis';
  trend_direction: 'improving' | 'stable' | 'declining';
  trend_strength: number;
  key_insights: string[];
  contributing_factors: string[];
  recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface AnomalyDetectionResult {
  id: string;
  facility_id: string;
  room_id?: string;
  anomaly_type:
    | 'unusual_usage'
    | 'quality_deviation'
    | 'resource_spike'
    | 'schedule_disruption';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  normal_range: Record<string, unknown>;
  actual_value: Record<string, unknown>;
  potential_causes: string[];
  recommended_actions: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface QualityAssuranceResult {
  id: string;
  facility_id: string;
  room_id: string;
  quality_score: number;
  quality_metrics: {
    cleanliness: number;
    compliance: number;
    efficiency: number;
    safety: number;
  };
  quality_trends: Record<string, unknown>;
  improvement_areas: string[];
  best_practices: string[];
  compliance_status: string;
  audit_recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface EnvironmentalAISettings {
  id?: string;
  facility_id: string;
  ai_enabled: boolean;
  ai_version: string;
  predictive_cleaning_enabled: boolean;
  smart_scheduling: boolean;
  contamination_prediction: boolean;
  resource_optimization: boolean;
  efficiency_analytics: boolean;
  smart_room_management_enabled: boolean;
  automatic_priority_assignment: boolean;
  risk_assessment: boolean;
  trend_analysis: boolean;
  predictive_maintenance: boolean;
  supply_optimization_enabled: boolean;
  staff_scheduling: boolean;
  cost_optimization: boolean;
  inventory_prediction: boolean;
  workload_balancing: boolean;
  quality_assurance_enabled: boolean;
  compliance_monitoring: boolean;
  audit_trail_enhancement: boolean;
  performance_tracking: boolean;
  automated_reporting: boolean;
  real_time_monitoring_enabled: boolean;
  anomaly_detection: boolean;
  smart_notifications: boolean;
  status_updates: boolean;
  emergency_alerts: boolean;
  ai_confidence_threshold: number;
  ai_data_retention_days: number;
  real_time_processing_enabled: boolean;
  batch_processing_enabled: boolean;
  data_sharing_enabled: boolean;
  local_ai_processing_enabled: boolean;
  encrypted_data_transmission: boolean;
  ai_model_training: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIModel {
  id: string;
  facility_id: string;
  name: string;
  model_type:
    | 'predictive_cleaning'
    | 'contamination_detection'
    | 'resource_optimization'
    | 'trend_analysis';
  provider: 'openai' | 'google' | 'azure' | 'custom';
  version: string;
  description?: string;
  model_parameters?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  deployment_status: 'deployed' | 'testing' | 'archived';
  accuracy_score?: number;
  processing_time_ms?: number;
  cost_per_request?: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// AI processing result types
export interface AIPredictiveCleaningResult {
  predicted_cleaning_date: string;
  confidence_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  cleaning_type: 'routine' | 'deep' | 'emergency' | 'maintenance';
  estimated_duration: number;
  required_resources: string[];
  risk_factors: string[];
  optimization_suggestions: string[];
}

export interface AIContaminationPredictionResult {
  contamination_probability: number;
  predicted_contamination_type: string;
  risk_factors: string[];
  prevention_measures: string[];
  early_warning_signs: string[];
  confidence_score: number;
}

export interface AIResourceOptimizationResult {
  current_usage: ResourceUsage;
  optimized_usage: ResourceUsage;
  savings_percentage: number;
  cost_savings: number;
  efficiency_improvement: number;
  recommended_actions: string[];
  implementation_timeline: string;
  risk_assessment: 'low' | 'medium' | 'high';
  confidence_score: number;
}

export interface AISmartSchedulingResult {
  optimal_cleaning_time: string;
  staff_recommendations: string[];
  resource_requirements: string[];
  conflict_avoidance: string[];
  efficiency_score: number;
  cost_optimization: number;
  quality_assurance: string[];
  confidence_score: number;
}

export interface HistoricalCleaningData {
  date: string;
  room_id: string;
  cleaning_type: string;
  duration: number;
  quality_score: number;
  resources_used: ResourceUsage;
}

export interface EnvironmentalCleaningCostData {
  staff_costs: number;
  supply_costs: number;
  equipment_costs: number;
  utility_costs: number;
  total_cost: number;
}
