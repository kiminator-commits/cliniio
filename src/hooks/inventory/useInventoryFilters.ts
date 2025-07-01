import { useState, useEffect, useMemo } from 'react';
import { InventoryFilter } from '../../types/inventoryTypes';

export interface InventoryFilters extends InventoryFilter {
  searchQuery: string;
  category: string;
  location: string;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  status?: string;
  dateCreated?: {
    start: Date;
    end: Date;
  };
}

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
    showTrackedOnly: false,
    showFavoritesOnly: false,
    ...initialFilters,
  });

  // Memoized filter actions
  const actions: FilterActions = useMemo(
    () => ({
      setSearchQuery: (query: string) => {
        setFilters(prev => ({ ...prev, searchQuery: query }));
      },

      setCategory: (category: string) => {
        setFilters(prev => ({ ...prev, category }));
      },

      setLocation: (location: string) => {
        setFilters(prev => ({ ...prev, location }));
      },

      setStatus: (status: string) => {
        setFilters(prev => ({ ...prev, status }));
      },

      setPriceRange: (min: number, max: number) => {
        setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
      },

      setQuantityRange: (min: number, max: number) => {
        setFilters(prev => ({ ...prev, minQuantity: min, maxQuantity: max }));
      },

      setDateRange: (start: Date, end: Date) => {
        setFilters(prev => ({ ...prev, dateCreated: { start, end } }));
      },

      toggleTrackedOnly: () => {
        setFilters(prev => ({ ...prev, showTrackedOnly: !prev.showTrackedOnly }));
      },

      toggleFavoritesOnly: () => {
        setFilters(prev => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }));
      },

      resetFilters: () => {
        setFilters({
          searchQuery: '',
          category: '',
          location: '',
          showTrackedOnly: false,
          showFavoritesOnly: false,
        });
      },

      applyFilters: (newFilters: Partial<InventoryFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
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
