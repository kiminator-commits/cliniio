import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  SterilizationAIService,
  SterilizationAIInsight,
  ToolConditionAssessment,
  SmartWorkflowSuggestion,
  CycleOptimization,
  PredictiveAnalytics,
  ComplianceAnalysis,
} from '../../services/ai/sterilizationAIService';

// Define proper types for the any parameters
interface ToolHistory {
  id: string;
  tool_id: string;
  cycle_id?: string;
  usage_count: number;
  last_sterilization: string;
  condition_rating: string;
  wear_level: number;
}

interface ToolData {
  id: string;
  type: string;
  condition: string;
  [key: string]: unknown;
}

interface BarcodeQualityResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
  issues?: string[];
}

interface ToolTypeResult {
  success: boolean;
  toolType?: string;
  category?: string;
  confidence: number;
  suggestions?: string[];
}

interface ProblemDetectionResult {
  success: boolean;
  problemsDetected: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  issues: string[];
  recommendations: string[];
}

interface BiologicalIndicatorData {
  id: string;
  type: string;
  result: string;
  [key: string]: unknown;
}

interface HistoricalTrendsData {
  success: boolean;
  trends: {
    efficiency: number[];
    quality: number[];
    duration: number[];
    temperature: number[];
  };
  insights: string[];
  predictions: string[];
}

export interface UseSterilizationAIReturn {
  // State
  insights: SterilizationAIInsight[];
  predictiveAnalytics: PredictiveAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // AI Analysis Methods
  analyzeToolCondition: (
    imageFile: File,
    toolId?: string
  ) => Promise<ToolConditionAssessment>;
  detectBarcodeQuality: (imageFile: File) => Promise<BarcodeQualityResult>;
  identifyToolType: (imageFile: File) => Promise<ToolTypeResult>;
  getWorkflowSuggestion: (
    toolId: string,
    toolHistory: ToolHistory
  ) => Promise<SmartWorkflowSuggestion>;
  detectPotentialProblems: (
    toolId: string,
    toolData: ToolData
  ) => Promise<ProblemDetectionResult>;

  // Cycle & Optimization Methods
  getCycleOptimization: (cycleId: string) => Promise<CycleOptimization>;
  getPredictiveAnalytics: () => Promise<PredictiveAnalytics>;

  // Quality & Compliance Methods
  analyzeCompliance: (cycleId: string) => Promise<ComplianceAnalysis>;
  validateBiologicalIndicators: (
    biData: BiologicalIndicatorData
  ) => Promise<unknown>;

  // Monitoring & Trends Methods
  getRealTimeInsights: () => Promise<SterilizationAIInsight[]>;
  getHistoricalTrends: (
    timeframe: 'week' | 'month' | 'quarter' | 'year'
  ) => Promise<HistoricalTrendsData>;

  // Utility Methods
  refreshInsights: () => Promise<void>;
  clearError: () => void;
}

export const useSterilizationAI = (
  facilityId: string
): UseSterilizationAIReturn => {
  const [insights, setInsights] = useState<SterilizationAIInsight[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] =
    useState<PredictiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useMemo(
    () => new SterilizationAIService(facilityId),
    [facilityId]
  );

  // Clear error utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load real-time insights
  const loadInsights = useCallback(async () => {
    try {
      const insightsData = await aiService.getRealTimeInsights();
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    }
  }, [aiService]);

  // Load predictive analytics
  const loadPredictiveAnalytics = useCallback(async () => {
    try {
      const analyticsData = await aiService.getPredictiveAnalytics();
      setPredictiveAnalytics(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load predictive analytics'
      );
    }
  }, [aiService]);

  // Refresh all insights
  const refreshInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([loadInsights(), loadPredictiveAnalytics()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refresh insights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadInsights, loadPredictiveAnalytics]);

  // AI Analysis Methods
  const analyzeToolCondition = useCallback(
    async (
      imageFile: File,
      toolId?: string
    ): Promise<ToolConditionAssessment> => {
      try {
        setError(null);
        const result = await aiService.analyzeToolCondition(toolId);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to analyze tool condition';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  const detectBarcodeQuality = useCallback(async () => {
    try {
      setError(null);
      const result = await aiService.detectBarcodeQuality();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to detect barcode quality';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [aiService]);

  const identifyToolType = useCallback(async () => {
    try {
      setError(null);
      const result = await aiService.identifyToolType();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to identify tool type';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [aiService]);

  const getWorkflowSuggestion = useCallback(
    async (
      toolId: string,
      toolHistory: ToolHistory
    ): Promise<SmartWorkflowSuggestion> => {
      try {
        setError(null);
        const result = await aiService.getWorkflowSuggestion(
          toolId,
          toolHistory
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get workflow suggestion';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  const detectPotentialProblems = useCallback(
    async (
      toolId: string,
      toolData: ToolData
    ): Promise<ProblemDetectionResult> => {
      try {
        setError(null);
        const result = await aiService.detectPotentialProblems(
          toolId,
          toolData
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to detect potential problems';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  // Cycle & Optimization Methods
  const getCycleOptimization = useCallback(
    async (cycleId: string): Promise<CycleOptimization> => {
      try {
        setError(null);
        const result = await aiService.getCycleOptimization(cycleId);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get cycle optimization';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  const getPredictiveAnalytics =
    useCallback(async (): Promise<PredictiveAnalytics> => {
      try {
        setError(null);
        const result = await aiService.getPredictiveAnalytics();
        setPredictiveAnalytics(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get predictive analytics';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }, [aiService]);

  // Quality & Compliance Methods
  const analyzeCompliance = useCallback(
    async (cycleId: string): Promise<ComplianceAnalysis> => {
      try {
        setError(null);
        const result = await aiService.analyzeCompliance(cycleId);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze compliance';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  const validateBiologicalIndicators = useCallback(
    async (biData: BiologicalIndicatorData): Promise<unknown> => {
      try {
        setError(null);
        const result = await aiService.validateBiologicalIndicators(biData);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to validate biological indicators';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  // Monitoring & Trends Methods
  const getRealTimeInsights = useCallback(async (): Promise<
    SterilizationAIInsight[]
  > => {
    try {
      setError(null);
      const result = await aiService.getRealTimeInsights();
      setInsights(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get real-time insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [aiService]);

  const getHistoricalTrends = useCallback(
    async (
      timeframe: 'week' | 'month' | 'quarter' | 'year'
    ): Promise<HistoricalTrendsData> => {
      try {
        setError(null);
        const result = await aiService.getHistoricalTrends(timeframe);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get historical trends';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [aiService]
  );

  // Load initial data
  useEffect(() => {
    if (facilityId) {
      refreshInsights();
    }
  }, [facilityId, refreshInsights]);

  return {
    // State
    insights,
    predictiveAnalytics,
    isLoading,
    error,

    // AI Analysis Methods
    analyzeToolCondition,
    detectBarcodeQuality,
    identifyToolType,
    getWorkflowSuggestion,
    detectPotentialProblems,

    // Cycle & Optimization Methods
    getCycleOptimization,
    getPredictiveAnalytics,

    // Quality & Compliance Methods
    analyzeCompliance,
    validateBiologicalIndicators,

    // Monitoring & Trends Methods
    getRealTimeInsights,
    getHistoricalTrends,

    // Utility Methods
    refreshInsights,
    clearError,
  };
};
