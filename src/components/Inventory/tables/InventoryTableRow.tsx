import React from 'react';
import { Button } from 'react-bootstrap';
import { InventoryItem } from '../../types/inventory';
import { useInventoryStore } from '../../../store/useInventoryStore';

interface InventoryTableRowProps {
  item: InventoryItem;
}

const InventoryTableRow: React.FC<InventoryTableRowProps> = ({ item }) => {
  const selectedItems = useInventoryStore(state => state.selectedItems);
  const toggleSelectedItem = useInventoryStore(state => state.toggleSelectedItem);

  const getItemId = () => {
    return item.toolId || item.supplyId || item.equipmentId || item.hardwareId || '';
  };

  const getItemStatus = () => {
    return item.p2Status || item.status || item.quantity || item.expiration || item.warranty || '';
  };

  return (
    <tr>
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={() => toggleSelectedItem(item.id)}
          aria-label={`Select ${item.name}`}
          className="focus:outline-blue-500"
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
      <td className="px-4 py-2 whitespace-nowrap">{item.category}</td>
      <td className="px-4 py-2 whitespace-nowrap">{getItemId()}</td>
      <td className="px-4 py-2 whitespace-nowrap">{item.location}</td>
      <td className="px-4 py-2 whitespace-nowrap">{getItemStatus()}</td>
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex gap-2">
          <Button
            variant="link"
            size="sm"
            className="rounded-full border border-violet-500 text-violet-500 text-sm px-3 py-1 hover:bg-violet-50 flex items-center"
            onClick={() => onEdit(item)}
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
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-red-500 hover:text-red-700 transition-colors p-3"
            onClick={() => onDelete(item)}
            aria-label="Delete item"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </Button>
          <Button variant="link" size="sm" className="text-[#20B2AA] hover:text-[#1a8f89]">
            Track
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default InventoryTableRow;
