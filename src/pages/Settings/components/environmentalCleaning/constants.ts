import {
  mdiCog,
  mdiChartLine,
  mdiTarget,
  mdiShield,
  mdiBell,
  mdiTune,
} from '@mdi/js';

// Default form values
export const DEFAULT_AI_SETTINGS = {
  aiEnabled: false,
  predictiveCleaningEnabled: false,
  smartScheduling: false,
  contaminationPrediction: false,
  resourceOptimization: false,
  efficiencyAnalytics: false,
  smartRoomManagementEnabled: false,
  automaticPriorityAssignment: false,
  riskAssessment: false,
  trendAnalysis: false,
  predictiveMaintenance: false,
  supplyOptimizationEnabled: false,
  staffScheduling: false,
  costOptimization: false,
  inventoryPrediction: false,
  workloadBalancing: false,
  qualityAssuranceEnabled: false,
  complianceMonitoring: false,
  auditTrailEnhancement: false,
  performanceTracking: false,
  automatedReporting: false,
  realTimeMonitoringEnabled: false,
  anomalyDetection: false,
  smartNotifications: false,
  statusUpdates: false,
  emergencyAlerts: false,
  aiConfidenceThreshold: 0.85,
  aiDataRetentionDays: 90,
  realTimeProcessingEnabled: false,
  batchProcessingEnabled: false,
  dataSharingEnabled: false,
  localAIProcessingEnabled: false,
  encryptedDataTransmission: true,
  aiModelTraining: false,
};

export const DEFAULT_PROTOCOL_SETTINGS = {
  defaultCleaningDuration: 45,
  qualityScoreThreshold: 8,
  contaminationLevels: ['low', 'medium', 'high', 'critical'],
  cleaningTypes: ['routine', 'deep', 'emergency', 'post_procedure'],
  autoSchedulingEnabled: false,
  bufferTimeMinutes: 15,
  maxConcurrentCleanings: 3,
  weekendCleaningEnabled: true,
  complianceTrackingEnabled: true,
  auditLogRetentionDays: 365,
  regulatoryReportingEnabled: false,
  certificationTracking: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNotificationsEnabled: true,
  dailySummaryEnabled: true,
  urgentAlertsEnabled: true,
  completionNotificationsEnabled: false,
  inAppNotificationsEnabled: true,
  pushNotificationsEnabled: false,
  soundEnabled: true,
  adminNotificationsEnabled: true,
  staffNotificationsEnabled: false,
  supervisorNotificationsEnabled: true,
};

// Form validation limits
export const FORM_LIMITS = {
  defaultCleaningDuration: { min: 15, max: 180 },
  qualityScoreThreshold: { min: 1, max: 10 },
  bufferTimeMinutes: { min: 0, max: 60 },
  maxConcurrentCleanings: { min: 1, max: 10 },
  auditLogRetentionDays: { min: 30, max: 2555 },
  aiConfidenceThreshold: { min: 0.1, max: 1.0, step: 0.05 },
  aiDataRetentionDays: { min: 30, max: 1095 },
};

// Tab configuration
export const TABS = [
  { id: 'general', label: 'General', icon: mdiCog },
  { id: 'ai', label: 'AI & Analytics', icon: mdiChartLine },
  { id: 'protocols', label: 'Cleaning Protocols', icon: mdiTarget },
  { id: 'rooms', label: 'Room Management', icon: mdiShield },
  { id: 'checklists', label: 'Checklists', icon: mdiTarget },
  { id: 'notifications', label: 'Notifications', icon: mdiBell },
  { id: 'compliance', label: 'Compliance', icon: mdiShield },
  { id: 'advanced', label: 'Advanced', icon: mdiTune },
];

// AI Feature categories for rendering
export const AI_FEATURE_CATEGORIES = {
  predictiveCleaning: [
    {
      key: 'smartScheduling',
      label: 'Smart Scheduling',
      desc: 'AI-powered cleaning schedule optimization',
    },
    {
      key: 'contaminationPrediction',
      label: 'Contamination Prediction',
      desc: 'Predict when rooms need cleaning',
    },
    {
      key: 'resourceOptimization',
      label: 'Resource Optimization',
      desc: 'Optimize supplies and staff allocation',
    },
    {
      key: 'efficiencyAnalytics',
      label: 'Efficiency Analytics',
      desc: 'Track and improve cleaning efficiency',
    },
  ],
  smartRoomManagement: [
    {
      key: 'automaticPriorityAssignment',
      label: 'Automatic Priority Assignment',
      desc: 'AI-driven room priority calculation',
    },
    {
      key: 'riskAssessment',
      label: 'Risk Assessment',
      desc: 'Automated contamination risk analysis',
    },
    {
      key: 'trendAnalysis',
      label: 'Trend Analysis',
      desc: 'Identify cleaning pattern trends',
    },
    {
      key: 'predictiveMaintenance',
      label: 'Predictive Maintenance',
      desc: 'Equipment maintenance predictions',
    },
  ],
};

// Notification categories for rendering
export const NOTIFICATION_CATEGORIES = {
  email: [
    { key: 'emailNotificationsEnabled', label: 'Enable Email Notifications' },
    { key: 'dailySummaryEnabled', label: 'Daily Summary Reports' },
    { key: 'urgentAlertsEnabled', label: 'Urgent Alerts' },
    {
      key: 'completionNotificationsEnabled',
      label: 'Task Completion Notifications',
    },
  ],
  inApp: [
    { key: 'inAppNotificationsEnabled', label: 'Enable In-App Notifications' },
    { key: 'pushNotificationsEnabled', label: 'Push Notifications' },
    { key: 'soundEnabled', label: 'Sound Alerts' },
  ],
};

// Message display timeout
export const MESSAGE_TIMEOUT = 3000;

// Type exports for components
export type EnvironmentalCleaningAISettings = typeof DEFAULT_AI_SETTINGS;
export type CleaningProtocolSettings = typeof DEFAULT_PROTOCOL_SETTINGS;
export type NotificationSettings = typeof DEFAULT_NOTIFICATION_SETTINGS;
