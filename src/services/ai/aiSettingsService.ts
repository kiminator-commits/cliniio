// Context imports
import { useMemo } from 'react';
import { useFacility } from '../../contexts/FacilityContext';

// Provider imports
import {
  AISettingsConfigProvider,
  UnifiedAISettings,
} from './aiSettings/AISettingsConfigProvider';
import { AISettingsModelProvider } from './aiSettings/AISettingsModelProvider';
import { AISettingsApiKeyProvider } from './aiSettings/AISettingsApiKeyProvider';
import { AISettingsToggleProvider } from './aiSettings/AISettingsToggleProvider';
import { AISettingsPerformanceProvider } from './aiSettings/AISettingsPerformanceProvider';
import { AISettingsPersistenceProvider } from './aiSettings/AISettingsPersistenceProvider';

// Re-export interfaces for backward compatibility
export type { UnifiedAISettings };

export class AISettingsService {
  private facilityId: string;
  private configProvider: AISettingsConfigProvider;
  private modelProvider: AISettingsModelProvider;
  private apiKeyProvider: AISettingsApiKeyProvider;
  private toggleProvider: AISettingsToggleProvider;
  private performanceProvider: AISettingsPerformanceProvider;
  private persistenceProvider: AISettingsPersistenceProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.configProvider = new AISettingsConfigProvider(facilityId);
    this.modelProvider = new AISettingsModelProvider(facilityId);
    this.apiKeyProvider = new AISettingsApiKeyProvider(facilityId);
    this.toggleProvider = new AISettingsToggleProvider(facilityId);
    this.performanceProvider = new AISettingsPerformanceProvider(facilityId);
    this.persistenceProvider = new AISettingsPersistenceProvider(facilityId);
  }

  // Load unified AI settings from all services
  async loadUnifiedSettings(): Promise<UnifiedAISettings> {
    return this.modelProvider.loadUnifiedSettings();
  }

  // Save unified AI settings to all services
  async saveUnifiedSettings(
    settings: Partial<UnifiedAISettings>
  ): Promise<boolean> {
    const modelResult = await this.modelProvider.saveUnifiedSettings(settings);
    const persistenceResult =
      await this.persistenceProvider.saveToUnifiedTable(settings);
    return modelResult && persistenceResult;
  }

  // Apply settings to running AI services
  async applySettings(settings: Partial<UnifiedAISettings>): Promise<boolean> {
    return this.modelProvider.applySettings(settings);
  }

  // Check if specific AI feature is enabled
  isFeatureEnabled(settings: UnifiedAISettings, featurePath: string): boolean {
    return this.apiKeyProvider.isFeatureEnabled(settings, featurePath);
  }

  // Get AI service status
  async getServiceStatus(): Promise<{
    sterilization: boolean;
    inventory: boolean;
    environmental: boolean;
    learning: boolean;
  }> {
    return this.modelProvider.getServiceStatus();
  }
}

// Hook for using AI Settings
export const useAISettings = () => {
  const { getCurrentFacilityId } = useFacility();
  const facilityId = getCurrentFacilityId();

  // Return null if facility ID is not available instead of throwing an error
  if (!facilityId) {
    return null;
  }

  // Memoize the service instance to prevent infinite loops
  return useMemo(() => new AISettingsService(facilityId), [facilityId]);
};
