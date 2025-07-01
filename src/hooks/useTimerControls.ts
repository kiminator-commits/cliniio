import { useCallback } from 'react';

interface UseTimerControlsProps {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  setStartTime: (time: number) => void;
  setPauseTime: (time: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export const useTimerControls = ({
  isRunning,
  setIsRunning,
  setStartTime,
  setPauseTime,
  onStart,
  onPause,
  onReset,
}: UseTimerControlsProps) => {
  const handleStart = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
      onStart?.();
    }
  }, [isRunning, setIsRunning, setStartTime, onStart]);

  const handlePause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setPauseTime(Date.now());
      onPause?.();
    }
  }, [isRunning, setIsRunning, setPauseTime, onPause]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStartTime(0);
    setPauseTime(0);
    onReset?.();
  }, [setIsRunning, setStartTime, setPauseTime, onReset]);

  return {
    handleStart,
    handlePause,
    handleReset,
  };
};

export function calculateOverexposure({
  elapsedTime,
  duration,
}: {
  elapsedTime: number;
  duration: number;
}): boolean {
  return elapsedTime > duration;
}

export function saveTimerState(key: string, state: Record<string, unknown>) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save timer state:', e);
  }
}

export function loadTimerState<T = Record<string, unknown>>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error('Failed to load timer state:', e);
    return null;
  }
}

export function getElapsedTime(startTime: number, pauseTime?: number): number {
  if (!startTime) return 0;
  const endTime = pauseTime || Date.now();
  return Math.max(0, endTime - startTime);
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
