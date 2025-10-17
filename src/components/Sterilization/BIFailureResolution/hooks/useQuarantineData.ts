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
  totalSterilizationEvents: number; // Total sterilization events (including tool repeats)
  toolsUsedMultipleTimes: number; // Tools sterilized 2+ times in risk window
  uniqueOperators: string[];
  dateRange: { start: Date; end: Date } | null;
  toolsByCategory: Record<string, number>;
  hasCurrentCycleAffected: boolean;
}

export const useQuarantineData = (): QuarantineData => {
  const { biTestResults, cycles, currentCycle, availableTools } =
    useSterilizationStore();

  return useMemo(() => {
    // Safety check for biTestResults
    if (!biTestResults || !Array.isArray(biTestResults)) {
      return {
        lastPassedDate: null,
        affectedCycles: [],
        affectedTools: [],
        totalToolsAffected: 0,
        totalCyclesAffected: 0,
        totalSterilizationEvents: 0,
        toolsUsedMultipleTimes: 0,
        uniqueOperators: [],
        dateRange: null,
        toolsByCategory: {},
        hasCurrentCycleAffected: false,
      };
    }

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

    // Get ALL tool instances from affected cycles (not unique - track multiple uses)
    const allToolInstances = affectedCycles.flatMap(
      (cycle: SterilizationCycle) => cycle.tools.map((toolId: string) => toolId)
    );

    // Count how many times each tool appears in the risk window
    const toolFrequencyMap = new Map<string, number>();
    allToolInstances.forEach((toolId: string) => {
      toolFrequencyMap.set(toolId, (toolFrequencyMap.get(toolId) || 0) + 1);
    });

    // Get unique tool IDs with their frequency data
    const uniqueAffectedToolIds = Array.from(toolFrequencyMap.keys());

    // Get detailed tool information
    const affectedTools = uniqueAffectedToolIds.map((toolId: string) => {
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
    const totalToolsAffected: number = affectedTools.length;
    const totalCyclesAffected: number = affectedCycles.length;
    const totalSterilizationEvents: number = allToolInstances.length; // Total sterilization events (including repeats)
    const toolsUsedMultipleTimes: number = affectedTools.filter(
      (tool: Tool) => (toolFrequencyMap.get(tool.id) || 0) > 1
    ).length;

    const uniqueOperators: string[] = [
      ...new Set(
        affectedCycles
          .map((cycle: SterilizationCycle) => cycle.operator)
          .filter((operator): operator is string => typeof operator === 'string')
      )
    ] as string[];
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
      totalSterilizationEvents,
      toolsUsedMultipleTimes,
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
