import { useEffect } from 'react';

export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
  }, [cleanupFn]);
};
