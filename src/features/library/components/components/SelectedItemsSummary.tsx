import React from 'react';
import { SelectedItemsSummaryProps } from '../types/InventorySearchModalTypes';

const SelectedItemsSummary: React.FC<SelectedItemsSummaryProps> = ({
  selectedItems,
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-2">Selected Items</h3>
      <p className="text-sm text-gray-600">
        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{' '}
        selected
      </p>
      {selectedItems.length > 0 && (
        <div className="mt-2 space-y-1">
          {selectedItems.slice(0, 3).map((item) => (
            <div key={item.id} className="text-xs text-gray-600 truncate">
              {item.name}
            </div>
          ))}
          {selectedItems.length > 3 && (
            <div className="text-xs text-gray-500">
              +{selectedItems.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectedItemsSummary;
