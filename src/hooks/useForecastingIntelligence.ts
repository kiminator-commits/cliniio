import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ForecastingAnalyticsService,
  AnalyticsFilters,
  IntelligenceSummary,
} from '../services/analytics';

// Simplified state interface
export interface ForecastingIntelligenceState {
  summary: IntelligenceSummary | null;
  loading: boolean;
  error: string | null;
  updated_at: string | null;
  confidence: number;
}

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple in-memory cache implementation
class ForecastingCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean up expired entries first
    this.cleanup();

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T | null;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Optimized hook for forecasting intelligence data
 * Features:
 * - Simplified state management
 * - Intelligent caching with TTL
 * - Lazy loading of individual forecasts
 * - Memoized computations
 * - Reduced re-renders
 */
export const useForecastingIntelligence = (
  filters: AnalyticsFilters = {},
  cacheConfig?: Partial<CacheConfig>
) => {
  // Initialize cache
  const cacheRef = useRef(
    new ForecastingCache({ ...DEFAULT_CACHE_CONFIG, ...cacheConfig })
  );
  const cache = cacheRef.current;

  // Simplified state - only track what's actually needed
  const [state, setState] = useState<ForecastingIntelligenceState>({
    summary: null,
    loading: false,
    error: null,
    updated_at: null,
    confidence: 0,
  });

  // Memoized cache key based on filters
  const cacheKey = useMemo(() => {
    return `forecasting_${JSON.stringify(filters || {})}`;
  }, [filters]);

  // Memoized service instance
  const forecastingService = useMemo(() => {
    return ForecastingAnalyticsService.getInstance();
  }, []);

  // Check if data is cached and valid
  const isCached = useMemo(() => {
    return cache.has(cacheKey);
  }, [cache, cacheKey]);

  // Memoized individual forecasts from summary
  const individualForecasts = useMemo(() => {
    if (!state.summary) return null;

    return {
      toolReplacement: state.summary.toolReplacement || [],
      autoclaveCapacity: state.summary.autoclaveCapacity || [],
      inventoryInflation: state.summary.inventoryInflation || [],
      clinicalStaffing: state.summary.clinicalStaffing || null,
      adminStaffing: state.summary.adminStaffing || null,
      theftLoss: state.summary.theftLoss || null,
      supplyDepletion: state.summary.supplyDepletion || [],
      toolTurnoverUtilization: state.summary.toolTurnoverUtilization || [],
      auditRisk: state.summary.auditRisk || null,
      trainingGaps: state.summary.trainingGaps || null,
      efficiencyROI: state.summary.efficiencyROI || null,
    };
  }, [state.summary]);

  // Optimized fetch function with caching
  const fetchIntelligenceSummary = useCallback(
    async (forceRefresh = false) => {
      // Return cached data if available and not forcing refresh
      if (!forceRefresh && isCached) {
        const cachedData = cache.get<IntelligenceSummary>(cacheKey);
        if (cachedData) {
          setState({
            summary: cachedData,
            loading: false,
            error: null,
            updated_at: cachedData.lastUpdated,
            confidence: cachedData.confidence,
          });
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const summary = await forecastingService.getIntelligenceSummary(
          filters,
          forceRefresh
        );

        // Cache the result
        cache.set(cacheKey, summary);

        setState({
          summary,
          loading: false,
          error: null,
          updated_at: summary.lastUpdated,
          confidence: summary.confidence,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch intelligence data',
        }));
      }
    },
    [filters, forecastingService, cache, cacheKey, isCached]
  );

  // Lazy loading for individual forecasts
  const getIndividualForecast = useCallback(
    async <T>(
      forecastType: string,
      fetchMethod: () => Promise<T>,
      cacheKeySuffix: string
    ): Promise<T> => {
      const individualCacheKey = `${cacheKey}_${cacheKeySuffix}`;

      // Check cache first
      if (cache.has(individualCacheKey)) {
        return cache.get<T>(individualCacheKey)!;
      }

      try {
        const data = await fetchMethod();
        cache.set(individualCacheKey, data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${forecastType}:`, error);
        throw error;
      }
    },
    [cache, cacheKey]
  );

  // Individual forecast methods with caching
  const getToolReplacementForecast = useCallback(async () => {
    return getIndividualForecast(
      'tool replacement forecast',
      () => forecastingService.getToolReplacementForecast(filters),
      'tool_replacement'
    );
  }, [getIndividualForecast, forecastingService, filters]);

  const getAutoclaveCapacityForecast = useCallback(async () => {
    return getIndividualForecast(
      'autoclave capacity forecast',
      () => forecastingService.getAutoclaveCapacityForecast(filters),
      'autoclave_capacity'
    );
  }, [getIndividualForecast, forecastingService, filters]);

  const getToolTurnoverUtilization = useCallback(async () => {
    return getIndividualForecast(
      'tool turnover utilization',
      () => forecastingService.getToolTurnoverUtilization(filters),
      'tool_turnover'
    );
  }, [getIndividualForecast, forecastingService, filters]);

  const getAuditRiskScore = useCallback(async () => {
    return getIndividualForecast(
      'audit risk score',
      () => forecastingService.getAuditRiskScore(filters),
      'audit_risk'
    );
  }, [getIndividualForecast, forecastingService, filters]);

  const getSupplyDepletionForecast = useCallback(async () => {
    return getIndividualForecast(
      'supply depletion forecast',
      () => forecastingService.getSupplyDepletionForecast(filters),
      'supply_depletion'
    );
  }, [getIndividualForecast, forecastingService, filters]);

  // Memoized utility methods
  const hasHighRiskItems = useMemo(() => {
    if (!individualForecasts) return false;

    const { auditRisk, supplyDepletion } = individualForecasts;
    return (
      auditRisk?.riskLevel === 'high' ||
      auditRisk?.riskLevel === 'critical' ||
      supplyDepletion.some((item) => item.reorderUrgency === 'critical')
    );
  }, [individualForecasts]);

  const getUrgentActions = useMemo(() => {
    if (!individualForecasts) return [];

    const actions = [];

    // Check for critical supply depletion
    const criticalSupplies = individualForecasts.supplyDepletion.filter(
      (item) => item.reorderUrgency === 'critical'
    );
    if (criticalSupplies.length > 0) {
      actions.push({
        type: 'critical_supply',
        message: `${criticalSupplies.length} critical supplies need immediate reorder`,
        items: criticalSupplies,
      });
    }

    // Check for high audit risk
    if (
      individualForecasts.auditRisk?.riskLevel === 'high' ||
      individualForecasts.auditRisk?.riskLevel === 'critical'
    ) {
      actions.push({
        type: 'audit_risk',
        message: 'High audit risk detected - immediate action required',
        riskScore: individualForecasts.auditRisk,
      });
    }

    return actions;
  }, [individualForecasts]);

  // Cache management
  const clearCache = useCallback(() => {
    cache.clear();
    setState((prev) => ({ ...prev, updated_at: null }));
  }, [cache]);

  const refreshData = useCallback(async () => {
    // Clear hook cache before forcing refresh
    cache.clear();
    await fetchIntelligenceSummary(true); // Force refresh
  }, [fetchIntelligenceSummary, cache]);

  // Initialize data when filters change
  useEffect(() => {
    if (!filters.facilityId) return;
    fetchIntelligenceSummary();
  }, [filters.facilityId, fetchIntelligenceSummary]);

  return {
    // State
    ...state,
    lastUpdated: state.updated_at, // Alias for compatibility
    individualForecasts,

    // Cache info
    isCached,
    cacheKey,

    // Actions
    refreshData,
    clearCache,
    fetchIntelligenceSummary,

    // Individual forecast methods (lazy loaded with caching)
    getToolReplacementForecast,
    getAutoclaveCapacityForecast,
    getToolTurnoverUtilization,
    getAuditRiskScore,
    getSupplyDepletionForecast,

    // Utility methods (memoized)
    hasHighRiskItems,
    getUrgentActions,
  };
};

export default useForecastingIntelligence;
