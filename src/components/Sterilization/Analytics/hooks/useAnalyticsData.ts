import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { Tool } from '@/types/toolTypes';
import {
  BITestResult,
  ActivityLogItem,
} from '@/store/slices/types/biWorkflowTypes';
import { UnifiedAIService as _UnifiedAIService } from '@/services/ai/UnifiedAIService';
import { useCentralizedInventoryData } from '@/hooks/useCentralizedInventoryData';

// Define types locally since we're migrating away from vercelAIService
interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ForecastPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

// Type for formatted activity items with string time
interface FormattedActivityItem {
  id: string;
  type: ActivityLogItem['type'];
  title: string;
  description?: string;
  time: string; // Formatted time string
  toolCount?: number;
  color: string;
  operatorId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Custom hook for processing sterilization analytics data.
 * Extracts data processing logic from the main analytics component.
 */
export const useAnalyticsData = () => {
  const {
    getCycleStats,
    biTestResults,
    nextBITestDue,
    activityLog,
    availableTools,
    loadBITestResults,
    loadBIFailureIncidents,
  } = useSterilizationStore();

  // Get inventory data to ensure tool counts match inventory page
  const { tools: inventoryTools } = useCentralizedInventoryData();

  // AI-powered analytics state
  const [aiInsights, setAiInsights] = useState<AnalyticsInsight[]>([]);
  const [aiForecasts, setAiForecasts] = useState<ForecastPrediction[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGenerationAttempted, setAiGenerationAttempted] = useState(false);

  // Check if inventory data is available - don't wait for sterilization tools
  const isLoading = !inventoryTools || inventoryTools.length === 0;

  // Manual refresh function for debugging
  const refreshBIResults = useCallback(async () => {
    try {
      console.log('🔄 Manually refreshing BI results...');
      const facilityId = '550e8400-e29b-41d4-a716-446655440000'; // Default facility
      await loadBITestResults(facilityId);
      await loadBIFailureIncidents(facilityId);
      console.log('✅ BI results refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh BI results:', error);
    }
  }, [loadBITestResults, loadBIFailureIncidents]);

  // Load BI test results from database when analytics loads
  useEffect(() => {
    const loadBIActivities = async () => {
      try {
        const facilityId = '550e8400-e29b-41d4-a716-446655440000'; // Default facility
        await loadBITestResults(facilityId);
        await loadBIFailureIncidents(facilityId);
      } catch (error) {
        console.error('Failed to load BI activities:', error);
      }
    };

    // Initial load
    loadBIActivities();

    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const dailyRefreshTimer = setTimeout(() => {
      // Refresh at midnight
      loadBIActivities();

      // Then refresh every 24 hours
      setInterval(loadBIActivities, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    // Cleanup timer on unmount
    return () => clearTimeout(dailyRefreshTimer);
  }, [loadBITestResults, loadBIFailureIncidents]);

  // Memoize additional metrics calculations
  const additionalMetrics = useMemo(() => {
    // Total Tools: Use inventory data to match inventory page count
    const totalTools = inventoryTools.length;

    if (isLoading) {
      return { totalTools, activeTools: 0, completedToday: 0 };
    }

    // In Cycle: All tools that are currently in any timer phase (from sterilization data)
    const inCycleTools = availableTools.filter(
      (tool: Tool) =>
        tool.currentPhase &&
        tool.currentPhase !== 'complete' &&
        tool.currentPhase !== 'failed'
    ).length;

    // Completed Today: All tools that completed a P2 or Autoclave cycle today
    const today = new Date();
    const completedToday = availableTools.filter((tool: Tool) => {
      if (!tool.endTime) return false;
      const completionDate = new Date(tool.endTime);
      const isToday = completionDate.toDateString() === today.toDateString();
      const hasCompletedCycle = tool.currentPhase === 'complete';
      return isToday && hasCompletedCycle;
    }).length;

    return { totalTools, activeTools: inCycleTools, completedToday };
  }, [availableTools, inventoryTools, isLoading]);

  // Memoize recent BI test results filtering and sorting
  const recentBITests = useMemo(() => {
    console.log('🔍 recentBITests filter:', {
      isLoading,
      biTestResultsLength: biTestResults?.length || 0,
      biTestResults:
        biTestResults?.length > 0
          ? biTestResults.slice(0, 3).map((t) => ({
              status: t.status,
              date: t.date,
              passed: t.passed,
              id: t.id,
            }))
          : 'none',
    });

    if (isLoading || !biTestResults || biTestResults.length === 0) {
      return [];
    }

    return biTestResults
      .filter((result: BITestResult) => {
        // 7-day rolling window for recent tests
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // Convert test_date string to Date for comparison
        const testDate = new Date(result.test_date);
        return testDate >= sevenDaysAgo;
      })
      .sort(
        (a: BITestResult, b: BITestResult) =>
          new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
      ) // Sort by most recent first
      .slice(0, 5); // Limit to 5 most recent tests for UI performance
  }, [biTestResults, isLoading]);

  // Format activity log for RecentActivity
  const recentActivities = useMemo((): FormattedActivityItem[] => {
    if (isLoading || !activityLog || activityLog.length === 0) {
      return [];
    }

    return activityLog.map((item: ActivityLogItem) => {
      const formattedTime = formatTimeAgo(item.time);
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.data?.description,
        time: formattedTime,
        toolCount: item.toolCount,
        color: item.color,
        operatorId: item.operatorId,
        metadata: item.metadata,
      } as FormattedActivityItem;
    });
    // Remove limit to show all activities (component will handle scrolling)
  }, [activityLog, isLoading]);

  // AI insights generation - DISABLED due to OpenAI API issues
  const generateAIInsights = useCallback(async () => {
    // Skip AI generation to prevent blocking page load
    setAiInsights([]);
    setAiForecasts([]);
    setIsAiLoading(false);
    setAiGenerationAttempted(true);
    setAiError(null);
  }, []);

  // Generate AI insights when data is available - but don't block the page
  useEffect(() => {
    if (
      !isLoading &&
      availableTools &&
      biTestResults &&
      activityLog &&
      !aiGenerationAttempted
    ) {
      // Attempt AI insights generation
      generateAIInsights().catch((error) => {
        console.warn('AI insights generation failed (non-blocking):', error);
      });
    }
  }, [
    isLoading,
    availableTools,
    biTestResults,
    activityLog,
    generateAIInsights,
    aiGenerationAttempted,
  ]);

  // Return early with default values if data isn't ready
  if (isLoading) {
    return {
      stats: {
        totalCycles: 0,
        completedCycles: 0,
        averageCycleTime: 0,
        biPassRate: 100,
        efficiencyScore: { score: 0, trend: null },
        cycleTrend: null,
        biPassRateTrend: null,
      },
      additionalMetrics,
      recentBITests,
      nextBITestDue: null,
      recentActivities,
      aiInsights: [],
      aiForecasts: [],
      isAiLoading: false,
      aiError: null,
      generateAIInsights,
      isLoading: true,
    };
  }

  const stats = getCycleStats();

  return {
    stats,
    additionalMetrics,
    recentBITests,
    nextBITestDue,
    refreshBIResults, // Expose manual refresh function
    recentActivities,
    aiInsights,
    aiForecasts,
    isAiLoading,
    aiError,
    generateAIInsights,
    isLoading: false,
  };
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
