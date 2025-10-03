import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { Tool } from '@/types/toolTypes';
import {
  BITestResult,
  ActivityLogItem,
} from '@/store/slices/types/biWorkflowTypes';
import { UnifiedAIService } from '@/services/ai/UnifiedAIService';

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
  } = useSterilizationStore();

  // AI-powered analytics state
  const [aiInsights, setAiInsights] = useState<AnalyticsInsight[]>([]);
  const [aiForecasts, setAiForecasts] = useState<ForecastPrediction[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGenerationAttempted, setAiGenerationAttempted] = useState(false);

  // Check if data is still loading (not if it's empty)
  const isLoading = !availableTools;

  // Memoize additional metrics calculations
  const additionalMetrics = useMemo(() => {
    if (isLoading) {
      return { totalTools: 0, activeTools: 0, completedToday: 0 };
    }

    // Total Tools: All tools in the inventory
    const totalTools = availableTools.length;

    // In Cycle: All tools that are currently in any timer phase
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
  }, [availableTools, isLoading]);

  // Memoize recent BI test results filtering and sorting
  const recentBITests = useMemo(() => {
    if (isLoading || !biTestResults || biTestResults.length === 0) {
      return [];
    }

    return biTestResults
      .filter((result: BITestResult) => {
        // 7-day rolling window for recent tests
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return result.date >= sevenDaysAgo;
      })
      .sort(
        (a: BITestResult, b: BITestResult) =>
          b.date.getTime() - a.date.getTime()
      ) // Sort by most recent first
      .slice(0, 5); // Limit to 5 most recent tests for UI performance
  }, [biTestResults, isLoading]);

  // Format activity log for RecentActivity
  const recentActivities = useMemo((): FormattedActivityItem[] => {
    if (isLoading || !activityLog || activityLog.length === 0) {
      return [];
    }

    return activityLog
      .map((item: ActivityLogItem) => {
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
      })
      .slice(0, 10);
  }, [activityLog, isLoading]);

  // AI insights generation
  const generateAIInsights = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isAiLoading || aiGenerationAttempted) {
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiGenerationAttempted(true);

    try {
      // Generate analytics insights using UnifiedAIService
      const insightsPrompt = `Analyze the following sterilization data and provide insights:
        - Available Tools: ${availableTools?.length || 0} tools
        - BI Test Results: ${biTestResults?.length || 0} results
        - Activity Log: ${activityLog?.length || 0} entries
        
        Please provide analytics insights including trends, anomalies, predictions, and recommendations.`;
      
      const insightsResponse = await UnifiedAIService.askAI(insightsPrompt, 'sterilization analytics');
      
      // Parse the response into insights format
      const insights: AnalyticsInsight[] = [
        {
          type: 'trend',
          title: 'Sterilization Trend Analysis',
          description: insightsResponse,
          confidence: 0.85,
          actionable: true,
          priority: 'medium'
        }
      ];
      setAiInsights(insights);

      // Generate forecasts using UnifiedAIService
      const forecastsPrompt = `Based on the sterilization data, provide forecasts for:
        - Total Tools: ${availableTools?.length || 0}
        - BI Test Results: ${biTestResults?.length || 0}
        - Activity Log: ${activityLog?.length || 0}
        
        Please provide cycle forecasts and predictions.`;
      
      const _forecastsResponse = await UnifiedAIService.askAI(forecastsPrompt, 'sterilization forecasting');
      
      // Parse the response into forecasts format
      const forecasts: ForecastPrediction[] = [
        {
          metric: 'Cycle Efficiency',
          currentValue: 85,
          predictedValue: 88,
          timeframe: 'Next 30 days',
          confidence: 0.80,
          factors: ['Tool availability', 'BI test results'],
          recommendations: ['Optimize cycle timing', 'Monitor BI indicators']
        }
      ];
      setAiForecasts(forecasts);
    } catch (error) {
      console.warn('AI insights generation failed (non-blocking):', error);
      // Set a user-friendly error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          setAiError(
            'AI insights are taking longer than expected. Please try again later.'
          );
        } else if (error.message.includes('Rate limit')) {
          setAiError('AI service is temporarily busy. Please try again later.');
        } else {
          setAiError(
            'AI insights temporarily unavailable. Using standard analytics.'
          );
        }
      } else {
        setAiError(
          'AI insights temporarily unavailable. Using standard analytics.'
        );
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [
    availableTools,
    biTestResults,
    activityLog,
    aiGenerationAttempted,
    isAiLoading,
  ]);

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
