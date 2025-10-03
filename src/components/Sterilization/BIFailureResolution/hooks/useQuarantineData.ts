import { useMemo } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { Tool } from '@/types/toolTypes';
import { BITestResult } from '@/store/slices/types/biWorkflowTypes';
import { SterilizationCycle } from '@/store/slices/types/sterilizationCycleTypes';

export interface QuarantineData {
  lastPassedDate: Date | null;
  affectedCycles: SterilizationCycle[];
  affectedTools: Tool[];
  totalToolsAffected: number;
  totalCyclesAffected: number;
  uniqueOperators: string[];
  dateRange: { start: Date; end: Date } | null;
  toolsByCategory: Record<string, number>;
  hasCurrentCycleAffected: boolean;
}

export const useQuarantineData = (): QuarantineData => {
  const { biTestResults, cycles, currentCycle, availableTools } =
    useSterilizationStore();

  return useMemo(() => {
    // Find the last passed BI test
    const lastPassedTest = biTestResults
      .filter((result: BITestResult) => result.passed)
      .sort(
        (a: BITestResult, b: BITestResult) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

    const lastPassedDate = lastPassedTest
      ? new Date(lastPassedTest.date)
      : null;

    // Get all cycles (including current cycle if it exists)
    const allCycles = currentCycle ? [...cycles, currentCycle] : cycles;

    // Filter cycles that started after the last passed BI test
    const affectedCycles = lastPassedDate
      ? allCycles.filter(
          (cycle: SterilizationCycle) =>
            new Date(cycle.startTime) > lastPassedDate
        )
      : allCycles;

    // Get all unique tool IDs from affected cycles
    const affectedToolIds = [
      ...new Set(
        affectedCycles.flatMap((cycle: SterilizationCycle) => cycle.tools)
      ),
    ];

    // Get detailed tool information
    const affectedTools = affectedToolIds.map((toolId) => {
      const availableTool = availableTools.find((t: Tool) => t.id === toolId);
      return (
        availableTool || {
          id: toolId,
          name: `Tool ${toolId}`,
          barcode: toolId,
          category: 'Unknown',
          type: 'Unknown',
          cycleCount: 0,
          lastSterilized: undefined,
          status: 'available' as const,
        }
      );
    });

    // Calculate statistics
    const totalToolsAffected = affectedTools.length;
    const totalCyclesAffected = affectedCycles.length;
    const uniqueOperators = [
      ...new Set(
        affectedCycles.map((cycle: SterilizationCycle) => cycle.operator)
      ),
    ];
    const dateRange =
      affectedCycles.length > 0
        ? {
            start: new Date(
              Math.min(
                ...affectedCycles.map((c: SterilizationCycle) =>
                  new Date(c.startTime).getTime()
                )
              )
            ),
            end: new Date(
              Math.max(
                ...affectedCycles.map((c: SterilizationCycle) =>
                  new Date(c.startTime).getTime()
                )
              )
            ),
          }
        : null;

    // Group tools by category
    const toolsByCategory = affectedTools.reduce(
      (acc, tool) => {
        const category = tool.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      lastPassedDate,
      affectedCycles,
      affectedTools,
      totalToolsAffected,
      totalCyclesAffected,
      uniqueOperators,
      dateRange,
      toolsByCategory,
      hasCurrentCycleAffected: Boolean(
        currentCycle &&
          (!lastPassedDate || new Date(currentCycle.startTime) > lastPassedDate)
      ),
    };
  }, [biTestResults, cycles, currentCycle, availableTools]);
};
