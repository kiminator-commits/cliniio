import { DataSourceConfig, InventoryDataAdapter } from './InventoryDataAdapter';
import { getSupabaseAdapter } from './SupabaseAdapterLoader';

import { LocalStorageAdapter } from './LocalStorageAdapter';

export interface AdapterFactoryConfig {
  defaultAdapter: 'localStorage' | 'api' | 'supabase';
  adapters: {
    localStorage?: DataSourceConfig;
    api?: DataSourceConfig;
    supabase?: DataSourceConfig;
  };
  fallbackAdapter?: 'localStorage' | 'supabase';
}

export interface AdapterRegistry {
  [key: string]: InventoryDataAdapter;
}

export interface InventoryAdapterFactory {
  // Factory methods
  createAdapter(
    type: string,
    config?: DataSourceConfig
  ): Promise<InventoryDataAdapter>;
  getAdapter(type: string): InventoryDataAdapter | null;
  registerAdapter(type: string, adapter: InventoryDataAdapter): void;
  unregisterAdapter(type: string): void;

  // Adapter management
  initializeDefaultAdapter(): Promise<InventoryDataAdapter>;
  getAvailableAdapters(): string[];
  getAdapterMetadata(type: string): unknown;

  // Configuration
  updateConfig(config: Partial<AdapterFactoryConfig>): void;
  getConfig(): AdapterFactoryConfig;
}

export class InventoryAdapterFactoryImpl implements InventoryAdapterFactory {
  private config: AdapterFactoryConfig;
  private registry: AdapterRegistry = {};
  private defaultAdapter: InventoryDataAdapter | null = null;

  constructor(config: AdapterFactoryConfig) {
    this.config = {
      defaultAdapter: config.defaultAdapter || 'localStorage',
      adapters: { ...config.adapters },
      fallbackAdapter: config.fallbackAdapter || 'supabase',
    };
  }

  async createAdapter(
    type: string,
    config?: DataSourceConfig
  ): Promise<InventoryDataAdapter> {
    // Check if adapter already exists in registry
    if (this.registry[type]) {
      return this.registry[type];
    }

    let adapter: InventoryDataAdapter;

    switch (type) {
      case 'static': {
        const { StaticDataAdapter } = await import('./StaticDataAdapter');
        adapter = new StaticDataAdapter(config || { type: 'static' });
        break;
      }
      case 'localStorage': {
        adapter = new LocalStorageAdapter(
          config || this.config.adapters.localStorage
        ) as any;
        break;
      }
      case 'api': {
        const { ApiAdapter, isApiAdapterConfig } = await import('./ApiAdapter');
        const apiConfig = config || this.config.adapters.api;
        if (!apiConfig) {
          throw new Error('API adapter configuration is required');
        }
        if (!isApiAdapterConfig(apiConfig)) {
          throw new Error('API adapter requires baseUrl configuration');
        }
        adapter = new ApiAdapter(apiConfig) as any;
        break;
      }
      case 'supabase': {
        const { SupabaseAdapter } = await getSupabaseAdapter();
        const supabaseConfig = config || this.config.adapters.supabase;
        if (!supabaseConfig) {
          throw new Error('Supabase adapter configuration is required');
        }
        adapter = new SupabaseAdapter(supabaseConfig) as any;
        break;
      }
      default:
        throw new Error(`Unknown adapter type: ${type}`);
    }

    // Initialize the adapter
    await adapter.initialize();

    // Register the adapter
    this.registerAdapter(type, adapter);

    return adapter;
  }

  getAdapter(type: string): InventoryDataAdapter | null {
    return this.registry[type] || null;
  }

  registerAdapter(type: string, adapter: InventoryDataAdapter): void {
    this.registry[type] = adapter;

    // Set as default if it's the configured default adapter
    if (type === this.config.defaultAdapter) {
      this.defaultAdapter = adapter;
    }
  }

  unregisterAdapter(type: string): void {
    const adapter = this.registry[type];
    if (adapter) {
      adapter.disconnect().catch(console.error);
      delete this.registry[type];

      // Clear default adapter if it was this one
      if (this.defaultAdapter === adapter) {
        this.defaultAdapter = null;
      }
    }
  }

  async initializeDefaultAdapter(): Promise<InventoryDataAdapter> {
    if (this.defaultAdapter) {
      return this.defaultAdapter;
    }

    try {
      const adapter = await this.createAdapter(this.config.defaultAdapter);
      this.defaultAdapter = adapter;
      return adapter;
    } catch (err) {
      console.error(err);
      console.error(
        `Failed to initialize default adapter (${this.config.defaultAdapter}):`
      );

      // Try fallback adapter
      if (
        this.config.fallbackAdapter &&
        this.config.fallbackAdapter !== this.config.defaultAdapter
      ) {
        try {
          const fallbackAdapter = await this.createAdapter(
            this.config.fallbackAdapter
          );
          this.defaultAdapter = fallbackAdapter;
          return fallbackAdapter;
        } catch (fallbackError) {
          console.error(
            `Failed to initialize fallback adapter (${this.config.fallbackAdapter}):`,
            fallbackError
          );
          throw new Error('No available adapters could be initialized');
        }
      }

      throw new Error('No available adapters could be initialized');
    }
  }

  getAvailableAdapters(): string[] {
    return Object.keys(this.registry);
  }

  getAdapterMetadata(type: string): unknown {
    const adapter = this.registry[type];
    return adapter ? adapter.getMetadata() : null;
  }

  updateConfig(config: Partial<AdapterFactoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AdapterFactoryConfig {
    return { ...this.config };
  }

  // Utility methods for adapter switching
  async switchDefaultAdapter(type: string): Promise<InventoryDataAdapter> {
    // Validate adapter type
    if (!['localStorage', 'api', 'supabase'].includes(type)) {
      throw new Error(`Invalid adapter type: ${type}`);
    }

    // Update config
    this.config.defaultAdapter = type as 'localStorage' | 'api' | 'supabase';

    // Clear current default
    this.defaultAdapter = null;

    // Initialize new default
    return this.initializeDefaultAdapter();
  }

  async getBestAvailableAdapter(): Promise<InventoryDataAdapter> {
    // Try to get the default adapter
    try {
      return await this.initializeDefaultAdapter();
    } catch (err) {
      console.error(err);
      // If default fails, try to find any available adapter
      const availableTypes = ['supabase', 'localStorage'];

      for (const type of availableTypes) {
        try {
          const adapter = await this.createAdapter(type);
          return adapter;
        } catch (adapterError) {
          console.warn(`Failed to create adapter ${type}:`, adapterError);
          continue;
        }
      }

      throw new Error('No adapters are available');
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    const cleanupPromises = Object.values(this.registry).map((adapter) =>
      adapter.disconnect().catch(console.error)
    );

    await Promise.all(cleanupPromises);
    this.registry = {};
    this.defaultAdapter = null;
  }
}

// Default factory instance
export const inventoryAdapterFactory = new InventoryAdapterFactoryImpl({
  defaultAdapter: 'supabase',
  adapters: {
    supabase: { type: 'supabase' },
    localStorage: { type: 'localStorage' },
  },
  fallbackAdapter: 'localStorage',
});
