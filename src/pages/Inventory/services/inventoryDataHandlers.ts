import { TabType } from '../types';
import { handleCategoryChange } from '@/utils/inventoryHelpers';
import { getStatusBadge, getStatusText } from '@/utils/Inventory/statusUtils';
import { InventoryItem } from '@/types/inventoryTypes';

/**
 * Service for handling inventory category logic
 * Extracted from main Inventory page component
 */
export class CategoryService {
  /**
   * Handle category change with memoization
   * Extracted from memoizedCategoryChange in main page
   */
  static createCategoryChangeHandler(setActiveTab: (tab: TabType) => void) {
    return (tab: TabType) => {
      handleCategoryChange(setActiveTab, tab);
    };
  }

  /**
   * Handle tracked filter toggle
   * Extracted from handleToggleTrackedFilter in main page
   */
  static createTrackedFilterHandler(
    showTrackedOnly: boolean,
    setShowTrackedOnly: (show: boolean) => void
  ) {
    return () => {
      setShowTrackedOnly(!showTrackedOnly);
    };
  }

  /**
   * Handle favorites filter toggle
   * Extracted from handleToggleFavoritesFilter in main page
   */
  static createFavoritesFilterHandler(
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
 * Extracted from main Inventory page component
 */
export class FilterService {
  /**
   * Get filtered tools data based on current filter state
   * This method should be called from a React component that has access to hooks
   */
  static getFilteredTools(
    allItems: InventoryItem[],
    searchQuery: string,
    categoryFilter: string,
    locationFilter: string,
    showTrackedOnly: boolean,
    showFavoritesOnly: boolean,
    favorites: string[]
  ): InventoryItem[] {
    if (!allItems || !Array.isArray(allItems)) {
      return [];
    }

    let filteredItems = [...allItems];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        const searchableFields = [
          item.name,
          item.category,
          item.location,
          item.data?.description,
          item.data?.barcode,
          item.data?.sku,
        ];

        return searchableFields.some((field) => {
          if (!field) return false;
          return field.toString().toLowerCase().includes(query);
        });
      });
    }

    // Filter by category
    if (categoryFilter) {
      filteredItems = filteredItems.filter(
        (item) => item.category === categoryFilter
      );
    }

    // Filter by location
    if (locationFilter) {
      filteredItems = filteredItems.filter(
        (item) => item.location === locationFilter
      );
    }

    // Filter by tracked status (only for tools and supplies)
    if (showTrackedOnly) {
      filteredItems = filteredItems.filter((item) => {
        // Only apply tracking filter to tools and supplies
        if (item.category !== 'Tools' && item.category !== 'Supplies') {
          return true;
        }
        // Check if item is tracked (has tracking data)
        return item.data?.tracked === true;
      });
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filteredItems = filteredItems.filter((item) =>
        favorites.includes(item.id)
      );
    }

    return filteredItems;
  }

  /**
   * Get filtered tools data for modal display (legacy method)
   * This method returns the old format expected by modals
   */
  static getFilteredToolsForModal(
    allItems: InventoryItem[],
    searchQuery: string,
    categoryFilter: string,
    locationFilter: string,
    showTrackedOnly: boolean,
    showFavoritesOnly: boolean,
    favorites: string[]
  ) {
    const filteredItems = this.getFilteredTools(
      allItems,
      searchQuery,
      categoryFilter,
      locationFilter,
      showTrackedOnly,
      showFavoritesOnly,
      favorites
    );

    return filteredItems.map((item) => ({
      id: item.id || '',
      name: item.name || item.item || '',
      barcode: item.data?.barcode || '',
      currentPhase: item.status || 'unknown',
      category: item.category || '',
    }));
  }
}

/**
 * Service for handling inventory item status logic
 * Extracted from main Inventory page component
 */
export class StatusService {
  /**
   * Get CSS classes for status badge styling
   */
  static getStatusBadge(phase: string): string {
    return getStatusBadge(phase);
  }

  /**
   * Get display text for status
   */
  static getStatusText(phase: string): string {
    return getStatusText(phase);
  }
}
