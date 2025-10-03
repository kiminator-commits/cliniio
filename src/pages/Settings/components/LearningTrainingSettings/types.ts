export interface LearningAISettings {
  // Master AI Toggle
  aiEnabled: boolean;

  // AI Learning Features
  personalizedRecommendations: boolean;
  skillGapAnalysis: boolean;
  learningPathOptimization: boolean;
  performancePrediction: boolean;
  adaptiveDifficulty: boolean;

  // AI Analytics
  learningAnalyticsEnabled: boolean;
  behaviorTracking: boolean;
  progressPrediction: boolean;
  engagementMetrics: boolean;
  retentionAnalysis: boolean;

  // AI Configuration
  aiConfidenceThreshold: number;
  recommendationLimit: number;
  dataRetentionDays: number;
  modelVersion: string;

  // Privacy & Data
  dataSharingEnabled: boolean;
  localAIProcessingEnabled: boolean;
  encryptedDataTransmission: boolean;
  aiModelTraining: boolean;
}

export interface LearningGeneralSettings {
  // General Settings
  enableLearningPaths: boolean;
  enableCertifications: boolean;
  enableProgressTracking: boolean;
  enableSocialLearning: boolean;

  // Content Settings
  defaultContentType: string;
  enableContentRating: boolean;
  enableComments: boolean;
  requireContentApproval: boolean;

  // User Experience
  showLearningRecommendations: boolean;
  enableLearningReminders: boolean;
  adaptiveInterface: boolean;
  mobileLearningEnabled: boolean;
}

export interface CertificationSettings {
  // Certification Management
  enableAutoCertification: boolean;
  certificationExpiryDays: number;
  requireReCertification: boolean;
  enableCertificationTemplates: boolean;

  // Compliance
  complianceTrackingEnabled: boolean;
  regulatoryUpdatesEnabled: boolean;
  auditTrailEnabled: boolean;
  complianceReportingEnabled: boolean;

  // Assessment
  enableAssessments: boolean;
  passingScoreThreshold: number;
  maxAssessmentAttempts: number;
  enableRetakes: boolean;
}

export interface LearningPathSettings {
  // Learning Paths
  enableCustomPaths: boolean;
  enablePrerequisites: boolean;
  enableBranching: boolean;
  adaptivePathGeneration: boolean;

  // Progress Tracking
  enableMilestones: boolean;
  enableProgressGamification: boolean;
  enableLearningStreaks: boolean;
  enableAchievementBadges: boolean;

  // Time Management
  estimatedCompletionTracking: boolean;
  enableStudyScheduling: boolean;
  optimalStudyTimeRecommendations: boolean;
  enableLearningReminders: boolean;
}
