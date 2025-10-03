import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AILearningService,
  AILearningInsight,
  AIContentRecommendation,
  SessionAnalyticsData,
} from '../services/aiLearningService';

export function useAILearning() {
  const [learningInsights, setLearningInsights] =
    useState<AILearningInsight | null>(null);
  const [contentRecommendations, setContentRecommendations] = useState<
    AIContentRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = useMemo(() => new AILearningService(), []);

  // Load AI learning insights
  const loadLearningInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const insights = await aiService.getLearningInsights();
      setLearningInsights(insights);

      // If no insights exist, generate them
      if (!insights) {
        const generatedInsights = await aiService.generateLearningInsights();
        if (generatedInsights) {
          setLearningInsights(generatedInsights as AILearningInsight);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load learning insights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  // Load AI content recommendations
  const loadContentRecommendations = useCallback(
    async (limit: number = 5) => {
      try {
        setIsLoading(true);
        setError(null);

        const recommendations =
          await aiService.getContentRecommendations(limit);
        setContentRecommendations(recommendations);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load content recommendations'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Track recommendation interaction
  const trackRecommendationInteraction = useCallback(
    async (
      recommendationId: string,
      action: 'displayed' | 'clicked' | 'completed'
    ) => {
      try {
        await aiService.trackRecommendationInteraction(
          recommendationId,
          action
        );
      } catch (err) {
        console.error('Failed to track recommendation interaction:', err);
      }
    },
    [aiService]
  );

  // Store learning session analytics
  const storeSessionAnalytics = useCallback(
    async (sessionData: Record<string, unknown>) => {
      try {
        await aiService.storeSessionAnalytics(
          sessionData as unknown as SessionAnalyticsData
        );
      } catch (err) {
        console.error('Failed to store session analytics:', err);
      }
    },
    [aiService]
  );

  // Generate new learning insights
  const generateNewInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const insights = await aiService.generateLearningInsights();
      if (insights) {
        setLearningInsights(insights as AILearningInsight);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate new insights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  // Load initial data - defer to avoid blocking initial render
  useEffect(() => {
    // Defer AI operations to allow initial page render
    const timer = setTimeout(() => {
      loadLearningInsights();
      loadContentRecommendations();
    }, 200); // Increased delay to allow page to render first
    return () => clearTimeout(timer);
  }, [loadLearningInsights, loadContentRecommendations]);

  return {
    learningInsights,
    contentRecommendations,
    isLoading,
    error,
    loadLearningInsights,
    loadContentRecommendations,
    trackRecommendationInteraction,
    storeSessionAnalytics,
    generateNewInsights,
    refreshData: () => {
      loadLearningInsights();
      loadContentRecommendations();
    },
  };
}
