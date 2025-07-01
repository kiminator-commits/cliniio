import { useState, useEffect, useRef } from 'react';

export function useAccurateTimer(duration: number, isActive: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    startTimeRef.current = Date.now();

    const tick = () => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const newElapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsed(newElapsed);

      if (newElapsed < duration) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive, duration]);

  return {
    elapsed,
    remaining: Math.max(duration - elapsed, 0),
    isComplete: elapsed >= duration,
  };
}
