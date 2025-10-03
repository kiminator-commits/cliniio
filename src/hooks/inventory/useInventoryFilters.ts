import { useState, useMemo, useEffect } from 'react';
import { InventoryFilters as BaseInventoryFilters } from '@/types/inventoryServiceTypes';

// Use the base interface directly since no additional properties are needed
export type InventoryFilters = BaseInventoryFilters;

export interface UseInventoryFiltersProps {
  initialFilters?: Partial<InventoryFilters>;
  onFiltersChange?: (filters: InventoryFilters) => void;
}

export interface FilterActions {
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setLocation: (location: string) => void;
  setStatus: (status: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setQuantityRange: (min: number, max: number) => void;
  setDateRange: (start: Date, end: Date) => void;
  toggleTrackedOnly: () => void;
  toggleFavoritesOnly: () => void;
  resetFilters: () => void;
  applyFilters: (filters: Partial<InventoryFilters>) => void;
}

export const useInventoryFilters = ({
  initialFilters = {},
  onFiltersChange,
}: UseInventoryFiltersProps = {}): [InventoryFilters, FilterActions] => {
  const [filters, setFilters] = useState<InventoryFilters>({
    searchQuery: '',
    category: '',
    location: '',
    tracked: false,
    favorite: false,
    ...initialFilters,
  });

  // Memoized filter actions
  const actions: FilterActions = useMemo(
    () => ({
      setSearchQuery: (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
      },

      setCategory: (category: string) => {
        setFilters((prev) => ({ ...prev, category }));
      },

      setLocation: (location: string) => {
        setFilters((prev) => ({ ...prev, location }));
      },

      setStatus: (status: string) => {
        setFilters((prev) => ({ ...prev, status }));
      },

      setPriceRange: (min: number, max: number) => {
        setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
      },

      setQuantityRange: (min: number) => {
        setFilters((prev) => ({ ...prev, reorder_point: min }));
      },

      setDateRange: (start: Date, end: Date) => {
        setFilters((prev) => ({
          ...prev,
          createdAt: { start: start.toISOString(), end: end.toISOString() },
        }));
      },

      toggleTrackedOnly: () => {
        setFilters((prev) => ({ ...prev, tracked: !prev.tracked }));
      },

      toggleFavoritesOnly: () => {
        setFilters((prev) => ({ ...prev, favorite: !prev.favorite }));
      },

      resetFilters: () => {
        setFilters({
          searchQuery: '',
          category: '',
          location: '',
          tracked: false,
          favorite: false,
        });
      },

      applyFilters: (newFilters: Partial<InventoryFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
      },
    }),
    []
  );

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  return [filters, actions];
};
