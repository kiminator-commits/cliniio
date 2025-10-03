import { useLayoutEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/_core/logger';
import { performanceMonitor } from '../services/monitoring/PerformanceMonitor';

interface PerformanceMetrics {
  pageLoadTime: number;
  componentMountTime: number;
  dataLoadTime?: number;
  totalTime: number;
  navigationTime?: number;
  authenticationTime?: number;
  dataFetchTime?: number;
}

interface UsePagePerformanceOptions {
  pageName: string;
  trackDataLoading?: boolean;
  trackNavigation?: boolean;
  trackAuthentication?: boolean;
  onMetricsComplete?: (metrics: PerformanceMetrics) => void;
}

export const usePagePerformance = ({
  pageName,
  trackDataLoading = false,
  trackNavigation = true,
  trackAuthentication = true,
  onMetricsComplete,
}: UsePagePerformanceOptions) => {
  const mountStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number>();
  const dataLoadTime = useRef<number>();
  const navigationTime = useRef<number>();
  const authenticationTime = useRef<number>();
  const dataFetchTime = useRef<number>();

  // Defer logging to avoid blocking renders
  const deferredLog = useCallback((message: string) => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        logger.perf(message);
      }, 0);
    }
  }, []);

  // Use useLayoutEffect for more accurate mount timing
  useLayoutEffect(() => {
    // Record component mount time - measure from hook creation to effect execution
    const now = performance.now();
    const startTime = mountStartTime.current;
    mountTime.current = now - startTime;

    // Cap mount time to prevent unrealistic values (max 10 seconds)
    if (mountTime.current > 10000) {
      mountTime.current = 10000;
    }

    // Record in performance monitor
    performanceMonitor.recordComponentMount(pageName, mountTime.current, {
      page: pageName,
      timestamp: new Date().toISOString(),
    });

    // Defer mount performance logging
    deferredLog(`${pageName} mounted in ${mountTime.current.toFixed(2)}ms`);

    if (navigationTime.current) {
      deferredLog(
        `${pageName} navigation took ${navigationTime.current.toFixed(2)}ms`
      );
    }

    if (authenticationTime.current) {
      deferredLog(
        `${pageName} authentication took ${authenticationTime.current.toFixed(2)}ms`
      );
    }

    if (dataFetchTime.current) {
      deferredLog(
        `${pageName} data fetch took ${dataFetchTime.current.toFixed(2)}ms`
      );
    }

    return () => {
      // Calculate total time on unmount using captured startTime
      const totalTime = performance.now() - startTime;
      const currentMountTime = mountTime.current;

      const metrics: PerformanceMetrics = {
        pageLoadTime: currentMountTime || 0,
        componentMountTime: currentMountTime || 0,
        dataLoadTime: dataLoadTime.current,
        navigationTime: navigationTime.current,
        authenticationTime: authenticationTime.current,
        dataFetchTime: dataFetchTime.current,
        totalTime,
      };

      // Defer total performance logging and bottleneck analysis
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          logger.perf(
            `${pageName} total time: ${totalTime.toFixed(2)}ms`,
            metrics
          );

          // Identify bottlenecks with performance monitor thresholds
          const bottlenecks = [];
          if (navigationTime.current && navigationTime.current > 1000) {
            bottlenecks.push(
              `Navigation (${navigationTime.current.toFixed(2)}ms)`
            );
          }
          if (authenticationTime.current && authenticationTime.current > 2000) {
            bottlenecks.push(
              `Authentication (${authenticationTime.current.toFixed(2)}ms)`
            );
          }
          if (dataFetchTime.current && dataFetchTime.current > 2000) {
            bottlenecks.push(
              `Data Fetch (${dataFetchTime.current.toFixed(2)}ms)`
            );
          }
          if (currentMountTime && currentMountTime > 1000) {
            bottlenecks.push(
              `Component Mount (${currentMountTime.toFixed(2)}ms)`
            );
          }

          if (bottlenecks.length > 0) {
            logger.warn(
              `${pageName} bottlenecks detected:`,
              bottlenecks.join(', ')
            );
          }
        }, 0);
      }

      // Call callback if provided
      onMetricsComplete?.(metrics);
    };
  }, [pageName, onMetricsComplete, deferredLog]);

  const recordDataLoaded = useCallback(() => {
    if (trackDataLoading && mountStartTime.current) {
      dataLoadTime.current = performance.now() - mountStartTime.current;
      deferredLog(
        `${pageName} data loaded in ${dataLoadTime.current.toFixed(2)}ms`
      );
    }
  }, [pageName, trackDataLoading, deferredLog]);

  const recordNavigationComplete = useCallback(() => {
    if (trackNavigation && mountStartTime.current) {
      navigationTime.current = performance.now() - mountStartTime.current;

      // Record in performance monitor
      performanceMonitor.recordNavigation(
        'unknown',
        pageName,
        navigationTime.current,
        {
          page: pageName,
          timestamp: new Date().toISOString(),
        }
      );

      deferredLog(
        `${pageName} navigation completed in ${navigationTime.current.toFixed(2)}ms`
      );
    }
  }, [pageName, trackNavigation, deferredLog]);

  const recordAuthenticationComplete = useCallback(() => {
    if (trackAuthentication && mountStartTime.current) {
      // Only record authentication time if we haven't already recorded it
      if (!authenticationTime.current) {
        authenticationTime.current = performance.now() - mountStartTime.current;

        // Record in performance monitor
        performanceMonitor.recordAuthentication(
          authenticationTime.current,
          true,
          {
            page: pageName,
            timestamp: new Date().toISOString(),
          }
        );

        deferredLog(
          `${pageName} authentication completed in ${authenticationTime.current.toFixed(2)}ms`
        );
      }
    }
  }, [pageName, trackAuthentication, deferredLog]);

  const recordDataFetchComplete = useCallback(() => {
    if (trackDataLoading && mountStartTime.current) {
      dataFetchTime.current = performance.now() - mountStartTime.current;

      // Record in performance monitor
      performanceMonitor.recordDataFetch(
        'data_fetch',
        dataFetchTime.current,
        true,
        {
          page: pageName,
          timestamp: new Date().toISOString(),
        }
      );

      deferredLog(
        `[PERF] ${pageName} data fetch completed in ${dataFetchTime.current.toFixed(2)}ms`
      );
    }
  }, [pageName, trackDataLoading, deferredLog]);

  return {
    recordDataLoaded,
    recordNavigationComplete,
    recordAuthenticationComplete,
    recordDataFetchComplete,
  };
};
