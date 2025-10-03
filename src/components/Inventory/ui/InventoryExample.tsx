import React from 'react';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { InventorySearchAndFilters } from './InventorySearchAndFilters';
import { InventoryActionButtons } from './InventoryActionButtons';
import { InventoryTabs } from './InventoryTabs';
import { InventoryItemsList } from './InventoryItemsList';
import { InventoryPagination } from './InventoryPagination';
import { InventoryAnalytics } from './InventoryAnalytics';

/**
 * Refactored example component demonstrating the new clean inventory store
 * Now uses smaller, focused components for better maintainability
 */
const InventoryExample: React.FC = () => {
  const {
    // Data state
    items,
    categories,
    favorites,
    isLoading,

    // UI state
    activeTab,
    showFilters,

    // Filter state
    searchQuery,
    categoryFilter,

    // Pagination state
    currentPage,
    itemsPerPage,
    totalItems,

    // Analytics state
    analyticsData,
    isLoadingAnalytics,

    // Actions
    setActiveTab,
    setShowFilters,
    setSearchQuery,
    setCategoryFilter,
    toggleFavorite,
    openAddModal,
    openScanModal,
    setCurrentPage,
  } = useInventoryStore();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAddItem = () => {
    openAddModal();
  };

  const handleScanItem = () => {
    openScanModal();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inventory Management</h2>

      {/* Search and Filters */}
      <InventorySearchAndFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        categories={categories}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
      />

      {/* Actions */}
      <InventoryActionButtons
        onAddItem={handleAddItem}
        onScanItem={handleScanItem}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Tabs */}
      <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Items List */}
      <InventoryItemsList
        items={items}
        favorites={favorites}
        isLoading={isLoading}
        onToggleFavorite={toggleFavorite}
      />

      {/* Pagination */}
      <InventoryPagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

      {/* Analytics */}
      <InventoryAnalytics
        analyticsData={analyticsData}
        isLoadingAnalytics={isLoadingAnalytics}
      />
    </div>
  );
};

export default InventoryExample;
