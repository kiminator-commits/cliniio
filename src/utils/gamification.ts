export const calculateLevel = (points: number): number => {
  if (points < 500) return 1;
  return Math.floor(Math.sqrt(points / 500)) + 1;
};

export const calculatePointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelThreshold = Math.pow(currentLevel, 2) * 500;
  return nextLevelThreshold - currentPoints;
};

export const calculateLevelProgress = (points: number): number => {
  const currentLevel = calculateLevel(points);
  const currentLevelThreshold = Math.pow(currentLevel - 1, 2) * 500;
  const nextLevelThreshold = Math.pow(currentLevel, 2) * 500;
  const levelRange = nextLevelThreshold - currentLevelThreshold;
  const pointsInCurrentLevel = points - currentLevelThreshold;

  return (pointsInCurrentLevel / levelRange) * 100;
};

export const shouldResetPoints = (lastResetDate: string | null): boolean => {
  if (!lastResetDate) return true;

  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Check if it's a new year
  return lastReset.getFullYear() < now.getFullYear();
};

export const getDaysUntilReset = (): number => {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st
  const diffTime = endOfYear.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getYearlyProgress = (): { current: number; total: number } => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st
  const endOfYear = new Date(now.getFullYear(), 11, 31); // December 31st
  const totalDays = Math.ceil(
    (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  return {
    current: daysPassed,
    total: totalDays,
  };
};
