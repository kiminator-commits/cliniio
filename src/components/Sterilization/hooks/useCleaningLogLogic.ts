import { useMemo, useState, useEffect } from 'react';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import {
  CleaningLogService,
  FilterOptions,
  CycleStats,
  CleaningLog,
} from '../services/cleaningLogService';
import { ToolStatus as _ToolStatus } from '@/types/toolTypes';

interface UseCleaningLogLogicProps {
  filterStatus: 'all' | 'in_progress' | 'completed' | 'failed';
  filterDate: string;
}

export const useCleaningLogLogic = ({
  filterStatus,
  filterDate,
}: UseCleaningLogLogicProps) => {
  const { biTestResults } = useSterilizationStore();
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cleaning logs from database
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await CleaningLogService.fetchCleaningLogs();
        setCleaningLogs(logs);
      } catch (err) {
        console.error('Failed to fetch cleaning logs:', err);
        setError('Failed to load cleaning logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const filterOptions: FilterOptions = {
      status: filterStatus,
      date: filterDate,
    };
    return CleaningLogService.filterCleaningLogs(cleaningLogs, filterOptions);
  }, [cleaningLogs, filterStatus, filterDate]);

  const stats = useMemo((): CycleStats => {
    return CleaningLogService.calculateStats(filteredLogs);
  }, [filteredLogs]);

  const getStatusColor = (status: string) => {
    return CleaningLogService.getStatusColor(status).color;
  };

  const formatDuration = (startTime: string, endTime?: string): string => {
    return CleaningLogService.formatDuration(startTime, endTime);
  };

  const getBITestResultsForCycle = (cycleStartTime: string) => {
    return CleaningLogService.getBITestResultsForCycle(
      biTestResults,
      cycleStartTime
    );
  };

  const getBITestResultColor = (result: 'pass' | 'fail'): string => {
    return CleaningLogService.getBITestResultColor(result);
  };

  const formatTestTime = (date: Date): string => {
    return CleaningLogService.formatTestTime(date);
  };

  const getCleaningTypeDisplayName = (cleaningType: string): string => {
    return CleaningLogService.getCleaningTypeDisplayName(cleaningType);
  };

  const getQualityScoreDisplay = (score?: number): string => {
    return CleaningLogService.getQualityScoreDisplay(score);
  };

  const getComplianceScoreDisplay = (score?: number): string => {
    return CleaningLogService.getComplianceScoreDisplay(score);
  };

  const exportLogs = () => {
    CleaningLogService.exportToCSV(filteredLogs);
  };

  return {
    filteredLogs,
    stats,
    loading,
    error,
    getStatusColor,
    formatDuration,
    getBITestResultsForCycle,
    getBITestResultColor,
    formatTestTime,
    getCleaningTypeDisplayName,
    getQualityScoreDisplay,
    getComplianceScoreDisplay,
    exportLogs,
  };
};
