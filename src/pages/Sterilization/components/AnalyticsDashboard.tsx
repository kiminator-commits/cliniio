import React, { useMemo } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { formatDuration } from '@/utils/timeUtils';
import { logger } from '@/services/loggerService';

interface BITest {
  test_date: string | Date;
  [key: string]: unknown;
}

interface SterilizationCycle {
  start_time: string;
  end_time: string | null;
  [key: string]: unknown;
}

export default function AnalyticsDashboard() {
  const { biTests, cycles } = useSterilizationStore();

  // ✅ Normalize timestamps once
  const _normalizedTests = useMemo(() => {
    if (!Array.isArray(biTests)) return [];
    return (biTests as BITest[]).map((t) => ({
      ...t,
      test_date: t.test_date instanceof Date ? t.test_date : new Date(t.test_date),
    }));
  }, [biTests]);

  // ✅ Compute dynamic average cycle time & trend
  const averageCycleMinutes = useMemo(() => {
    if (!Array.isArray(cycles) || !cycles.length) return 0;
    const total = (cycles as SterilizationCycle[]).reduce((sum, c) => {
      // Calculate duration from start_time to end_time
      if (c.start_time && c.end_time) {
        const start = new Date(c.start_time);
        const end = new Date(c.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      }
      return sum;
    }, 0);
    return Math.round(total / cycles.length);
  }, [cycles]);

  const previousAverage = useMemo(() => {
    if (!Array.isArray(cycles) || !cycles.length) return 0;
    const past = (cycles as SterilizationCycle[]).filter((c) => {
      if (!c.end_time) return false;
      const d = new Date(c.end_time);
      const now = new Date();
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    });
    if (!past.length) return 0;
    const total = past.reduce((sum, c) => {
      if (c.start_time && c.end_time) {
        const start = new Date(c.start_time);
        const end = new Date(c.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);
    return Math.round(total / past.length);
  }, [cycles]);

  const trend = useMemo(() => {
    if (previousAverage === 0) return 'Stable';
    const diff = averageCycleMinutes - previousAverage;
    if (Math.abs(diff) < 2) return 'Stable';
    return diff < 0 ? 'Improving' : 'Worsening';
  }, [averageCycleMinutes, previousAverage]);

  // ✅ Memoized last updated timestamp
  const lastUpdated = useMemo(() => new Date(), []);

  logger.info(`Analytics trend: ${trend}, average cycle: ${averageCycleMinutes} min`);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Sterilization Analytics</h2>
      <p className="text-gray-600 text-sm">Last updated: {lastUpdated.toLocaleString()}</p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded bg-gray-50">
          <p className="text-sm text-gray-500">Average Cycle Time</p>
          <p className="text-lg font-semibold">{formatDuration(averageCycleMinutes)}</p>
          <p className="text-xs text-gray-400">Trend: {trend}</p>
        </div>
        {/* existing KPIs remain intact */}
      </div>
    </div>
  );
}
