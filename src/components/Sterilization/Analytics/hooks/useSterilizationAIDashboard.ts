import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SterilizationAIInsight,
  PredictiveAnalytics,
} from '@/types/sterilizationAITypes';
import { SterilizationAIService } from '@/services/ai/sterilization/sterilizationAIService';

export const useSterilizationAIDashboard = () => {
  const [insights, setInsights] = useState<SterilizationAIInsight[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] =
    useState<PredictiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('month');
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');
  const [showHistoricalTrends, setShowHistoricalTrends] = useState(false);
  const [historicalData, setHistoricalData] = useState<{
    success: boolean;
    trends: {
      efficiency: number[];
      quality: number[];
      duration: number[];
      temperature: number[];
    };
    insights: string[];
    predictions: string[];
  } | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(
    new Set()
  );

  // Create service instance
  const aiService = useMemo(() => {
    const facilityId = 'default-facility'; // TODO: Get from context
    return new SterilizationAIService(facilityId);
  }, []);

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const [insightsData, analyticsData] = await Promise.all([
        aiService.getRealTimeInsights(),
        aiService.getPredictiveAnalytics(),
      ]);

      setInsights(insightsData as SterilizationAIInsight[]);
      setPredictiveAnalytics(analyticsData as PredictiveAnalytics);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  const loadHistoricalTrends = useCallback(async () => {
    try {
      const trendsData = await aiService.getHistoricalTrends(selectedTimeframe);
      setHistoricalData(trendsData);
    } catch (error) {
      console.error('Failed to load historical trends:', error);
    }
  }, [aiService, selectedTimeframe]);

  const toggleInsightExpansion = useCallback((insightId: string) => {
    setExpandedInsights((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(insightId)) {
        newExpanded.delete(insightId);
      } else {
        newExpanded.add(insightId);
      }
      return newExpanded;
    });
  }, []);

  const handleInsightTypeChange = useCallback((type: string) => {
    setSelectedInsightType(type);
  }, []);

  const handleToggleHistoricalTrends = useCallback(() => {
    setShowHistoricalTrends((prev) => !prev);
  }, []);

  const handleTimeframeChange = useCallback(
    (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
      setSelectedTimeframe(timeframe);
    },
    []
  );

  const handleExportReport = useCallback(
    async (
      reportType:
        | 'insights'
        | 'predictive'
        | 'historical'
        | 'comprehensive' = 'comprehensive',
      format: 'pdf' | 'csv' | 'excel' | 'json' = 'pdf'
    ) => {
      try {
        const result = await aiService.exportAnalyticsReport(
          reportType,
          format
        );

        if (result.success && result.downloadUrl) {
          // Create download link
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `sterilization-analytics-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          URL.revokeObjectURL(result.downloadUrl);
        } else {
          console.error('Export failed:', result.error);
        }
      } catch (error) {
        console.error('Export report failed:', error);
      }
    },
    [aiService]
  );

  const filteredInsights = useMemo(
    () =>
      insights.filter(
        (insight) =>
          selectedInsightType === 'all' || insight.type === selectedInsightType
      ),
    [insights, selectedInsightType]
  );

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    if (showHistoricalTrends) {
      loadHistoricalTrends();
    }
  }, [showHistoricalTrends, loadHistoricalTrends]);

  return {
    insights,
    predictiveAnalytics,
    isLoading,
    selectedTimeframe,
    selectedInsightType,
    showHistoricalTrends,
    historicalData,
    expandedInsights,
    filteredInsights,
    loadInsights,
    toggleInsightExpansion,
    handleInsightTypeChange,
    handleToggleHistoricalTrends,
    handleTimeframeChange,
    handleExportReport,
  };
};
