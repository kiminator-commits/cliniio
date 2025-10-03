import { useCallback, useMemo, useRef } from 'react';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import {
  DashboardService,
  CycleProgressInfo,
} from '../services/dashboardService';

export const useDashboardLogic = () => {
  const { currentCycle } = useSterilizationStore();
  const startTime = useRef(performance.now());

  // Memoize tabs to prevent recalculation
  const tabs = useMemo(() => {
    return DashboardService.getTabs();
  }, []);

  // Memoize cycle progress info with proper dependency
  const cycleProgressInfo = useMemo((): CycleProgressInfo | null => {
    if (!currentCycle) return null;
    return DashboardService.getCycleProgressInfo(currentCycle);
  }, [currentCycle]);

  // Memoize validation function
  const validateOperatorName = useCallback((operatorName: string): boolean => {
    return DashboardService.validateOperatorName(operatorName);
  }, []);

  // Memoize tab button classes function
  const getTabButtonClasses = useCallback((isActive: boolean): string => {
    return DashboardService.getTabButtonClasses(isActive);
  }, []);

  // Memoize start cycle button state function
  const getStartCycleButtonState = useCallback((operatorName: string) => {
    return DashboardService.getStartCycleButtonState(operatorName);
  }, []);

  // Memoize should show no cycle message with proper dependency
  const shouldShowNoCycleMessage = useCallback((): boolean => {
    return DashboardService.shouldShowNoCycleMessage(currentCycle);
  }, [currentCycle]);

  // Memoize should show active cycle info with proper dependency
  const shouldShowActiveCycleInfo = useCallback((): boolean => {
    if (!currentCycle) return false;
    return DashboardService.shouldShowActiveCycleInfo(currentCycle);
  }, [currentCycle]);

  // Performance logging
  useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      const _totalTime = performance.now() - startTime.current;
    }
  }, []);

  return {
    tabs,
    cycleProgressInfo,
    validateOperatorName,
    getTabButtonClasses,
    getStartCycleButtonState,
    shouldShowNoCycleMessage,
    shouldShowActiveCycleInfo,
  };
};
