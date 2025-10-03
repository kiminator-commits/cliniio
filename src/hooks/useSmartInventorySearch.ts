import { useMemo, useCallback } from 'react';
import { usageTrackingService } from '@/services/usageTrackingService';
import { useCentralizedInventoryData } from './useCentralizedInventoryData';
import { filterInventoryBySearch } from '@/utils/inventoryHelpers';
import { InventoryItem } from '@/types/inventoryTypes';

// Type for searchable inventory items (converts null/unknown to string for search)
type SearchableInventoryItem = {
  [K in keyof InventoryItem]: InventoryItem[K] extends string | number | boolean
    ? InventoryItem[K]
    : string | number | boolean;
};

// Helper function to safely convert InventoryItem to SearchableInventoryItem
const convertToSearchableItem = (
  item: InventoryItem
): SearchableInventoryItem => {
  return {
    id: item.id,
    facility_id: item.facility_id,
    name: item.name,
    quantity: item.quantity,
    data: item.data ? JSON.stringify(item.data) : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    reorder_point: item.reorder_point,
    expiration_date: item.expiration_date,
    unit_cost: item.unit_cost,
    category: item.category,
    status: item.status,
    location: item.location,
    barcode: item.barcode,
    supplier: item.supplier,
    notes: item.notes,
    // Convert properties that exist on InventoryItem
    tool_id: item.tool_id,
    supply_id: item.supply_id,
    equipment_id: item.equipment_id,
    hardware_id: item.hardware_id,
    last_serviced: item.last_serviced,
    purchase_date: item.purchase_date,
    serial_number: item.serial_number,
    manufacturer: item.manufacturer,
    is_active: item.is_active,
    favorite: item.favorite,
    tags: item.tags ? JSON.stringify(item.tags) : null,
    // Convert other properties to strings where needed
    item: item.item,
    cost: item.cost,
    vendor: item.vendor,
    warranty: item.warranty,
    maintenance_schedule: item.maintenance_schedule,
    next_due: item.next_due,
    service_provider: item.service_provider,
    assigned_to: item.assigned_to,
    p2_status: item.p2_status,
    image_url: item.image_url,
    tracked: item.tracked,
    sku: item.sku,
    description: item.description,
    current_phase: item.current_phase,
    unit: item.unit,
    expiration: item.expiration,
    last_updated: item.last_updated,
    lastUpdated: item.lastUpdated,
    expiryDate: item.expiryDate,
  } as SearchableInventoryItem;
};

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

interface ItemWithId {
  toolId?: string;
  supplyId?: string;
  equipmentId?: string;
  hardwareId?: string;
}

export function useSmartInventorySearch(filters: SmartSearchFilters) {
  const { inventoryData, suppliesData, equipmentData, officeHardwareData } =
    useCentralizedInventoryData();

  // Track search queries to learn user patterns
  const trackSearchQuery = useCallback(
    (query: string) => {
      if (query.trim()) {
        // Find items that match the search and track them
        const allItems = [
          ...inventoryData,
          ...suppliesData,
          ...equipmentData,
          ...officeHardwareData,
        ];
        const matchingItems = filterInventoryBySearch(
          allItems.map(convertToSearchableItem),
          ['name', 'category', 'id', 'location'],
          query
        );

        matchingItems.forEach((item: SearchableInventoryItem) => {
          const itemId = item.id || '';
          if (itemId) {
            usageTrackingService.trackItemSearch(itemId);
          }
        });
      }
    },
    [inventoryData, suppliesData, equipmentData, officeHardwareData]
  );

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

      items.forEach((item) => {
        const itemWithId = item as ItemWithId;
        const itemId =
          (itemWithId as { data?: { toolId?: string } }).data?.toolId ||
          (itemWithId as { data?: { supplyId?: string } }).data?.supplyId ||
          (itemWithId as { data?: { equipmentId?: string } }).data
            ?.equipmentId ||
          (itemWithId as { data?: { hardwareId?: string } }).data?.hardwareId ||
          '';
        const usageScore = usageTrackingService.calculateSmartScore(itemId);

        // Check if item matches search
        const matchesSearch = searchFields.some((field) =>
          item[field]?.toString().toLowerCase().includes(queryLower)
        );

        if (matchesSearch) {
          // Calculate search relevance score
          let searchScore = 0;
          let isExactMatch = false;
          let isFrequentlyUsed = false;

          // Check for exact matches (higher priority)
          searchFields.forEach((field) => {
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

          // Check if item is frequently used
          if (usageScore > 0.5) {
            searchScore += 200;
            isFrequentlyUsed = true;
          }

          results.push({
            item,
            score: searchScore + usageScore * 100,
            isExactMatch,
            isFrequentlyUsed,
          });
        }
      });

      // Sort by score (highest first)
      return results
        .sort((a, b) => b.score - a.score)
        .map((result) => result.item);
    },
    [trackSearchQuery]
  );

  // Get items for current tab
  const getItemsForTab = useCallback(
    (tab: string) => {
      switch (tab.toLowerCase()) {
        case 'tools':
          return inventoryData;
        case 'supplies':
          return suppliesData;
        case 'equipment':
          return equipmentData;
        case 'hardware':
          return officeHardwareData;
        default:
          return [
            ...inventoryData,
            ...suppliesData,
            ...equipmentData,
            ...officeHardwareData,
          ];
      }
    },
    [inventoryData, suppliesData, equipmentData, officeHardwareData]
  );

  // Perform search for current tab
  const searchResults = useMemo(() => {
    const items = getItemsForTab(filters.activeTab);
    const searchFields: (keyof InventoryItem)[] = [
      'name',
      'category',
      'id',
      'location',
      'barcode',
    ];

    return performSmartSearch(
      items.map(convertToSearchableItem),
      searchFields,
      filters.searchQuery
    );
  }, [
    filters.searchQuery,
    filters.activeTab,
    getItemsForTab,
    performSmartSearch,
  ]);

  return {
    searchResults,
    performSmartSearch,
    trackSearchQuery,
  };
}
