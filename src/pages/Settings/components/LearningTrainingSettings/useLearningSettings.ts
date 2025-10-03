import { useState } from 'react';
import {
  LearningAISettings,
  LearningGeneralSettings,
  CertificationSettings,
  LearningPathSettings,
} from './types';

export const useLearningSettings = () => {
  const [aiSettings, setAiSettings] = useState<LearningAISettings>({
    aiEnabled: true,
    personalizedRecommendations: true,
    skillGapAnalysis: true,
    learningPathOptimization: true,
    performancePrediction: true,
    adaptiveDifficulty: true,
    learningAnalyticsEnabled: true,
    behaviorTracking: true,
    progressPrediction: true,
    engagementMetrics: true,
    retentionAnalysis: true,
    aiConfidenceThreshold: 0.8,
    recommendationLimit: 5,
    dataRetentionDays: 365,
    modelVersion: 'v1.0',
    dataSharingEnabled: false,
    localAIProcessingEnabled: true,
    encryptedDataTransmission: true,
    aiModelTraining: false,
  });

  const [generalSettings, setGeneralSettings] =
    useState<LearningGeneralSettings>({
      enableLearningPaths: true,
      enableCertifications: true,
      enableProgressTracking: true,
      enableSocialLearning: false,
      defaultContentType: 'course',
      enableContentRating: true,
      enableComments: true,
      requireContentApproval: true,
      showLearningRecommendations: true,
      enableLearningReminders: true,
      adaptiveInterface: true,
      mobileLearningEnabled: true,
    });

  const [certificationSettings, setCertificationSettings] =
    useState<CertificationSettings>({
      enableAutoCertification: true,
      certificationExpiryDays: 365,
      requireReCertification: true,
      enableCertificationTemplates: true,
      complianceTrackingEnabled: true,
      regulatoryUpdatesEnabled: true,
      auditTrailEnabled: true,
      complianceReportingEnabled: true,
      enableAssessments: true,
      passingScoreThreshold: 80,
      maxAssessmentAttempts: 3,
      enableRetakes: true,
    });

  const [learningPathSettings, setLearningPathSettings] =
    useState<LearningPathSettings>({
      enableCustomPaths: true,
      enablePrerequisites: true,
      enableBranching: true,
      adaptivePathGeneration: true,
      enableMilestones: true,
      enableProgressGamification: true,
      enableLearningStreaks: true,
      enableAchievementBadges: true,
      estimatedCompletionTracking: true,
      enableStudyScheduling: true,
      optimalStudyTimeRecommendations: true,
      enableLearningReminders: true,
    });

  return {
    aiSettings,
    setAiSettings,
    generalSettings,
    setGeneralSettings,
    certificationSettings,
    setCertificationSettings,
    learningPathSettings,
    setLearningPathSettings,
  };
};
