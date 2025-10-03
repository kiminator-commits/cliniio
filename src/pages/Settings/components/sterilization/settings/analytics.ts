import { SterilizationAISettings } from './types';

export const trackSettingChanged = (
  settingName: keyof SterilizationAISettings,
  oldValue: unknown,
  newValue: unknown,
  facilityId: string
): void => {
  // Analytics tracking for setting changes
  console.log('Setting changed:', {
    setting: settingName,
    oldValue,
    newValue,
    facilityId,
    timestamp: new Date().toISOString(),
  });
};

export const trackSaveAttempt = (
  settings: SterilizationAISettings,
  facilityId: string
): void => {
  // Analytics tracking for save attempts
  console.log('Save attempt:', {
    facilityId,
    timestamp: new Date().toISOString(),
    settingsCount: Object.keys(settings).length,
    aiEnabled: settings.ai_enabled,
  });
};

export const trackSaveResult = (
  success: boolean,
  facilityId: string,
  error?: string
): void => {
  // Analytics tracking for save results
  console.log('Save result:', {
    success,
    facilityId,
    timestamp: new Date().toISOString(),
    error: error || null,
  });
};

export const trackResetAttempt = (facilityId: string): void => {
  // Analytics tracking for reset attempts
  console.log('Reset attempt:', {
    facilityId,
    timestamp: new Date().toISOString(),
  });
};

export const trackResetResult = (
  success: boolean,
  facilityId: string,
  error?: string
): void => {
  // Analytics tracking for reset results
  console.log('Reset result:', {
    success,
    facilityId,
    timestamp: new Date().toISOString(),
    error: error || null,
  });
};

export const trackAIFeatureToggle = (
  featureName: keyof SterilizationAISettings,
  enabled: boolean,
  facilityId: string
): void => {
  // Analytics tracking for AI feature toggles
  console.log('AI feature toggle:', {
    feature: featureName,
    enabled,
    facilityId,
    timestamp: new Date().toISOString(),
  });
};

export const trackCycleSettingsChange = (
  cycleType: string,
  changes: Record<string, unknown>,
  facilityId: string
): void => {
  // Analytics tracking for cycle settings changes
  console.log('Cycle settings change:', {
    cycleType,
    changes,
    facilityId,
    timestamp: new Date().toISOString(),
  });
};

export const trackEnforcementToggle = (
  enforcementType: 'BI' | 'CI',
  enabled: boolean,
  facilityId: string
): void => {
  // Analytics tracking for enforcement toggles
  console.log('Enforcement toggle:', {
    type: enforcementType,
    enabled,
    facilityId,
    timestamp: new Date().toISOString(),
  });
};

export const trackReceiptSettingsChange = (
  setting: string,
  value: unknown,
  facilityId: string
): void => {
  // Analytics tracking for receipt settings changes
  console.log('Receipt settings change:', {
    setting,
    value,
    facilityId,
    timestamp: new Date().toISOString(),
  });
};
