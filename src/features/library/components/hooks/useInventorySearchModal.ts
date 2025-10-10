import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import { SearchFilters } from '../types/InventorySearchModalTypes';
import {
  buildSearchFilters,
  getDefaultFilters,
} from '../utils/inventorySearchUtils';
import { useInventorySearch } from '../../hooks/useInventorySearch';

interface UseInventorySearchModalProps {
  isOpen: boolean;
  selectedItems?: InventoryItem[];
  onSelectItems: (items: InventoryItem[]) => void;
  onClose: () => void;
}

export const useInventorySearchModal = ({
  isOpen,
  selectedItems = [],
  onSelectItems,
  onClose,
}: UseInventorySearchModalProps) => {
  const {
    inventoryItems,
    isLoading,
    error,
    categories,
    locations,
    statuses,
    searchInventory,
    clearSearch,
  } = useInventorySearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(getDefaultFilters());
  const [localSelectedItems, setLocalSelectedItems] =
    useState<InventoryItem[]>(selectedItems);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = setTimeout(() => {
      if (
        searchQuery.trim() ||
        Object.values(filters).some((value) => value !== '')
      ) {
        const searchFilters = buildSearchFilters(searchQuery, filters);
        searchInventory(searchFilters);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, isOpen, searchInventory]);

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      clearSearch();
      setLocalSelectedItems(selectedItems);
      // Trigger initial search to load all items
      const searchFilters = buildSearchFilters(searchQuery, filters);
      searchInventory(searchFilters);
    }
    return undefined;
  }, [
    isOpen,
    selectedItems,
    clearSearch,
    searchInventory,
    searchQuery,
    filters,
  ]);

  // Update local selected items when prop changes
  useEffect(() => {
    setLocalSelectedItems(selectedItems);
  }, [selectedItems]);

  const handleClearFilters = () => {
    setFilters(getDefaultFilters());
    setSearchQuery('');
    // Clear search and then trigger a new search to show all items
    clearSearch().then(() => {
      setTimeout(() => {
        searchInventory({});
      }, 100);
    });
  };

  const handleItemToggle = (item: InventoryItem) => {
    const isSelected = localSelectedItems.some(
      (selected) => selected.id === item.id
    );
    if (isSelected) {
      setLocalSelectedItems((prev) =>
        prev.filter((selected) => selected.id !== item.id)
      );
    } else {
      setLocalSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleConfirmSelection = () => {
    onSelectItems(localSelectedItems);
    onClose();
  };

  const handleSearch = () => {
    const searchFilters = buildSearchFilters(searchQuery, filters);
    searchInventory(searchFilters);
  };

  return {
    // State
    searchQuery,
    showFilters,
    filters,
    localSelectedItems,
    inventoryItems,
    isLoading,
    error,
    categories,
    locations,
    statuses,

    // Actions
    setSearchQuery,
    setShowFilters,
    setFilters,
    handleClearFilters,
    handleItemToggle,
    handleConfirmSelection,
    handleSearch,
  };
};
