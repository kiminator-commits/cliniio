import { useEffect } from 'react';
import { logger } from '@/utils/_core/logger';

interface PerformanceEntryWithProcessingStart extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export const usePerformanceMonitoring = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    // Monitor Core Web Vitals
    const measurePerformance = () => {
      const loadTime = performance.now() - startTime;

      // Get Web Vitals if available
      const metrics: Partial<PerformanceMetrics> = {
        pageLoadTime: loadTime,
      };

      // Try to get Web Vitals from Performance Observer
      if ('PerformanceObserver' in window) {
        try {
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(
              (entry) => entry.name === 'first-contentful-paint'
            );
            if (fcpEntry) {
              metrics.firstContentfulPaint = fcpEntry.startTime;
            }
          });
          fcpObserver.observe({ entryTypes: ['paint'] });

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              metrics.largestContentfulPaint = lastEntry.startTime;
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const firstEntry = entries[0];
            if (firstEntry) {
              metrics.firstInputDelay =
                (firstEntry as PerformanceEntryWithProcessingStart)
                  .processingStart - firstEntry.startTime;
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as LayoutShiftEntry;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
            metrics.cumulativeLayoutShift = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          logger.warn('Performance monitoring setup failed:', error);
        }
      }

      // Log performance metrics
      logger.info(`🚀 ${pageName} Performance Metrics:`, metrics);

      // Log slow page loads
      if (loadTime > 3000) {
        logger.warn(
          `⚠️ Slow page load detected for ${pageName}: ${loadTime.toFixed(2)}ms`
        );
      } else if (loadTime < 1000) {
        logger.info(
          `✅ Fast page load for ${pageName}: ${loadTime.toFixed(2)}ms`
        );
      }
    };

    // Measure performance after a short delay to allow for initial render
    const timeoutId = setTimeout(measurePerformance, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pageName]);
};

export default usePerformanceMonitoring;
