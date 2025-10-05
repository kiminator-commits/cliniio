import { AnalyticsFilters } from '../analyticsDataService';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import {
  _InventoryItemRow,
  InventoryInflationForecast,
} from '../forecastingAnalyticsTypes';
import { INVENTORY_INFLATION_CONFIG } from '../forecastingAnalyticsConfig';

export class InventoryInflationForecastService {
  private static instance: InventoryInflationForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): InventoryInflationForecastService {
    if (!InventoryInflationForecastService.instance) {
      InventoryInflationForecastService.instance =
        new InventoryInflationForecastService();
    }
    return InventoryInflationForecastService.instance;
  }

  /**
   * 💸 Inventory Inflation Trend
   * Price delta by category, supplier trends, regional inflation
   */
  async getInventoryInflationForecast(
    filters: AnalyticsFilters = {}
  ): Promise<InventoryInflationForecast[]> {
    try {
      const cacheKey = `inventory_inflation_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<InventoryInflationForecast[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn(
          'No facility ID provided for inventory inflation forecast'
        );
        return [];
      }

      // Get inventory data for price analysis using centralized service
      const allItems = await InventoryActionService.getItems();

      // Apply filters manually
      let inventoryData = allItems;
      if (filters.facilityId) {
        inventoryData = allItems.filter(
          (item) => item.facility_id === filters.facilityId
        );
      }

      // Filter by date (last 365 days)
      const oneYearAgo = new Date(
        Date.now() -
          INVENTORY_INFLATION_CONFIG.ANALYSIS_DAYS * 24 * 60 * 60 * 1000
      );
      inventoryData = inventoryData.filter(
        (item) => item.created_at && new Date(item.created_at) >= oneYearAgo
      );

      // Sort by created_at descending
      inventoryData.sort(
        (a, b) =>
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
      );

      if (!inventoryData || inventoryData.length === 0) {
        console.warn('No inventory data found for inflation forecast');
        return [];
      }

      // Group by category and analyze price trends
      const categoryGroups = (inventoryData as _InventoryItemRow[]).reduce(
        (acc: Record<string, _InventoryItemRow[]>, item: _InventoryItemRow) => {
          const category =
            (item.data as { category?: string })?.category ?? 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as Record<string, _InventoryItemRow[]>
      );

      const forecasts: InventoryInflationForecast[] = Object.entries(
        categoryGroups
      )
        .map(([category, items]) => {
          const prices = items
            .map(
              (item: _InventoryItemRow) =>
                (item.data as { unit_cost?: number })?.unit_cost || 0
            )
            .filter((price: number) => price > 0);
          if (prices.length === 0) return null;

          const currentPrice = prices[prices.length - 1] ?? 0;
          const historicalPrice = prices[0] ?? 0;
          const priceIncrease = currentPrice - historicalPrice;
          const inflationRate =
            historicalPrice > 0 ? (priceIncrease / historicalPrice) * 100 : 0;

          return {
            category,
            currentPrice,
            priceIncrease,
            inflationRate,
            projectedYearEndPrice:
              currentPrice *
              (1 +
                (inflationRate / 100) *
                  INVENTORY_INFLATION_CONFIG.PROJECTION_MONTHS), // Project 6 months
            cheaperSupplierExists: false, // This should come from supplier comparison data
            alternativeSupplier: undefined,
            costSavings: 0,
          };
        })
        .filter(Boolean) as InventoryInflationForecast[];

      this.setCachedData(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error forecasting inventory inflation:', error);
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

export default InventoryInflationForecastService;
