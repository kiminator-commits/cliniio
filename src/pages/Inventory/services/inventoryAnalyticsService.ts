import { InventoryItem } from '../../../types/inventoryTypes';
import { TabType } from '../types';

// Define proper types for analytics data
export interface TabAnalytics {
  totalItems: number;
  totalValue: number;
  averageValue: number;
  tab: TabType;
}

export interface AnalyticsInsights {
  lowStockItems: number;
  outOfStockItems: number;
  highValueItems: number;
  alerts: number;
}

export interface AnalyticsReport extends TabAnalytics, AnalyticsInsights {
  timestamp: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

/**
 * Service for handling inventory analytics operations
 * Extracted from main Inventory page component
 */
export class InventoryAnalyticsService {
  /**
   * Calculate analytics data for the current tab
   */
  static calculateTabAnalytics(
    data: InventoryItem[],
    activeTab: TabType
  ): TabAnalytics {
    const totalItems = data.length;
    const totalValue = data.reduce(
      (sum, item) => sum + (item.unit_cost || 0),
      0
    );
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

    return {
      totalItems,
      totalValue,
      averageValue,
      tab: activeTab,
    };
  }

  /**
   * Get analytics insights for display
   */
  static getAnalyticsInsights(data: InventoryItem[]): AnalyticsInsights {
    const lowStockItems = data.filter(
      (item) => (item.quantity || 0) <= 10
    ).length;
    const outOfStockItems = data.filter(
      (item) => (item.quantity || 0) === 0
    ).length;
    const highValueItems = data.filter(
      (item) => (item.unit_cost || 0) > 100
    ).length;

    return {
      lowStockItems,
      outOfStockItems,
      highValueItems,
      alerts: lowStockItems + outOfStockItems,
    };
  }

  /**
   * Generate analytics report
   */
  static generateAnalyticsReport(
    data: InventoryItem[],
    activeTab: TabType
  ): AnalyticsReport {
    const analytics = this.calculateTabAnalytics(data, activeTab);
    const insights = this.getAnalyticsInsights(data);

    return {
      ...analytics,
      ...insights,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle analytics chart data
   */
  static getChartData(
    data: InventoryItem[],
    chartType: string
  ): ChartDataPoint[] {
    switch (chartType) {
      case 'category':
        return this.getCategoryChartData(data);
      case 'value':
        return this.getValueChartData(data);
      case 'status':
        return this.getStatusChartData(data);
      default:
        return [];
    }
  }

  private static getCategoryChartData(data: InventoryItem[]): ChartDataPoint[] {
    const categories = data.reduce(
      (acc, item) => {
        const category = item.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(categories).map(([category, count]) => ({
      label: category,
      value: count,
    }));
  }

  private static getValueChartData(data: InventoryItem[]): ChartDataPoint[] {
    return data.map((item) => ({
      label: item.name || 'Unknown',
      value: item.unit_cost || 0,
    }));
  }

  private static getStatusChartData(data: InventoryItem[]): ChartDataPoint[] {
    const statuses = data.reduce(
      (acc, item) => {
        const status = item.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statuses).map(([status, count]) => ({
      label: status,
      value: count,
    }));
  }

  /**
   * Get analytics data
   */
  static getAnalytics(): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Get statistics
   */
  static getStatistics(): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
