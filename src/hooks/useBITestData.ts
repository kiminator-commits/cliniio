import { useMemo } from 'react';
import { formatTestTime } from '@/services/bi/formatTestTime';

interface BITest {
  timestamp: string | Date;
  [key: string]: unknown;
}

export function useBITestData(tests: BITest[]) {
  return useMemo(() => {
    if (!Array.isArray(tests)) return [];
    return tests.map((test) => {
      const normalizedTime =
        test.timestamp instanceof Date ? test.timestamp : new Date(test.timestamp);
      const safeTime = isNaN(normalizedTime.getTime()) ? null : normalizedTime;

      return {
        ...test,
        timestamp: safeTime,
        formattedTime: safeTime ? formatTestTime(safeTime) : '—',
      };
    });
  }, [tests]);
}
