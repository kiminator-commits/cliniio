import { UnifiedAISettings } from './AISettingsConfigProvider';

export class AISettingsApiKeyProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Check if specific AI feature is enabled
  isFeatureEnabled(settings: UnifiedAISettings, featurePath: string): boolean {
    if (!settings.aiEnabled) return false;

    const featureValue = this.getNestedValue(
      settings as Record<string, unknown>,
      featurePath
    );
    return featureValue === true;
  }

  // Validate API keys
  validateApiKeys(apiKeys: UnifiedAISettings['apiKeys']): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (apiKeys.openaiApiKey && !this.isValidApiKey(apiKeys.openaiApiKey)) {
      errors.push('Invalid OpenAI API key format');
    }

    if (
      apiKeys.googleVisionApiKey &&
      !this.isValidApiKey(apiKeys.googleVisionApiKey)
    ) {
      errors.push('Invalid Google Vision API key format');
    }

    if (
      apiKeys.azureComputerVisionKey &&
      !this.isValidApiKey(apiKeys.azureComputerVisionKey)
    ) {
      errors.push('Invalid Azure Computer Vision API key format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Encrypt API keys for storage
  encryptApiKeys(
    apiKeys: UnifiedAISettings['apiKeys']
  ): UnifiedAISettings['apiKeys'] {
    // In a real implementation, you would encrypt these keys
    // For now, we'll just return them as-is
    return {
      openaiApiKey: apiKeys.openaiApiKey
        ? this.encryptKey(apiKeys.openaiApiKey)
        : undefined,
      googleVisionApiKey: apiKeys.googleVisionApiKey
        ? this.encryptKey(apiKeys.googleVisionApiKey)
        : undefined,
      azureComputerVisionKey: apiKeys.azureComputerVisionKey
        ? this.encryptKey(apiKeys.azureComputerVisionKey)
        : undefined,
    };
  }

  // Decrypt API keys for use
  decryptApiKeys(
    encryptedApiKeys: UnifiedAISettings['apiKeys']
  ): UnifiedAISettings['apiKeys'] {
    // In a real implementation, you would decrypt these keys
    // For now, we'll just return them as-is
    return {
      openaiApiKey: encryptedApiKeys.openaiApiKey
        ? this.decryptKey(encryptedApiKeys.openaiApiKey)
        : undefined,
      googleVisionApiKey: encryptedApiKeys.googleVisionApiKey
        ? this.decryptKey(encryptedApiKeys.googleVisionApiKey)
        : undefined,
      azureComputerVisionKey: encryptedApiKeys.azureComputerVisionKey
        ? this.decryptKey(encryptedApiKeys.azureComputerVisionKey)
        : undefined,
    };
  }

  // Get required API keys for enabled features
  getRequiredApiKeys(settings: UnifiedAISettings): string[] {
    const requiredKeys: string[] = [];

    // Check computer vision features
    if (
      settings.computerVision.toolConditionAssessment ||
      settings.computerVision.barcodeQualityDetection ||
      settings.computerVision.toolTypeRecognition ||
      settings.computerVision.imageRecognition ||
      settings.computerVision.qualityAssessment
    ) {
      requiredKeys.push('googleVisionApiKey', 'azureComputerVisionKey');
    }

    // Check predictive analytics features
    if (
      settings.predictiveAnalytics.failurePrediction ||
      settings.predictiveAnalytics.cycleOptimization ||
      settings.predictiveAnalytics.demandForecasting
    ) {
      requiredKeys.push('openaiApiKey');
    }

    // Check environmental AI features
    if (
      settings.environmental.predictiveCleaning ||
      settings.environmental.contaminationPrediction ||
      settings.environmental.resourceOptimization
    ) {
      requiredKeys.push('openaiApiKey');
    }

    // Check learning AI features
    if (
      settings.learning.personalizedRecommendations ||
      settings.learning.skillGapAnalysis ||
      settings.learning.learningPathOptimization
    ) {
      requiredKeys.push('openaiApiKey');
    }

    return [...new Set(requiredKeys)]; // Remove duplicates
  }

  // Check if all required API keys are present
  hasRequiredApiKeys(settings: UnifiedAISettings): boolean {
    const requiredKeys = this.getRequiredApiKeys(settings);
    const availableKeys = Object.keys(settings.apiKeys).filter(
      (key) => settings.apiKeys[key as keyof typeof settings.apiKeys]
    );

    return requiredKeys.every((requiredKey) =>
      availableKeys.some((availableKey) => availableKey === requiredKey)
    );
  }

  // Private helper methods
  private isValidApiKey(apiKey: string): boolean {
    // Basic validation - in reality, you'd want more sophisticated validation
    return apiKey && apiKey.length > 10 && !apiKey.includes(' ');
  }

  private encryptKey(key: string): string {
    // Placeholder for encryption logic
    // In a real implementation, use proper encryption
    return `encrypted_${key}`;
  }

  private decryptKey(encryptedKey: string): string {
    // Placeholder for decryption logic
    // In a real implementation, use proper decryption
    return encryptedKey.replace('encrypted_', '');
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path
      .split('.')
      .reduce(
        (current: unknown, key: string) =>
          (current as Record<string, unknown>)?.[key],
        obj
      );
  }
}
