import React from 'react';
import { useInventoryDataManagerContext } from '@/pages/Inventory/providers/InventoryDataManagerProvider';

/**
 * Example component demonstrating the new centralized data management hook
 *
 * This component shows different ways to use the data manager:
 * 1. Full data manager access
 * 2. Data-only access
 * 3. Operations-only access
 * 4. Analytics data access
 */
const DataManagerExample: React.FC = () => {
  // Full access to the data manager
  const dataManager = useInventoryDataManagerContext();

  // Example: Display loading state
  if (dataManager.isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">Loading Inventory Data...</h3>
        <div className="mt-2 text-sm text-blue-600">
          {dataManager.operationInProgress.type && (
            <span>Operation in progress: {dataManager.operationInProgress.type}</span>
          )}
        </div>
      </div>
    );
  }

  // Example: Display error state
  if (dataManager.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
        <p className="mt-2 text-sm text-red-600">{dataManager.error}</p>
        <div className="mt-3 space-x-2">
          <button
            onClick={dataManager.retryLastOperation}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
          <button
            onClick={dataManager.clearError}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Error
          </button>
        </div>
      </div>
    );
  }

  // Example: Display analytics data
  const analytics = dataManager.getAnalyticsData();

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Inventory Data Manager Example</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={dataManager.refreshData}
            disabled={dataManager.isRefreshing}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {dataManager.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-xs text-gray-500">
            Last updated: {dataManager.lastUpdated?.toLocaleTimeString() || 'Never'}
          </span>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Items</h3>
          <p className="text-2xl font-bold text-blue-900">{analytics.totalItems}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Value</h3>
          <p className="text-2xl font-bold text-green-900">
            ${analytics.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-900">{analytics.lowStockItems}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-900">{analytics.outOfStockItems}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {analytics.categories.map(category => (
            <span
              key={category}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {category} ({dataManager.getItemsByCategory(category).length})
            </span>
          ))}
        </div>
      </div>

      {/* Sample Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Sample Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataManager
            .getAllItems()
            .slice(0, 6)
            .map(item => (
              <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">{item.item}</h4>
                <p className="text-sm text-gray-600">Category: {item.category}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity || 0}</p>
                <p className="text-sm text-gray-600">Location: {item.location}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Search Example */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Search Example</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search items..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => {
              const searchResults = dataManager.getFilteredItems(e.target.value);
              console.log('Search results:', searchResults);
            }}
          />
        </div>
      </div>

      {/* CRUD Operations Example */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">CRUD Operations Example</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // Example: Create a new item
              const newItem = {
                id: `item-${Date.now()}`,
                item: 'Example Item',
                category: 'Tools',
                location: 'Storage A',
                quantity: 10,
                price: 25.99,
                barcode: '123456789',
                currentPhase: 'Available',
              };

              dataManager.createItem(newItem).catch(console.error);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Example Item
          </button>

          <button
            onClick={() => {
              // Example: Add a new category
              dataManager.addCategory('New Category').catch(console.error);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagerExample;
