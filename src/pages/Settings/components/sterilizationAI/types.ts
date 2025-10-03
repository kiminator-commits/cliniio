import { SterilizationAISettings as SterilizationAISettingsType } from '../../../../services/ai/sterilizationAIService';

export type { SterilizationAISettingsType };

export interface MessageType {
  type: 'success' | 'error';
  text: string;
}

export interface ApiKeyField {
  openai_api_key_encrypted: string;
  google_vision_api_key_encrypted: string;
  azure_computer_vision_key_encrypted: string;
}

export interface LocalStorageSettings {
  aiEnabled: boolean;
  computerVisionEnabled: boolean;
  toolConditionAssessment: boolean;
  barcodeQualityDetection: boolean;
  toolTypeRecognition: boolean;
  cleaningValidation: boolean;
  predictiveAnalyticsEnabled: boolean;
  cycleOptimization: boolean;
  failurePrediction: boolean;
  efficiencyOptimization: boolean;
  resourcePlanning: boolean;
  smartWorkflowEnabled: boolean;
  intelligentWorkflowSelection: boolean;
  automatedProblemDetection: boolean;
  smartPhaseTransitions: boolean;
  batchOptimization: boolean;
  qualityAssuranceEnabled: boolean;
  biologicalIndicatorAnalysis: boolean;
  complianceMonitoring: boolean;
  auditTrailEnhancement: boolean;
  riskAssessment: boolean;
  scannerIntelligenceEnabled: boolean;
  multiFormatBarcodeSupport: boolean;
  toolHistoryIntegration: boolean;
  smartValidation: boolean;
  errorPrevention: boolean;
  realTimeMonitoringEnabled: boolean;
  anomalyDetection: boolean;
  predictiveMaintenance: boolean;
  qualityDriftDetection: boolean;
  smartNotifications: boolean;
  aiConfidenceThreshold: number;
  aiDataRetentionDays: number;
  realTimeProcessingEnabled: boolean;
  batchProcessingEnabled: boolean;
  dataSharingEnabled: boolean;
  localAIProcessingEnabled: boolean;
  encryptedDataTransmission: boolean;
  aiModelTraining: boolean;
  autoOptimizationEnabled: boolean;
  performanceMonitoring: boolean;
  resourceOptimization: boolean;
  openaiApiKey?: string;
  googleVisionApiKey?: string;
  azureComputerVisionKey?: string;
}
