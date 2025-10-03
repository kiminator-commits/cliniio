// Service imports
import { SterilizationAIService } from '../sterilization/sterilizationAIService';
import { InventoryAIService } from '../inventoryAIService';
import { EnvironmentalAIService } from '../environmentalAI/environmentalAIService';
import { LearningAIService } from '../learningAI/learningAIService';
import { UnifiedAISettings } from './AISettingsConfigProvider';

export class AISettingsModelProvider {
  private facilityId: string;
  private sterilizationAI: SterilizationAIService;
  private inventoryAI: InventoryAIService;
  private environmentalAI: EnvironmentalAIService;
  private learningAI: LearningAIService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.sterilizationAI = new SterilizationAIService(facilityId);
    this.inventoryAI = new InventoryAIService(facilityId);
    this.environmentalAI = new EnvironmentalAIService(facilityId);
    this.learningAI = new LearningAIService(facilityId);
  }

  // Load unified AI settings from all services
  async loadUnifiedSettings(): Promise<UnifiedAISettings> {
    try {
      // Load settings from all AI services
      const [
        sterilizationSettings,
        inventorySettings,
        environmentalSettings,
        learningSettings,
      ] = await Promise.all([
        this.sterilizationAI.loadSettings(),
        this.inventoryAI.loadSettings(),
        this.environmentalAI.loadSettings(),
        this.learningAI.loadSettings(),
      ]);

      // Create default settings if none exist
      const defaultSettings = this.createDefaultSettings();

      // Merge existing settings with defaults
      return this.mergeSettings(
        defaultSettings,
        sterilizationSettings || undefined,
        inventorySettings || undefined,
        environmentalSettings || undefined,
        learningSettings || undefined
      );
    } catch (error) {
      console.error('Error loading unified AI settings:', error);
      return this.createDefaultSettings();
    }
  }

  // Save unified AI settings to all services
  async saveUnifiedSettings(
    settings: Partial<UnifiedAISettings>
  ): Promise<boolean> {
    try {
      // Extract service-specific settings
      const sterilizationSettings = this.extractSterilizationSettings(settings);
      const inventorySettings = this.extractInventorySettings(settings);
      const environmentalSettings = this.extractEnvironmentalSettings(settings);
      const learningSettings = this.extractLearningSettings(settings);

      // Save to respective services
      const [
        sterilizationResult,
        inventoryResult,
        environmentalResult,
        learningResult,
      ] = await Promise.all([
        this.sterilizationAI.saveSettings({
          facility_id: this.facilityId,
          ai_enabled: true,
          ai_version: '1.0',
          computer_vision_enabled:
            sterilizationSettings.tool_condition_assessment || false,
          tool_condition_assessment:
            sterilizationSettings.tool_condition_assessment || false,
          barcode_quality_detection:
            sterilizationSettings.barcode_quality_detection || false,
          tool_type_recognition:
            sterilizationSettings.tool_type_recognition || false,
          cleaning_validation: false,
          predictive_analytics_enabled:
            sterilizationSettings.failure_prediction || false,
          cycle_optimization: sterilizationSettings.cycle_optimization || false,
          failure_prediction: sterilizationSettings.failure_prediction || false,
          efficiency_optimization: false,
          resource_planning: false,
          smart_workflow_enabled: false,
          ai_confidence_threshold:
            sterilizationSettings.ai_confidence_threshold || 0.8,
          ai_data_retention_days:
            sterilizationSettings.ai_data_retention_days || 90,
        } as Record<string, unknown>),
        this.inventoryAI.saveSettings(inventorySettings),
        this.environmentalAI.saveSettings(environmentalSettings),
        this.learningAI.saveSettings(learningSettings),
      ]);

      return (
        sterilizationResult &&
        inventoryResult &&
        environmentalResult &&
        learningResult
      );
    } catch (error) {
      console.error('Error saving unified AI settings:', error);
      return false;
    }
  }

  // Apply settings to running AI services
  async applySettings(settings: Partial<UnifiedAISettings>): Promise<boolean> {
    try {
      // Update service configurations
      await this.sterilizationAI.initialize();
      // await this.inventoryAI.initialize();
      await this.environmentalAI.initialize();
      await this.learningAI.initialize();

      // Apply feature flags to services
      this.applyFeatureFlags(settings);

      return true;
    } catch (error) {
      console.error('Error applying AI settings:', error);
      return false;
    }
  }

  // Get AI service status
  async getServiceStatus(): Promise<{
    sterilization: boolean;
    inventory: boolean;
    environmental: boolean;
    learning: boolean;
  }> {
    try {
      const [sterilizationStatus, environmentalStatus, learningStatus] =
        await Promise.all([
          this.sterilizationAI.initialize(),
          this.environmentalAI.initialize(),
          this.learningAI.initialize(),
        ]);

      return {
        sterilization: sterilizationStatus,
        inventory: false, // inventoryStatus not available
        environmental: environmentalStatus,
        learning: learningStatus,
      };
    } catch (error) {
      console.error('Error getting AI service status:', error);
      return {
        sterilization: false,
        inventory: false,
        environmental: false,
        learning: false,
      };
    }
  }

  // Private helper methods
  private createDefaultSettings(): UnifiedAISettings {
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

  private mergeSettings(
    defaults: UnifiedAISettings,
    sterilization?: Record<string, unknown>,
    inventory?: Record<string, unknown>,
    environmental?: Record<string, unknown>,
    learning?: Record<string, unknown>
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

  private extractSterilizationSettings(
    settings: Partial<UnifiedAISettings>
  ): Record<string, unknown> {
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

  private extractInventorySettings(
    settings: Partial<UnifiedAISettings>
  ): Record<string, unknown> {
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

  private extractEnvironmentalSettings(
    settings: Partial<UnifiedAISettings>
  ): Record<string, unknown> {
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

  private extractLearningSettings(
    settings: Partial<UnifiedAISettings>
  ): Record<string, unknown> {
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

  private applyFeatureFlags(settings: Partial<UnifiedAISettings>): void {
    // Apply settings to running services
    // This would update service configurations in real-time
    console.log('Applying AI feature flags:', settings);
  }
}
