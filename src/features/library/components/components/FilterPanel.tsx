import React from 'react';
import Icon from '@mdi/react';
import { mdiFilter, mdiSort } from '@mdi/js';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterPanelProps } from '../types/InventorySearchModalTypes';

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  showFilters,
  onToggleFilters,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <>
      {/* Filters Toggle */}
      <div className="mb-4">
        <button
          onClick={onToggleFilters}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Icon path={mdiFilter} size={1} />
          <span>Filters</span>
          <Icon
            path={mdiSort}
            size={1}
            className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 mb-4"
          >
            {/* Category */}
            <div>
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="min-quantity-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Min Quantity
                </label>
                <input
                  id="min-quantity-filter"
                  type="number"
                  value={filters.reorder_point}
                  onChange={(e) =>
                    handleFilterChange('reorder_point', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="max-quantity-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Quantity
                </label>
                <input
                  id="max-quantity-filter"
                  type="number"
                  // maxQuantity filter removed - not in Supabase schema
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  placeholder="∞"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="expiry-status-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expiry Status
              </label>
              <select
                id="expiry-status-filter"
                value={filters.expiryDate}
                onChange={(e) =>
                  handleFilterChange('expiryDate', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="">All Items</option>
                <option value="expired">Expired</option>
                <option value="expiring-soon">Expiring Soon (30 days)</option>
                <option value="valid">Valid</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="sort-by-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort By
                </label>
                <select
                  id="sort-by-filter"
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleFilterChange(
                      'sortBy',
                      e.target.value as
                        | 'name'
                        | 'category'
                        | 'quantity'
                        | 'expiration'
                        | 'unit_cost'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="quantity">Quantity</option>
                  <option value="expiration">Expiration</option>
                  <option value="unit_cost">Unit Cost</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="sort-direction-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Direction
                </label>
                <select
                  id="sort-direction-filter"
                  value={filters.sortDirection}
                  onChange={(e) =>
                    handleFilterChange(
                      'sortDirection',
                      e.target.value as 'asc' | 'desc'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterPanel;
