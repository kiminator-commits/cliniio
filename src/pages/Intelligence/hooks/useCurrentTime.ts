import { useState, useEffect } from 'react';

/**
 * Hook to get the current time that updates every minute
 * This avoids calling Date.now() during render which is impure
 */
export function useCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return currentTime;
}
