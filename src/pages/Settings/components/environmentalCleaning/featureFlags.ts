// Environment variable checks for feature flags
const getEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variables in window object or config
    const config =
      (window as { __ENV__?: Record<string, string | boolean> }).__ENV__ || {};
    return config[key] === 'true' || config[key] === true || defaultValue;
  }

  // Server-side: check process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] === 'true' || defaultValue;
  }

  return defaultValue;
};

// Feature flag configuration
const FEATURE_FLAGS = {
  ENHANCED_CHECKLISTS: 'REACT_APP_ENHANCED_CHECKLISTS_ENABLED',
  ROOM_AUDITS: 'REACT_APP_ROOM_AUDITS_ENABLED',
  AI_PREDICTIVE_CLEANING: 'REACT_APP_AI_PREDICTIVE_CLEANING_ENABLED',
  SMART_SCHEDULING: 'REACT_APP_SMART_SCHEDULING_ENABLED',
  CONTAMINATION_PREDICTION: 'REACT_APP_CONTAMINATION_PREDICTION_ENABLED',
  RESOURCE_OPTIMIZATION: 'REACT_APP_RESOURCE_OPTIMIZATION_ENABLED',
  EFFICIENCY_ANALYTICS: 'REACT_APP_EFFICIENCY_ANALYTICS_ENABLED',
  AUTOMATIC_PRIORITY_ASSIGNMENT:
    'REACT_APP_AUTOMATIC_PRIORITY_ASSIGNMENT_ENABLED',
  RISK_ASSESSMENT: 'REACT_APP_RISK_ASSESSMENT_ENABLED',
  TREND_ANALYSIS: 'REACT_APP_TREND_ANALYSIS_ENABLED',
  PREDICTIVE_MAINTENANCE: 'REACT_APP_PREDICTIVE_MAINTENANCE_ENABLED',
  SUPPLY_OPTIMIZATION: 'REACT_APP_SUPPLY_OPTIMIZATION_ENABLED',
  STAFF_SCHEDULING: 'REACT_APP_STAFF_SCHEDULING_ENABLED',
  COST_OPTIMIZATION: 'REACT_APP_COST_OPTIMIZATION_ENABLED',
  INVENTORY_PREDICTION: 'REACT_APP_INVENTORY_PREDICTION_ENABLED',
  WORKLOAD_BALANCING: 'REACT_APP_WORKLOAD_BALANCING_ENABLED',
  QUALITY_ASSURANCE: 'REACT_APP_QUALITY_ASSURANCE_ENABLED',
  COMPLIANCE_MONITORING: 'REACT_APP_COMPLIANCE_MONITORING_ENABLED',
  AUDIT_TRAIL_ENHANCEMENT: 'REACT_APP_AUDIT_TRAIL_ENHANCEMENT_ENABLED',
  PERFORMANCE_TRACKING: 'REACT_APP_PERFORMANCE_TRACKING_ENABLED',
  AUTOMATED_REPORTING: 'REACT_APP_AUTOMATED_REPORTING_ENABLED',
  REAL_TIME_MONITORING: 'REACT_APP_REAL_TIME_MONITORING_ENABLED',
  ANOMALY_DETECTION: 'REACT_APP_ANOMALY_DETECTION_ENABLED',
  SMART_NOTIFICATIONS: 'REACT_APP_SMART_NOTIFICATIONS_ENABLED',
  STATUS_UPDATES: 'REACT_APP_STATUS_UPDATES_ENABLED',
  EMERGENCY_ALERTS: 'REACT_APP_EMERGENCY_ALERTS_ENABLED',
  REAL_TIME_PROCESSING: 'REACT_APP_REAL_TIME_PROCESSING_ENABLED',
  BATCH_PROCESSING: 'REACT_APP_BATCH_PROCESSING_ENABLED',
  DATA_SHARING: 'REACT_APP_DATA_SHARING_ENABLED',
  LOCAL_AI_PROCESSING: 'REACT_APP_LOCAL_AI_PROCESSING_ENABLED',
  ENCRYPTED_DATA_TRANSMISSION: 'REACT_APP_ENCRYPTED_DATA_TRANSMISSION_ENABLED',
  AI_MODEL_TRAINING: 'REACT_APP_AI_MODEL_TRAINING_ENABLED',
};

// Feature flag evaluation functions
export const isEnhancedChecklistsEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.ENHANCED_CHECKLISTS, false);
};

export const isRoomAuditsEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.ROOM_AUDITS, false);
};

export const isAIPredictiveCleaningEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.AI_PREDICTIVE_CLEANING, false);
};

export const isSmartSchedulingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.SMART_SCHEDULING, false);
};

export const isContaminationPredictionEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.CONTAMINATION_PREDICTION, false);
};

export const isResourceOptimizationEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.RESOURCE_OPTIMIZATION, false);
};

export const isEfficiencyAnalyticsEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.EFFICIENCY_ANALYTICS, false);
};

export const isAutomaticPriorityAssignmentEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.AUTOMATIC_PRIORITY_ASSIGNMENT, false);
};

export const isRiskAssessmentEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.RISK_ASSESSMENT, false);
};

export const isTrendAnalysisEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.TREND_ANALYSIS, false);
};

export const isPredictiveMaintenanceEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.PREDICTIVE_MAINTENANCE, false);
};

export const isSupplyOptimizationEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.SUPPLY_OPTIMIZATION, false);
};

export const isStaffSchedulingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.STAFF_SCHEDULING, false);
};

export const isCostOptimizationEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.COST_OPTIMIZATION, false);
};

export const isInventoryPredictionEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.INVENTORY_PREDICTION, false);
};

export const isWorkloadBalancingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.WORKLOAD_BALANCING, false);
};

export const isQualityAssuranceEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.QUALITY_ASSURANCE, false);
};

export const isComplianceMonitoringEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.COMPLIANCE_MONITORING, false);
};

export const isAuditTrailEnhancementEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.AUDIT_TRAIL_ENHANCEMENT, false);
};

export const isPerformanceTrackingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.PERFORMANCE_TRACKING, false);
};

export const isAutomatedReportingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.AUTOMATED_REPORTING, false);
};

export const isRealTimeMonitoringEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.REAL_TIME_MONITORING, false);
};

export const isAnomalyDetectionEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.ANOMALY_DETECTION, false);
};

export const isSmartNotificationsEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.SMART_NOTIFICATIONS, false);
};

export const isStatusUpdatesEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.STATUS_UPDATES, false);
};

export const isEmergencyAlertsEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.EMERGENCY_ALERTS, false);
};

export const isRealTimeProcessingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.REAL_TIME_PROCESSING, false);
};

export const isBatchProcessingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.BATCH_PROCESSING, false);
};

export const isDataSharingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.DATA_SHARING, false);
};

export const isLocalAIProcessingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.LOCAL_AI_PROCESSING, false);
};

export const isEncryptedDataTransmissionEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.ENCRYPTED_DATA_TRANSMISSION, true);
};

export const isAIModelTrainingEnabled = (): boolean => {
  return getEnvVar(FEATURE_FLAGS.AI_MODEL_TRAINING, false);
};

// Master AI feature flag check
export const isMasterAIEnabled = (): boolean => {
  // Master AI is enabled if any of the core AI features are enabled
  return (
    isAIPredictiveCleaningEnabled() ||
    isSmartSchedulingEnabled() ||
    isContaminationPredictionEnabled() ||
    isResourceOptimizationEnabled() ||
    isEfficiencyAnalyticsEnabled() ||
    isAutomaticPriorityAssignmentEnabled() ||
    isRiskAssessmentEnabled() ||
    isTrendAnalysisEnabled() ||
    isPredictiveMaintenanceEnabled()
  );
};

// Helper function to check if a specific AI feature should be available
export const isAIFeatureAvailable = (featureKey: string): boolean => {
  const featureFlags: Record<string, () => boolean> = {
    smartScheduling: isSmartSchedulingEnabled,
    contaminationPrediction: isContaminationPredictionEnabled,
    resourceOptimization: isResourceOptimizationEnabled,
    efficiencyAnalytics: isEfficiencyAnalyticsEnabled,
    automaticPriorityAssignment: isAutomaticPriorityAssignmentEnabled,
    riskAssessment: isRiskAssessmentEnabled,
    trendAnalysis: isTrendAnalysisEnabled,
    predictiveMaintenance: isPredictiveMaintenanceEnabled,
    supplyOptimization: isSupplyOptimizationEnabled,
    staffScheduling: isStaffSchedulingEnabled,
    costOptimization: isCostOptimizationEnabled,
    inventoryPrediction: isInventoryPredictionEnabled,
    workloadBalancing: isWorkloadBalancingEnabled,
    qualityAssurance: isQualityAssuranceEnabled,
    complianceMonitoring: isComplianceMonitoringEnabled,
    auditTrailEnhancement: isAuditTrailEnhancementEnabled,
    performanceTracking: isPerformanceTrackingEnabled,
    automatedReporting: isAutomatedReportingEnabled,
    realTimeMonitoring: isRealTimeMonitoringEnabled,
    anomalyDetection: isAnomalyDetectionEnabled,
    smartNotifications: isSmartNotificationsEnabled,
    statusUpdates: isStatusUpdatesEnabled,
    emergencyAlerts: isEmergencyAlertsEnabled,
    realTimeProcessing: isRealTimeProcessingEnabled,
    batchProcessing: isBatchProcessingEnabled,
    dataSharing: isDataSharingEnabled,
    localAIProcessing: isLocalAIProcessingEnabled,
    encryptedDataTransmission: isEncryptedDataTransmissionEnabled,
    aiModelTraining: isAIModelTrainingEnabled,
  };

  return featureFlags[featureKey]?.() ?? false;
};
