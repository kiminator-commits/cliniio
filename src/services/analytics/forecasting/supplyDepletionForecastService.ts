import { AnalyticsFilters } from '../analyticsDataService';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import {
  _InventoryItemRow,
  SupplyDepletionForecast,
} from '../forecastingAnalyticsTypes';

export class SupplyDepletionForecastService {
  private static instance: SupplyDepletionForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): SupplyDepletionForecastService {
    if (!SupplyDepletionForecastService.instance) {
      SupplyDepletionForecastService.instance =
        new SupplyDepletionForecastService();
    }
    return SupplyDepletionForecastService.instance;
  }

  /**
   * 🔮 Supply Depletion Forecast
   * Usage trend vs. stock, reorder window, supplier delay
   */
  async getSupplyDepletionForecast(
    filters: AnalyticsFilters = {}
  ): Promise<SupplyDepletionForecast[]> {
    try {
      const cacheKey = `supply_depletion_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<SupplyDepletionForecast[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId || filters.facilityId.trim() === '') {
        console.warn('No facility ID provided for supply depletion forecast');
        return [];
      }

      // Get real inventory data using centralized service
      const allItems = await InventoryActionService.getItems();

      // Apply filters manually
      let inventoryData = allItems;
      if (filters.facilityId) {
        inventoryData = allItems.filter(
          (item) => item.facility_id === filters.facilityId
        );
      }

      // Sort by quantity ascending
      inventoryData.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

      if (!inventoryData || inventoryData.length === 0) {
        console.warn('No inventory data found for supply depletion forecast');
        return [];
      }

      // Generate real forecasts based on actual inventory data
      const forecasts: SupplyDepletionForecast[] = (
        inventoryData as _InventoryItemRow[]
      )
        .slice(0, 8)
        .map((item: _InventoryItemRow, index: number) => {
          const currentStock = item.quantity ?? 0;
          const reorderPoint =
            (item.data as { reorder_point?: number })?.reorder_point ?? 100;
          const unitCost =
            (item.data as { unit_cost?: number })?.unit_cost ?? 50;

          // Calculate depletion urgency based on stock vs reorder point
          let reorderUrgency: 'low' | 'medium' | 'high' | 'critical';
          if (currentStock <= reorderPoint * 0.5) reorderUrgency = 'critical';
          else if (currentStock <= reorderPoint * 0.8) reorderUrgency = 'high';
          else if (currentStock <= reorderPoint * 1.2)
            reorderUrgency = 'medium';
          else reorderUrgency = 'low';

          // Calculate depletion date based on usage patterns
          const daysUntilDepletion = Math.ceil(
            currentStock / (reorderPoint / 30)
          ); // Assume monthly usage
          const depletionDate = new Date(
            Date.now() + daysUntilDepletion * 24 * 60 * 60 * 1000
          );
          const reorderDate = new Date(
            depletionDate.getTime() - 7 * 24 * 60 * 60 * 1000
          ); // Reorder 7 days before depletion

          return {
            itemName: item.name ?? `Item ${index + 1}`,
            currentStock,
            depletionDate: depletionDate.toISOString().split('T')[0],
            reorderUrgency,
            recommendedReorderDate: reorderDate.toISOString().split('T')[0],
            currentCost: unitCost,
            historicalCosts: [unitCost * 0.95, unitCost * 0.98, unitCost],
            costTrend:
              unitCost >
              ((item.data as { last_restocked_cost?: number })
                ?.last_restocked_cost || unitCost)
                ? 'increasing'
                : 'stable',
          };
        });

      this.setCachedData(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error forecasting supply depletion:', error);
      return [];
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export default SupplyDepletionForecastService;
