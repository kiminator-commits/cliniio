import { SterilizationAISettingsType } from './types';
import { STERILIZATION_AI_CONSTANTS } from './constants';

export const validateProviderConfig = (
  settings: SterilizationAISettingsType
): string[] => {
  const errors: string[] = [];

  if (settings.ai_enabled) {
    if (
      settings.computer_vision_enabled &&
      !settings.google_vision_api_key_encrypted &&
      !settings.azure_computer_vision_key_encrypted
    ) {
      errors.push(
        'Computer vision requires either Google Vision or Azure Computer Vision API key'
      );
    }

    if (
      settings.predictive_analytics_enabled &&
      !settings.openai_api_key_encrypted
    ) {
      errors.push('Predictive analytics requires OpenAI API key');
    }
  }

  return errors;
};

export const validateThresholds = (
  settings: SterilizationAISettingsType
): string[] => {
  const errors: string[] = [];

  if (
    settings.ai_confidence_threshold <
      STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN ||
    settings.ai_confidence_threshold >
      STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX
  ) {
    errors.push(
      `AI confidence threshold must be between ${STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN * 100}% and ${STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX * 100}%`
    );
  }

  if (
    settings.ai_data_retention_days <
      STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MIN ||
    settings.ai_data_retention_days >
      STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MAX
  ) {
    errors.push(
      `AI data retention must be between ${STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MIN} and ${STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MAX} days`
    );
  }

  return errors;
};

export const validateApiKeyFormat = (
  apiKey: string,
  provider: string
): string[] => {
  const errors: string[] = [];

  if (apiKey && apiKey.length < STERILIZATION_AI_CONSTANTS.MIN_API_KEY_LENGTH) {
    errors.push(`${provider} API key is too short`);
  }

  if (
    apiKey &&
    !apiKey.startsWith(STERILIZATION_AI_CONSTANTS.API_KEY_MASK_PREFIX) &&
    apiKey.length < 10
  ) {
    errors.push(`${provider} API key appears to be invalid`);
  }

  return errors;
};

export const coerceAndValidateForm = (
  settings: SterilizationAISettingsType
): {
  isValid: boolean;
  errors: string[];
  sanitizedSettings: SterilizationAISettingsType;
} => {
  const errors: string[] = [];

  // Validate thresholds
  errors.push(...validateThresholds(settings));

  // Validate provider configuration
  errors.push(...validateProviderConfig(settings));

  // Validate API keys
  if (settings.openai_api_key_encrypted) {
    errors.push(
      ...validateApiKeyFormat(settings.openai_api_key_encrypted, 'OpenAI')
    );
  }
  if (settings.google_vision_api_key_encrypted) {
    errors.push(
      ...validateApiKeyFormat(
        settings.google_vision_api_key_encrypted,
        'Google Vision'
      )
    );
  }
  if (settings.azure_computer_vision_key_encrypted) {
    errors.push(
      ...validateApiKeyFormat(
        settings.azure_computer_vision_key_encrypted,
        'Azure Computer Vision'
      )
    );
  }

  // Sanitize settings (ensure numeric values are within bounds)
  const sanitizedSettings: SterilizationAISettingsType = {
    ...settings,
    ai_confidence_threshold: Math.max(
      STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN,
      Math.min(
        STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX,
        settings.ai_confidence_threshold
      )
    ),
    ai_data_retention_days: Math.max(
      STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MIN,
      Math.min(
        STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MAX,
        settings.ai_data_retention_days
      )
    ),
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedSettings,
  };
};

export const validateFeatureDependencies = (
  settings: SterilizationAISettingsType
): string[] => {
  const errors: string[] = [];

  // Check if dependent features are enabled when parent features are disabled
  if (!settings.ai_enabled) {
    if (
      settings.computer_vision_enabled ||
      settings.predictive_analytics_enabled ||
      settings.smart_workflow_enabled ||
      settings.quality_assurance_enabled ||
      settings.scanner_intelligence_enabled ||
      settings.real_time_monitoring_enabled
    ) {
      errors.push('AI must be enabled to use AI-powered features');
    }
  }

  if (!settings.computer_vision_enabled && settings.ai_enabled) {
    if (
      settings.tool_condition_assessment ||
      settings.barcode_quality_detection ||
      settings.tool_type_recognition ||
      settings.cleaning_validation
    ) {
      errors.push(
        'Computer vision must be enabled to use vision-based features'
      );
    }
  }

  if (!settings.predictive_analytics_enabled && settings.ai_enabled) {
    if (
      settings.cycle_optimization ||
      settings.failure_prediction ||
      settings.efficiency_optimization ||
      settings.resource_planning
    ) {
      errors.push(
        'Predictive analytics must be enabled to use predictive features'
      );
    }
  }

  if (!settings.smart_workflow_enabled && settings.ai_enabled) {
    if (
      settings.intelligent_workflow_selection ||
      settings.automated_problem_detection ||
      settings.smart_phase_transitions ||
      settings.batch_optimization
    ) {
      errors.push(
        'Smart workflow must be enabled to use workflow automation features'
      );
    }
  }

  return errors;
};
