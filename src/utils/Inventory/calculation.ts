/**
 * Pure calculation functions for inventory analytics and metrics
 * Handles mathematical operations, statistics, and business calculations
 */

export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  category: string;
  status: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMetrics {
  totalItems: number;
  totalQuantity: number;
  averageQuantity: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  categoryDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface InventoryAnalytics {
  metrics: InventoryMetrics;
  trends: {
    stockLevels: number[];
    categoryGrowth: Record<string, number>;
    turnoverRate: number;
  };
  recommendations: string[];
}

/**
 * Calculates total number of items
 */
export const calculateTotalItems = (items: InventoryItem[]): number => {
  return items.length;
};

/**
 * Calculates total quantity across all items
 */
export const calculateTotalQuantity = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Calculates average quantity per item
 */
export const calculateAverageQuantity = (items: InventoryItem[]): number => {
  if (items.length === 0) return 0;
  return calculateTotalQuantity(items) / items.length;
};

/**
 * Counts items with low stock (quantity <= 10)
 */
export const calculateLowStockItems = (items: InventoryItem[]): number => {
  return items.filter(item => (item.quantity || 0) <= 10).length;
};

/**
 * Counts items that are out of stock
 */
export const calculateOutOfStockItems = (items: InventoryItem[]): number => {
  return items.filter(item => (item.quantity || 0) === 0).length;
};

/**
 * Counts expired items
 */
export const calculateExpiredItems = (items: InventoryItem[]): number => {
  const now = new Date();
  return items.filter(item => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < now;
  }).length;
};

/**
 * Counts items expiring within the next 30 days
 */
export const calculateExpiringSoonItems = (
  items: InventoryItem[],
  daysThreshold: number = 30
): number => {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  return items.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    return expiryDate >= now && expiryDate <= thresholdDate;
  }).length;
};

/**
 * Calculates distribution of items by category
 */
export const calculateCategoryDistribution = (items: InventoryItem[]): Record<string, number> => {
  const distribution: Record<string, number> = {};

  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    distribution[category] = (distribution[category] || 0) + 1;
  });

  return distribution;
};

/**
 * Calculates distribution of items by status
 */
export const calculateStatusDistribution = (items: InventoryItem[]): Record<string, number> => {
  const distribution: Record<string, number> = {};

  items.forEach(item => {
    const status = item.status || 'Unknown';
    distribution[status] = (distribution[status] || 0) + 1;
  });

  return distribution;
};

/**
 * Calculates inventory turnover rate
 */
export const calculateTurnoverRate = (
  items: InventoryItem[],
  timePeriodDays: number = 30
): number => {
  if (items.length === 0) return 0;

  const totalQuantity = calculateTotalQuantity(items);
  const averageQuantity = calculateAverageQuantity(items);

  if (averageQuantity === 0) return 0;

  // Simplified turnover calculation
  return totalQuantity / averageQuantity / (timePeriodDays / 30);
};

/**
 * Calculates stock level trends
 */
export const calculateStockLevelTrends = (items: InventoryItem[]): number[] => {
  const categories = Object.keys(calculateCategoryDistribution(items));

  return categories.map(category => {
    const categoryItems = items.filter(item => item.category === category);
    return calculateTotalQuantity(categoryItems);
  });
};

/**
 * Calculates category growth rates
 */
export const calculateCategoryGrowth = (items: InventoryItem[]): Record<string, number> => {
  const distribution = calculateCategoryDistribution(items);
  const totalItems = calculateTotalItems(items);
  const growth: Record<string, number> = {};

  Object.keys(distribution).forEach(category => {
    growth[category] = (distribution[category] / totalItems) * 100;
  });

  return growth;
};

/**
 * Generates inventory recommendations
 */
export const generateRecommendations = (items: InventoryItem[]): string[] => {
  const recommendations: string[] = [];

  const lowStockCount = calculateLowStockItems(items);
  const outOfStockCount = calculateOutOfStockItems(items);
  const expiredCount = calculateExpiredItems(items);
  const expiringSoonCount = calculateExpiringSoonItems(items);

  if (lowStockCount > 0) {
    recommendations.push(`Restock ${lowStockCount} items with low inventory`);
  }

  if (outOfStockCount > 0) {
    recommendations.push(`Urgent: ${outOfStockCount} items are out of stock`);
  }

  if (expiredCount > 0) {
    recommendations.push(`Remove ${expiredCount} expired items from inventory`);
  }

  if (expiringSoonCount > 0) {
    recommendations.push(`Monitor ${expiringSoonCount} items expiring soon`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Inventory levels are healthy');
  }

  return recommendations;
};

/**
 * Calculates comprehensive inventory metrics
 */
export const calculateInventoryMetrics = (items: InventoryItem[]): InventoryMetrics => {
  return {
    totalItems: calculateTotalItems(items),
    totalQuantity: calculateTotalQuantity(items),
    averageQuantity: calculateAverageQuantity(items),
    lowStockItems: calculateLowStockItems(items),
    outOfStockItems: calculateOutOfStockItems(items),
    expiredItems: calculateExpiredItems(items),
    expiringSoonItems: calculateExpiringSoonItems(items),
    categoryDistribution: calculateCategoryDistribution(items),
    statusDistribution: calculateStatusDistribution(items),
  };
};

/**
 * Calculates comprehensive inventory analytics
 */
export const calculateInventoryAnalytics = (items: InventoryItem[]): InventoryAnalytics => {
  const metrics = calculateInventoryMetrics(items);

  return {
    metrics,
    trends: {
      stockLevels: calculateStockLevelTrends(items),
      categoryGrowth: calculateCategoryGrowth(items),
      turnoverRate: calculateTurnoverRate(items),
    },
    recommendations: generateRecommendations(items),
  };
};

/**
 * Calculates inventory value (if price data is available)
 */
export const calculateInventoryValue = (
  items: InventoryItem[],
  priceMap: Record<string, number>
): number => {
  return items.reduce((total, item) => {
    const price = priceMap[item.id || ''] || 0;
    return total + item.quantity * price;
  }, 0);
};

/**
 * Calculates reorder point for an item
 */
export const calculateReorderPoint = (
  averageDailyUsage: number,
  leadTimeDays: number,
  safetyStock: number = 0
): number => {
  return Math.ceil(averageDailyUsage * leadTimeDays) + safetyStock;
};

/**
 * Calculates economic order quantity
 */
export const calculateEOQ = (
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): number => {
  return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
};
