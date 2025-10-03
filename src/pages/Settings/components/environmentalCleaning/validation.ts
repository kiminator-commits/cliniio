import {
  EnvironmentalCleaningAISettings,
  CleaningProtocolSettings,
  NotificationSettings,
} from './types';
import { FORM_LIMITS } from './constants';

export const validateAISettings = (
  settings: EnvironmentalCleaningAISettings
): string[] => {
  const errors: string[] = [];

  if (
    settings.aiConfidenceThreshold < FORM_LIMITS.aiConfidenceThreshold.min ||
    settings.aiConfidenceThreshold > FORM_LIMITS.aiConfidenceThreshold.max
  ) {
    errors.push(
      `AI confidence threshold must be between ${FORM_LIMITS.aiConfidenceThreshold.min} and ${FORM_LIMITS.aiConfidenceThreshold.max}`
    );
  }

  if (
    settings.aiDataRetentionDays < FORM_LIMITS.aiDataRetentionDays.min ||
    settings.aiDataRetentionDays > FORM_LIMITS.aiDataRetentionDays.max
  ) {
    errors.push(
      `AI data retention days must be between ${FORM_LIMITS.aiDataRetentionDays.min} and ${FORM_LIMITS.aiDataRetentionDays.max}`
    );
  }

  return errors;
};

export const validateProtocolSettings = (
  settings: CleaningProtocolSettings
): string[] => {
  const errors: string[] = [];

  if (
    settings.defaultCleaningDuration <
      FORM_LIMITS.defaultCleaningDuration.min ||
    settings.defaultCleaningDuration > FORM_LIMITS.defaultCleaningDuration.max
  ) {
    errors.push(
      `Default cleaning duration must be between ${FORM_LIMITS.defaultCleaningDuration.min} and ${FORM_LIMITS.defaultCleaningDuration.max} minutes`
    );
  }

  if (
    settings.qualityScoreThreshold < FORM_LIMITS.qualityScoreThreshold.min ||
    settings.qualityScoreThreshold > FORM_LIMITS.qualityScoreThreshold.max
  ) {
    errors.push(
      `Quality score threshold must be between ${FORM_LIMITS.qualityScoreThreshold.min} and ${FORM_LIMITS.qualityScoreThreshold.max}`
    );
  }

  if (
    settings.bufferTimeMinutes < FORM_LIMITS.bufferTimeMinutes.min ||
    settings.bufferTimeMinutes > FORM_LIMITS.bufferTimeMinutes.max
  ) {
    errors.push(
      `Buffer time must be between ${FORM_LIMITS.bufferTimeMinutes.min} and ${FORM_LIMITS.bufferTimeMinutes.max} minutes`
    );
  }

  if (
    settings.maxConcurrentCleanings < FORM_LIMITS.maxConcurrentCleanings.min ||
    settings.maxConcurrentCleanings > FORM_LIMITS.maxConcurrentCleanings.max
  ) {
    errors.push(
      `Max concurrent cleanings must be between ${FORM_LIMITS.maxConcurrentCleanings.min} and ${FORM_LIMITS.maxConcurrentCleanings.max}`
    );
  }

  if (
    settings.auditLogRetentionDays < FORM_LIMITS.auditLogRetentionDays.min ||
    settings.auditLogRetentionDays > FORM_LIMITS.auditLogRetentionDays.max
  ) {
    errors.push(
      `Audit log retention days must be between ${FORM_LIMITS.auditLogRetentionDays.min} and ${FORM_LIMITS.auditLogRetentionDays.max}`
    );
  }

  return errors;
};

export const validateNotificationSettings = (
  settings: NotificationSettings
): string[] => {
  const errors: string[] = [];

  // Basic validation - could be expanded based on business rules
  if (
    !settings.emailNotificationsEnabled &&
    !settings.inAppNotificationsEnabled
  ) {
    errors.push('At least one notification method must be enabled');
  }

  return errors;
};

export const validateAllSettings = (
  aiSettings: EnvironmentalCleaningAISettings,
  protocolSettings: CleaningProtocolSettings,
  notificationSettings: NotificationSettings
): string[] => {
  const errors = [
    ...validateAISettings(aiSettings),
    ...validateProtocolSettings(protocolSettings),
    ...validateNotificationSettings(notificationSettings),
  ];

  return errors;
};

export const coerceAndValidateForm = (
  aiSettings: EnvironmentalCleaningAISettings,
  protocolSettings: CleaningProtocolSettings,
  notificationSettings: NotificationSettings
): { isValid: boolean; errors: string[] } => {
  const errors = validateAllSettings(
    aiSettings,
    protocolSettings,
    notificationSettings
  );

  return {
    isValid: errors.length === 0,
    errors,
  };
};
