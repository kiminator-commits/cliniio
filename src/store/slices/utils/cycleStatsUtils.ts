import {
  SterilizationCycle,
  CycleStats,
  TrendData,
  EfficiencyScore,
} from '../types/sterilizationCycleTypes';
import { Tool } from '../../../types/toolTypes';
import { BITestResult } from '../../../types/sterilizationTypes';
import { hasAutoclavePhase } from './cycleUtils';

export const calculateBIPassRate = (
  biTestResults: BITestResult[]
): { rate: number; trend: TrendData | null } => {
  let biPassRate = 100; // Default to 100%
  let biPassRateTrend: TrendData | null = null;

  if (biTestResults.length > 0) {
    // Check for any failed tests or missed tests in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTests = biTestResults.filter(
      (result: BITestResult) => result.date >= thirtyDaysAgo
    );

    // Check for failures
    const failedTests = recentTests.filter(
      (result: BITestResult) => result.passed === false
    );

    // Check for missed tests (skipped or overdue)
    const missedTests = recentTests.filter(
      (result: BITestResult) => !result.passed && result.date < thirtyDaysAgo
    );

    if (recentTests.length > 0) {
      // Calculate actual pass rate for all tests
      const passedTests = recentTests.filter(
        (result: BITestResult) => result.passed === true
      ).length;

      biPassRate = Math.round((passedTests / recentTests.length) * 100);

      if (failedTests.length > 0) {
        biPassRateTrend = {
          direction: 'down',
          value: `${failedTests.length} failure(s) this month`,
        };
      }
    } else if (missedTests.length > 0) {
      // Show warning for missed tests but keep 100% pass rate
      biPassRateTrend = {
        direction: 'warning',
        value: `${missedTests.length} test(s) missed this month`,
      };
    }
  }

  return { rate: biPassRate, trend: biPassRateTrend };
};

export const calculateCycleTrend = (
  cycles: SterilizationCycle[]
): TrendData | null => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Filter cycles from the last week that have autoclave phase initiated
  const weeklyCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isWithinLastWeek = cycleStartTime >= oneWeekAgo;
    return isWithinLastWeek && hasAutoclavePhase(cycle);
  });

  // Filter cycles from the previous week for trend calculation
  const previousWeekCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isWithinPreviousWeek =
      cycleStartTime >= twoWeeksAgo && cycleStartTime < oneWeekAgo;
    return isWithinPreviousWeek && hasAutoclavePhase(cycle);
  });

  const totalCycles = weeklyCycles.length;
  const previousWeekCount = previousWeekCycles.length;

  if (previousWeekCount > 0) {
    const trendPercentage = Math.round(
      ((totalCycles - previousWeekCount) / previousWeekCount) * 100
    );
    return {
      direction: trendPercentage >= 0 ? 'up' : 'down',
      value: `${trendPercentage >= 0 ? '+' : ''}${trendPercentage}% from last week`,
    };
  } else if (totalCycles > 0) {
    return {
      direction: 'up',
      value: 'New this week',
    };
  }

  return null;
};

export const calculateAverageToolTurnaroundTime = (
  cycles: SterilizationCycle[],
  availableTools: Tool[]
): number => {
  // Extend to 30 days to match total cycles calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Debug: Tool turnaround calculation

  // Get tools that completed their full sterilization cycle within the last 30 days
  const recentlyCompletedTools = availableTools.filter((tool: Tool) => {
    // Tool must be clean and available
    const isClean =
      tool.currentPhase === 'complete' || tool.currentPhase === 'available';

    // Must have timing data
    const hasTiming = tool.startTime && tool.endTime;

    // Must have completed within last 30 days
    const isRecent = hasTiming && new Date(tool.endTime!) >= thirtyDaysAgo;

    // Must have gone through sterilization (not just cleaning)
    const wentThroughSterilization =
      hasTiming &&
      new Date(tool.endTime!).getTime() - new Date(tool.startTime!).getTime() >
        30 * 60 * 1000; // At least 30 minutes

    return isClean && hasTiming && isRecent && wentThroughSterilization;
  });

  // Debug: Tool turnaround data

  if (recentlyCompletedTools.length === 0) {
    // Don't log this repeatedly - it's normal for new installations
    return 0;
  }

  // Calculate total turnaround time for all tools
  const totalTurnaroundTime = recentlyCompletedTools.reduce(
    (total: number, tool: Tool) => {
      const startTime = new Date(tool.startTime!);
      const endTime = new Date(tool.endTime!);
      const turnaroundTime = endTime.getTime() - startTime.getTime();

      // Debug: Individual tool timing
      return total + turnaroundTime;
    },
    0
  );

  const avgTurnaroundMinutes = Math.round(
    totalTurnaroundTime / recentlyCompletedTools.length / (1000 * 60)
  );

  // Debug: Final calculation

  return avgTurnaroundMinutes;
};

interface _environmentalCleanMetrics {
  cleaningEfficiency: number;
  totalRooms: number;
  cleanRooms: number;
  complianceScore: number;
}

export const calculateEfficiencyScore = (
  cycles: SterilizationCycle[],
  biPassRate: number,
  averageToolTurnaroundTime: number,
  inventoryMetrics?: {
    lowStockItems: number;
    totalItems: number;
    expiringItems: number;
    inventoryAccuracy: number;
  },
  _environmentalCleanMetrics?: _environmentalCleanMetrics
): EfficiencyScore => {
  // Enhanced weighted factors for comprehensive efficiency across all modules
  const weights = {
    cycleCompletionRate: 0.2, // Basic completion rate
    timeEfficiency: 0.15, // Actual vs expected cycle times
    resourceUtilization: 0.15, // Tools per cycle optimization
    qualityMetrics: 0.15, // BI pass rates, compliance
    throughputEfficiency: 0.1, // Cycles per day/week
    inventoryEfficiency: 0.15, // NEW: Inventory management efficiency
    // Environmental cleaning efficiency removed - sterilization analytics only
  };

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Filter weekly cycles
  const weeklyCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isWithinLastWeek = cycleStartTime >= oneWeekAgo;
    return isWithinLastWeek && hasAutoclavePhase(cycle);
  });

  const totalCycles = weeklyCycles.length;
  const completedCycles = weeklyCycles.filter(
    (cycle: SterilizationCycle) => cycle.completedAt !== null
  ).length;

  // 1. Cycle Completion Rate (0-100)
  const completionRate =
    totalCycles > 0 ? (completedCycles / totalCycles) * 100 : 0;

  // 2. Time Efficiency (0-100)
  // Expected tool turnaround time is ~60 minutes for optimized process
  const expectedTurnaroundTime = 60;
  const timeEfficiency = Math.max(
    0,
    Math.min(
      100,
      ((expectedTurnaroundTime -
        Math.abs(averageToolTurnaroundTime - expectedTurnaroundTime)) /
        expectedTurnaroundTime) *
        100
    )
  );

  // 3. Resource Utilization (0-100)
  // Optimal tools per cycle is 6-8 tools
  const totalToolsInCycles = weeklyCycles.reduce(
    (sum: number, cycle: SterilizationCycle) => sum + cycle.tools.length,
    0
  );
  const avgToolsPerCycle =
    totalCycles > 0 ? totalToolsInCycles / totalCycles : 0;
  const optimalToolsPerCycle = 7;
  const resourceUtilization = Math.max(
    0,
    Math.min(100, (avgToolsPerCycle / optimalToolsPerCycle) * 100)
  );

  // 4. Quality Metrics (0-100)
  const qualityScore = biPassRate; // Already a percentage

  // 5. Throughput Efficiency (0-100)
  // Optimal is 2-3 cycles per day
  const daysInWeek = 7;
  const cyclesPerDay = totalCycles / daysInWeek;
  const optimalCyclesPerDay = 2.5;
  const throughputEfficiency = Math.max(
    0,
    Math.min(100, (cyclesPerDay / optimalCyclesPerDay) * 100)
  );

  // 6. Inventory Efficiency (0-100) - NEW
  let inventoryEfficiency = 0;
  if (inventoryMetrics) {
    const { lowStockItems, totalItems, expiringItems, inventoryAccuracy } =
      inventoryMetrics;

    // Calculate inventory health score
    const stockHealth =
      totalItems > 0
        ? Math.max(0, 100 - (lowStockItems / totalItems) * 100)
        : 100;
    const expirationHealth =
      totalItems > 0
        ? Math.max(0, 100 - (expiringItems / totalItems) * 100)
        : 100;
    const accuracyScore = inventoryAccuracy || 100;

    // Weighted inventory efficiency
    inventoryEfficiency =
      stockHealth * 0.4 + expirationHealth * 0.3 + accuracyScore * 0.3;
  }

  // Environmental cleaning efficiency removed - sterilization analytics only

  // Calculate weighted score with all modules
  const weightedScore =
    completionRate * weights.cycleCompletionRate +
    timeEfficiency * weights.timeEfficiency +
    resourceUtilization * weights.resourceUtilization +
    qualityScore * weights.qualityMetrics +
    throughputEfficiency * weights.throughputEfficiency +
    inventoryEfficiency * weights.inventoryEfficiency;

  // Calculate trend (compare with previous week)
  const previousWeekCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    return cycleStartTime >= twoWeeksAgo && cycleStartTime < oneWeekAgo;
  });

  let trend: { direction: 'up' | 'down'; value: string } | null = null;

  if (previousWeekCycles.length > 0) {
    // Calculate previous week's efficiency (simplified)
    const prevCompletionRate =
      (previousWeekCycles.filter(
        (c: SterilizationCycle) => c.completedAt !== null
      ).length /
        previousWeekCycles.length) *
      100;
    const prevScore = prevCompletionRate * weights.cycleCompletionRate + 80; // Simplified previous score

    const scoreChange = weightedScore - prevScore;
    const trendPercentage = Math.round((scoreChange / prevScore) * 100);

    trend = {
      direction: scoreChange >= 0 ? 'up' : 'down',
      value: `${scoreChange >= 0 ? '+' : ''}${trendPercentage}% from last week`,
    };
  }

  return {
    score: Math.round(weightedScore),
    trend,
    // Add breakdown for transparency
    breakdown: {
      sterilization: {
        completionRate,
        timeEfficiency,
        resourceUtilization,
        qualityScore,
        throughputEfficiency,
      },
      inventory: {
        efficiency: inventoryEfficiency,
        lowStockItems: inventoryMetrics?.lowStockItems || 0,
        totalItems: inventoryMetrics?.totalItems || 0,
        expiringItems: inventoryMetrics?.expiringItems || 0,
        accuracy: inventoryMetrics?.inventoryAccuracy || 100,
      },
      // Environmental cleaning data removed - this is sterilization analytics only
    },
  };
};

export const getCycleStats = (
  cycles: SterilizationCycle[],
  availableTools: Tool[],
  biTestResults: BITestResult[],
  inventoryMetrics?: {
    lowStockItems: number;
    totalItems: number;
    expiringItems: number;
    inventoryAccuracy: number;
  }
): CycleStats => {
  const { rate: biPassRate, trend: biPassRateTrend } =
    calculateBIPassRate(biTestResults);
  const cycleTrendData = calculateCycleTrend(cycles);
  const averageToolTurnaroundTime = calculateAverageToolTurnaroundTime(
    cycles,
    availableTools
  );
  const efficiencyScore = calculateEfficiencyScore(
    cycles,
    biPassRate,
    averageToolTurnaroundTime,
    inventoryMetrics
  );

  // Extend the time window to 30 days to include more cycles
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isValidDate = !isNaN(cycleStartTime.getTime());
    const isWithinLastMonth = isValidDate && cycleStartTime >= thirtyDaysAgo;
    return isWithinLastMonth;
  });

  // Debug: Analytics calculation
  const totalCycles = recentCycles.length;
  const completedCycles = recentCycles.filter(
    (cycle: SterilizationCycle) => cycle.completedAt !== null
  ).length;

  // Convert cycleTrend to the expected format (only up/down, no warning)
  const cycleTrend =
    cycleTrendData && cycleTrendData.direction !== 'warning'
      ? {
          direction: cycleTrendData.direction as 'up' | 'down',
          value: cycleTrendData.value,
        }
      : null;

  return {
    totalCycles,
    completedCycles,
    averageCycleTime: averageToolTurnaroundTime, // Map to existing field name
    biPassRate,
    biPassRateTrend,
    cycleTrend,
    efficiencyScore,
  };
};
