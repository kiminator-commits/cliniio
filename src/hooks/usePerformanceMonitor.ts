import { useEffect } from 'react';

export const usePerformanceMonitor = (label: string) => {
  const start = performance.now();

  useEffect(() => {
    const end = performance.now();
    const duration = end - start;
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }, [label, start]);
};
