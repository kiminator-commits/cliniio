import { useCallback, useMemo } from 'react';
import { useInventoryData } from './useInventoryData';
import { InventoryItem, LocalInventoryItem } from '../../types/inventoryTypes';

/**
 * Hook for basic inventory metrics calculations
 * Handles total items, values, averages, and stock levels
 */
export const useInventoryMetrics = () => {
  const { tools, supplies, equipment, officeHardware } = useInventoryData();

  // Combine all inventory items into a single array for metrics
  const allInventoryItems = useMemo(() => {
    return [
      ...tools.map((item) => ({ ...item, type: 'tool' as const })),
      ...supplies.map((item) => ({ ...item, type: 'supply' as const })),
      ...equipment.map((item) => ({ ...item, type: 'equipment' as const })),
      ...officeHardware.map((item) => ({ ...item, type: 'hardware' as const })),
    ];
  }, [tools, supplies, equipment, officeHardware]);

  // Use the unified conversion function with type extension
  const convertToInventoryItemWithType = useCallback(
    (item: LocalInventoryItem & { type: string }): InventoryItem => {
      return item as InventoryItem;
    },
    []
  );

  // Basic metrics
  const getTotalItems = useCallback((): number => {
    return allInventoryItems.length;
  }, [allInventoryItems]);

  const getTotalValue = useCallback((): number => {
    return allInventoryItems.reduce((total, item) => {
      const cost = item.unit_cost || 0;
      const quantity = 'quantity' in item ? (item.quantity ?? 1) : 1;
      return total + cost * quantity;
    }, 0);
  }, [allInventoryItems]);

  const getAveragePrice = useCallback((): number => {
    const itemsWithCost = allInventoryItems.filter(
      (item) => item.unit_cost && item.unit_cost > 0
    );
    if (itemsWithCost.length === 0) return 0;
    return (
      itemsWithCost.reduce((total, item) => total + (item.unit_cost || 0), 0) /
      itemsWithCost.length
    );
  }, [allInventoryItems]);

  const getLowStockItems = useCallback(
    (threshold: number = 10): InventoryItem[] => {
      return allInventoryItems
        .filter((item) => {
          if ('quantity' in item) {
            return (
              (item.quantity ?? 0) <= threshold && (item.quantity ?? 0) > 0
            );
          }
          return false;
        })
        .map(convertToInventoryItemWithType);
    },
    [allInventoryItems, convertToInventoryItemWithType]
  );

  const getOutOfStockItems = useCallback((): InventoryItem[] => {
    return allInventoryItems
      .filter((item) => {
        if ('quantity' in item) {
          return (item.quantity ?? 0) === 0;
        }
        return false;
      })
      .map(convertToInventoryItemWithType);
  }, [allInventoryItems, convertToInventoryItemWithType]);

  const getOverstockItems = useCallback(
    (threshold: number = 100): InventoryItem[] => {
      return allInventoryItems
        .filter((item) => {
          if ('quantity' in item) {
            return (item.quantity ?? 0) > threshold;
          }
          return false;
        })
        .map(convertToInventoryItemWithType);
    },
    [allInventoryItems, convertToInventoryItemWithType]
  );

  const getLowStockCount = useCallback(
    (threshold: number = 10): number => {
      return allInventoryItems.filter((item) => {
        if ('quantity' in item) {
          return (item.quantity ?? 0) <= threshold && (item.quantity ?? 0) > 0;
        }
        return false;
      }).length;
    },
    [allInventoryItems]
  );

  const getOutOfStockCount = useCallback((): number => {
    return allInventoryItems.filter((item) => {
      if ('quantity' in item) {
        return (item.quantity ?? 0) === 0;
      }
      return false;
    }).length;
  }, [allInventoryItems]);

  const getOverstockCount = useCallback(
    (threshold: number = 100): number => {
      return allInventoryItems.filter((item) => {
        if ('quantity' in item) {
          return (item.quantity ?? 0) > threshold;
        }
        return false;
      }).length;
    },
    [allInventoryItems]
  );

  return {
    getTotalItems,
    getTotalValue,
    getAveragePrice,
    getLowStockItems,
    getOutOfStockItems,
    getOverstockItems,
    getLowStockCount,
    getOutOfStockCount,
    getOverstockCount,
  };
};
