import { useInventoryStore } from '@/store/useInventoryStore';
import { InventoryItem } from '@/types/inventoryTypes';

export const useTableActions = () => {
  const { trackedItems, toggleTrackedItem } = useInventoryStore();

  const getItemId = (item: InventoryItem): string => {
    return (
      (typeof item.data?.toolId === 'string' ? item.data.toolId : '') ||
      (typeof item.data?.supplyId === 'string' ? item.data.supplyId : '') ||
      (typeof item.data?.equipmentId === 'string'
        ? item.data.equipmentId
        : '') ||
      (typeof item.data?.hardwareId === 'string' ? item.data.hardwareId : '') ||
      item.id
    );
  };

  const isItemTracked = (item: InventoryItem): boolean => {
    const itemId = getItemId(item);
    return trackedItems.has(itemId);
  };

  const handleToggleTracked = (item: InventoryItem): void => {
    const itemId = getItemId(item);
    toggleTrackedItem(itemId, 'system'); // Add default doctor parameter
  };

  const getTrackingTooltip = (item: InventoryItem): string => {
    return isItemTracked(item)
      ? 'Tracked - You will be notified when available'
      : 'Click to track this item';
  };

  return {
    isItemTracked,
    handleToggleTracked,
    getTrackingTooltip,
    getItemId,
  };
};
