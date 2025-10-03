import { InventoryItem } from '../../../types/inventoryTypes';
import { InventoryResponse } from '../InventoryServiceFacade';
import {
  BaseInventoryDataAdapter,
  DataSourceConfig,
  AdapterCapabilities,
} from './InventoryDataAdapter';
import { isDevelopment, isBrowser } from '../../../lib/getEnv';

export class StaticDataAdapter extends BaseInventoryDataAdapter {
  constructor(config: DataSourceConfig = { type: 'static' }) {
    const capabilities: AdapterCapabilities = {
      supportsRead: isDevelopment() || !isBrowser(),
      supportsWrite: isDevelopment() || !isBrowser(),
      supportsDelete: isDevelopment() || !isBrowser(),
      supportsRealTime: false,
      supportsOffline: isDevelopment() || !isBrowser(),
      supportsBatch: false,
    };

    super(config, {
      name: 'StaticDataAdapter',
      version: '1.0.0',
      description:
        'Static data adapter for development or when Supabase is not configured',
      capabilities,
    });
  }

  async initialize(): Promise<void> {
    // Allow static adapter in development mode or when not in browser
    if (isDevelopment() || !isBrowser()) {
      return;
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  isConnected(): boolean {
    return isDevelopment() || !isBrowser();
  }

  async fetchAllInventoryData(): Promise<InventoryResponse> {
    if (isDevelopment() || !isBrowser()) {
      return {
        data: this.getMockInventoryItems(),
        error: null,
        count: this.getMockInventoryItems().length,
      };
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    if (isDevelopment() || !isBrowser()) {
      return this.getMockInventoryItems();
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async fetchCategories(): Promise<string[]> {
    if (isDevelopment() || !isBrowser()) {
      return this.getMockCategories();
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async addInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    if (isDevelopment() || !isBrowser()) {
      return { ...item, id: `mock-${Date.now()}` };
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    if (isDevelopment() || !isBrowser()) {
      return { id, name: 'Mock Item', ...updates } as InventoryItem;
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async deleteInventoryItem(_id: string): Promise<void> {
    if (isDevelopment() || !isBrowser()) {
      return;
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async addCategory(category: string): Promise<string> {
    if (isDevelopment() || !isBrowser()) {
      return category;
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  async deleteCategory(_category: string): Promise<void> {
    if (isDevelopment() || !isBrowser()) {
      return;
    }

    throw new Error(
      'Static data adapter is disabled. This project should not use mock data. Please configure Supabase instead.'
    );
  }

  // Mock data methods for development
  private getMockInventoryItems(): InventoryItem[] {
    return [
      {
        id: 'mock-1',
        facility_id: 'mock-facility',
        name: 'Surgical Scissors',
        _category: 'Surgical Instruments',
        location: 'Operating Room 1',
        status: 'Available',
        quantity: 5,
        unit_cost: 150.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: 2,
        expiration_date: null,
        data: {
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        id: 'mock-2',
        facility_id: 'mock-facility',
        name: 'Stethoscope',
        category: 'Diagnostic Equipment',
        location: 'Exam Room 2',
        status: 'Available',
        quantity: 3,
        unit_cost: 75.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: 1,
        expiration_date: null,
        data: {
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        id: 'mock-3',
        facility_id: 'mock-facility',
        name: 'Blood Pressure Cuff',
        category: 'Diagnostic Equipment',
        location: 'Exam Room 1',
        status: 'In Use',
        quantity: 2,
        unit_cost: 45.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: 1,
        expiration_date: null,
        data: {
          lastUpdated: new Date().toISOString(),
        },
      },
    ];
  }

  private getMockCategories(): string[] {
    return [
      'Surgical Instruments',
      'Diagnostic Equipment',
      'Medical Supplies',
      'Office Equipment',
      'Emergency Equipment',
    ];
  }
}
