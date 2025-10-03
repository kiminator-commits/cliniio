// Database interfaces
export interface InventoryAISettings {
  id: string;
  facility_id: string;
  ai_enabled: boolean;
  ai_version: string;
  computer_vision_enabled: boolean;
  barcode_scanning_enabled: boolean;
  image_recognition_enabled: boolean;
  quality_assessment_enabled: boolean;
  damage_detection_enabled: boolean;
  inventory_counting_enabled: boolean;
  predictive_analytics_enabled: boolean;
  demand_forecasting_enabled: boolean;
  maintenance_prediction_enabled: boolean;
  cost_optimization_enabled: boolean;
  seasonal_analysis_enabled: boolean;
  cycle_optimization_enabled: boolean;
  smart_categorization_enabled: boolean;
  auto_classification_enabled: boolean;
  smart_form_filling_enabled: boolean;
  intelligent_workflow_enabled: boolean;
  quality_assurance_enabled: boolean;
  compliance_monitoring_enabled: boolean;
  audit_trail_enhancement_enabled: boolean;
  risk_assessment_enabled: boolean;
  scanner_intelligence_enabled: boolean;
  multi_format_barcode_support: boolean;
  smart_validation_enabled: boolean;
  error_prevention_enabled: boolean;
  real_time_monitoring_enabled: boolean;
  anomaly_detection_enabled: boolean;
  predictive_maintenance_enabled: boolean;
  smart_notifications_enabled: boolean;
  ai_confidence_threshold: number;
  ai_data_retention_days: number;
  real_time_processing_enabled: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  facility_id: string;
  name: string;
  model_type: 'computer_vision' | 'predictive_analytics' | 'categorization';
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

export interface BarcodeAnalysisResult {
  id: string;
  facility_id: string;
  inventory_item_id?: string;
  transaction_id?: string;
  barcode_value?: string;
  barcode_type?: string;
  quality_rating?: 'excellent' | 'good' | 'fair' | 'poor';
  readability_score?: number;
  damage_detected: boolean;
  damage_types?: string[];
  confidence_score?: number;
  model_id?: string;
  processing_time_ms?: number;
  image_file_path?: string;
  ai_insights?: Record<string, unknown>;
  recommendations?: string[];
  created_by?: string;
  created_at: string;
}

export interface ImageRecognitionResult {
  id: string;
  facility_id: string;
  inventory_item_id?: string;
  transaction_id?: string;
  recognized_objects?: string[];
  object_confidence_scores?: number[];
  item_classification?: string;
  category_suggestion?: string;
  quality_assessment?: 'excellent' | 'good' | 'fair' | 'poor';
  damage_detected: boolean;
  damage_description?: string;
  condition_rating?: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  confidence_score?: number;
  model_id?: string;
  processing_time_ms?: number;
  image_file_path?: string;
  ai_insights?: Record<string, unknown>;
  recommendations?: string[];
  created_by?: string;
  created_at: string;
}

export interface DemandForecastingResult {
  id: string;
  facility_id: string;
  inventory_item_id?: string;
  forecast_period: 'week' | 'month' | 'quarter' | 'year';
  forecast_date: string;
  predicted_demand?: number;
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  seasonal_factors?: Record<string, unknown>;
  trend_analysis?: string;
  influencing_factors?: string[];
  confidence_score?: number;
  model_id?: string;
  processing_time_ms?: number;
  historical_data_points?: number;
  accuracy_metrics?: Record<string, unknown>;
  recommendations?: string[];
  created_by?: string;
  created_at: string;
}

export interface CostOptimizationResult {
  id: string;
  facility_id: string;
  optimization_type: 'purchasing' | 'storage' | 'transportation' | 'overall';
  current_cost?: number;
  optimized_cost?: number;
  cost_savings?: number;
  savings_percentage?: number;
  optimization_factors?: Record<string, unknown>;
  recommended_actions?: string[];
  implementation_timeline?: string;
  risk_assessment?: 'low' | 'medium' | 'high';
  confidence_score?: number;
  model_id?: string;
  processing_time_ms?: number;
  data_analysis_period?: string;
  roi_estimate?: number;
  created_by?: string;
  created_at: string;
}

export interface SmartCategorizationResult {
  id: string;
  facility_id: string;
  inventory_item_id?: string;
  suggested_category?: string;
  suggested_subcategory?: string;
  category_confidence_score?: number;
  alternative_categories?: string[];
  categorization_reasoning?: string[];
  form_fill_suggestions?: Record<string, unknown>;
  workflow_recommendations?: string[];
  confidence_score?: number;
  model_id?: string;
  processing_time_ms?: number;
  input_data_type?: 'image' | 'text' | 'barcode' | 'mixed';
  learning_feedback: boolean;
  user_acceptance?: boolean;
  created_by?: string;
  created_at: string;
}

export interface AIInventoryInsight {
  type:
    | 'barcode_analysis'
    | 'image_recognition'
    | 'demand_forecast'
    | 'cost_optimization'
    | 'categorization';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
  timestamp: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  id: string;
  actionable?: boolean;
}

// AI processing result types
export interface AIImageProcessingResult {
  confidence: number;
  damage_detected: boolean;
  damage_types: string[];
  objects: string[];
  confidence_scores: number[];
  classification: string;
  category: string;
  quality: string;
  condition: string;
  damage_description: string | null;
  recommendations: string[];
}

export interface AIForecastResult {
  predicted_demand: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  seasonal_factors: Record<string, unknown>;
  trend_analysis: string;
  influencing_factors: string[];
  confidence_score: number;
  accuracy_metrics: Record<string, unknown>;
  recommendations: string[];
}

export interface AIOptimizationResult {
  current_cost: number;
  optimized_cost: number;
  cost_savings: number;
  savings_percentage: number;
  optimization_factors: Record<string, unknown>;
  recommended_actions: string[];
  implementation_timeline: string;
  risk_assessment: 'low' | 'medium' | 'high';
  confidence_score: number;
  roi_estimate: number;
}

export interface AICategorizationResult {
  suggested_category: string;
  suggested_subcategory: string;
  category_confidence_score: number;
  alternative_categories: string[];
  categorization_reasoning: string[];
  form_fill_suggestions: Record<string, unknown>;
  workflow_recommendations: string[];
  confidence_score: number;
}

export interface HistoricalInventoryData {
  date: string;
  quantity: number;
  transaction_type: string;
}

export interface InventoryCostData {
  purchasing_costs: number;
  storage_costs: number;
  transportation_costs: number;
  total_cost: number;
}

export interface InventoryReportData {
  totalItems: number;
  categories: Record<string, number>;
  lowStockItems: Array<{
    id: string;
    name: string;
    current_stock: number;
    reorder_point: number;
  }>;
  highValueItems: Array<{
    id: string;
    name: string;
    value: number;
    category: string;
  }>;
}

export interface CostReportData {
  totalCosts: number;
  costByCategory: Record<string, number>;
  costTrends: Array<{
    month: string;
    cost: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

export interface MaintenanceReportData {
  totalMaintenance: number;
  maintenanceByType: Record<string, number>;
  upcomingMaintenance: Array<{
    id: string;
    equipment_name: string;
    due_date: string;
    type: string;
  }>;
}

export interface ComprehensiveReportData {
  inventory: InventoryReportData;
  predictive: Record<string, unknown>; // Will be defined when predictive analytics is implemented
  cost: CostReportData;
  maintenance: MaintenanceReportData;
  summary: {
    totalValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export type ReportData =
  | InventoryReportData
  | CostReportData
  | MaintenanceReportData
  | ComprehensiveReportData;
