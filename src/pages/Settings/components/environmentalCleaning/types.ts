export interface EnvironmentalCleaningAISettings {
  // Master AI Toggle
  aiEnabled: boolean;

  // Predictive Cleaning
  predictiveCleaningEnabled: boolean;
  smartScheduling: boolean;
  contaminationPrediction: boolean;
  resourceOptimization: boolean;
  efficiencyAnalytics: boolean;

  // Smart Room Management
  smartRoomManagementEnabled: boolean;
  automaticPriorityAssignment: boolean;
  riskAssessment: boolean;
  trendAnalysis: boolean;
  predictiveMaintenance: boolean;

  // Supply & Staff Optimization
  supplyOptimizationEnabled: boolean;
  staffScheduling: boolean;
  costOptimization: boolean;
  inventoryPrediction: boolean;
  workloadBalancing: boolean;

  // Quality Assurance
  qualityAssuranceEnabled: boolean;
  complianceMonitoring: boolean;
  auditTrailEnhancement: boolean;
  performanceTracking: boolean;
  automatedReporting: boolean;

  // Real-time Monitoring
  realTimeMonitoringEnabled: boolean;
  anomalyDetection: boolean;
  smartNotifications: boolean;
  statusUpdates: boolean;
  emergencyAlerts: boolean;

  // AI Configuration
  aiConfidenceThreshold: number;
  aiDataRetentionDays: number;
  realTimeProcessingEnabled: boolean;
  batchProcessingEnabled: boolean;

  // Privacy & Data
  dataSharingEnabled: boolean;
  localAIProcessingEnabled: boolean;
  encryptedDataTransmission: boolean;
  aiModelTraining: boolean;
}

export interface CleaningProtocolSettings {
  // General Settings
  defaultCleaningDuration: number;
  qualityScoreThreshold: number;
  contaminationLevels: string[];
  cleaningTypes: string[];

  // Scheduling
  autoSchedulingEnabled: boolean;
  bufferTimeMinutes: number;
  maxConcurrentCleanings: number;
  weekendCleaningEnabled: boolean;

  // Compliance
  complianceTrackingEnabled: boolean;
  auditLogRetentionDays: number;
  regulatoryReportingEnabled: boolean;
  certificationTracking: boolean;
}

export interface NotificationSettings {
  // Email Notifications
  emailNotificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  urgentAlertsEnabled: boolean;
  completionNotificationsEnabled: boolean;

  // In-App Notifications
  inAppNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  soundEnabled: boolean;

  // Recipients
  adminNotificationsEnabled: boolean;
  staffNotificationsEnabled: boolean;
  supervisorNotificationsEnabled: boolean;
}

export interface Message {
  type: 'success' | 'error';
  text: string;
}

export interface Tab {
  id: string;
  label: string;
  icon: string;
}
