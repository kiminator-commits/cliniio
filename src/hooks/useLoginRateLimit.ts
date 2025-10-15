import { useState, useEffect } from 'react';

// Rate limiting hook
export const useLoginRateLimit = () => {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Lock user for 30 seconds after 3 failed attempts
  const maxAttempts = 3;
  const lockTime = 30000; // 30 seconds

  useEffect(() => {
    if (lockedUntil && Date.now() < lockedUntil) {
      // Still locked
      return;
    }
    if (lockedUntil && Date.now() >= lockedUntil) {
      // Unlock after time period - use setTimeout to avoid synchronous setState
      setTimeout(() => {
        setAttempts(0);
        setLockedUntil(null);
      }, 0);
    }
  }, [lockedUntil]);

  const incrementAttempts = () => {
    if (attempts + 1 >= maxAttempts) {
      setLockedUntil(Date.now() + lockTime);
    } else {
      setAttempts(attempts + 1);
    }
  };

  return { attempts, lockedUntil, incrementAttempts };
};
