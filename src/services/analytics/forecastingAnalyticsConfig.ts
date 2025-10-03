// Forecasting Analytics Configuration Constants

// Cache Configuration
export const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for forecasting

// Tool Replacement Forecast Configuration
export const TOOL_REPLACEMENT_CONFIG = {
  MAX_LIFECYCLE: 95,
  MIN_LIFECYCLE: 10,
  LIFECYCLE_MULTIPLIER: 2.5,
  ANALYSIS_DAYS: 90,
  MAX_CYCLES_PER_DAY: 0.1,
  MIN_CONFIDENCE: 0.6,
  MAX_CONFIDENCE: 0.95,
  CONFIDENCE_BASE: 0.75,
  REORDER_DAYS_BEFORE_EOL: 30,
  MIN_REORDER_DAYS: 7,
} as const;

// Autoclave Capacity Configuration
export const AUTOCLAVE_CAPACITY_CONFIG = {
  ANALYSIS_DAYS: 30,
  RECENT_ANALYSIS_DAYS: 7,
  MAX_CAPACITY_PER_DAY: 24,
  MIN_LOAD_PERCENTAGE: 10,
  MAX_LOAD_PERCENTAGE: 100,
  HIGH_USAGE_THRESHOLD: 20,
  MEDIUM_USAGE_THRESHOLD: 15,
  HIGH_OVERLOAD_DAYS: 15,
  MEDIUM_OVERLOAD_DAYS: 45,
  LOW_OVERLOAD_DAYS: 90,
  HIGH_LOAD_THRESHOLD: 90,
  MEDIUM_LOAD_THRESHOLD: 75,
  LOW_LOAD_THRESHOLD: 60,
  HIGH_QUEUE_THRESHOLD: 5,
  HIGH_FAILURE_RATE: 0.1,
  PATIENT_LOAD_MULTIPLIER: 1.2,
} as const;

// Inventory Inflation Configuration
export const INVENTORY_INFLATION_CONFIG = {
  ANALYSIS_DAYS: 365,
  PROJECTION_MONTHS: 0.5, // 6 months projection
} as const;

// Clinical Staffing Configuration
export const CLINICAL_STAFFING_CONFIG = {
  ANALYSIS_DAYS: 30,
  DEFAULT_FTE: 8.5,
  WORKLOAD_INCREASE_THRESHOLD: 20,
  FTE_INCREASE: 0.5,
  COST_PER_FTE: 50000,
} as const;

// Admin Staffing Configuration
export const ADMIN_STAFFING_CONFIG = {
  ANALYSIS_DAYS: 30,
  GROWTH_RATE: 1.1, // 10% growth projection
  INCIDENT_RATE: 0.3, // 30% of incomplete cycles
  HIGH_WORKLOAD_THRESHOLD: 20,
  MEDIUM_WORKLOAD_THRESHOLD: 10,
  HIGH_COVERAGE_THRESHOLD: 15,
} as const;

// Theft Loss Configuration
export const THEFT_LOSS_CONFIG = {
  ANALYSIS_DAYS: 30,
  MAX_LOSS_PERCENTAGE: 10,
  VALUE_PER_PERCENTAGE: 1000,
  MAX_FLAGGED_ITEMS: 3,
  MIN_CONFIDENCE: 0.5,
} as const;

// Supply Depletion Configuration
export const SUPPLY_DEPLETION_CONFIG = {
  MAX_ITEMS: 8,
  DEFAULT_REORDER_POINT: 100,
  DEFAULT_UNIT_COST: 50,
  CRITICAL_THRESHOLD: 0.5,
  HIGH_THRESHOLD: 0.8,
  MEDIUM_THRESHOLD: 1.2,
  REORDER_DAYS_BEFORE_DEPLETION: 7,
  USAGE_DAYS: 30,
  COST_VARIANCE: 0.95,
  COST_VARIANCE_2: 0.98,
} as const;

// Tool Turnover Configuration
export const TOOL_TURNOVER_CONFIG = {
  ANALYSIS_DAYS: 30,
  MIN_UTILIZATION: 50,
  MAX_UTILIZATION: 100,
  PEAK_HOURS_THRESHOLD: 0.8,
  MAX_PEAK_HOURS: 4,
  DEFAULT_PEAK_HOURS: ['09:00', '12:00', '15:00'],
  EXCELLENT_EFFICIENCY: 90,
  GOOD_EFFICIENCY: 80,
  MODERATE_EFFICIENCY: 70,
  LOW_EFFICIENCY_THRESHOLD: 80,
  SIGNIFICANT_IDLE_THRESHOLD: 70,
} as const;

// Audit Risk Configuration
export const AUDIT_RISK_CONFIG = {
  ANALYSIS_DAYS: 7,
  INCOMPLETE_CYCLES_WEIGHT: 40,
  SKIPPED_INDICATORS_WEIGHT: 15,
  POLICY_DRIFT_WEIGHT: 0.4,
  CRITICAL_RISK_THRESHOLD: 80,
  HIGH_RISK_THRESHOLD: 60,
  MEDIUM_RISK_THRESHOLD: 40,
  MAX_SEVERITY: 10,
  MIN_SEVERITY: 1,
} as const;

// Training Knowledge Gaps Configuration
export const TRAINING_GAPS_CONFIG = {
  ANALYSIS_DAYS: 30,
  MAX_FAILED_STEPS: 3,
  FAILURE_WEIGHT: 40,
  SUCCESS_RATE_WEIGHT: 30,
  LOW_USER_WEIGHT: 20,
  EFFICIENCY_WEIGHT: 10,
  LOW_USER_THRESHOLD: 3,
  EFFICIENCY_THRESHOLD: 60,
  CRITICAL_FAILURE_THRESHOLD: 2,
  CRITICAL_SUCCESS_THRESHOLD: 80,
  DURATION_THRESHOLD: 60,
} as const;

// Efficiency ROI Configuration
export const EFFICIENCY_ROI_CONFIG = {
  ANALYSIS_DAYS: 30,
  BASE_HOURS: 40,
  HOURLY_RATE: 42,
  ANNUAL_MONTHS: 12,
  SCHEDULING_USAGE: 0.8,
  INVENTORY_USAGE: 0.6,
  MAINTENANCE_USAGE: 0.4,
  SCHEDULING_TIME_SAVINGS: 0.3,
  INVENTORY_TIME_SAVINGS: 0.2,
  MAINTENANCE_TIME_SAVINGS: 0.1,
  STERILIZATION_MODULE_WEIGHT: 0.5,
  INVENTORY_MODULE_WEIGHT: 0.3,
  ENVIRONMENTAL_MODULE_WEIGHT: 0.2,
  INVENTORY_EFFICIENCY_FACTOR: 0.9,
  ENVIRONMENTAL_EFFICIENCY_FACTOR: 0.8,
} as const;

// Sterilization Metrics Configuration
export const STERILIZATION_METRICS_CONFIG = {
  ANALYSIS_DAYS: 30,
  DEFAULT_PASS_RATE: 100,
  DEFAULT_EFFICIENCY: 100,
} as const;

// Inventory Metrics Configuration
export const INVENTORY_METRICS_CONFIG = {
  DEFAULT_TURNOVER_RATE: 80,
  DEFAULT_STOCK_LEVEL: 100,
} as const;

// Intelligence Summary Configuration
export const INTELLIGENCE_SUMMARY_CONFIG = {
  DEFAULT_CONFIDENCE: 0.89,
} as const;

// Timeline Configuration
export const TIMELINE_CONFIG = {
  IMMEDIATE: 'Immediate',
  Q1_2025: 'Q1 2025',
  Q2_2025: 'Q2 2025',
  Q3_2025: 'Q3 2025',
  NEXT_QUARTER: 'Next quarter',
  MONITOR_3_MONTHS: 'Monitor for 3 months',
} as const;

// Risk Level Configuration
export const RISK_LEVEL_CONFIG = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Reorder Urgency Configuration
export const REORDER_URGENCY_CONFIG = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Cost Trend Configuration
export const COST_TREND_CONFIG = {
  INCREASING: 'increasing',
  DECREASING: 'decreasing',
  STABLE: 'stable',
} as const;

// Recommended Action Configuration
export const RECOMMENDED_ACTION_CONFIG = {
  ADD_AUTOCLAVE: 'add_autoclave',
  EXTEND_HOURS: 'extend_hours',
  OPTIMIZE_SCHEDULE: 'optimize_schedule',
} as const;

// Priority Configuration
export const PRIORITY_CONFIG = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
