import { useMemo } from 'react';

interface AnalyticsDataPoint {
  date: string;
  average_cycle_time: number;
}

export function useAnalyticsMetrics(data: AnalyticsDataPoint[]) {
  return useMemo(() => {
    if (!Array.isArray(data) || data.length < 2) {
      return { averageCycleTrend: 'steady', averageCycleTime: 0 };
    }

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const last = sorted.at(-1);
    const prev = sorted.at(-2);

    const avg = last?.average_cycle_time ?? 0;
    const prevAvg = prev?.average_cycle_time ?? 0;

    let trend: 'up' | 'down' | 'steady' = 'steady';
    if (avg > prevAvg) trend = 'up';
    else if (avg < prevAvg) trend = 'down';

    return {
      averageCycleTrend: trend,
      averageCycleTime: avg,
    };
  }, [data]);
}
