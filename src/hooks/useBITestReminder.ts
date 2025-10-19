import { useEffect } from 'react';
// import { useBITestStore } from '@/store/useBITestStore';
import { logger } from '@/services/loggerService';

export function useBITestReminder() {
  // const { tests, markDueSoon } = useBITestStore();

  useEffect(() => {
    // TODO: Implement BI test reminder logic when useBITestStore is available
    logger.info('BI test reminder hook initialized');
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // This hook doesn't return anything
}
