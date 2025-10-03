import React from 'react';
import { motion } from 'framer-motion';
import { InventorySearchModalProps } from './types/InventorySearchModalTypes';
import { useInventorySearchModal } from './hooks/useInventorySearchModal';
import ModalHeader from './components/ModalHeader';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import SelectedItemsSummary from './components/SelectedItemsSummary';
import SearchResults from './components/SearchResults';

const InventorySearchModal: React.FC<InventorySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectItems,
  selectedItems = [],
}) => {
  const {
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
  } = useInventorySearchModal({
    isOpen,
    selectedItems,
    onSelectItems,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <ModalHeader onClose={onClose} />

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Search and Filters */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
            />

            {/* Filters */}
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              categories={categories}
              locations={locations}
              statuses={statuses}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {/* Selected Items Summary */}
            <SelectedItemsSummary selectedItems={localSelectedItems} />
          </div>

          {/* Right Panel - Results */}
          <SearchResults
            inventoryItems={inventoryItems}
            selectedItems={localSelectedItems}
            onItemToggle={handleItemToggle}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Confirm Selection Button */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleConfirmSelection}
            disabled={localSelectedItems.length === 0}
            className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection ({localSelectedItems.length})
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InventorySearchModal;
