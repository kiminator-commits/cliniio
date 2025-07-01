import { useState, useEffect, useCallback } from 'react';

interface InventoryFilters {
  searchQuery: string;
  category: string;
  location: string;
  showTrackedOnly?: boolean;
}

interface UseInventoryFiltersProps {
  initialFilters?: Partial<InventoryFilters>;
  onFiltersChange?: (filters: InventoryFilters) => void;
}

export const useInventoryFilters = ({
  initialFilters = {},
  onFiltersChange,
}: UseInventoryFiltersProps = {}) => {
  const [selectedFilters, setSelectedFilters] = useState<InventoryFilters>({
    searchQuery: '',
    category: '',
    location: '',
    showTrackedOnly: false,
    ...initialFilters,
  });

  const handleFilterChange = useCallback(
    (filterKey: keyof InventoryFilters, value: string | boolean) => {
      setSelectedFilters(prev => ({
        ...prev,
        [filterKey]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setSelectedFilters({
      searchQuery: '',
      category: '',
      location: '',
      showTrackedOnly: false,
    });
  }, []);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(selectedFilters);
    }
  }, [selectedFilters, onFiltersChange]);

  return {
    selectedFilters,
    handleFilterChange,
    resetFilters,
  };
};
