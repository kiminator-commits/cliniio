import React from 'react';
import Icon from '@mdi/react';
import { mdiPackageVariant, mdiLoading, mdiAlertCircle } from '@mdi/js';
import { SearchResultsProps } from '../types/InventorySearchModalTypes';
import InventoryItemCard from './InventoryItemCard';

const SearchResults: React.FC<SearchResultsProps> = ({
  inventoryItems,
  selectedItems,
  onItemToggle,
  isLoading,
  error,
}) => {
  return (
    <div className="w-2/3 p-6 overflow-y-auto">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Search Results
          </h3>
          <p className="text-sm text-gray-600">
            {isLoading
              ? 'Searching...'
              : `${inventoryItems.length} items found`}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <Icon path={mdiAlertCircle} size={1} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Icon
              path={mdiLoading}
              size={1}
              className="animate-spin text-[#4ECDC4]"
            />
            <span className="text-gray-600">Searching inventory...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                path={mdiPackageVariant}
                size={3}
                className="mx-auto text-gray-300 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            inventoryItems.map((item) => {
              const isSelected = selectedItems.some(
                (selected) => selected.id === item.id
              );
              return (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  onToggle={onItemToggle}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
