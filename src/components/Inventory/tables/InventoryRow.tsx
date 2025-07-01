import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircleOutline } from '@mdi/js';
import { InventoryItem } from '../../types/inventoryTypes';
import { getSupplyStatusBadge } from '@/utils/inventory/statusUtils';

interface InventoryRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onTrack: (item: InventoryItem) => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({ item, onEdit, onDelete, onTrack }) => {
  const getStatusColor = (status: string) => {
    return getSupplyStatusBadge(status);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.toolId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{item.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{item.location}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}
        >
          {item.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => onEdit(item)}
            className="rounded-full border border-violet-500 text-violet-500 text-sm px-3 py-1 hover:bg-violet-50 flex items-center"
            aria-label="Edit item"
          >
            <svg
              className="inline-block mr-1"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M15.502 1.94a1.5 1.5 0 0 1 0 2.12l-1.439 1.439-2.12-2.12 1.439-1.439a1.5 1.5 0 0 1 2.12 0zm-2.561 2.561-9.193 9.193a.5.5 0 0 0-.121.196l-1 3a.5.5 0 0 0 .633.633l3-1a.5.5 0 0 0 .196-.12l9.193-9.194-2.12-2.12z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onTrack(item)}
            className="text-green-600 hover:text-green-900"
            aria-label="Track item"
          >
            <Icon path={mdiCheckCircleOutline} size={1.2} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="text-red-500 hover:text-red-700 transition-colors p-3"
            aria-label="Delete item"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default InventoryRow;
