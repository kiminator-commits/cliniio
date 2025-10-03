import { InventoryDataAdapter, AdapterMetadata } from './InventoryDataAdapter';
import { DataSourceConfig } from './InventoryDataAdapter';
import { InventoryResponse } from '../types/inventoryServiceTypes';
import { LocalInventoryItem } from '../../../types/inventoryTypes';

export interface ApiAdapterConfig extends DataSourceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

// Type guard to check if config is ApiAdapterConfig
export function isApiAdapterConfig(
  config: DataSourceConfig
): config is ApiAdapterConfig {
  return config.type === 'api' && 'baseUrl' in config;
}

export class ApiAdapter implements InventoryDataAdapter {
  private config: ApiAdapterConfig;
  private isInitialized = false;

  constructor(config: ApiAdapterConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Test the API connection
      const response = await this.makeRequest('GET', '/health');
      if (!response.ok) {
        throw new Error(`API health check failed: ${response.statusText}`);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize API adapter:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.isInitialized;
  }

  async disconnect(): Promise<void> {
    this.isInitialized = false;
  }

  async fetchAllInventoryData(): Promise<InventoryResponse> {
    const response = await this.makeRequest('GET', '/inventory');
    const data = await response.json();

    return {
      data: data.items || [],
      error: null,
      count: data.totalCount || 0,
    };
  }

  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    const response = await this.makeRequest('GET', '/inventory/items');
    return response.json();
  }

  async fetchCategories(): Promise<string[]> {
    const response = await this.makeRequest('GET', '/inventory/categories');
    return response.json();
  }

  async addInventoryItem(
    item: LocalInventoryItem
  ): Promise<LocalInventoryItem> {
    const response = await this.makeRequest('POST', '/inventory/items', item);
    return response.json();
  }

  async updateInventoryItem(
    id: string,
    item: Partial<LocalInventoryItem>
  ): Promise<LocalInventoryItem> {
    const response = await this.makeRequest(
      'PUT',
      `/inventory/items/${id}`,
      item
    );
    return response.json();
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.makeRequest('DELETE', `/inventory/items/${id}`);
  }

  async addCategory(category: string): Promise<string> {
    const response = await this.makeRequest('POST', '/inventory/categories', {
      name: category,
    });
    const data = await response.json();
    return data.id || category;
  }

  async deleteCategory(category: string): Promise<void> {
    await this.makeRequest('DELETE', `/inventory/categories/${category}`);
  }

  async batchAddItems(
    items: LocalInventoryItem[]
  ): Promise<LocalInventoryItem[]> {
    const response = await this.makeRequest('POST', '/inventory/items/batch', {
      items,
    });
    return response.json();
  }

  async batchUpdateItems(
    updates: Array<{ id: string; item: Partial<LocalInventoryItem> }>
  ): Promise<LocalInventoryItem[]> {
    const response = await this.makeRequest('PUT', '/inventory/items/batch', {
      updates,
    });
    return response.json();
  }

  async batchDeleteItems(ids: string[]): Promise<void> {
    await this.makeRequest('DELETE', '/inventory/items/batch', { ids });
  }

  async sync(): Promise<void> {
    // API adapters are always in sync
    return Promise.resolve();
  }

  getLastSyncTime(): Date | null {
    return new Date(); // API is always current
  }

  hasPendingChanges(): boolean {
    return false; // API adapters don't have pending changes
  }

  getLastError(): Error | null {
    return null; // Implement error tracking if needed
  }

  clearError(): void {
    // No errors to clear in API adapter
  }

  async searchItems(query: string): Promise<LocalInventoryItem[]> {
    const response = await this.makeRequest(
      'GET',
      `/inventory/search?q=${encodeURIComponent(query)}`
    );
    return response.json();
  }

  getMetadata(): AdapterMetadata {
    return {
      name: 'API Adapter',
      version: '1.0.0',
      description: 'Adapter for external API data sources',
      capabilities: {
        supportsRead: true,
        supportsWrite: true,
        supportsDelete: true,
        supportsBatch: true,
        supportsRealTime: false,
        supportsOffline: false,
      },
      config: this.config,
    };
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<Response> {
    if (!this.isInitialized) {
      throw new Error('API adapter not initialized');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < this.config.retryAttempts!) {
          console.warn(
            `API request attempt ${attempt} failed, retrying...`,
            lastError.message
          );
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('API request failed after all retry attempts');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
