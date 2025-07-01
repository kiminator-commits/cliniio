import { DataSourceConfig, InventoryDataAdapter } from './InventoryDataAdapter';
import { StaticDataAdapter } from './StaticDataAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export interface AdapterFactoryConfig {
  defaultAdapter: 'static' | 'localStorage' | 'api' | 'supabase';
  adapters: {
    static?: DataSourceConfig;
    localStorage?: DataSourceConfig;
    api?: DataSourceConfig;
    supabase?: DataSourceConfig;
  };
  fallbackAdapter?: 'static' | 'localStorage';
}

export interface AdapterRegistry {
  [key: string]: InventoryDataAdapter;
}

export interface InventoryAdapterFactory {
  // Factory methods
  createAdapter(type: string, config?: DataSourceConfig): Promise<InventoryDataAdapter>;
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
      defaultAdapter: 'static',
      adapters: {},
      fallbackAdapter: 'static',
      ...config,
    };
  }

  async createAdapter(type: string, config?: DataSourceConfig): Promise<InventoryDataAdapter> {
    // Check if adapter already exists in registry
    if (this.registry[type]) {
      return this.registry[type];
    }

    let adapter: InventoryDataAdapter;

    switch (type) {
      case 'static':
        adapter = new StaticDataAdapter(config || this.config.adapters.static);
        break;
      case 'localStorage':
        adapter = new LocalStorageAdapter(config || this.config.adapters.localStorage);
        break;
      case 'api':
        // TODO: Implement API adapter
        throw new Error('API adapter not yet implemented');
      case 'supabase':
        // TODO: Implement Supabase adapter
        throw new Error('Supabase adapter not yet implemented');
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
    } catch (error) {
      console.error(`Failed to initialize default adapter (${this.config.defaultAdapter}):`, error);

      // Try fallback adapter
      if (
        this.config.fallbackAdapter &&
        this.config.fallbackAdapter !== this.config.defaultAdapter
      ) {
        try {
          const fallbackAdapter = await this.createAdapter(this.config.fallbackAdapter);
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

      throw error;
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
    if (!['static', 'localStorage', 'api', 'supabase'].includes(type)) {
      throw new Error(`Invalid adapter type: ${type}`);
    }

    // Update config
    this.config.defaultAdapter = type as 'static' | 'localStorage' | 'api' | 'supabase';

    // Clear current default
    this.defaultAdapter = null;

    // Initialize new default
    return this.initializeDefaultAdapter();
  }

  async getBestAvailableAdapter(): Promise<InventoryDataAdapter> {
    // Try to get the default adapter
    try {
      return await this.initializeDefaultAdapter();
    } catch (error) {
      // If default fails, try to find any available adapter
      const availableTypes = ['static', 'localStorage'];

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
    const cleanupPromises = Object.values(this.registry).map(adapter =>
      adapter.disconnect().catch(console.error)
    );

    await Promise.all(cleanupPromises);
    this.registry = {};
    this.defaultAdapter = null;
  }
}

// Default factory instance
export const inventoryAdapterFactory = new InventoryAdapterFactoryImpl({
  defaultAdapter: 'static',
  adapters: {
    static: { type: 'static' },
    localStorage: { type: 'localStorage' },
  },
  fallbackAdapter: 'static',
});
