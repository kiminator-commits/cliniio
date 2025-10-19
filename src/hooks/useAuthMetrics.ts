import { useEffect } from 'react';
import { useLoginStore } from '@/store/useLoginStore';
import { logger } from '@/services/loggerService';

export function useAuthMetrics() {
  const { token } = useLoginStore();

  useEffect(() => {
    if (!token) return;

    // ✅ Environment guard for performance API
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      logger.warn('Auth metrics skipped — performance API unavailable.');
      return;
    }

    try {
      const timeSinceNavigation = performance.now();
      const duration = Math.round(timeSinceNavigation);

      // ✅ Log via shared logger
      logger.info('🔐 Authentication complete', { duration });

      // ✅ Only fire after verified success
      recordAuthenticationComplete(duration);
    } catch (err) {
      logger.error('Auth metric collection failed', err);
    }
  }, [token]);
}

// Stub for backward compatibility
function recordAuthenticationComplete(duration: number) {
  if (import.meta.env.MODE !== 'production') {
    console.info(`Auth complete recorded (${duration}ms)`);
  }
}
