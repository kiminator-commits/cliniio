import { DailyOperationsTaskRow, AITaskPerformance, UserGamificationStatsRow } from '@/types/aiTaskPerformanceTypes';

/**
 * Calculate time saved between estimated and actual duration
 */
export function calculateTimeSaved(estimatedDuration: number, actualDuration: number): number {
  return Math.max(0, estimatedDuration - actualDuration);
}

/**
 * Calculate efficiency score as percentage
 */
export function calculateEfficiencyScore(actualDuration: number, estimatedDuration: number): number {
  return Math.min(100, (actualDuration / estimatedDuration) * 100);
}

/**
 * Convert minutes to milliseconds
 */
export function minutesToMilliseconds(minutes: number): number {
  return minutes * 60000;
}

/**
 * Convert minutes to hours
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Calculate cost saved based on time saved and hourly rate
 */
export function calculateCostSaved(timeSavedMinutes: number, hourlyRate: number): number {
  const hoursSaved = minutesToHours(timeSavedMinutes);
  return hoursSaved * hourlyRate;
}

/**
 * Calculate proactive management score
 */
export function calculateProactiveScore(completedAt: string): number {
  const isProactive = new Date(completedAt) <= new Date();
  return isProactive ? 10 : 0;
}

/**
 * Calculate category score based on task category
 */
export function calculateCategoryScore(category: string, efficiencyScore: number): number {
  switch (category) {
    case 'inventory':
    case 'sterilization':
    case 'equipment':
      return efficiencyScore;
    default:
      return efficiencyScore;
  }
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to YYYY-MM month string
 */
export function formatDateToMonthString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get start of day date
 */
export function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get start of month date
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Generate cache key for time savings
 */
export function generateTimeSavingsCacheKey(facilityId: string): string {
  return `time-savings-${facilityId}`;
}

/**
 * Generate cache key for cost savings
 */
export function generateCostSavingsCacheKey(facilityId: string, hourlyRate: number): string {
  return `cost-savings-${facilityId}-${hourlyRate}`;
}

/**
 * Generate cache key for team performance
 */
export function generateTeamPerformanceCacheKey(facilityId: string): string {
  return `team-performance-${facilityId}`;
}

/**
 * Check if cache entry is valid based on TTL
 */
export function isCacheValid(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp < ttl;
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate percentage from ratio
 */
export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Sum array of numbers
 */
export function sumArray(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

/**
 * Get maximum value from array of numbers
 */
export function getMaxValue(numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Filter array by condition and return count
 */
export function countByCondition<T>(array: T[], condition: (item: T) => boolean): number {
  return array.filter(condition).length;
}

/**
 * Transform task data to performance object
 */
export function transformTaskToPerformance(
  taskData: DailyOperationsTaskRow,
  taskId: string,
  userId: string
): AITaskPerformance {
  const estimatedDuration = taskData.estimated_duration || 30;
  const actualDuration = taskData.actual_duration || 0;
  const timeSaved = calculateTimeSaved(estimatedDuration, actualDuration);
  const efficiencyScore = calculateEfficiencyScore(actualDuration, estimatedDuration);

  return {
    taskId,
    userId,
    taskType: taskData.type ?? '',
    category: taskData.category ?? '',
    estimatedDuration,
    actualDuration,
    points: taskData.points ?? 0,
    difficulty: taskData.priority ?? '',
    completedAt: new Date().toISOString(),
    timeSaved,
    efficiencyScore,
  };
}

/**
 * Calculate gamification stats aggregates
 */
export function calculateGamificationStats(gamificationStats: UserGamificationStatsRow[]) {
  return {
    totalTasks: sumArray(gamificationStats.map(stat => stat.total_tasks)),
    completedTasks: sumArray(gamificationStats.map(stat => stat.completed_tasks)),
    perfectDays: countByCondition(
      gamificationStats,
      stat => stat.completed_tasks === stat.total_tasks
    ),
    currentStreak: getMaxValue(gamificationStats.map(stat => stat.current_streak)),
    bestStreak: getMaxValue(gamificationStats.map(stat => stat.best_streak)),
  };
}

/**
 * Calculate team performance aggregates
 */
export function calculateTeamPerformanceAggregates(
  learningData: { progress: number | null }[],
  inventoryData: { accuracy: number | null }[],
  sterilizationData: { status: string | null }[]
) {
  const skills = learningData.length > 0 
    ? Math.round(calculateAverage(learningData.map(item => item.progress ?? 0)))
    : 0;

  const inventory = inventoryData.length > 0
    ? Math.round(calculateAverage(inventoryData.map(item => item.accuracy ?? 0)))
    : 0;

  const sterilization = sterilizationData.length > 0
    ? calculatePercentage(
        countByCondition(sterilizationData, cycle => cycle.status === 'completed'),
        sterilizationData.length
      )
    : 0;

  return { skills, inventory, sterilization };
}
