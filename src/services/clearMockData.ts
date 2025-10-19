import { logger } from '@/services/loggerService';

export function clearMockData() {
  if (import.meta.env.MODE === 'production') {
    logger.info('clearMockData skipped in production');
    return;
  }

  try {
    if (typeof window === 'undefined') return;
    const storageTargets = [localStorage, sessionStorage];

    const knownPrefixes = ['mock_', 'test_', 'dev_cache_', 'tmp_'];

    for (const store of storageTargets) {
      for (const key of Object.keys(store)) {
        if (knownPrefixes.some((prefix) => key.startsWith(prefix))) {
          store.removeItem(key);
          if (import.meta.env.MODE !== 'production') {
            logger.debug(`🧹 Cleared mock key: ${key}`);
          }
        }
      }
    }
    if (import.meta.env.MODE !== 'production') {
      logger.info('✅ Mock data cleared');
    }
  } catch (err) {
    logger.error('Failed to clear mock data', err);
  }
}
