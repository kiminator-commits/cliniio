import { useMemo, useCallback } from 'react';
import { usageTrackingService } from '@/services/usageTrackingService';
import {
  inventoryData,
  suppliesData,
  equipmentData,
  officeHardwareData,
} from '@/utils/Inventory/inventoryData';
import { filterInventoryBySearch } from '@/utils/inventoryHelpers';

interface SmartSearchFilters {
  searchQuery: string;
  activeTab: string;
}

interface SearchResult<T> {
  item: T;
  score: number;
  isExactMatch: boolean;
  isFrequentlyUsed: boolean;
}

export function useSmartInventorySearch(filters: SmartSearchFilters) {
  // Track search queries to learn user patterns
  const trackSearchQuery = useCallback((query: string) => {
    if (query.trim()) {
      // Find items that match the search and track them
      const allItems = [...inventoryData, ...suppliesData, ...equipmentData, ...officeHardwareData];
      const matchingItems = filterInventoryBySearch(
        allItems,
        ['item', 'category', 'toolId', 'supplyId', 'equipmentId', 'hardwareId', 'location'],
        query
      );

      matchingItems.forEach(item => {
        const itemId = item.toolId || item.supplyId || item.equipmentId || item.hardwareId || '';
        if (itemId) {
          usageTrackingService.trackItemSearch(itemId);
        }
      });
    }
  }, []);

  // Smart search with ranking
  const performSmartSearch = useCallback(
    <T extends Record<string, unknown>>(
      items: T[],
      searchFields: (keyof T)[],
      query: string
    ): T[] => {
      if (!query.trim()) {
        // If no search query, return items sorted by usage frequency
        return usageTrackingService.getSmartRanking(items);
      }

      // Track this search query
      trackSearchQuery(query);

      const queryLower = query.toLowerCase();
      const results: SearchResult<T>[] = [];

      items.forEach(item => {
        const itemId = item.toolId || item.supplyId || item.equipmentId || item.hardwareId || '';
        const usageScore = usageTrackingService.calculateSmartScore(itemId);

        // Check if item matches search
        const matchesSearch = searchFields.some(field =>
          item[field]?.toString().toLowerCase().includes(queryLower)
        );

        if (matchesSearch) {
          // Calculate search relevance score
          let searchScore = 0;
          let isExactMatch = false;
          let isFrequentlyUsed = false;

          // Check for exact matches (higher priority)
          searchFields.forEach(field => {
            const fieldValue = item[field]?.toString().toLowerCase();
            if (fieldValue === queryLower) {
              searchScore += 1000; // Exact match gets highest priority
              isExactMatch = true;
            } else if (fieldValue?.startsWith(queryLower)) {
              searchScore += 500; // Starts with query
            } else if (fieldValue?.includes(queryLower)) {
              searchScore += 100; // Contains query
            }
          });

          // Boost frequently used items
          if (usageScore > 50) {
            searchScore += usageScore * 0.5;
            isFrequentlyUsed = true;
          }

          // Boost items used recently
          if (usageScore > 0) {
            searchScore += Math.min(usageScore, 100); // Cap the boost
          }

          results.push({
            item,
            score: searchScore,
            isExactMatch,
            isFrequentlyUsed,
          });
        }
      });

      // Sort by score (highest first)
      return results.sort((a, b) => b.score - a.score).map(result => result.item);
    },
    [trackSearchQuery]
  );

  // Get filtered and smart-ranked data for each category
  const smartFilteredData = useMemo(() => {
    const searchFields = ['item', 'category', 'toolId', 'location', 'p2Status'];
    return performSmartSearch(inventoryData, searchFields, filters.searchQuery);
  }, [filters.searchQuery, performSmartSearch]);

  const smartFilteredSuppliesData = useMemo(() => {
    const searchFields = ['item', 'category', 'supplyId', 'location', 'expiration'];
    return performSmartSearch(suppliesData, searchFields, filters.searchQuery);
  }, [filters.searchQuery, performSmartSearch]);

  const smartFilteredEquipmentData = useMemo(() => {
    const searchFields = ['item', 'category', 'equipmentId', 'location', 'status', 'lastServiced'];
    return performSmartSearch(equipmentData, searchFields, filters.searchQuery);
  }, [filters.searchQuery, performSmartSearch]);

  const smartFilteredOfficeHardwareData = useMemo(() => {
    const searchFields = ['item', 'category', 'hardwareId', 'location', 'status', 'warranty'];
    return performSmartSearch(officeHardwareData, searchFields, filters.searchQuery);
  }, [filters.searchQuery, performSmartSearch]);

  // Get the appropriate data based on active tab
  const getCurrentTabData = useCallback(() => {
    switch (filters.activeTab) {
      case 'tools':
        return smartFilteredData;
      case 'supplies':
        return smartFilteredSuppliesData;
      case 'equipment':
        return smartFilteredEquipmentData;
      case 'officeHardware':
        return smartFilteredOfficeHardwareData;
      default:
        return smartFilteredData;
    }
  }, [
    filters.activeTab,
    smartFilteredData,
    smartFilteredSuppliesData,
    smartFilteredEquipmentData,
    smartFilteredOfficeHardwareData,
  ]);

  return {
    filteredData: smartFilteredData,
    filteredSuppliesData: smartFilteredSuppliesData,
    filteredEquipmentData: smartFilteredEquipmentData,
    filteredOfficeHardwareData: smartFilteredOfficeHardwareData,
    getCurrentTabData,
    trackSearchQuery,
  };
}
