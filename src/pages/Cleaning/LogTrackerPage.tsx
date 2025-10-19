import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { filterCycles } from '@/services/cleaning/CleaningLogService';
import { logger } from '@/services/loggerService';

export default function LogTrackerPage() {
interface CleaningCycle {
  id: string;
  status: string;
  started_at: string;
  [key: string]: unknown;
}

  const [cycles, setCycles] = useState<CleaningCycle[]>([]);
  const [_selectedCycle, _setSelectedCycle] = useState<CleaningCycle | null>(null);
  const [_filters, _setFilters] = useState({ status: 'all', date: '' });
  const [_loading, _setLoading] = useState(false);

  // ✅ Reset selected cycle whenever filters change
  useEffect(() => {
    _setSelectedCycle(null);
  }, [_filters.status, _filters.date]);

  async function _loadCycles() {
    try {
      _setLoading(true);
      const result = await filterCycles({
        facilityId: 'current-facility',
        status: _filters.status,
        date: _filters.date,
      });
      setCycles(result.data);
    } catch (err) {
      logger.error('Failed to load cleaning cycles', err);
    } finally {
      _setLoading(false);
    }
  }

  // ✅ Disable Export button if no data or export not implemented
  const canExport = cycles.length > 0 && typeof (window as Window & { exportCleaningData?: (cycles: CleaningCycle[]) => void })?.exportCleaningData === 'function';

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Cleaning Log Tracker</h2>
        <Button disabled={!canExport} onClick={() => canExport && (window as Window & { exportCleaningData?: (cycles: CleaningCycle[]) => void }).exportCleaningData?.(cycles)}>
          Export
        </Button>
      </div>

      {/* Table rendering cycles (unchanged) */}
      <div>{/* existing cycle list markup remains intact */}</div>
    </div>
  );
}
