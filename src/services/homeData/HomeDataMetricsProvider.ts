import { HomeTask } from '../../types/homeTypes';

export class HomeDataMetricsProvider {
  /**
   * Calculate metrics from tasks data
   */
  calculateMetrics(tasks: HomeTask[]): {
    availablePoints: number;
    completedTasksCount: number;
    totalTasksCount: number;
  } {
    // Calculate available points
    const earnedPoints = tasks.reduce(
      (sum, task) => sum + task.pointsEarned,
      0
    );
    const completedTasks = tasks.filter((task) => task.isCompleted).length;

    return {
      availablePoints: earnedPoints,
      completedTasksCount: completedTasks,
      totalTasksCount: tasks.length,
    };
  }

  /**
   * Calculate pagination info
   */
  calculatePagination(
    page: number,
    pageSize: number,
    total: number
  ): {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  } {
    const offset = (page - 1) * pageSize;
    return {
      page,
      pageSize,
      total,
      hasMore: offset + pageSize < total,
    };
  }

  /**
   * Performance comparison calculation
   */
  calculatePerformanceImprovement(
    originalTime: number,
    optimizedTime: number
  ): number {
    return ((originalTime - optimizedTime) / originalTime) * 100;
  }
}
