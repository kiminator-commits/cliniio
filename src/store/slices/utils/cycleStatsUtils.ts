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

    if (failedTests.length > 0) {
      // Calculate actual pass rate if there are failures
      const validTests = recentTests.filter(
        (result: BITestResult) => result.passed !== false
      );

      if (validTests.length > 0) {
        const passedTests = validTests.filter(
          (result: BITestResult) => result.passed
        ).length;
        biPassRate = Math.round((passedTests / validTests.length) * 100);
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

export const calculateAverageCycleTime = (
  cycles: SterilizationCycle[],
  availableTools: Tool[]
): number => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isWithinLastWeek = cycleStartTime >= oneWeekAgo;
    return isWithinLastWeek && hasAutoclavePhase(cycle);
  });

  const completedCycles = weeklyCycles.filter(
    (cycle: SterilizationCycle) => cycle.completedAt !== null
  );

  if (completedCycles.length === 0) return 0;

  // Get tools that completed their sterilization cycle within the last week
  const weeklyCompletedTools = availableTools.filter(
    (tool: Tool) =>
      tool.currentPhase === 'complete' &&
      tool.startTime &&
      tool.endTime &&
      new Date(tool.endTime) >= oneWeekAgo
  );

  if (weeklyCompletedTools.length > 0) {
    // Calculate time from when tool went dirty until it's clean again
    const totalTime = weeklyCompletedTools.reduce(
      (total: number, tool: Tool) => {
        const startTime = new Date(tool.startTime!);
        const endTime = new Date(tool.endTime!);
        return total + (endTime.getTime() - startTime.getTime());
      },
      0
    );
    return Math.round(totalTime / weeklyCompletedTools.length / (1000 * 60)); // Convert to minutes
  } else {
    // Fallback to cycle-based calculation if no tool timing data available
    const totalTime = cycles
      .filter((cycle: SterilizationCycle) => cycle.completedAt !== null)
      .reduce((total: number, cycle: SterilizationCycle) => {
        const startTime = new Date(cycle.startTime);
        const endTime = new Date(cycle.completedAt!);
        return total + (endTime.getTime() - startTime.getTime());
      }, 0);
    return Math.round(totalTime / completedCycles.length / (1000 * 60)); // Convert to minutes
  }
};

export const calculateEfficiencyScore = (
  cycles: SterilizationCycle[],
  biPassRate: number,
  averageCycleTime: number,
  inventoryMetrics?: {
    lowStockItems: number;
    totalItems: number;
    expiringItems: number;
    inventoryAccuracy: number;
  },
  environmentalCleanMetrics?: {
    cleaningEfficiency: number;
    totalRooms: number;
    cleanRooms: number;
    complianceScore: number;
  }
): EfficiencyScore => {
  // Enhanced weighted factors for comprehensive efficiency across all modules
  const weights = {
    cycleCompletionRate: 0.2, // Basic completion rate
    timeEfficiency: 0.15, // Actual vs expected cycle times
    resourceUtilization: 0.15, // Tools per cycle optimization
    qualityMetrics: 0.15, // BI pass rates, compliance
    throughputEfficiency: 0.1, // Cycles per day/week
    inventoryEfficiency: 0.15, // NEW: Inventory management efficiency
    environmentalCleanEfficiency: 0.1, // NEW: Environmental cleaning efficiency
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
  // Expected cycle time is ~90 minutes for full sterilization
  const expectedCycleTime = 90;
  const timeEfficiency = Math.max(
    0,
    Math.min(
      100,
      ((expectedCycleTime - Math.abs(averageCycleTime - expectedCycleTime)) /
        expectedCycleTime) *
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

  // 7. Environmental Clean Efficiency (0-100) - NEW
  let environmentalCleanEfficiency = 0;
  if (environmentalCleanMetrics) {
    const { cleaningEfficiency, totalRooms, cleanRooms, complianceScore } =
      environmentalCleanMetrics;

    // Use provided cleaning efficiency or calculate from room data
    const roomEfficiency = totalRooms > 0 ? (cleanRooms / totalRooms) * 100 : 0;
    const finalCleaningEfficiency = cleaningEfficiency || roomEfficiency;
    const complianceScoreValue = complianceScore || 100;

    // Weighted environmental clean efficiency
    environmentalCleanEfficiency =
      finalCleaningEfficiency * 0.7 + complianceScoreValue * 0.3;
  }

  // Calculate weighted score with all modules
  const weightedScore =
    completionRate * weights.cycleCompletionRate +
    timeEfficiency * weights.timeEfficiency +
    resourceUtilization * weights.resourceUtilization +
    qualityScore * weights.qualityMetrics +
    throughputEfficiency * weights.throughputEfficiency +
    inventoryEfficiency * weights.inventoryEfficiency +
    environmentalCleanEfficiency * weights.environmentalCleanEfficiency;

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
      environmentalClean: {
        efficiency: environmentalCleanEfficiency,
        cleaningEfficiency: environmentalCleanMetrics?.cleaningEfficiency || 0,
        totalRooms: environmentalCleanMetrics?.totalRooms || 0,
        cleanRooms: environmentalCleanMetrics?.cleanRooms || 0,
        complianceScore: environmentalCleanMetrics?.complianceScore || 100,
      },
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
  },
  environmentalCleanMetrics?: {
    cleaningEfficiency: number;
    totalRooms: number;
    cleanRooms: number;
    complianceScore: number;
  }
): CycleStats => {
  const { rate: biPassRate, trend: biPassRateTrend } =
    calculateBIPassRate(biTestResults);
  const cycleTrendData = calculateCycleTrend(cycles);
  const averageCycleTime = calculateAverageCycleTime(cycles, availableTools);
  const efficiencyScore = calculateEfficiencyScore(
    cycles,
    biPassRate,
    averageCycleTime,
    inventoryMetrics,
    environmentalCleanMetrics
  );

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyCycles = cycles.filter((cycle: SterilizationCycle) => {
    const cycleStartTime = new Date(cycle.startTime);
    const isWithinLastWeek = cycleStartTime >= oneWeekAgo;
    return isWithinLastWeek && hasAutoclavePhase(cycle);
  });

  const totalCycles = weeklyCycles.length;
  const completedCycles = weeklyCycles.filter(
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
    averageCycleTime,
    biPassRate,
    biPassRateTrend,
    cycleTrend,
    efficiencyScore,
  };
};
