import { UnifiedAISettings } from './AISettingsConfigProvider';

export class AISettingsToggleProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Apply feature flags to services
  applyFeatureFlags(settings: Partial<UnifiedAISettings>): void {
    // Apply settings to running services
    // This would update service configurations in real-time
    console.log('Applying AI feature flags:', settings);
  }

  // Toggle specific feature
  toggleFeature(
    settings: UnifiedAISettings,
    featurePath: string,
    enabled: boolean
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };
    this.setNestedValue(
      updatedSettings as Record<string, unknown>,
      featurePath,
      enabled
    );
    return updatedSettings;
  }

  // Toggle multiple features at once
  toggleMultipleFeatures(
    settings: UnifiedAISettings,
    featureToggles: Record<string, boolean>
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };

    Object.entries(featureToggles).forEach(([featurePath, enabled]) => {
      this.setNestedValue(
        updatedSettings as Record<string, unknown>,
        featurePath,
        enabled
      );
    });

    return updatedSettings;
  }

  // Enable all features in a category
  enableCategory(
    settings: UnifiedAISettings,
    category: keyof UnifiedAISettings
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };

    if (
      typeof updatedSettings[category] === 'object' &&
      updatedSettings[category] !== null
    ) {
      const categoryObj = updatedSettings[category] as Record<string, boolean>;
      Object.keys(categoryObj).forEach((key) => {
        categoryObj[key] = true;
      });
    }

    return updatedSettings;
  }

  // Disable all features in a category
  disableCategory(
    settings: UnifiedAISettings,
    category: keyof UnifiedAISettings
  ): UnifiedAISettings {
    const updatedSettings = { ...settings };

    if (
      typeof updatedSettings[category] === 'object' &&
      updatedSettings[category] !== null
    ) {
      const categoryObj = updatedSettings[category] as Record<string, boolean>;
      Object.keys(categoryObj).forEach((key) => {
        categoryObj[key] = false;
      });
    }

    return updatedSettings;
  }

  // Get feature status
  getFeatureStatus(settings: UnifiedAISettings, featurePath: string): boolean {
    const featureValue = this.getNestedValue(
      settings as Record<string, unknown>,
      featurePath
    );
    return featureValue === true;
  }

  // Get category status (percentage of enabled features)
  getCategoryStatus(
    settings: UnifiedAISettings,
    category: keyof UnifiedAISettings
  ): { enabled: number; total: number; percentage: number } {
    if (typeof settings[category] !== 'object' || settings[category] === null) {
      return { enabled: 0, total: 0, percentage: 0 };
    }

    const categoryObj = settings[category] as Record<string, boolean>;
    const features = Object.values(categoryObj);
    const enabled = features.filter(Boolean).length;
    const total = features.length;

    return {
      enabled,
      total,
      percentage: total > 0 ? Math.round((enabled / total) * 100) : 0,
    };
  }

  // Get all disabled features
  getDisabledFeatures(settings: UnifiedAISettings): string[] {
    const disabledFeatures: string[] = [];

    // Check computer vision features
    Object.entries(settings.computerVision).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`computerVision.${key}`);
    });

    // Check predictive analytics features
    Object.entries(settings.predictiveAnalytics).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`predictiveAnalytics.${key}`);
    });

    // Check smart workflow features
    Object.entries(settings.smartWorkflow).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`smartWorkflow.${key}`);
    });

    // Check quality assurance features
    Object.entries(settings.qualityAssurance).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`qualityAssurance.${key}`);
    });

    // Check real-time monitoring features
    Object.entries(settings.realTimeMonitoring).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`realTimeMonitoring.${key}`);
    });

    // Check analytics features
    Object.entries(settings.analytics).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`analytics.${key}`);
    });

    // Check intelligence features
    Object.entries(settings.intelligence).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`intelligence.${key}`);
    });

    // Check performance features
    Object.entries(settings.performance).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`performance.${key}`);
    });

    // Check privacy features
    Object.entries(settings.privacy).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`privacy.${key}`);
    });

    // Check integration features
    Object.entries(settings.integration).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`integration.${key}`);
    });

    // Check user experience features
    Object.entries(settings.userExperience).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`userExperience.${key}`);
    });

    // Check environmental features
    Object.entries(settings.environmental).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`environmental.${key}`);
    });

    // Check learning features
    Object.entries(settings.learning).forEach(([key, value]) => {
      if (!value) disabledFeatures.push(`learning.${key}`);
    });

    return disabledFeatures;
  }

  // Get all enabled features
  getEnabledFeatures(settings: UnifiedAISettings): string[] {
    const enabledFeatures: string[] = [];

    // Check computer vision features
    Object.entries(settings.computerVision).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`computerVision.${key}`);
    });

    // Check predictive analytics features
    Object.entries(settings.predictiveAnalytics).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`predictiveAnalytics.${key}`);
    });

    // Check smart workflow features
    Object.entries(settings.smartWorkflow).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`smartWorkflow.${key}`);
    });

    // Check quality assurance features
    Object.entries(settings.qualityAssurance).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`qualityAssurance.${key}`);
    });

    // Check real-time monitoring features
    Object.entries(settings.realTimeMonitoring).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`realTimeMonitoring.${key}`);
    });

    // Check analytics features
    Object.entries(settings.analytics).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`analytics.${key}`);
    });

    // Check intelligence features
    Object.entries(settings.intelligence).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`intelligence.${key}`);
    });

    // Check performance features
    Object.entries(settings.performance).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`performance.${key}`);
    });

    // Check privacy features
    Object.entries(settings.privacy).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`privacy.${key}`);
    });

    // Check integration features
    Object.entries(settings.integration).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`integration.${key}`);
    });

    // Check user experience features
    Object.entries(settings.userExperience).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`userExperience.${key}`);
    });

    // Check environmental features
    Object.entries(settings.environmental).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`environmental.${key}`);
    });

    // Check learning features
    Object.entries(settings.learning).forEach(([key, value]) => {
      if (value) enabledFeatures.push(`learning.${key}`);
    });

    return enabledFeatures;
  }

  // Private helper methods
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path
      .split('.')
      .reduce(
        (current: unknown, key: string) =>
          (current as Record<string, unknown>)?.[key],
        obj
      );
  }

  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce(
      (current: Record<string, unknown>, key: string) => {
        if (!(key in current)) {
          current[key] = {};
        }
        return current[key] as Record<string, unknown>;
      },
      obj
    );
    target[lastKey] = value;
  }
}
