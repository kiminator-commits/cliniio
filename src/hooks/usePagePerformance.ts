import { useEffect } from 'react';
import { logger } from '@/services/loggerService';

export function usePagePerformance(debug = false) {
  useEffect(() => {
    // ✅ Guard for SSR or non-browser contexts
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      logger.warn('Performance API not available in this environment.');
      return undefined;
    }

    const t0 = performance.now();

    function onLoad() {
      const t1 = performance.now();
      const duration = Math.round(t1 - t0);

      // ✅ Route logs through shared logger
      logger.info(`Page load duration: ${duration}ms`);

      if (debug) {
        logger.debug('Performance timing breakdown', {
          navigationStart: performance.timeOrigin,
          domContentLoaded: performance.timing?.domContentLoadedEventEnd,
          total: duration,
        });
      }
    }

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [debug]);

  return null; // This hook doesn't return anything
}
