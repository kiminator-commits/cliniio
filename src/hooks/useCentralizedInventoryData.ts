import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryServiceFacadeImpl } from '@/services/inventory/InventoryServiceFacade';
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
          const inventoryService = await InventoryServiceFacadeImpl.getInstance();
          const response = await inventoryService.getAllItems();
          const allItems = response.data || [];
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
          const inventoryService = await InventoryServiceFacadeImpl.getInstance();
          const response = await inventoryService.getAllItems();
          const allItems = response.data || [];
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
          const inventoryService = await InventoryServiceFacadeImpl.getInstance();
          const response = await inventoryService.getAllItems();
          const allItems = response.data || [];
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
          const inventoryService = await InventoryServiceFacadeImpl.getInstance();
          const response = await inventoryService.getAllItems();
          const allItems = response.data || [];
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
            // Simplified retry logic - reduce retries and delay for faster loading
            let retryCount = 0;
            const maxRetries = 2; // Reduced from 3
            const baseDelay = 25; // Reduced from 50ms

            while (retryCount < maxRetries) {
              try {
                // Get the service instance through the factory
                const inventoryService = await InventoryServiceFacadeImpl.getInstance();
                const response = await inventoryService.getAllItems();
                const allItems = response.data || [];

                // Categorize items by type
                const categorizedData = {
                  tools: allItems.filter(item => item.category === 'Tools'),
                  supplies: allItems.filter(item => item.category === 'Supplies'),
                  equipment: allItems.filter(item => item.category === 'Equipment'),
                  officeHardware: allItems.filter(item => item.category === 'Office Hardware'),
                };

                // Atomically set ALL slices from the same source
                console.log(
                  '[useCentralizedInventoryData] Setting state with data:',
                  {
                    allItems: allItems.length,
                    tools: categorizedData.tools.length,
                    supplies: categorizedData.supplies.length,
                    equipment: categorizedData.equipment.length,
                    officeHardware: categorizedData.officeHardware.length,
                  }
                );

                set({
                  items: allItems,
                  tools: categorizedData.tools,
                  supplies: categorizedData.supplies,
                  equipment: categorizedData.equipment,
                  officeHardware: categorizedData.officeHardware,
                  data: { 
                    tools: categorizedData.tools, 
                    supplies: categorizedData.supplies, 
                    equipment: categorizedData.equipment, 
                    officeHardware: categorizedData.officeHardware,
                    categories: Array.from(new Set(allItems.map(item => item.category).filter(Boolean))),
                    isLoading: false,
                    error: null
                  },
                  error: null,
                  isLoading: false,
                });

                __log('✅ single-source applied', {
                  counts: {
                    all: allItems.length,
                    tools: categorizedData.tools.length,
                    supplies: categorizedData.supplies.length,
                    equipment: categorizedData.equipment.length,
                    officeHardware: categorizedData.officeHardware.length,
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

// React hook to initialize data fetching with lazy loading
export const useInitializeInventoryData = () => {
  const refreshData = useCentralizedInventoryData((state) => state.refreshData);
  const isLoading = useCentralizedInventoryData((state) => state.isLoading);
  const data = useCentralizedInventoryData((state) => state.data);

  React.useEffect(() => {
    // Only fetch if not already loading, no data exists, and not already fetching
    if (!isLoading && !data && !isDataFetching) {
      // Defer initialization to avoid blocking initial render
      const timeoutId = setTimeout(() => {
        refreshData();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [refreshData, isLoading, data]);

  return { refreshData, isLoading };
};
