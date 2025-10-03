// Production BI Workflow Types
// Corresponds to Supabase database schema

export interface Facility {
  id: string;
  name: string;
  facility_code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  compliance_requirements: Record<string, unknown>;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  facility_id: string;
  user_id?: string; // Links to auth.users if using Supabase Auth
  name: string;
  email?: string;
  role: 'operator' | 'supervisor' | 'admin';
  certification_number?: string;
  certification_expiry?: string;
  permissions: Record<string, unknown>;
  performance_metrics: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SterilizationCycle {
  id: string;
  facility_id: string;
  operator_id?: string;
  cycle_number: string;
  cycle_type: 'standard' | 'express' | 'custom';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  start_time: string;
  end_time?: string;
  phases: SterilizationPhase[];
  tools: Tool[];
  cycle_parameters: CycleParameters;
  environmental_factors: EnvironmentalFactors;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SterilizationPhase {
  id: string;
  name: string;
  duration: number; // in seconds
  tools: string[]; // tool IDs
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
}

export interface Tool {
  id: string;
  name: string;
  barcode: string;
  category: string;
  status: 'available' | 'in_cycle' | 'maintenance' | 'retired';
  lastSterilized?: string;
  cycleCount: number;
  maxCycles?: number;
  location?: string;
  notes?: string;
  currentPhase?: string;
  startTime?: string;
  endTime?: string;
  phaseStartTime?: string;
  phaseEndTime?: string;
  biStatus?: 'pending' | 'pass' | 'fail' | 'in-progress';
  operator?: string;
  cycleId?: string;
  label?: string;
}

export interface CycleParameters {
  temperature_celsius?: number;
  pressure_psi?: number;
  duration_minutes?: number;
  humidity_percent?: number;
  load_type?: string;
  sterilization_method?: string;
  [key: string]: unknown;
}

export interface EnvironmentalFactors {
  room_temperature_celsius?: number;
  humidity_percent?: number;
  air_quality?: string;
  equipment_status?: string;
  [key: string]: unknown;
}

export interface BITestResult {
  id: string;
  facility_id: string;
  operator_id?: string;
  cycle_id?: string;
  test_number: string;
  test_date: string;
  result: 'pass' | 'fail' | 'skip';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  bi_lot_number?: string;
  bi_expiry_date?: string;
  incubation_time_minutes?: number;
  incubation_temperature_celsius?: number;
  test_conditions: TestConditions;
  failure_reason?: string;
  skip_reason?: string;
  compliance_notes?: string;
  audit_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface TestConditions {
  room_temperature_celsius?: number;
  humidity_percent?: number;
  equipment_used?: string;
  test_location?: string;
  operator_notes?: string;
  [key: string]: unknown;
}

export interface ComplianceAudit {
  id: string;
  facility_id: string;
  audit_type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'incident';
  audit_date: string;
  auditor_id?: string;
  audit_scope: Record<string, unknown>;
  findings: AuditFinding[];
  compliance_score?: number;
  recommendations?: string;
  corrective_actions: CorrectiveAction[];
  follow_up_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
  recommendations?: string;
  [key: string]: unknown;
}

export interface CorrectiveAction {
  id: string;
  action: string;
  assigned_to?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface Equipment {
  id: string;
  facility_id: string;
  equipment_type: string;
  model_number?: string;
  serial_number?: string;
  manufacturer?: string;
  installation_date?: string;
  last_calibration_date?: string;
  next_calibration_date?: string;
  maintenance_schedule: MaintenanceSchedule;
  performance_metrics: PerformanceMetrics;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  frequency_days?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_type?: string;
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  total_cycles?: number;
  success_rate?: number;
  average_cycle_time?: number;
  last_performance_check?: string;
  [key: string]: unknown;
}

export interface BITestTemplate {
  id: string;
  facility_id: string;
  template_name: string;
  template_type: 'standard' | 'custom' | 'emergency';
  test_parameters: TestParameters;
  compliance_requirements: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestParameters {
  incubation_time_minutes: number;
  incubation_temperature_celsius: number;
  bi_lot_requirements?: string[];
  environmental_requirements?: Record<string, unknown>;
  [key: string]: unknown;
}

// Analytics and Reporting Types
export interface BIPassRateAnalytics {
  facility_name: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
}

export interface OperatorPerformance {
  operator_name: string;
  total_cycles: number;
  completed_cycles: number;
  bi_tests_performed: number;
  bi_pass_rate: number;
  avg_cycle_duration_minutes: number;
}

export interface BITestAnalytics {
  facility_name: string;
  facility_code: string;
  operator_name?: string;
  operator_role?: string;
  test_date: string;
  result: 'pass' | 'fail' | 'skip';
  status: string;
  cycle_type?: string;
  cycle_parameters?: CycleParameters;
  test_conditions?: TestConditions;
  failure_reason?: string;
  skip_reason?: string;
}

// API Request/Response Types
export interface CreateBITestRequest {
  facility_id: string;
  operator_id?: string;
  cycle_id?: string;
  result: 'pass' | 'fail' | 'skip';
  bi_lot_number?: string;
  bi_expiry_date?: string;
  incubation_time_minutes?: number;
  incubation_temperature_celsius?: number;
  test_conditions?: TestConditions;
  failure_reason?: string;
  skip_reason?: string;
  compliance_notes?: string;
}

export interface UpdateBITestRequest {
  id: string;
  result?: 'pass' | 'fail' | 'skip';
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  failure_reason?: string;
  skip_reason?: string;
  compliance_notes?: string;
  audit_signature?: string;
}

export interface BITestFilters {
  facility_id?: string;
  operator_id?: string;
  cycle_id?: string;
  result?: 'pass' | 'fail' | 'skip';
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// Real-time Subscription Types
export interface BITestSubscription {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: BITestResult;
  old_record?: BITestResult;
}

// AI/ML Types for Future Integration
export interface AIPrediction {
  prediction_type:
    | 'bi_failure'
    | 'cycle_optimization'
    | 'equipment_maintenance';
  confidence: number;
  factors: string[];
  recommendations: string[];
  timestamp: string;
}

export interface ComplianceForecast {
  facility_id: string;
  forecast_date: string;
  predicted_compliance_score: number;
  risk_factors: string[];
  recommendations: string[];
}
