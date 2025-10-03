import React from 'react';

export interface InventoryActionButtonsProps {
  onAddItem: () => void;
  onScanItem: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const InventoryActionButtons: React.FC<InventoryActionButtonsProps> = ({
  onAddItem,
  onScanItem,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="mb-4 space-x-2">
      <button
        onClick={onAddItem}
        className="px-4 py-2 bg-[#4ECDC4] hover:bg-[#3db8b0] text-white rounded transition-colors duration-200"
        aria-label="Add new inventory item"
      >
        Add Item
      </button>
      <button
        onClick={onScanItem}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        aria-label="Scan inventory item"
      >
        Scan Item
      </button>
      <button
        onClick={onToggleFilters}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
      >
        {showFilters ? 'Hide' : 'Show'} Filters
      </button>
    </div>
  );
};
