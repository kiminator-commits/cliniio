import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnvironmentalCleanDataManager } from '../../hooks/useEnvironmentalCleanDataManager';

export function EnvironmentalCleanInsightsCard() {
  const { rooms: cleans } = useEnvironmentalCleanDataManager();

  // Analytics calculations
  const total = cleans.length;
  const byStatus = useMemo(
    () =>
      cleans.reduce<Record<string, number>>((acc, item) => {
        const status = (item as { status?: string }).status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    [cleans]
  );

  return (
    <Card>
      <CardContent>
        <h2>Environmental Clean Insights</h2>
        {/* Metrics Section */}
        <div>Total items: {total}</div>
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status}>
            {status}: {count}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
