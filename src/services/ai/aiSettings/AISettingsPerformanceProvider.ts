import { UnifiedAISettings } from './AISettingsConfigProvider';

export interface PerformanceMetrics {
  accuracyTracking: boolean;
  responseTimeMonitoring: boolean;
  errorRateTracking: boolean;
  qualityMetrics: boolean;
  benchmarkComparison: boolean;
  performanceAlerts: boolean;
  optimizationSuggestions: boolean;
  modelHealthMonitoring: boolean;
}

export interface PerformanceConfig {
  aiConfidenceThreshold: number;
  aiDataRetentionDays: number;
  realTimeProcessingEnabled: boolean;
  batchProcessingEnabled: boolean;
  dataSharingEnabled: boolean;
  localAIProcessingEnabled: boolean;
  encryptedDataTransmission: boolean;
  aiModelTraining: boolean;
}

export class AISettingsPerformanceProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Optimize performance settings based on facility needs
  optimizePerformanceSettings(settings: UnifiedAISettings): UnifiedAISettings {
    const optimizedSettings = { ...settings };

    // Optimize AI confidence threshold based on feature usage
    optimizedSettings.aiConfig.aiConfidenceThreshold = this.calculateOptimalConfidenceThreshold(settings);

    // Optimize data retention based on facility size and compliance requirements
    optimizedSettings.aiConfig.aiDataRetentionDays = this.calculateOptimalDataRetention(settings);

    // Enable/disable processing modes based on feature requirements
    optimizedSettings.aiConfig.realTimeProcessingEnabled = this.shouldEnableRealTimeProcessing(settings);
    optimizedSettings.aiConfig.batchProcessingEnabled = this.shouldEnableBatchProcessing(settings);

    // Configure data sharing based on privacy settings
    optimizedSettings.aiConfig.dataSharingEnabled = this.shouldEnableDataSharing(settings);

    // Configure local processing based on facility capabilities
    optimizedSettings.aiConfig.localAIProcessingEnabled = this.shouldEnableLocalProcessing(settings);

    // Configure encryption based on security requirements
    optimizedSettings.aiConfig.encryptedDataTransmission = this.shouldEnableEncryption(settings);

    // Configure model training based on data availability
    optimizedSettings.aiConfig.aiModelTraining = this.shouldEnableModelTraining(settings);

    return optimizedSettings;
  }

  // Get performance recommendations
  getPerformanceRecommendations(settings: UnifiedAISettings): {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
  }[] {
    const recommendations: Array<{
      recommendations: string[];
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Check confidence threshold
    if (settings.aiConfig.aiConfidenceThreshold < 0.7) {
      recommendations.push({
        recommendations: ['Consider increasing AI confidence threshold to 0.8 or higher for better accuracy'],
        priority: 'medium',
      });
    }

    // Check data retention
    if (settings.aiConfig.aiDataRetentionDays > 365) {
      recommendations.push({
        recommendations: ['Consider reducing data retention period to improve performance and reduce storage costs'],
        priority: 'low',
      });
    }

    // Check processing modes
    if (!settings.aiConfig.realTimeProcessingEnabled && !settings.aiConfig.batchProcessingEnabled) {
      recommendations.push({
        recommendations: ['Enable at least one processing mode (real-time or batch) for AI functionality'],
        priority: 'high',
      });
    }

    // Check encryption
    if (!settings.aiConfig.encryptedDataTransmission) {
      recommendations.push({
        recommendations: ['Enable encrypted data transmission for better security'],
        priority: 'high',
      });
    }

    // Check local processing
    if (!settings.aiConfig.localAIProcessingEnabled && settings.privacy.dataAnonymization) {
      recommendations.push({
        recommendations: ['Consider enabling local AI processing for better privacy compliance'],
        priority: 'medium',
      });
    }

    return recommendations;
  }

  // Validate performance settings
  validatePerformanceSettings(settings: UnifiedAISettings): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate confidence threshold
    if (settings.aiConfig.aiConfidenceThreshold < 0.1 || settings.aiConfig.aiConfidenceThreshold > 1.0) {
      errors.push('AI confidence threshold must be between 0.1 and 1.0');
    }

    // Validate data retention
    if (settings.aiConfig.aiDataRetentionDays < 1 || settings.aiConfig.aiDataRetentionDays > 2555) { // 7 years
      errors.push('AI data retention days must be between 1 and 2555 (7 years)');
    }

    // Check processing modes
    if (!settings.aiConfig.realTimeProcessingEnabled && !settings.aiConfig.batchProcessingEnabled) {
      errors.push('At least one processing mode must be enabled');
    }

    // Check encryption for sensitive data
    if (!settings.aiConfig.encryptedDataTransmission && settings.privacy.dataAnonymization) {
      warnings.push('Consider enabling encrypted data transmission when using data anonymization');
    }

    // Check local processing for privacy compliance
    if (!settings.aiConfig.localAIProcessingEnabled && settings.privacy.privacyCompliance) {
      warnings.push('Consider enabling local AI processing for better privacy compliance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Get performance metrics configuration
  getPerformanceMetricsConfig(settings: UnifiedAISettings): PerformanceMetrics {
    return {
      accuracyTracking: settings.performance.accuracyTracking,
      responseTimeMonitoring: settings.performance.responseTimeMonitoring,
      errorRateTracking: settings.performance.errorRateTracking,
      qualityMetrics: settings.performance.qualityMetrics,
      benchmarkComparison: settings.performance.benchmarkComparison,
      performanceAlerts: settings.performance.performanceAlerts,
      optimizationSuggestions: settings.performance.optimizationSuggestions,
      modelHealthMonitoring: settings.performance.modelHealthMonitoring,
    };
  }

  // Update performance metrics configuration
  updatePerformanceMetrics(
    settings: UnifiedAISettings,
    metrics: Partial<PerformanceMetrics>
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        (updatedSettings.performance as Record<string, boolean>)[key] = value;
      }
    });

    return updatedSettings;
  }

  // Get performance configuration
  getPerformanceConfig(settings: UnifiedAISettings): PerformanceConfig {
    return {
      aiConfidenceThreshold: settings.aiConfig.aiConfidenceThreshold,
      aiDataRetentionDays: settings.aiConfig.aiDataRetentionDays,
      realTimeProcessingEnabled: settings.aiConfig.realTimeProcessingEnabled,
      batchProcessingEnabled: settings.aiConfig.batchProcessingEnabled,
      dataSharingEnabled: settings.aiConfig.dataSharingEnabled,
      localAIProcessingEnabled: settings.aiConfig.localAIProcessingEnabled,
      encryptedDataTransmission: settings.aiConfig.encryptedDataTransmission,
      aiModelTraining: settings.aiConfig.aiModelTraining,
    };
  }

  // Update performance configuration
  updatePerformanceConfig(
    settings: UnifiedAISettings,
    config: Partial<PerformanceConfig>
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };
    
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        (updatedSettings.aiConfig as Record<string, unknown>)[key] = value;
      }
    });

    return updatedSettings;
  }

  // Private helper methods
  private calculateOptimalConfidenceThreshold(settings: UnifiedAISettings): number {
    // Calculate based on enabled features and their criticality
    let threshold = 0.8; // Default

    // Increase threshold for critical features
    if (settings.predictiveAnalytics.failurePrediction) {
      threshold = Math.max(threshold, 0.9);
    }

    if (settings.qualityAssurance.complianceMonitoring) {
      threshold = Math.max(threshold, 0.85);
    }

    if (settings.realTimeMonitoring.emergencyAlerts) {
      threshold = Math.max(threshold, 0.95);
    }

    return Math.min(threshold, 0.99); // Cap at 99%
  }

  private calculateOptimalDataRetention(settings: UnifiedAISettings): number {
    // Calculate based on compliance requirements and feature usage
    let retentionDays = 365; // Default 1 year

    // Increase retention for compliance features
    if (settings.privacy.complianceMonitoring) {
      retentionDays = Math.max(retentionDays, 2555); // 7 years for compliance
    }

    if (settings.qualityAssurance.regulatoryCompliance) {
      retentionDays = Math.max(retentionDays, 1825); // 5 years for regulatory
    }

    // Decrease retention for performance features
    if (settings.performance.optimizationSuggestions) {
      retentionDays = Math.min(retentionDays, 180); // 6 months for optimization
    }

    return retentionDays;
  }

  private shouldEnableRealTimeProcessing(settings: UnifiedAISettings): boolean {
    // Enable for real-time features
    return settings.realTimeMonitoring.anomalyDetection ||
           settings.realTimeMonitoring.emergencyAlerts ||
           settings.realTimeMonitoring.smartNotifications ||
           settings.analytics.realTimeUpdates;
  }

  private shouldEnableBatchProcessing(settings: UnifiedAISettings): boolean {
    // Enable for batch-oriented features
    return settings.predictiveAnalytics.demandForecasting ||
           settings.predictiveAnalytics.seasonalAnalysis ||
           settings.analytics.historicalDataRetention ||
           settings.performance.benchmarkComparison;
  }

  private shouldEnableDataSharing(settings: UnifiedAISettings): boolean {
    // Enable only if privacy settings allow
    return settings.privacy.dataSharingEnabled && 
           !settings.privacy.dataAnonymization;
  }

  private shouldEnableLocalProcessing(settings: UnifiedAISettings): boolean {
    // Enable for privacy-sensitive features
    return settings.privacy.dataAnonymization ||
           settings.privacy.privacyCompliance ||
           settings.privacy.accessControl;
  }

  private shouldEnableEncryption(settings: UnifiedAISettings): boolean {
    // Always enable for sensitive data
    return settings.privacy.encryption ||
           settings.privacy.privacyCompliance ||
           settings.privacy.accessControl;
  }

  private shouldEnableModelTraining(settings: UnifiedAISettings): boolean {
    // Enable if we have enough data and features that benefit from training
    return settings.analytics.dataCollection &&
           (settings.predictiveAnalytics.failurePrediction ||
            settings.predictiveAnalytics.cycleOptimization ||
            settings.learning.personalizedRecommendations);
  }
}
