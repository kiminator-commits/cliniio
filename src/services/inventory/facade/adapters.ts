import { LocalInventoryItem } from './types';
import { inventoryAdapterFactory } from '../adapters/InventoryAdapterFactory';
import { InventoryDataAdapter } from '../adapters/InventoryDataAdapter';
import { getItemStatus } from '../../../types/inventoryTypes';
import { TabType } from '../../../types/inventory';
import { handleCategoryChange } from '../../../utils/inventoryHelpers';
import {
  getStatusBadge,
  getStatusText,
} from '../../../utils/Inventory/statusUtils';

/**
 * Service for handling inventory category logic
 */
export class InventoryCategoryService {
  /**
   * Handle category change with memoization
   */
  createCategoryChangeHandler(setActiveTab: (tab: string) => void) {
    return (tab: string) => {
      handleCategoryChange(setActiveTab, tab as TabType);
    };
  }

  /**
   * Handle tracked filter toggle
   */
  createTrackedFilterHandler(
    showTrackedOnly: boolean,
    setShowTrackedOnly: (show: boolean) => void
  ) {
    return () => {
      setShowTrackedOnly(!showTrackedOnly);
    };
  }

  /**
   * Handle favorites filter toggle
   */
  createFavoritesFilterHandler(
    showFavoritesOnly: boolean,
    setShowFavoritesOnly: (show: boolean) => void
  ) {
    return () => {
      setShowFavoritesOnly(!showFavoritesOnly);
    };
  }
}

/**
 * Service for handling inventory filtering logic
 */
export class InventoryFilterService {
  private filteredToolsData: LocalInventoryItem[] = [];

  /**
   * Transform inventory data for modal display
   */
  getFilteredTools() {
    return this.filteredToolsData.map((item) => ({
      id: item.id || '',
      name: item.name || item.item || '',
      barcode: item.data?.barcode || '',
      currentPhase: getItemStatus(item),
      category: item.category || '',
    }));
  }

  /**
   * Set filtered tools data
   */
  setFilteredToolsData(data: LocalInventoryItem[]): void {
    this.filteredToolsData = data;
  }

  /**
   * Set filtered tools data (called by facade)
   */
  setFilteredTools(tools: LocalInventoryItem[]) {
    this.filteredToolsData = tools;
  }
}

/**
 * Service for handling inventory item status logic
 */
export class InventoryStatusService {
  /**
   * Get CSS classes for status badge styling
   */
  getStatusBadge(phase: string): string {
    return getStatusBadge(phase);
  }

  /**
   * Get display text for status
   */
  getStatusText(phase: string): string {
    return getStatusText(phase);
  }

  /**
   * Get item status
   */
  getItemStatus(item: LocalInventoryItem): string {
    return getItemStatus(item) || 'Unknown';
  }
}

/**
 * Adapter factory wrapper for external provider management
 */
export class InventoryAdapterManager {
  private currentAdapter: InventoryDataAdapter | null = null;
  private adapterType: string = 'static';
  private initialized = false;

  /**
   * Initialize the default adapter
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return; // Already initialized, prevent multiple initializations
    }

    this.currentAdapter =
      await inventoryAdapterFactory.initializeDefaultAdapter();
    this.adapterType = inventoryAdapterFactory.getConfig().defaultAdapter;
    this.initialized = true;
  }

  /**
   * Get the current adapter
   */
  getAdapter(): InventoryDataAdapter {
    if (!this.currentAdapter) {
      throw new Error(
        'Inventory service facade not initialized. Call initialize() first.'
      );
    }
    return this.currentAdapter;
  }

  /**
   * Get current adapter type
   */
  getCurrentAdapterType(): string {
    return this.adapterType;
  }

  /**
   * Get adapter metadata
   */
  getAdapterMetadata() {
    const metadata = inventoryAdapterFactory.getAdapterMetadata(
      this.adapterType
    );
    return metadata;
  }

  /**
   * Get available adapters
   */
  getAvailableAdapters() {
    return inventoryAdapterFactory.getAvailableAdapters();
  }
}
