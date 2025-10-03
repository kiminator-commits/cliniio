import React from 'react';
import Icon from '@mdi/react';
import { mdiFileDocument } from '@mdi/js';
import {
  ChecklistItem as ChecklistItemType,
  SDSSheet,
} from '../types/cleaningChecklists';

interface ChecklistItemProps {
  item: ChecklistItemType;
  bypassedItems: Set<string>;
  adjustedQuantities: Record<string, number>;
  onBypassItem: (itemId: string) => void;
  onAdjustQuantity: (
    itemId: string,
    inventoryItemId: string,
    adjustment: number
  ) => void;
  onViewSDS: (sds: SDSSheet) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  bypassedItems,
  adjustedQuantities,
  onBypassItem,
  onAdjustQuantity,
  onViewSDS,
}) => {
  return (
    <div className="border-b border-gray-200 py-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 px-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-[#5b5b5b]">{item.title}</h3>
            <button
              onClick={() => onBypassItem(item.id)}
              className={`ml-4 px-3 py-1 text-sm rounded-full transition-colors ${
                bypassedItems.has(item.id)
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              type="button"
            >
              {bypassedItems.has(item.id) ? 'Not Needed' : 'Mark Not Needed'}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.instructions}</p>

          {item.inventoryItems && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700">
                Required Items:
              </h4>
              <ul className="mt-1 space-y-1">
                {item.inventoryItems.map((invItem) => {
                  const adjustedQty =
                    adjustedQuantities[`${item.id}-${invItem.id}`] || 0;
                  const finalRequiredQty =
                    invItem.requiredQuantity + adjustedQty;

                  return (
                    <li
                      key={invItem.id}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <span className="w-32">{invItem.name}</span>
                      <span className="mx-2">•</span>
                      <span>Required: {finalRequiredQty}</span>
                      <span className="mx-2">•</span>
                      <span>Available: {invItem.currentStock}</span>
                      {invItem.status && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Status: {invItem.status}</span>
                        </>
                      )}
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() =>
                            onAdjustQuantity(item.id, invItem.id, -1)
                          }
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          type="button"
                        >
                          -
                        </button>
                        <button
                          onClick={() =>
                            onAdjustQuantity(item.id, invItem.id, 1)
                          }
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {item.sds && (
            <div className="mt-2">
              <button
                onClick={() => onViewSDS(item.sds!)}
                className="inline-flex items-center text-sm text-[#4ECDC4] hover:text-[#3db8b0]"
                type="button"
              >
                <Icon path={mdiFileDocument} size={1} className="mr-1" />
                View SDS Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
