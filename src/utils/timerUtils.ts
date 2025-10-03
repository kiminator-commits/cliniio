interface Timer {
  isRunning?: boolean;
  timeRemaining?: number;
  elapsedTime?: number;
  overexposed?: boolean;
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateProgress = (
  timer: Timer | null,
  duration: number
): number => {
  if (!timer) return 0;
  const timeRemaining = timer.timeRemaining ?? duration;
  return ((duration - timeRemaining) / duration) * 100;
};

export const getPhaseStatusColor = (
  isOverexposed: boolean,
  isRunning: boolean
): string => {
  if (isOverexposed) {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  if (isRunning) {
    return 'bg-[#4ECDC4] text-white';
  }
  return 'bg-gray-100 text-gray-600';
};

export const getPhaseStatusText = (
  isOverexposed: boolean,
  isRunning: boolean
): string => {
  if (isOverexposed) {
    return 'OVEREXPOSED';
  }
  if (isRunning) {
    return 'ACTIVE';
  }
  return 'INACTIVE';
};

export const getTimerDisplayValue = (
  timer: Timer | null,
  phaseId: string,
  duration: number,
  elapsedTime: number
): string => {
  if (!timer) {
    return phaseId === 'drying' ? '00:00:00' : formatTime(duration);
  }

  if (phaseId === 'drying') {
    return formatTime(elapsedTime);
  }

  // For bath phases, show overexposure time when overexposed
  const isBathPhase = phaseId === 'bath1' || phaseId === 'bath2';
  if (isBathPhase && timer.overexposed && timer.elapsedTime) {
    const overexposureTime = timer.elapsedTime - duration;
    return `+${formatTime(overexposureTime)}`;
  }

  return formatTime(timer.timeRemaining ?? 0);
};
