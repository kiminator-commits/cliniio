import { InventoryDataAdapter } from '../../adapters/InventoryDataAdapter';
import { InventoryErrorHandler } from '../../InventoryErrorHandler';
import { inventoryAdapterFactory } from '../../adapters/InventoryAdapterFactory';
import { InventoryCategoryProvider } from './InventoryCategoryProvider';

export interface InventoryStats {
  totalItems: number;
  categories: number;
  locations: number;
  activeItems: number;
  maintenanceItems: number;
  inactiveItems: number;
  retiredItems: number;
  archivedItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  normalizedCategories: {
    tools: number;
    supplies: number;
    equipment: number;
    officeHardware: number;
  };
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  averageQuantity: number;
  totalValue?: number;
}

export interface AdapterMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  supportedOperations: string[];
}

export class InventoryStatsProvider {
  private adapter: InventoryDataAdapter;
  private adapterType: string;

  constructor(adapter: InventoryDataAdapter, adapterType: string) {
    this.adapter = adapter;
    this.adapterType = adapterType;
  }

  /**
   * Get inventory stats
   */
  async getInventoryStats(): Promise<{
    data: InventoryStats | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getInventoryStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();

        const stats: InventoryStats = {
          totalItems: allItems.length,
          categories: Array.from(new Set(allItems.map((item) => item.category)))
            .length,
          locations: Array.from(new Set(allItems.map((item) => item.location)))
            .length,
          activeItems: allItems.filter((item) => item.status === 'active')
            .length,
          maintenanceItems: allItems.filter(
            (item) => item.status === 'maintenance'
          ).length,
          inactiveItems: allItems.filter((item) => item.status === 'inactive')
            .length,
          retiredItems: allItems.filter((item) => item.status === 'retired')
            .length,
          archivedItems: allItems.filter((item) => item.status === 'archived')
            .length,
          lowStockItems: allItems.filter((item) => {
            const quantity = item.quantity || 0;
            const minStock = item.minimumStock || 0;
            return quantity > 0 && quantity <= minStock;
          }).length,
          outOfStockItems: allItems.filter((item) => (item.quantity || 0) === 0)
            .length,
          normalizedCategories: {
            tools: 0,
            supplies: 0,
            equipment: 0,
            officeHardware: 0,
          },
          statusDistribution: {},
          categoryDistribution: {},
          locationDistribution: {},
          averageQuantity: 0,
        };

        // Calculate normalized category distribution
        allItems.forEach((item) => {
          const normalizedCategory = InventoryCategoryProvider.normalizeCategory(item.category || '');
          stats.normalizedCategories[normalizedCategory.toLowerCase().replace(' ', '') as keyof typeof stats.normalizedCategories]++;
        });

        // Calculate status distribution
        allItems.forEach((item) => {
          const status = item.status || 'unknown';
          stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
        });

        // Calculate category distribution
        allItems.forEach((item) => {
          const category = item.category || 'unknown';
          stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
        });

        // Calculate location distribution
        allItems.forEach((item) => {
          const location = item.location || 'unknown';
          stats.locationDistribution[location] = (stats.locationDistribution[location] || 0) + 1;
        });

        // Calculate average quantity
        const totalQuantity = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        stats.averageQuantity = allItems.length > 0 ? totalQuantity / allItems.length : 0;

        return stats;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{
    data: Record<string, number> | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getCategoryStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const stats: Record<string, number> = {};

        allItems.forEach((item) => {
          const normalizedCategory = InventoryCategoryProvider.normalizeCategory(item.category || '');
          stats[normalizedCategory] = (stats[normalizedCategory] || 0) + 1;
        });

        return stats;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get status statistics
   */
  async getStatusStats(): Promise<{
    data: Record<string, number> | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getStatusStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const stats: Record<string, number> = {};

        allItems.forEach((item) => {
          const status = item.status || 'unknown';
          stats[status] = (stats[status] || 0) + 1;
        });

        return stats;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get location statistics
   */
  async getLocationStats(): Promise<{
    data: Record<string, number> | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getLocationStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const stats: Record<string, number> = {};

        allItems.forEach((item) => {
          const location = item.location || 'unknown';
          stats[location] = (stats[location] || 0) + 1;
        });

        return stats;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get stock level statistics
   */
  async getStockLevelStats(): Promise<{
    data: {
      inStock: number;
      lowStock: number;
      outOfStock: number;
      overStock: number;
    } | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getStockLevelStats',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let overStock = 0;

        allItems.forEach((item) => {
          const quantity = item.quantity || 0;
          const minStock = item.minimumStock || 0;
          const maxStock = item.maximumStock || Infinity;

          if (quantity === 0) {
            outOfStock++;
          } else if (quantity <= minStock) {
            lowStock++;
          } else if (quantity >= maxStock) {
            overStock++;
          } else {
            inStock++;
          }
        });

        return {
          inStock,
          lowStock,
          outOfStock,
          overStock,
        };
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get trending items (items with recent activity)
   */
  async getTrendingItems(limit: number = 10): Promise<{
    data: Array<{
      id: string;
      name: string;
      category: string;
      lastUpdated: string;
      updateCount: number;
    }> | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getTrendingItems',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        
        // Group items by ID and count updates (simplified - in real implementation, you'd track update history)
        const itemUpdateCounts: Record<string, number> = {};
        allItems.forEach((item) => {
          itemUpdateCounts[item.id] = (itemUpdateCounts[item.id] || 0) + 1;
        });

        // Sort by last updated and return top items
        const trendingItems = allItems
          .sort((a, b) => new Date(b.lastUpdated || b.createdAt).getTime() - new Date(a.lastUpdated || a.createdAt).getTime())
          .slice(0, limit)
          .map((item) => ({
            id: item.id,
            name: item.name || item.item || 'Unknown',
            category: item.category || 'Unknown',
            lastUpdated: item.lastUpdated || item.createdAt,
            updateCount: itemUpdateCounts[item.id] || 1,
          }));

        return trendingItems;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get current adapter type
   */
  getCurrentAdapterType(): string {
    return this.adapterType;
  }

  /**
   * Get adapter metadata
   */
  getAdapterMetadata(): AdapterMetadata | null {
    const metadata = inventoryAdapterFactory.getAdapterMetadata(this.adapterType);
    return metadata;
  }

  /**
   * Get available adapters
   */
  getAvailableAdapters(): AdapterMetadata[] {
    return inventoryAdapterFactory.getAvailableAdapters();
  }

  /**
   * Get adapter capabilities
   */
  getAdapterCapabilities(): string[] {
    const metadata = this.getAdapterMetadata();
    return metadata?.capabilities || [];
  }

  /**
   * Check if adapter supports operation
   */
  supportsOperation(operation: string): boolean {
    const metadata = this.getAdapterMetadata();
    return metadata?.supportedOperations.includes(operation) || false;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    data: {
      averageResponseTime: number;
      totalOperations: number;
      errorRate: number;
      cacheHitRate?: number;
    } | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getPerformanceMetrics',
      async () => {
        // This would typically come from a performance monitoring service
        // For now, return mock data
        return {
          averageResponseTime: 150, // ms
          totalOperations: 1000,
          errorRate: 0.02, // 2%
          cacheHitRate: 0.85, // 85%
        };
      }
    );

    return { data: result, error: null };
  }

  /**
   * Get data quality metrics
   */
  async getDataQualityMetrics(): Promise<{
    data: {
      completeness: number;
      accuracy: number;
      consistency: number;
      issues: string[];
    } | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getDataQualityMetrics',
      async () => {
        const allItems = await this.adapter.fetchInventoryItems();
        const issues: string[] = [];
        
        let completeFields = 0;
        let totalFields = 0;

        allItems.forEach((item) => {
          // Check required fields
          const requiredFields = ['name', 'category', 'status'];
          requiredFields.forEach((field) => {
            totalFields++;
            if (item[field as keyof typeof item]) {
              completeFields++;
            } else {
              issues.push(`Missing ${field} for item ${item.id}`);
            }
          });

          // Check data consistency
          if (item.quantity !== undefined && item.minimumStock !== undefined) {
            if (item.quantity < 0) {
              issues.push(`Negative quantity for item ${item.id}`);
            }
            if (item.minimumStock < 0) {
              issues.push(`Negative minimum stock for item ${item.id}`);
            }
          }
        });

        const completeness = totalFields > 0 ? completeFields / totalFields : 0;
        const accuracy = 1 - (issues.length / allItems.length); // Simplified accuracy calculation
        const consistency = 1 - (issues.filter(issue => issue.includes('consistency')).length / allItems.length);

        return {
          completeness,
          accuracy: Math.max(0, accuracy),
          consistency: Math.max(0, consistency),
          issues,
        };
      }
    );

    return { data: result, error: null };
  }

  /**
   * Generate inventory report
   */
  async generateInventoryReport(): Promise<{
    data: {
      summary: InventoryStats;
      categoryBreakdown: Record<string, number>;
      statusBreakdown: Record<string, number>;
      locationBreakdown: Record<string, number>;
      stockLevels: {
        inStock: number;
        lowStock: number;
        outOfStock: number;
        overStock: number;
      };
      recommendations: string[];
      generatedAt: string;
    } | null;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'generateInventoryReport',
      async () => {
        const [statsResult, categoryStats, statusStats, locationStats, stockStats] = await Promise.all([
          this.getInventoryStats(),
          this.getCategoryStats(),
          this.getStatusStats(),
          this.getLocationStats(),
          this.getStockLevelStats(),
        ]);

        const recommendations: string[] = [];

        // Generate recommendations based on stats
        if (statsResult.data) {
          if (statsResult.data.lowStockItems > 0) {
            recommendations.push(`Consider restocking ${statsResult.data.lowStockItems} low stock items`);
          }
          if (statsResult.data.outOfStockItems > 0) {
            recommendations.push(`Urgent: ${statsResult.data.outOfStockItems} items are out of stock`);
          }
          if (statsResult.data.archivedItems > statsResult.data.totalItems * 0.1) {
            recommendations.push('Consider cleaning up archived items');
          }
        }

        return {
          summary: statsResult.data!,
          categoryBreakdown: categoryStats.data || {},
          statusBreakdown: statusStats.data || {},
          locationBreakdown: locationStats.data || {},
          stockLevels: stockStats.data || { inStock: 0, lowStock: 0, outOfStock: 0, overStock: 0 },
          recommendations,
          generatedAt: new Date().toISOString(),
        };
      }
    );

    return { data: result, error: null };
  }
}
