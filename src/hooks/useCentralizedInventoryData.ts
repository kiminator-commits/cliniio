import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getInventoryService } from '@/services/ServiceAccess';
import {
  InventoryDataResponse,
  InventoryFilters,
} from '@/services/inventory/types/inventoryServiceTypes';
import { LocalInventoryItem } from '@/types/inventoryTypes';
// import { cacheInvalidationService } from '@/services/cache/cacheInvalidationCompatibility';
// import { useUser } from '@/contexts/UserContext'; // Fix import path

// const __INV_SINGLE_SOURCE__ = 'facade' as const;
const __log = (...args: unknown[]) =>
  console.log('[useCentralizedInventoryData]', ...args);

export interface UseCentralizedInventoryDataReturn {
  // Data state
  data: InventoryDataResponse | null;
  isLoading: boolean;
  error: string | null;

  // Direct array access
  items: LocalInventoryItem[];
  tools: LocalInventoryItem[];
  supplies: LocalInventoryItem[];
  equipment: LocalInventoryItem[];
  officeHardware: LocalInventoryItem[];

  // Raw data access methods
  getTools: () => LocalInventoryItem[];
  getSupplies: () => LocalInventoryItem[];
  getEquipment: () => LocalInventoryItem[];
  getOfficeHardware: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Filtered data methods (compatible with existing useFilteredInventoryData)
  getFilteredData: (
    searchQuery: string,
    filters?: InventoryFilters
  ) => Promise<LocalInventoryItem[]>;
  getFilteredSuppliesData: (
    searchQuery: string,
    filters?: InventoryFilters
  ) => Promise<LocalInventoryItem[]>;
  getFilteredEquipmentData: (
    searchQuery: string,
    filters?: InventoryFilters
  ) => Promise<LocalInventoryItem[]>;
  getFilteredOfficeHardwareData: (
    searchQuery: string,
    filters?: InventoryFilters
  ) => Promise<LocalInventoryItem[]>;

  // Data management
  refreshData: () => Promise<void>;
  clearError: () => void;

  // Legacy compatibility - direct data access (for gradual migration)
  inventoryData: LocalInventoryItem[];
  suppliesData: LocalInventoryItem[];
  equipmentData: LocalInventoryItem[];
  officeHardwareData: LocalInventoryItem[];
}

// Global state to prevent multiple data fetches
let isDataFetching = false;

export const useCentralizedInventoryData =
  create<UseCentralizedInventoryDataReturn>()(
    persist(
      (set, get) => ({
        // Data state
        data: null,
        isLoading: true,
        error: null,

        // Direct array access
        items: [],
        tools: [],
        supplies: [],
        equipment: [],
        officeHardware: [],

        // Raw data access methods
        getTools: () => get().tools,
        getSupplies: () => get().supplies,
        getEquipment: () => get().equipment,
        getOfficeHardware: () => get().officeHardware,
        getCategories: () => {
          const state = get();
          return Array.from(
            new Set([
              ...state.tools
                .map((item) => item.category)
                .filter((cat): cat is string => cat !== null),
              ...state.supplies
                .map((item) => item.category)
                .filter((cat): cat is string => cat !== null),
              ...state.equipment
                .map((item) => item.category)
                .filter((cat): cat is string => cat !== null),
              ...state.officeHardware
                .map((item) => item.category)
                .filter((cat): cat is string => cat !== null),
            ])
          );
        },

        // Filtered data methods (compatible with existing useFilteredInventoryData)
        getFilteredData: async (searchQuery: string) => {
          const inventoryService = await getInventoryService();
          const allItems = await inventoryService.fetchInventoryItems();
          if (!allItems || !Array.isArray(allItems)) {
            return [];
          }
          return allItems.filter(
            (item) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.category?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        },

        getFilteredSuppliesData: async (searchQuery: string) => {
          const inventoryService = await getInventoryService();
          const allItems = await inventoryService.fetchInventoryItems();
          return allItems.filter(
            (item) =>
              item.category === 'Supplies' &&
              (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          );
        },

        getFilteredEquipmentData: async (searchQuery: string) => {
          const inventoryService = await getInventoryService();
          const allItems = await inventoryService.fetchInventoryItems();
          return allItems.filter(
            (item) =>
              item.category === 'Equipment' &&
              (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          );
        },

        getFilteredOfficeHardwareData: async (searchQuery: string) => {
          const inventoryService = await getInventoryService();
          const allItems = await inventoryService.fetchInventoryItems();
          return allItems.filter(
            (item) =>
              item.category === 'Office Hardware' &&
              (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          );
        },

        // Data management
        refreshData: async () => {
          // Prevent multiple simultaneous calls
          if (isDataFetching) {
            console.log(
              '[useCentralizedInventoryData] Data fetch already in progress, skipping...'
            );
            return;
          }

          isDataFetching = true;
          set({ isLoading: true, error: null });

          try {
            // Optimized retry logic for facade initialization
            let retryCount = 0;
            const maxRetries = 3;
            const baseDelay = 50;

            while (retryCount < maxRetries) {
              try {
                // Get the service instance through the factory
                const inventoryService = await getInventoryService();
                const data = await inventoryService.fetchAllInventoryData();

                // Derive a unified "all items" array from the categorized data.
                const allItems = [
                  ...(data?.tools ?? []),
                  ...(data?.supplies ?? []),
                  ...(data?.equipment ?? []),
                  ...(data?.officeHardware ?? []),
                ];

                // Atomically set ALL slices from the same source
                console.log(
                  '[useCentralizedInventoryData] Setting state with data:',
                  {
                    allItems: allItems.length,
                    tools: data?.tools?.length || 0,
                    supplies: data?.supplies?.length || 0,
                    equipment: data?.equipment?.length || 0,
                    officeHardware: data?.officeHardware?.length || 0,
                  }
                );

                set({
                  items: allItems,
                  tools: data?.tools ?? [],
                  supplies: data?.supplies ?? [],
                  equipment: data?.equipment ?? [],
                  officeHardware: data?.officeHardware ?? [],
                  data: data,
                  error: null,
                  isLoading: false,
                });

                __log('✅ single-source applied', {
                  counts: {
                    all: allItems.length,
                    tools: (data?.tools ?? []).length,
                    supplies: (data?.supplies ?? []).length,
                    equipment: (data?.equipment ?? []).length,
                    officeHardware: (data?.officeHardware ?? []).length,
                  },
                });

                // Success! Break out of retry loop
                break;
              } catch (err) {
                retryCount++;
                if (retryCount >= maxRetries) {
                  // Final failure after all retries
                  __log(
                    '❌ facade fetch failed after all retries; clearing state',
                    String((err as Error)?.message ?? err)
                  );
                  set({
                    items: [],
                    tools: [],
                    supplies: [],
                    equipment: [],
                    officeHardware: [],
                    error: String((err as Error)?.message ?? err),
                    isLoading: false,
                  });
                } else {
                  // Log retry attempt and continue
                  __log(
                    `⚠️ Facade fetch attempt ${retryCount} failed, retrying...`,
                    String((err as Error)?.message ?? err)
                  );
                  // Wait before next retry with linear backoff
                  const delay = baseDelay * (retryCount + 1);
                  await new Promise((resolve) => setTimeout(resolve, delay));
                }
              }
            }
          } finally {
            isDataFetching = false;
          }
        },

        clearError: () => set({ error: null }),

        // Legacy compatibility - direct data access (for gradual migration)
        inventoryData: [],
        suppliesData: [],
        equipmentData: [],
        officeHardwareData: [],
      }),
      {
        name: 'centralized-inventory-store', // localStorage key
        partialize: (state) => ({
          tools: state.tools,
          supplies: state.supplies,
          equipment: state.equipment,
          officeHardware: state.officeHardware,
          items: state.items,
          data: state.data,
        }),
      }
    )
  );

// React hook to initialize data fetching
export const useInitializeInventoryData = () => {
  const refreshData = useCentralizedInventoryData((state) => state.refreshData);
  const isLoading = useCentralizedInventoryData((state) => state.isLoading);

  React.useEffect(() => {
    // Only fetch if not already loading and no data exists
    if (!isLoading) {
      refreshData();
    }
  }, [refreshData, isLoading]);

  return { refreshData, isLoading };
};
