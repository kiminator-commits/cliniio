import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import {
  inventorySearchService,
  InventorySearchFilters,
} from '../services/inventorySearchService';

interface UseInventorySearchReturn {
  inventoryItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  categories: string[];
  locations: string[];
  statuses: string[];
  manufacturers: string[];
  suppliers: string[];
  searchInventory: (filters: InventorySearchFilters) => Promise<void>;
  clearSearch: () => Promise<void>;
}

export const useInventorySearch = (): UseInventorySearchReturn => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [cats, locs, stats, mans, supps] = await Promise.all([
          inventorySearchService.getCategories(),
          inventorySearchService.getLocations(),
          inventorySearchService.getStatuses(),
          inventorySearchService.getManufacturers(),
          inventorySearchService.getSuppliers(),
        ]);

        setCategories(cats);
        setLocations(locs);
        setStatuses(stats);
        setManufacturers(mans);
        setSuppliers(supps);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load filter options'
        );
      }
    };

    loadFilterOptions();
  }, []);

  const searchInventory = useCallback(
    async (filters: InventorySearchFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const results =
          await inventorySearchService.searchInventoryItems(filters);
        setInventoryItems(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to search inventory'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await inventorySearchService.searchInventoryItems({});
      setInventoryItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear search');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    inventoryItems,
    isLoading,
    error,
    categories,
    locations,
    statuses,
    manufacturers,
    suppliers,
    searchInventory,
    clearSearch,
  };
};
