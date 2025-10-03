import { useEffect } from 'react';

export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return () => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    };
  }, [cleanupFn]);
};
