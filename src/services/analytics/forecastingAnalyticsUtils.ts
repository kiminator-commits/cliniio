import { _SterilizationCycleRow } from './forecastingAnalyticsTypes';

/**
 * Calculate peak usage hours from sterilization cycles
 */
export function calculatePeakHours(cycles: _SterilizationCycleRow[]): string[] {
  // Group cycles by hour and find peak usage times
  const hourCounts = new Array(24).fill(0);
  cycles.forEach((cycle: _SterilizationCycleRow) => {
    if (cycle.created_at) {
      const hour = new Date(cycle.created_at).getHours();
      hourCounts[hour]++;
    }
  });

  const maxCount = Math.max(...hourCounts);
  const peakHours = hourCounts
    .map((count, hour) => ({ count, hour }))
    .filter(({ count }) => count >= maxCount * 0.8)
    .map(({ hour }) => `${hour.toString().padStart(2, '0')}:00`)
    .slice(0, 4); // Limit to 4 peak hours

  return peakHours.length > 0 ? peakHours : ['09:00', '12:00', '15:00'];
}

/**
 * Get optimization recommendation based on utilization efficiency
 */
export function getOptimizationRecommendation(efficiency: number): string {
  if (efficiency >= 90)
    return 'Excellent utilization - maintain current practices';
  if (efficiency >= 80)
    return 'Good utilization - minor optimizations possible';
  if (efficiency >= 70)
    return 'Moderate utilization - consider schedule optimization';
  return 'Low utilization - review tool allocation and scheduling';
}

/**
 * Get bottleneck indicators based on utilization efficiency
 */
export function getBottleneckIndicators(efficiency: number): string[] {
  const indicators = [];
  if (efficiency < 80) indicators.push('Low utilization efficiency');
  if (efficiency < 70) indicators.push('Significant idle time detected');
  return indicators.length > 0 ? indicators : ['Minimal bottlenecks detected'];
}
