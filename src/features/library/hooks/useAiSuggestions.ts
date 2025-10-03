import { useCallback, useState, useEffect } from 'react';
import { ContentItem } from '../libraryTypes';
import { AISuggestionsService } from '../services/aiSuggestionsService';

interface AISuggestion {
  id: string;
  content_id: string;
  recommendation_score: number;
  recommendation_reason: string;
  confidence_level: number;
}

export function useAiSuggestions(
  content: ContentItem[],
  aiSuggestionsActive: boolean
) {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const fetchAISuggestions = useCallback(async () => {
    if (!aiSuggestionsActive || !content.length) return;

    try {
      const aiService = new AISuggestionsService();
      const {
        data: { user },
      } = await import('@/lib/supabase').then((m) => m.supabase.auth.getUser());
      if (!user) return;

      const suggestions = await aiService.getAIContentRecommendations(
        user.id,
        5
      );
      setAiSuggestions(suggestions);

      // Track that suggestions were displayed
      suggestions.forEach((suggestion) => {
        aiService.trackRecommendationInteraction(
          suggestion.id,
          'displayed',
          user.id
        );
      });
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  }, [aiSuggestionsActive, content.length]);

  useEffect(() => {
    fetchAISuggestions();
  }, [fetchAISuggestions]);

  const getSuggestions = useCallback(() => {
    if (aiSuggestionsActive && aiSuggestions.length > 0) {
      // Return AI suggestions sorted by recommendation score
      return aiSuggestions
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .map((suggestion) => {
          const contentItem = content.find(
            (item) => item.id === suggestion.content_id
          );
          return contentItem || content[0]; // Fallback to first item if not found
        });
    }

    // Fallback to mock suggestions when AI is not active
    const mockSuggestions = content
      .filter(
        (item) => item.category === 'Courses' || item.category === 'Procedures'
      )
      .slice(0, 3)
      .map((item, index) => ({
        ...item,
        aiScore: Math.random() * 100,
        aiReason: `Recommended based on your learning pattern ${index + 1}`,
      }));

    return mockSuggestions.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  }, [aiSuggestionsActive, aiSuggestions, content]);

  return getSuggestions;
}
