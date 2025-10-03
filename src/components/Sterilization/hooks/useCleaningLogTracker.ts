import { useState } from 'react';

/**
 * Custom hook for managing CleaningLogTracker state.
 * Handles filter state and cycle selection.
 */
export const useCleaningLogTracker = () => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'completed' | 'failed'
  >('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const handleStatusChange = (status: 'all' | 'completed' | 'failed') => {
    setFilterStatus(status);
  };

  const handleDateChange = (date: string) => {
    setFilterDate(date);
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterDate('');
  };

  const handleCycleToggle = (cycleId: string) => {
    setSelectedCycle(selectedCycle === cycleId ? null : cycleId);
  };

  return {
    selectedCycle,
    filterStatus,
    filterDate,
    handleStatusChange,
    handleDateChange,
    handleClearFilters,
    handleCycleToggle,
  };
};
