import React from 'react';
import { useInventoryStore } from '@/hooks/useInventoryStore';

/**
 * Example component demonstrating the new clean inventory store
 * Shows how all state is now organized and accessible from a single store
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

    // Modal state
    showAddModal,
    showScanModal,

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
    closeAddModal,
    openScanModal,
    closeScanModal,
    setCurrentPage,
    updateAnalytics,
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
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <select
          value={categoryFilter}
          onChange={e => handleCategoryChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="mb-4 space-x-2">
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
        <button
          onClick={handleScanItem}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Scan Item
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-2">
          {['tools', 'supplies', 'equipment'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="mb-4">
        {isLoading ? (
          <p>Loading items...</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 5).map(item => (
              <div key={item.id} className="p-2 border rounded flex justify-between items-center">
                <span>{item.name}</span>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`px-2 py-1 rounded ${
                    favorites.includes(item.id)
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {favorites.includes(item.id) ? '★' : '☆'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mb-4 flex justify-between items-center">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * itemsPerPage >= totalItems}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Analytics</h3>
        {isLoadingAnalytics ? (
          <p>Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{analyticsData.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{analyticsData.lowStockItems}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{analyticsData.expiredItems}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </div>
        )}
        <button
          onClick={updateAnalytics}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">Add New Item</h3>
            <p className="mb-4">Add item form would go here...</p>
            <button onClick={closeAddModal} className="px-4 py-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}

      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">Scan Item</h3>
            <p className="mb-4">Scanner interface would go here...</p>
            <button onClick={closeScanModal} className="px-4 py-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryExample;
