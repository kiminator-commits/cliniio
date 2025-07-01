import { useState, useCallback, useEffect } from 'react';
import { useInventoryData } from './useInventoryData';
import {
  InventoryItem,
  AnalyticsMetrics,
  ChartData,
  ReportOptions,
  TimeRange,
} from '../../types/inventory';

interface AnalyticsState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  timeRange: TimeRange;
  selectedMetrics: string[];
}

interface AnalyticsOperations {
  // Basic metrics
  getTotalItems: () => number;
  getTotalValue: () => number;
  getAveragePrice: () => number;
  getLowStockItems: (threshold?: number) => InventoryItem[];
  getOutOfStockItems: () => InventoryItem[];
  getOverstockItems: (threshold?: number) => InventoryItem[];

  // Category analytics
  getCategoryDistribution: () => ChartData;
  getCategoryValueDistribution: () => ChartData;
  getTopCategories: (limit?: number) => Array<{ category: string; count: number; value: number }>;

  // Status analytics
  getStatusDistribution: () => ChartData;
  getStatusValueDistribution: () => ChartData;
  getItemsByStatus: (status: string) => InventoryItem[];

  // Time-based analytics
  getItemsAddedInPeriod: (startDate: Date, endDate: Date) => InventoryItem[];
  getItemsUpdatedInPeriod: (startDate: Date, endDate: Date) => InventoryItem[];
  getGrowthRate: (period: 'week' | 'month' | 'quarter' | 'year') => number;
  getTrendData: (metric: keyof AnalyticsMetrics, period: TimeRange) => ChartData;

  // Price analytics
  getPriceDistribution: () => ChartData;
  getPriceRangeStats: () => { min: number; max: number; median: number; mean: number };
  getExpensiveItems: (threshold?: number) => InventoryItem[];
  getBudgetItems: (threshold?: number) => InventoryItem[];

  // Quantity analytics
  getQuantityDistribution: () => ChartData;
  getQuantityStats: () => { min: number; max: number; median: number; mean: number };
  getStockLevelAlerts: () => Array<{
    item: InventoryItem;
    alert: string;
    severity: 'low' | 'medium' | 'high';
  }>;

  // Supplier analytics
  getSupplierDistribution: () => ChartData;
  getTopSuppliers: (limit?: number) => Array<{ supplier: string; count: number; value: number }>;
  getItemsBySupplier: (supplier: string) => InventoryItem[];

  // Location analytics
  getLocationDistribution: () => ChartData;
  getItemsByLocation: (location: string) => InventoryItem[];

  // Tag analytics
  getTagDistribution: () => ChartData;
  getItemsByTag: (tag: string) => InventoryItem[];
  getPopularTags: (limit?: number) => Array<{ tag: string; count: number }>;

  // Advanced analytics
  getCorrelationAnalysis: (metric1: keyof InventoryItem, metric2: keyof InventoryItem) => number;
  getAnomalyDetection: () => InventoryItem[];
  getSeasonalTrends: () => ChartData;

  // Reporting
  generateReport: (options: ReportOptions) => Promise<Blob>;
  exportAnalytics: (format: 'csv' | 'json' | 'pdf') => Promise<Blob>;
  getReportTemplates: () => Array<{ name: string; description: string; options: ReportOptions }>;

  // Real-time analytics
  getRealTimeMetrics: () => AnalyticsMetrics;
  subscribeToUpdates: (callback: (metrics: AnalyticsMetrics) => void) => () => void;
}

export const useInventoryAnalytics = (): AnalyticsState & AnalyticsOperations => {
  const { inventoryData } = useInventoryData();

  const [state, setState] = useState<AnalyticsState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    timeRange: 'month',
    selectedMetrics: ['totalItems', 'totalValue', 'lowStock'],
  });

  const updateState = useCallback((updates: Partial<AnalyticsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Basic metrics
  const getTotalItems = useCallback((): number => {
    return inventoryData.length;
  }, [inventoryData]);

  const getTotalValue = useCallback((): number => {
    return inventoryData.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  }, [inventoryData]);

  const getAveragePrice = useCallback((): number => {
    const itemsWithPrice = inventoryData.filter(item => item.price && item.price > 0);
    if (itemsWithPrice.length === 0) return 0;
    return (
      itemsWithPrice.reduce((total, item) => total + (item.price || 0), 0) / itemsWithPrice.length
    );
  }, [inventoryData]);

  const getLowStockItems = useCallback(
    (threshold: number = 10): InventoryItem[] => {
      return inventoryData.filter(
        item => (item.quantity || 0) <= threshold && (item.quantity || 0) > 0
      );
    },
    [inventoryData]
  );

  const getOutOfStockItems = useCallback((): InventoryItem[] => {
    return inventoryData.filter(item => (item.quantity || 0) === 0);
  }, [inventoryData]);

  const getOverstockItems = useCallback(
    (threshold: number = 100): InventoryItem[] => {
      return inventoryData.filter(item => (item.quantity || 0) > threshold);
    },
    [inventoryData]
  );

  // Category analytics
  const getCategoryDistribution = useCallback((): ChartData => {
    const categoryCounts = inventoryData.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          label: 'Items by Category',
          data: Object.values(categoryCounts),
          backgroundColor: generateColors(Object.keys(categoryCounts).length),
        },
      ],
    };
  }, [inventoryData]);

  const getCategoryValueDistribution = useCallback((): ChartData => {
    const categoryValues = inventoryData.reduce(
      (acc, item) => {
        const value = (item.price || 0) * (item.quantity || 0);
        acc[item.category] = (acc[item.category] || 0) + value;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(categoryValues),
      datasets: [
        {
          label: 'Value by Category',
          data: Object.values(categoryValues),
          backgroundColor: generateColors(Object.keys(categoryValues).length),
        },
      ],
    };
  }, [inventoryData]);

  const getTopCategories = useCallback(
    (limit: number = 5): Array<{ category: string; count: number; value: number }> => {
      const categoryStats = inventoryData.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = { count: 0, value: 0 };
          }
          acc[item.category].count += 1;
          acc[item.category].value += (item.price || 0) * (item.quantity || 0);
          return acc;
        },
        {} as Record<string, { count: number; value: number }>
      );

      return Object.entries(categoryStats)
        .map(([category, stats]) => ({ category, ...stats }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
    },
    [inventoryData]
  );

  // Status analytics
  const getStatusDistribution = useCallback((): ChartData => {
    const statusCounts = inventoryData.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Items by Status',
          data: Object.values(statusCounts),
          backgroundColor: generateColors(Object.keys(statusCounts).length),
        },
      ],
    };
  }, [inventoryData]);

  const getStatusValueDistribution = useCallback((): ChartData => {
    const statusValues = inventoryData.reduce(
      (acc, item) => {
        const value = (item.price || 0) * (item.quantity || 0);
        acc[item.status] = (acc[item.status] || 0) + value;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(statusValues),
      datasets: [
        {
          label: 'Value by Status',
          data: Object.values(statusValues),
          backgroundColor: generateColors(Object.keys(statusValues).length),
        },
      ],
    };
  }, [inventoryData]);

  const getItemsByStatus = useCallback(
    (status: string): InventoryItem[] => {
      return inventoryData.filter(item => item.status === status);
    },
    [inventoryData]
  );

  // Time-based analytics
  const getItemsAddedInPeriod = useCallback(
    (startDate: Date, endDate: Date): InventoryItem[] => {
      return inventoryData.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    },
    [inventoryData]
  );

  const getItemsUpdatedInPeriod = useCallback(
    (startDate: Date, endDate: Date): InventoryItem[] => {
      return inventoryData.filter(item => {
        const itemDate = new Date(item.updatedAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    },
    [inventoryData]
  );

  const getGrowthRate = useCallback(
    (period: 'week' | 'month' | 'quarter' | 'year'): number => {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
      }

      const currentPeriodItems = getItemsAddedInPeriod(startDate, now);
      const previousPeriodStart = new Date(
        startDate.getTime() - (now.getTime() - startDate.getTime())
      );
      const previousPeriodItems = getItemsAddedInPeriod(previousPeriodStart, startDate);

      if (previousPeriodItems.length === 0) return currentPeriodItems.length > 0 ? 100 : 0;

      return (
        ((currentPeriodItems.length - previousPeriodItems.length) / previousPeriodItems.length) *
        100
      );
    },
    [getItemsAddedInPeriod]
  );

  const getTrendData = useCallback(
    (metric: keyof AnalyticsMetrics, period: TimeRange): ChartData => {
      // This would typically fetch historical data from a database
      // For now, we'll generate mock trend data
      const labels = generateTimeLabels(period);
      const data = labels.map(() => Math.random() * 100);

      return {
        labels,
        datasets: [
          {
            label: metric,
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      };
    },
    []
  );

  // Price analytics
  const getPriceDistribution = useCallback((): ChartData => {
    const prices = inventoryData
      .map(item => item.price || 0)
      .filter(price => price > 0)
      .sort((a, b) => a - b);

    const ranges = [
      { min: 0, max: 10, label: '$0-$10' },
      { min: 10, max: 50, label: '$10-$50' },
      { min: 50, max: 100, label: '$50-$100' },
      { min: 100, max: 500, label: '$100-$500' },
      { min: 500, max: Infinity, label: '$500+' },
    ];

    const distribution = ranges.map(range => ({
      label: range.label,
      count: prices.filter(price => price >= range.min && price < range.max).length,
    }));

    return {
      labels: distribution.map(d => d.label),
      datasets: [
        {
          label: 'Price Distribution',
          data: distribution.map(d => d.count),
          backgroundColor: generateColors(distribution.length),
        },
      ],
    };
  }, [inventoryData]);

  const getPriceRangeStats = useCallback((): {
    min: number;
    max: number;
    median: number;
    mean: number;
  } => {
    const prices = inventoryData
      .map(item => item.price || 0)
      .filter(price => price > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return { min: 0, max: 0, median: 0, mean: 0 };
    }

    const min = prices[0];
    const max = prices[prices.length - 1];
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median =
      prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

    return { min, max, median, mean };
  }, [inventoryData]);

  const getExpensiveItems = useCallback(
    (threshold: number = 100): InventoryItem[] => {
      return inventoryData.filter(item => (item.price || 0) > threshold);
    },
    [inventoryData]
  );

  const getBudgetItems = useCallback(
    (threshold: number = 50): InventoryItem[] => {
      return inventoryData.filter(item => (item.price || 0) <= threshold && (item.price || 0) > 0);
    },
    [inventoryData]
  );

  // Quantity analytics
  const getQuantityDistribution = useCallback((): ChartData => {
    const quantities = inventoryData.map(item => item.quantity || 0).sort((a, b) => a - b);

    const ranges = [
      { min: 0, max: 1, label: '0-1' },
      { min: 1, max: 5, label: '1-5' },
      { min: 5, max: 10, label: '5-10' },
      { min: 10, max: 50, label: '10-50' },
      { min: 50, max: Infinity, label: '50+' },
    ];

    const distribution = ranges.map(range => ({
      label: range.label,
      count: quantities.filter(qty => qty >= range.min && qty < range.max).length,
    }));

    return {
      labels: distribution.map(d => d.label),
      datasets: [
        {
          label: 'Quantity Distribution',
          data: distribution.map(d => d.count),
          backgroundColor: generateColors(distribution.length),
        },
      ],
    };
  }, [inventoryData]);

  const getQuantityStats = useCallback((): {
    min: number;
    max: number;
    median: number;
    mean: number;
  } => {
    const quantities = inventoryData.map(item => item.quantity || 0).sort((a, b) => a - b);

    if (quantities.length === 0) {
      return { min: 0, max: 0, median: 0, mean: 0 };
    }

    const min = quantities[0];
    const max = quantities[quantities.length - 1];
    const mean = quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length;
    const median =
      quantities.length % 2 === 0
        ? (quantities[quantities.length / 2 - 1] + quantities[quantities.length / 2]) / 2
        : quantities[Math.floor(quantities.length / 2)];

    return { min, max, median, mean };
  }, [inventoryData]);

  const getStockLevelAlerts = useCallback((): Array<{
    item: InventoryItem;
    alert: string;
    severity: 'low' | 'medium' | 'high';
  }> => {
    const alerts: Array<{
      item: InventoryItem;
      alert: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    inventoryData.forEach(item => {
      const quantity = item.quantity || 0;

      if (quantity === 0) {
        alerts.push({ item, alert: 'Out of stock', severity: 'high' });
      } else if (quantity <= 5) {
        alerts.push({ item, alert: 'Low stock', severity: 'high' });
      } else if (quantity <= 10) {
        alerts.push({ item, alert: 'Stock running low', severity: 'medium' });
      } else if (quantity > 100) {
        alerts.push({ item, alert: 'Overstocked', severity: 'low' });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [inventoryData]);

  // Supplier analytics
  const getSupplierDistribution = useCallback((): ChartData => {
    const supplierCounts = inventoryData
      .filter(item => item.supplier)
      .reduce(
        (acc, item) => {
          acc[item.supplier!] = (acc[item.supplier!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    return {
      labels: Object.keys(supplierCounts),
      datasets: [
        {
          label: 'Items by Supplier',
          data: Object.values(supplierCounts),
          backgroundColor: generateColors(Object.keys(supplierCounts).length),
        },
      ],
    };
  }, [inventoryData]);

  const getTopSuppliers = useCallback(
    (limit: number = 5): Array<{ supplier: string; count: number; value: number }> => {
      const supplierStats = inventoryData
        .filter(item => item.supplier)
        .reduce(
          (acc, item) => {
            if (!acc[item.supplier!]) {
              acc[item.supplier!] = { count: 0, value: 0 };
            }
            acc[item.supplier!].count += 1;
            acc[item.supplier!].value += (item.price || 0) * (item.quantity || 0);
            return acc;
          },
          {} as Record<string, { count: number; value: number }>
        );

      return Object.entries(supplierStats)
        .map(([supplier, stats]) => ({ supplier, ...stats }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
    },
    [inventoryData]
  );

  const getItemsBySupplier = useCallback(
    (supplier: string): InventoryItem[] => {
      return inventoryData.filter(item => item.supplier === supplier);
    },
    [inventoryData]
  );

  // Location analytics
  const getLocationDistribution = useCallback((): ChartData => {
    const locationCounts = inventoryData
      .filter(item => item.location)
      .reduce(
        (acc, item) => {
          acc[item.location!] = (acc[item.location!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    return {
      labels: Object.keys(locationCounts),
      datasets: [
        {
          label: 'Items by Location',
          data: Object.values(locationCounts),
          backgroundColor: generateColors(Object.keys(locationCounts).length),
        },
      ],
    };
  }, [inventoryData]);

  const getItemsByLocation = useCallback(
    (location: string): InventoryItem[] => {
      return inventoryData.filter(item => item.location === location);
    },
    [inventoryData]
  );

  // Tag analytics
  const getTagDistribution = useCallback((): ChartData => {
    const tagCounts: Record<string, number> = {};

    inventoryData.forEach(item => {
      item.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      labels: Object.keys(tagCounts),
      datasets: [
        {
          label: 'Items by Tag',
          data: Object.values(tagCounts),
          backgroundColor: generateColors(Object.keys(tagCounts).length),
        },
      ],
    };
  }, [inventoryData]);

  const getItemsByTag = useCallback(
    (tag: string): InventoryItem[] => {
      return inventoryData.filter(item => item.tags?.includes(tag));
    },
    [inventoryData]
  );

  const getPopularTags = useCallback(
    (limit: number = 10): Array<{ tag: string; count: number }> => {
      const tagCounts: Record<string, number> = {};

      inventoryData.forEach(item => {
        item.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    [inventoryData]
  );

  // Advanced analytics
  const getCorrelationAnalysis = useCallback(
    (metric1: keyof InventoryItem, metric2: keyof InventoryItem): number => {
      const values1 = inventoryData.map(item => Number(item[metric1]) || 0);
      const values2 = inventoryData.map(item => Number(item[metric2]) || 0);

      if (values1.length !== values2.length || values1.length === 0) return 0;

      const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
      const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

      const numerator = values1.reduce(
        (sum, val, i) => sum + (val - mean1) * (values2[i] - mean2),
        0
      );
      const denominator1 = Math.sqrt(
        values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0)
      );
      const denominator2 = Math.sqrt(
        values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
      );

      return denominator1 * denominator2 === 0 ? 0 : numerator / (denominator1 * denominator2);
    },
    [inventoryData]
  );

  const getAnomalyDetection = useCallback((): InventoryItem[] => {
    // Simple anomaly detection based on price and quantity outliers
    const prices = inventoryData.map(item => item.price || 0).filter(p => p > 0);

    if (prices.length === 0) return [];

    const priceMean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceStd = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - priceMean, 2), 0) / prices.length
    );

    return inventoryData.filter(item => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;

      // Price anomaly (more than 2 standard deviations from mean)
      const priceAnomaly = price > 0 && Math.abs(price - priceMean) > 2 * priceStd;

      // Quantity anomaly (very high or very low)
      const quantityAnomaly = quantity > 1000 || (quantity > 0 && quantity < 1);

      return priceAnomaly || quantityAnomaly;
    });
  }, [inventoryData]);

  const getSeasonalTrends = useCallback((): ChartData => {
    // Mock seasonal trend data
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const data = months.map(() => Math.random() * 100 + 50);

    return {
      labels: months,
      datasets: [
        {
          label: 'Seasonal Trends',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, []);

  // Reporting
  const generateReport = useCallback(
    async (options: ReportOptions): Promise<Blob> => {
      // Mock report generation
      const reportData = {
        timestamp: new Date().toISOString(),
        metrics: {
          totalItems: getTotalItems(),
          totalValue: getTotalValue(),
          averagePrice: getAveragePrice(),
        },
        options,
      };

      const jsonString = JSON.stringify(reportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    },
    [getTotalItems, getTotalValue, getAveragePrice]
  );

  const exportAnalytics = useCallback(
    async (format: 'csv' | 'json' | 'pdf'): Promise<Blob> => {
      // Mock export functionality
      const data = inventoryData.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        status: item.status,
        price: item.price,
        quantity: item.quantity,
      }));

      if (format === 'csv') {
        const csvContent = [
          'ID,Name,Category,Status,Price,Quantity',
          ...data.map(
            row =>
              `${row.id},${row.name},${row.category},${row.status},${row.price},${row.quantity}`
          ),
        ].join('\n');
        return new Blob([csvContent], { type: 'text/csv' });
      } else if (format === 'json') {
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      } else {
        // Mock PDF
        return new Blob(['PDF content would be generated here'], { type: 'application/pdf' });
      }
    },
    [inventoryData]
  );

  const getReportTemplates = useCallback((): Array<{
    name: string;
    description: string;
    options: ReportOptions;
  }> => {
    return [
      {
        name: 'Inventory Summary',
        description: 'Basic inventory overview with key metrics',
        options: { includeCharts: true, includeDetails: false, timeRange: 'month' },
      },
      {
        name: 'Detailed Report',
        description: 'Comprehensive report with all analytics',
        options: { includeCharts: true, includeDetails: true, timeRange: 'quarter' },
      },
      {
        name: 'Stock Alerts',
        description: 'Report focusing on low stock and alerts',
        options: { includeCharts: false, includeDetails: true, timeRange: 'week' },
      },
    ];
  }, []);

  // Real-time analytics
  const getRealTimeMetrics = useCallback((): AnalyticsMetrics => {
    return {
      totalItems: getTotalItems(),
      totalValue: getTotalValue(),
      averagePrice: getAveragePrice(),
      lowStockItems: getLowStockItems().length,
      outOfStockItems: getOutOfStockItems().length,
      overstockItems: getOverstockItems().length,
      lastUpdated: new Date(),
    };
  }, [
    getTotalItems,
    getTotalValue,
    getAveragePrice,
    getLowStockItems,
    getOutOfStockItems,
    getOverstockItems,
  ]);

  const subscribeToUpdates = useCallback(
    (callback: (metrics: AnalyticsMetrics) => void) => {
      // Mock subscription - in real implementation, this would set up event listeners
      const interval = setInterval(() => {
        callback(getRealTimeMetrics());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    },
    [getRealTimeMetrics]
  );

  // Update last updated timestamp when data changes
  useEffect(() => {
    updateState({ lastUpdated: new Date() });
  }, [inventoryData, updateState]);

  return {
    // State
    ...state,

    // Basic metrics
    getTotalItems,
    getTotalValue,
    getAveragePrice,
    getLowStockItems,
    getOutOfStockItems,
    getOverstockItems,

    // Category analytics
    getCategoryDistribution,
    getCategoryValueDistribution,
    getTopCategories,

    // Status analytics
    getStatusDistribution,
    getStatusValueDistribution,
    getItemsByStatus,

    // Time-based analytics
    getItemsAddedInPeriod,
    getItemsUpdatedInPeriod,
    getGrowthRate,
    getTrendData,

    // Price analytics
    getPriceDistribution,
    getPriceRangeStats,
    getExpensiveItems,
    getBudgetItems,

    // Quantity analytics
    getQuantityDistribution,
    getQuantityStats,
    getStockLevelAlerts,

    // Supplier analytics
    getSupplierDistribution,
    getTopSuppliers,
    getItemsBySupplier,

    // Location analytics
    getLocationDistribution,
    getItemsByLocation,

    // Tag analytics
    getTagDistribution,
    getItemsByTag,
    getPopularTags,

    // Advanced analytics
    getCorrelationAnalysis,
    getAnomalyDetection,
    getSeasonalTrends,

    // Reporting
    generateReport,
    exportAnalytics,
    getReportTemplates,

    // Real-time analytics
    getRealTimeMetrics,
    subscribeToUpdates,
  };
};

// Helper functions
const generateColors = (count: number): string[] => {
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#ec4899',
    '#6366f1',
  ];

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

const generateTimeLabels = (period: TimeRange): string[] => {
  const now = new Date();
  const labels: string[] = [];

  switch (period) {
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(date.toLocaleDateString('en-US', { day: 'numeric' }));
      }
      break;
    case 'quarter':
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      break;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      break;
  }

  return labels;
};
