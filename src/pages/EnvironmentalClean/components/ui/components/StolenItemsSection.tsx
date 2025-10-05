import React from 'react';
import { COLOR_SCHEMES } from '../../../constants';

interface StolenItem {
  item: string;
  quantity: number;
  data?: {
    notes?: string;
  };
}

interface StolenItemsSectionProps {
  stolenItems: StolenItem[];
  onAddStolenItem: () => void;
  onUpdateStolenItem: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  onClearStolenItems: () => void;
}

export const StolenItemsSection: React.FC<StolenItemsSectionProps> = ({
  stolenItems,
  onAddStolenItem,
  onUpdateStolenItem,
  onClearStolenItems,
}) => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">
          Reported Stolen Items
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onClearStolenItems}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
          >
            Clear All
          </button>
          <button
            onClick={onAddStolenItem}
            className={`px-3 py-1 ${COLOR_SCHEMES.error.light} text-red-600 rounded-md hover:bg-red-100 text-sm`}
          >
            + Add Stolen Item
          </button>
        </div>
      </div>
      {stolenItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Item"
            value={item.item}
            onChange={(e) => onUpdateStolenItem(index, 'item', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) =>
              onUpdateStolenItem(
                index,
                'quantity',
                parseInt(e.target.value) || 0
              )
            }
            className="w-20 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Notes"
            value={item.data?.notes}
            onChange={(e) => onUpdateStolenItem(index, 'notes', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      ))}
    </div>
  );
};
