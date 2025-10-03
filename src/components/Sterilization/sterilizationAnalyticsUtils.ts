// Cache for efficiency metrics to avoid recalculation
let efficiencyMetricsCache: Record<string, unknown> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const efficiencyMetrics = {
  timeSaved: '1.2 hours',
  errorPrevention: 4,
  complianceScore: '98%',
  batchThroughput: '7 tools/hour',
};

export const getSterilizationEfficiency = () => {
  const now = Date.now();

  // Return cached metrics if still valid
  if (efficiencyMetricsCache && now - cacheTimestamp < CACHE_DURATION) {
    return efficiencyMetricsCache;
  }

  // Calculate metrics (in a real app, this would be more complex)
  // Simulate some computation
  const calculatedMetrics = {
    ...efficiencyMetrics,
    calculatedAt: new Date().toISOString(),
  };

  // Cache the result
  efficiencyMetricsCache = calculatedMetrics;
  cacheTimestamp = now;

  // Performance logging removed for production

  return calculatedMetrics;
};

export const sterilizationStatsMeta = {
  source: 'local-metrics-engine',
  lastSynced: new Date().toISOString(),
  fields: [
    'timeSaved',
    'errorPrevention',
    'complianceScore',
    'batchThroughput',
  ],
};

export const analyticsConfig = {
  enabled: true,
  samplingRate: 1.0,
  logging: true,
};

export const logAnalyticsBanner = () => {
  // Analytics banner logging removed for production
};

export const refreshEfficiencyMetrics = () => {
  // Clear cache to force recalculation
  efficiencyMetricsCache = null;
  cacheTimestamp = 0;

  // Get fresh metrics
  const freshMetrics = getSterilizationEfficiency();

  const result = {
    refreshed: true,
    timestamp: new Date().toISOString(),
    metrics: freshMetrics,
  };

  // Performance logging removed for production

  return result;
};

// Clear cache function for testing or manual cache invalidation
export const clearAnalyticsCache = () => {
  efficiencyMetricsCache = null;
  cacheTimestamp = 0;
};
