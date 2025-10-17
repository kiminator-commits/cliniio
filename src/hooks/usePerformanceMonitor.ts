import { useEffect, useRef, useCallback } from 'react';
import { isDevelopment } from '../lib/getEnv';

interface PerformanceMetrics {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowestRender: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  threshold?: number; // Threshold in ms to log slow renders
  enabled?: boolean;
}

export const usePerformanceMonitor = ({
  componentName,
  threshold = 16, // 16ms = 60fps
  enabled = isDevelopment(),
}: UsePerformanceMonitorOptions) => {
  const renderStartTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    renderCount: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    slowestRender: 0,
  });

  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  const endRender = useCallback(() => {
    if (!enabled) return;

    const renderTime = performance.now() - renderStartTime.current;
    const currentMetrics = metrics.current;

    // Update metrics
    currentMetrics.renderCount++;
    currentMetrics.totalRenderTime += renderTime;
    currentMetrics.averageRenderTime =
      currentMetrics.totalRenderTime / currentMetrics.renderCount;
    currentMetrics.lastRenderTime = renderTime;

    if (renderTime > currentMetrics.slowestRender) {
      currentMetrics.slowestRender = renderTime;
    }

    // Log slow renders
    if (renderTime > threshold) {
      console.warn(
        `[PERF] ${componentName}: Slow render detected: ${renderTime.toFixed(2)}ms ` +
          `(threshold: ${threshold}ms)`
      );
    }

    // Log performance metrics every 10 renders
    if (currentMetrics.renderCount % 10 === 0) {
      console.log(
        `[PERF] ${componentName}: Render #${currentMetrics.renderCount} - ` +
          `Last: ${renderTime.toFixed(2)}ms, ` +
          `Avg: ${currentMetrics.averageRenderTime.toFixed(2)}ms, ` +
          `Slowest: ${currentMetrics.slowestRender.toFixed(2)}ms`
      );
    }
  }, [enabled, componentName, threshold]);

  // Log final metrics on unmount
  useEffect(() => {
    if (!enabled) return undefined;

    const currentMetrics = { ...metrics.current };

    return () => {
      if (currentMetrics.renderCount > 0) {
        console.log(
          `[PERF] ${componentName}: Final metrics - ` +
            `Total renders: ${currentMetrics.renderCount}, ` +
            `Average time: ${currentMetrics.averageRenderTime.toFixed(2)}ms, ` +
            `Slowest: ${currentMetrics.slowestRender.toFixed(2)}ms`
        );
      }
    };
  }, [enabled, componentName]);

  return {
    startRender,
    endRender,
    getMetrics: () => metrics.current,
  };
};
