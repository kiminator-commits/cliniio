import React from 'react';
import { InventoryItem } from '@/types/inventoryTypes';

export interface InventoryItemsListProps {
  items: InventoryItem[];
  favorites: string[];
  isLoading: boolean;
  onToggleFavorite: (id: string) => void;
  maxItems?: number;
}

export const InventoryItemsList: React.FC<InventoryItemsListProps> = ({
  items,
  favorites,
  isLoading,
  onToggleFavorite,
  maxItems = 5,
}) => {
  if (isLoading) {
    return <p>Loading items...</p>;
  }

  return (
    <div className="mb-4">
      <div className="space-y-2">
        {items.slice(0, maxItems).map((item) => (
          <div
            key={item.id}
            className="p-2 border rounded flex justify-between items-center"
          >
            <span>{item.name}</span>
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`px-2 py-1 rounded ${
                favorites.includes(item.id)
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              aria-label={`${favorites.includes(item.id) ? 'Remove from' : 'Add to'} favorites`}
            >
              {favorites.includes(item.id) ? '★' : '☆'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
