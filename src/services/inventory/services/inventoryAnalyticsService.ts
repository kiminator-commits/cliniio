import { InventoryItem } from '../../../types/inventoryTypes';
import { InventoryDataTransformer } from '../utils/inventoryTransformers';

export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  totalValue: number;
  categories: { [key: string]: number };
  locations: { [key: string]: number };
  statuses: { [key: string]: number };
  averageItemCost: number;
  lowStockItems: number;
  expiredItems: number;
  itemsNeedingService: number;
  efficiencyPercentage: number;
  recommendations: string[];
}

export class InventoryAnalyticsService {
  async getInventoryStats(): Promise<InventoryStats> {
    // This would typically fetch data from a service
    const items: InventoryItem[] = [];

    return {
      totalItems: items.length,
      activeItems: this.calculateActiveItems(items),
      totalValue: this.calculateItemValue(items),
      categories: this.calculateCategoryBreakdown(items),
      locations: this.calculateLocationBreakdown(items),
      statuses: this.calculateStatusBreakdown(items),
      averageItemCost: this.calculateAverageItemCost(items),
      lowStockItems: this.calculateLowStockItems(items).length,
      expiredItems: this.calculateExpiredItems(items).length,
      itemsNeedingService: this.calculateItemsNeedingService(items).length,
      efficiencyPercentage:
        this.calculateInventoryEfficiency(items).efficiencyPercentage,
      recommendations: this.calculateInventoryEfficiency(items).recommendations,
    };
  }

  transformDataForModal(items: InventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }> {
    return InventoryDataTransformer.transformForModal(items);
  }

  calculateItemValue(items: InventoryItem[]): number {
    return items.reduce((sum, item) => sum + (item.unit_cost || 0), 0);
  }

  calculateActiveItems(items: InventoryItem[]): number {
    return items.filter((item) => item.status === 'active').length;
  }

  calculateCategoryBreakdown(items: InventoryItem[]): {
    [key: string]: number;
  } {
    const categories: { [key: string]: number } = {};
    items.forEach((item) => {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
    });
    return categories;
  }

  calculateLocationBreakdown(items: InventoryItem[]): {
    [key: string]: number;
  } {
    const locations: { [key: string]: number } = {};
    items.forEach((item) => {
      if (item.location) {
        locations[item.location] = (locations[item.location] || 0) + 1;
      }
    });
    return locations;
  }

  calculateStatusBreakdown(items: InventoryItem[]): { [key: string]: number } {
    const statuses: { [key: string]: number } = {};
    items.forEach((item) => {
      if (item.status) {
        statuses[item.status] = (statuses[item.status] || 0) + 1;
      }
    });
    return statuses;
  }

  calculateAverageItemCost(items: InventoryItem[]): number {
    const itemsWithCost = items.filter(
      (item) => item.unit_cost && item.unit_cost > 0
    );
    if (itemsWithCost.length === 0) return 0;

    const totalCost = itemsWithCost.reduce(
      (sum, item) => sum + (item.unit_cost || 0),
      0
    );
    return Math.round((totalCost / itemsWithCost.length) * 100) / 100;
  }

  calculateLowStockItems(
    items: InventoryItem[],
    threshold: number = 5
  ): InventoryItem[] {
    return items.filter(
      (item) =>
        item.quantity !== null &&
        item.quantity !== undefined &&
        item.quantity <= threshold &&
        item.status === 'active'
    );
  }

  calculateExpiredItems(items: InventoryItem[]): InventoryItem[] {
    const now = new Date();
    return items.filter((item) => {
      if (!(item.data as any)?.expiration) return false;
      const expirationDate = new Date((item.data as any).expiration as string);
      return expirationDate < now;
    });
  }

  calculateItemsNeedingService(
    items: InventoryItem[],
    daysThreshold: number = 30
  ): InventoryItem[] {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return items.filter((item) => {
      if (!(item.data as any)?.lastServiced) return false;
      const lastServicedDate = new Date((item.data as any).lastServiced as string);
      return lastServicedDate < thresholdDate;
    });
  }

  calculateInventoryEfficiency(items: InventoryItem[]): {
    totalItems: number;
    activeItems: number;
    efficiencyPercentage: number;
    recommendations: string[];
  } {
    const totalItems = items.length;
    const activeItems = this.calculateActiveItems(items);
    const efficiencyPercentage =
      totalItems > 0 ? (activeItems / totalItems) * 100 : 0;

    const recommendations: string[] = [];
    if (efficiencyPercentage < 80) {
      recommendations.push(
        'Consider reviewing inactive items for potential removal or repair'
      );
    }
    if (this.calculateLowStockItems(items).length > 0) {
      recommendations.push(
        'Some items are running low on stock - consider reordering'
      );
    }
    if (this.calculateExpiredItems(items).length > 0) {
      recommendations.push(
        'Some items have expired - review and dispose if necessary'
      );
    }

    return {
      totalItems,
      activeItems,
      efficiencyPercentage: Math.round(efficiencyPercentage * 100) / 100,
      recommendations,
    };
  }
}
