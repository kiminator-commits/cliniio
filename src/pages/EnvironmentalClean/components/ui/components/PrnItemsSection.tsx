import React from 'react';
import { COLOR_SCHEMES } from '../../../constants';

interface PrnItem {
  item: string;
  quantity: number;
  reason: string;
}

interface PrnItemsSectionProps {
  prnItems: PrnItem[];
  onAddPrnItem: () => void;
  onUpdatePrnItem: (index: number, field: string, value: string | number) => void;
  onClearPrnItems: () => void;
}

export const PrnItemsSection: React.FC<PrnItemsSectionProps> = ({
  prnItems,
  onAddPrnItem,
  onUpdatePrnItem,
  onClearPrnItems,
}) => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">
          PRN Cleaning Items
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onClearPrnItems}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
          >
            Clear All
          </button>
          <button
            onClick={onAddPrnItem}
            className={`px-3 py-1 ${COLOR_SCHEMES.info.light} text-blue-600 rounded-md hover:bg-blue-100 text-sm`}
          >
            + Add PRN Item
          </button>
        </div>
      </div>
      {prnItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Item"
            value={item.item}
            onChange={(e) =>
              onUpdatePrnItem(index, 'item', e.target.value)
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) =>
              onUpdatePrnItem(
                index,
                'quantity',
                parseInt(e.target.value) || 0
              )
            }
            className="w-20 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Reason"
            value={item.reason}
            onChange={(e) =>
              onUpdatePrnItem(index, 'reason', e.target.value)
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      ))}
    </div>
  );
};
