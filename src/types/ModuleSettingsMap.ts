export interface ModuleSettingsMap {
  [module: string]: {
    [key: string]: unknown;
  };
}

export interface SettingsModule {
  name: string;
  displayName: string;
  description?: string;
  settings: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      defaultValue: unknown;
      description?: string;
      required?: boolean;
    };
  };
}

export type ModuleSettings<T extends keyof ModuleSettingsMap = keyof ModuleSettingsMap> = ModuleSettingsMap[T];

export const DEFAULT_MODULE_SETTINGS: ModuleSettingsMap = {
  inventory: {
    autoReorder: false,
    lowStockThreshold: 10,
    enableNotifications: true,
  },
  sterilization: {
    defaultCycleTime: 30,
    enableTracking: true,
    requireConfirmation: false,
  },
  billing: {
    enableAutoRenewal: true,
    notificationDays: 7,
  },
};
