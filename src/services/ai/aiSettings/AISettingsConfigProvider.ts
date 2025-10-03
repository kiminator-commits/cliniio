// Service-specific settings interfaces
export interface SterilizationSettings {
  tool_condition_assessment?: boolean;
  barcode_quality_detection?: boolean;
  tool_type_recognition?: boolean;
  cycle_optimization?: boolean;
  failure_prediction?: boolean;
  ai_confidence_threshold?: number;
  ai_data_retention_days?: number;
}

export interface InventorySettings {
  image_recognition_enabled?: boolean;
  quality_assessment_enabled?: boolean;
  demand_forecasting_enabled?: boolean;
  cost_optimization_enabled?: boolean;
  smart_categorization_enabled?: boolean;
  ai_confidence_threshold?: number;
  ai_data_retention_days?: number;
}

export interface EnvironmentalSettings {
  predictive_cleaning_enabled?: boolean;
  smart_scheduling?: boolean;
  contamination_prediction?: boolean;
  resource_optimization?: boolean;
  efficiency_analytics?: boolean;
  ai_confidence_threshold?: number;
  ai_data_retention_days?: number;
}

export interface LearningSettings {
  personalized_recommendations?: boolean;
  skill_gap_analysis?: boolean;
  learning_path_optimization?: boolean;
  performance_prediction?: boolean;
  adaptive_difficulty?: boolean;
  ai_confidence_threshold?: number;
  ai_data_retention_days?: number;
}

// Unified AI Settings Interface
export interface UnifiedAISettings {
  // Master AI Toggle
  aiEnabled: boolean;

  // Computer Vision Features
  computerVision: {
    toolConditionAssessment: boolean;
    barcodeQualityDetection: boolean;
    toolTypeRecognition: boolean;
    cleaningValidation: boolean;
    damageDetection: boolean;
    wearAnalysis: boolean;
    imageRecognition: boolean;
    qualityAssessment: boolean;
  };

  // Predictive Analytics
  predictiveAnalytics: {
    cycleOptimization: boolean;
    failurePrediction: boolean;
    efficiencyOptimization: boolean;
    resourcePlanning: boolean;
    maintenancePrediction: boolean;
    qualityPrediction: boolean;
    demandForecasting: boolean;
    costOptimization: boolean;
    seasonalAnalysis: boolean;
  };

  // Smart Workflow
  smartWorkflow: {
    intelligentWorkflowSelection: boolean;
    automatedProblemDetection: boolean;
    smartPhaseTransitions: boolean;
    batchOptimization: boolean;
    toolGrouping: boolean;
    cycleScheduling: boolean;
    smartCategorization: boolean;
    autoClassification: boolean;
    smartFormFilling: boolean;
  };

  // Quality Assurance
  qualityAssurance: {
    biologicalIndicatorAnalysis: boolean;
    complianceMonitoring: boolean;
    auditTrailEnhancement: boolean;
    riskAssessment: boolean;
    qualityMetrics: boolean;
    regulatoryCompliance: boolean;
    smartValidation: boolean;
    errorPrevention: boolean;
  };

  // Real-time Monitoring
  realTimeMonitoring: {
    anomalyDetection: boolean;
    predictiveMaintenance: boolean;
    qualityDriftDetection: boolean;
    smartNotifications: boolean;
    performanceMonitoring: boolean;
    alertManagement: boolean;
    statusUpdates: boolean;
    emergencyAlerts: boolean;
  };

  // Analytics Configuration
  analytics: {
    dataCollection: boolean;
    realTimeUpdates: boolean;
    historicalDataRetention: boolean;
    exportCapabilities: boolean;
    dashboardCustomization: boolean;
    performanceMetrics: boolean;
    efficiencyTracking: boolean;
    costAnalysis: boolean;
  };

  // Intelligence Settings
  intelligence: {
    riskAssessment: boolean;
    alertSystem: boolean;
    escalationRules: boolean;
    aiRecommendations: boolean;
    optimizationTips: boolean;
    predictiveInsights: boolean;
    trendAnalysis: boolean;
    forecasting: boolean;
  };

  // Performance Monitoring
  performance: {
    accuracyTracking: boolean;
    responseTimeMonitoring: boolean;
    errorRateTracking: boolean;
    qualityMetrics: boolean;
    benchmarkComparison: boolean;
    performanceAlerts: boolean;
    optimizationSuggestions: boolean;
    modelHealthMonitoring: boolean;
  };

  // Data Privacy & Security
  privacy: {
    dataAnonymization: boolean;
    thirdPartyPermissions: boolean;
    complianceMonitoring: boolean;
    auditTrail: boolean;
    dataRetention: boolean;
    encryption: boolean;
    accessControl: boolean;
    privacyCompliance: boolean;
  };

  // Integration Settings
  integration: {
    externalServices: boolean;
    apiRateLimiting: boolean;
    webhookEndpoints: boolean;
    dataSharing: boolean;
    healthMonitoring: boolean;
    syncScheduling: boolean;
    backupSystems: boolean;
    crossPlatformSync: boolean;
  };

  // User Experience
  userExperience: {
    aiSuggestions: boolean;
    learningPaths: boolean;
    personalization: boolean;
    accessibility: boolean;
    languagePreferences: boolean;
    notificationPreferences: boolean;
    interfaceCustomization: boolean;
    helpSystem: boolean;
  };

  // Environmental AI Features
  environmental: {
    predictiveCleaning: boolean;
    smartScheduling: boolean;
    contaminationPrediction: boolean;
    resourceOptimization: boolean;
    efficiencyAnalytics: boolean;
    smartRoomManagement: boolean;
    automaticPriorityAssignment: boolean;
    riskAssessment: boolean;
    trendAnalysis: boolean;
    predictiveMaintenance: boolean;
    supplyOptimization: boolean;
    staffScheduling: boolean;
    costOptimization: boolean;
    inventoryPrediction: boolean;
    workloadBalancing: boolean;
    qualityAssurance: boolean;
    complianceMonitoring: boolean;
    auditTrailEnhancement: boolean;
    performanceTracking: boolean;
    automatedReporting: boolean;
    realTimeMonitoring: boolean;
    anomalyDetection: boolean;
    smartNotifications: boolean;
    statusUpdates: boolean;
    emergencyAlerts: boolean;
  };

  // Learning AI Features
  learning: {
    personalizedRecommendations: boolean;
    skillGapAnalysis: boolean;
    learningPathOptimization: boolean;
    performancePrediction: boolean;
    adaptiveDifficulty: boolean;
    learningAnalytics: boolean;
    behaviorTracking: boolean;
    progressPrediction: boolean;
    engagementMetrics: boolean;
    retentionAnalysis: boolean;
    learningEfficiency: boolean;
    contentOptimization: boolean;
    assessmentIntelligence: boolean;
    certificationTracking: boolean;
    competencyMapping: boolean;
    learningInsights: boolean;
  };

  // AI Configuration
  aiConfig: {
    aiConfidenceThreshold: number;
    aiDataRetentionDays: number;
    realTimeProcessingEnabled: boolean;
    batchProcessingEnabled: boolean;
    dataSharingEnabled: boolean;
    localAIProcessingEnabled: boolean;
    encryptedDataTransmission: boolean;
    aiModelTraining: boolean;
  };

  // API Keys (encrypted)
  apiKeys: {
    openaiApiKey?: string;
    googleVisionApiKey?: string;
    azureComputerVisionKey?: string;
  };

  // Metadata
  facilityId: string;
  aiVersion: string;
  updated_at: string;
}

export class AISettingsConfigProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  createDefaultSettings(): UnifiedAISettings {
    return {
      aiEnabled: true,
      computerVision: {
        toolConditionAssessment: true,
        barcodeQualityDetection: true,
        toolTypeRecognition: true,
        cleaningValidation: true,
        damageDetection: true,
        wearAnalysis: true,
        imageRecognition: true,
        qualityAssessment: true,
      },
      predictiveAnalytics: {
        cycleOptimization: true,
        failurePrediction: true,
        efficiencyOptimization: true,
        resourcePlanning: true,
        maintenancePrediction: true,
        qualityPrediction: true,
        demandForecasting: true,
        costOptimization: true,
        seasonalAnalysis: true,
      },
      smartWorkflow: {
        intelligentWorkflowSelection: true,
        automatedProblemDetection: true,
        smartPhaseTransitions: true,
        batchOptimization: true,
        toolGrouping: true,
        cycleScheduling: true,
        smartCategorization: true,
        autoClassification: true,
        smartFormFilling: true,
      },
      qualityAssurance: {
        biologicalIndicatorAnalysis: true,
        complianceMonitoring: true,
        auditTrailEnhancement: true,
        riskAssessment: true,
        qualityMetrics: true,
        regulatoryCompliance: true,
        smartValidation: true,
        errorPrevention: true,
      },
      realTimeMonitoring: {
        anomalyDetection: true,
        predictiveMaintenance: true,
        qualityDriftDetection: true,
        smartNotifications: true,
        performanceMonitoring: true,
        alertManagement: true,
        statusUpdates: true,
        emergencyAlerts: true,
      },
      analytics: {
        dataCollection: true,
        realTimeUpdates: true,
        historicalDataRetention: true,
        exportCapabilities: true,
        dashboardCustomization: true,
        performanceMetrics: true,
        efficiencyTracking: true,
        costAnalysis: true,
      },
      intelligence: {
        riskAssessment: true,
        alertSystem: true,
        escalationRules: true,
        aiRecommendations: true,
        optimizationTips: true,
        predictiveInsights: true,
        trendAnalysis: true,
        forecasting: true,
      },
      performance: {
        accuracyTracking: true,
        responseTimeMonitoring: true,
        errorRateTracking: true,
        qualityMetrics: true,
        benchmarkComparison: true,
        performanceAlerts: true,
        optimizationSuggestions: true,
        modelHealthMonitoring: true,
      },
      privacy: {
        dataAnonymization: true,
        thirdPartyPermissions: true,
        complianceMonitoring: true,
        auditTrail: true,
        dataRetention: true,
        encryption: true,
        accessControl: true,
        privacyCompliance: true,
      },
      integration: {
        externalServices: true,
        apiRateLimiting: true,
        webhookEndpoints: true,
        dataSharing: true,
        healthMonitoring: true,
        syncScheduling: true,
        backupSystems: true,
        crossPlatformSync: true,
      },
      userExperience: {
        aiSuggestions: true,
        learningPaths: true,
        personalization: true,
        accessibility: true,
        languagePreferences: true,
        notificationPreferences: true,
        interfaceCustomization: true,
        helpSystem: true,
      },
      environmental: {
        predictiveCleaning: false,
        smartScheduling: false,
        contaminationPrediction: false,
        resourceOptimization: false,
        efficiencyAnalytics: false,
        smartRoomManagement: false,
        automaticPriorityAssignment: false,
        riskAssessment: false,
        trendAnalysis: false,
        predictiveMaintenance: false,
        supplyOptimization: false,
        staffScheduling: false,
        costOptimization: false,
        inventoryPrediction: false,
        workloadBalancing: false,
        qualityAssurance: false,
        complianceMonitoring: false,
        auditTrailEnhancement: false,
        performanceTracking: false,
        automatedReporting: false,
        realTimeMonitoring: false,
        anomalyDetection: false,
        smartNotifications: false,
        statusUpdates: false,
        emergencyAlerts: false,
      },
      learning: {
        personalizedRecommendations: false,
        skillGapAnalysis: false,
        learningPathOptimization: false,
        performancePrediction: false,
        adaptiveDifficulty: false,
        learningAnalytics: false,
        behaviorTracking: false,
        progressPrediction: false,
        engagementMetrics: false,
        retentionAnalysis: false,
        learningEfficiency: false,
        contentOptimization: false,
        assessmentIntelligence: false,
        certificationTracking: false,
        competencyMapping: false,
        learningInsights: false,
      },
      aiConfig: {
        aiConfidenceThreshold: 0.8,
        aiDataRetentionDays: 365,
        realTimeProcessingEnabled: true,
        batchProcessingEnabled: true,
        dataSharingEnabled: false,
        localAIProcessingEnabled: true,
        encryptedDataTransmission: true,
        aiModelTraining: false,
      },
      apiKeys: {},
      facilityId: this.facilityId,
      aiVersion: '1.0.0',
      updated_at: new Date().toISOString(),
    };
  }

  mergeSettings(
    defaults: UnifiedAISettings,
    sterilization?: SterilizationSettings,
    inventory?: InventorySettings,
    environmental?: EnvironmentalSettings,
    learning?: LearningSettings
  ): UnifiedAISettings {
    // Merge sterilization settings
    if (sterilization) {
      defaults.computerVision.toolConditionAssessment =
        sterilization.tool_condition_assessment ??
        defaults.computerVision.toolConditionAssessment;
      defaults.computerVision.barcodeQualityDetection =
        sterilization.barcode_quality_detection ??
        defaults.computerVision.barcodeQualityDetection;
      defaults.computerVision.toolTypeRecognition =
        sterilization.tool_type_recognition ??
        defaults.computerVision.toolTypeRecognition;
      defaults.predictiveAnalytics.cycleOptimization =
        sterilization.cycle_optimization ??
        defaults.predictiveAnalytics.cycleOptimization;
      defaults.predictiveAnalytics.failurePrediction =
        sterilization.failure_prediction ??
        defaults.predictiveAnalytics.failurePrediction;
      defaults.aiConfig.aiConfidenceThreshold =
        sterilization.ai_confidence_threshold ??
        defaults.aiConfig.aiConfidenceThreshold;
      defaults.aiConfig.aiDataRetentionDays =
        sterilization.ai_data_retention_days ??
        defaults.aiConfig.aiDataRetentionDays;
    }

    // Merge inventory settings
    if (inventory) {
      defaults.computerVision.imageRecognition =
        inventory.image_recognition_enabled ??
        defaults.computerVision.imageRecognition;
      defaults.computerVision.qualityAssessment =
        inventory.quality_assessment_enabled ??
        defaults.computerVision.qualityAssessment;
      defaults.predictiveAnalytics.demandForecasting =
        inventory.demand_forecasting_enabled ??
        defaults.predictiveAnalytics.demandForecasting;
      defaults.predictiveAnalytics.costOptimization =
        inventory.cost_optimization_enabled ??
        defaults.predictiveAnalytics.costOptimization;
      defaults.smartWorkflow.smartCategorization =
        inventory.smart_categorization_enabled ??
        defaults.smartWorkflow.smartCategorization;
    }

    // Merge environmental settings
    if (environmental) {
      defaults.environmental.predictiveCleaning =
        environmental.predictive_cleaning_enabled ??
        defaults.environmental.predictiveCleaning;
      defaults.environmental.smartScheduling =
        environmental.smart_scheduling ??
        defaults.environmental.smartScheduling;
      defaults.environmental.contaminationPrediction =
        environmental.contamination_prediction ??
        defaults.environmental.contaminationPrediction;
      defaults.environmental.resourceOptimization =
        environmental.resource_optimization ??
        defaults.environmental.resourceOptimization;
      defaults.environmental.efficiencyAnalytics =
        environmental.efficiency_analytics ??
        defaults.environmental.efficiencyAnalytics;
    }

    // Merge learning settings
    if (learning) {
      defaults.learning.personalizedRecommendations =
        learning.personalized_recommendations ??
        defaults.learning.personalizedRecommendations;
      defaults.learning.skillGapAnalysis =
        learning.skill_gap_analysis ?? defaults.learning.skillGapAnalysis;
      defaults.learning.learningPathOptimization =
        learning.learning_path_optimization ??
        defaults.learning.learningPathOptimization;
      defaults.learning.performancePrediction =
        learning.performance_prediction ??
        defaults.learning.performancePrediction;
      defaults.learning.adaptiveDifficulty =
        learning.adaptive_difficulty ?? defaults.learning.adaptiveDifficulty;
    }

    return defaults;
  }

  extractSterilizationSettings(
    settings: Partial<UnifiedAISettings>
  ): SterilizationSettings {
    return {
      tool_condition_assessment:
        settings.computerVision?.toolConditionAssessment,
      barcode_quality_detection:
        settings.computerVision?.barcodeQualityDetection,
      tool_type_recognition: settings.computerVision?.toolTypeRecognition,
      cycle_optimization: settings.predictiveAnalytics?.cycleOptimization,
      failure_prediction: settings.predictiveAnalytics?.failurePrediction,
      ai_confidence_threshold: settings.aiConfig?.aiConfidenceThreshold,
      ai_data_retention_days: settings.aiConfig?.aiDataRetentionDays,
    };
  }

  extractInventorySettings(
    settings: Partial<UnifiedAISettings>
  ): InventorySettings {
    return {
      image_recognition_enabled: settings.computerVision?.imageRecognition,
      quality_assessment_enabled: settings.computerVision?.qualityAssessment,
      demand_forecasting_enabled:
        settings.predictiveAnalytics?.demandForecasting,
      cost_optimization_enabled: settings.predictiveAnalytics?.costOptimization,
      smart_categorization_enabled: settings.smartWorkflow?.smartCategorization,
      ai_confidence_threshold: settings.aiConfig?.aiConfidenceThreshold,
      ai_data_retention_days: settings.aiConfig?.aiDataRetentionDays,
    };
  }

  extractEnvironmentalSettings(
    settings: Partial<UnifiedAISettings>
  ): EnvironmentalSettings {
    return {
      predictive_cleaning_enabled: settings.environmental?.predictiveCleaning,
      smart_scheduling: settings.environmental?.smartScheduling,
      contamination_prediction: settings.environmental?.contaminationPrediction,
      resource_optimization: settings.environmental?.resourceOptimization,
      efficiency_analytics: settings.environmental?.efficiencyAnalytics,
      ai_confidence_threshold: settings.aiConfig?.aiConfidenceThreshold,
      ai_data_retention_days: settings.aiConfig?.aiDataRetentionDays,
    };
  }

  extractLearningSettings(
    settings: Partial<UnifiedAISettings>
  ): LearningSettings {
    return {
      personalized_recommendations:
        settings.learning?.personalizedRecommendations,
      skill_gap_analysis: settings.learning?.skillGapAnalysis,
      learning_path_optimization: settings.learning?.learningPathOptimization,
      performance_prediction: settings.learning?.performancePrediction,
      adaptive_difficulty: settings.learning?.adaptiveDifficulty,
      ai_confidence_threshold: settings.aiConfig?.aiConfidenceThreshold,
      ai_data_retention_days: settings.aiConfig?.aiDataRetentionDays,
    };
  }
}
