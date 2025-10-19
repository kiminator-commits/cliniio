/**
 * React Hook for Performance Tracking
 * Provides easy integration with EnhancedPerformanceService
 */

import { useEffect, useRef, useCallback } from 'react';
import { enhancedPerformanceService } from '../services/EnhancedPerformanceService';

export interface PerformanceTrackingOptions {
  category: 'ui' | 'api' | 'database' | 'memory' | 'network' | 'user-interaction';
  tags?: Record<string, string>;
  threshold?: number;
  onThresholdExceeded?: (value: number, threshold: number) => void;
}

/**
 * Hook for tracking component render performance
 */
export function useRenderPerformance(componentName: string, options?: PerformanceTrackingOptions) {
  const startTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - startTime.current;
      
      enhancedPerformanceService.trackUIMetric(
        `${componentName}_render_time`,
        renderTime,
        {
          component: componentName,
          renderCount: renderCount.current.toString(),
          ...options?.tags,
        }
      );

      // Check threshold
      if (options?.threshold && renderTime > options.threshold) {
        options.onThresholdExceeded?.(renderTime, options.threshold);
      }
    };
  });
}

/**
 * Hook for tracking API call performance
 */
export function useAPIPerformance() {
  const trackAPICall = useCallback((
    endpoint: string,
    duration: number,
    tags: Record<string, string> = {}
  ) => {
    enhancedPerformanceService.trackAPIMetric(
      `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
      duration,
      {
        endpoint,
        ...tags,
      }
    );
  }, []);

  return { trackAPICall };
}

/**
 * Hook for tracking user interaction performance
 */
export function useInteractionPerformance() {
  const trackInteraction = useCallback((
    interactionType: string,
    duration: number,
    tags: Record<string, string> = {}
  ) => {
    enhancedPerformanceService.trackUserInteractionMetric(
      `interaction_${interactionType}`,
      duration,
      {
        type: interactionType,
        ...tags,
      }
    );
  }, []);

  return { trackInteraction };
}

/**
 * Hook for tracking memory usage
 */
export function useMemoryTracking() {
  const trackMemoryUsage = useCallback((
    context: string,
    memoryUsage: number,
    tags: Record<string, string> = {}
  ) => {
    enhancedPerformanceService.trackMemoryMetric(
      `memory_${context}`,
      memoryUsage,
      {
        context,
        ...tags,
      }
    );
  }, []);

  return { trackMemoryUsage };
}

/**
 * Hook for getting performance insights
 */
export function usePerformanceInsights() {
  const getInsights = useCallback(() => {
    return enhancedPerformanceService.getRecentInsights(10);
  }, []);

  const getSummary = useCallback(() => {
    return enhancedPerformanceService.getPerformanceSummary();
  }, []);

  return { getInsights, getSummary };
}

/**
 * Hook for tracking page load performance
 */
export function usePageLoadPerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      enhancedPerformanceService.trackUIMetric(
        `${pageName}_load_time`,
        loadTime,
        {
          page: pageName,
          type: 'page_load',
        }
      );
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
      return undefined;
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pageName]);
}

/**
 * Hook for tracking component mount/unmount performance
 */
export function useComponentLifecyclePerformance(componentName: string) {
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const lifecycleTime = performance.now() - mountTime.current;
      
      enhancedPerformanceService.trackUIMetric(
        `${componentName}_lifecycle_time`,
        lifecycleTime,
        {
          component: componentName,
          type: 'lifecycle',
        }
      );
    };
  }, [componentName]);
}
