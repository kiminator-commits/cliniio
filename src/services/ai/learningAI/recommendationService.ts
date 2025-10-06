import { supabase } from '../../../lib/supabaseClient';
import { LearningAIModelProvider } from '../../learningAI/LearningAIModelProvider';
import type { PersonalizedRecommendationResult } from '../../../types/learningAITypes';
import type { Json } from '../../../types/database.types';
import type { PersonalizedRecommendationRow } from '../../../types/learningAITypes';
import {
  calculateProcessingTime,
  formatRecommendationReasoning,
  parseRecommendationReasoning,
  getCurrentTimestamp,
} from '../../learningAI/learningAIUtils';

export class RecommendationService {
  private facilityId: string;
  private providerService: LearningAIModelProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.providerService = new LearningAIModelProvider(facilityId);
  }

  // Personalized recommendations
  async generatePersonalizedRecommendations(
    userId: string
  ): Promise<PersonalizedRecommendationResult | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processPersonalizedRecommendationsWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result: Partial<PersonalizedRecommendationResult> = {
        facility_id: this.facilityId,
        user_id: userId,
        recommended_content: aiResult.recommended_content,
        recommendation_reasoning: aiResult.recommendation_reasoning,
        confidence_scores: aiResult.confidence_scores,
        learning_path_suggestions: aiResult.learning_path_suggestions,
        skill_development_areas: aiResult.skill_development_areas,
        estimated_completion_time: aiResult.estimated_completion_time,
        difficulty_progression: aiResult.difficulty_progression,
        alternative_recommendations: aiResult.alternative_recommendations,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        recommended_content: result.recommended_content as Json,
        recommendation_reasoning: formatRecommendationReasoning(
          result.recommendation_reasoning
        ) as Json,
        confidence_scores: result.confidence_scores as Json,
        learning_path_suggestions: result.learning_path_suggestions as Json,
        skill_development_areas: result.skill_development_areas as Json,
        estimated_completion_time: result.estimated_completion_time,
        difficulty_progression: result.difficulty_progression as Json,
        alternative_recommendations: result.alternative_recommendations as Json,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_personalized_recommendations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error(
          'Error saving personalized recommendation result:',
          error
        );
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as PersonalizedRecommendationRow;
      return {
        id: resultData.id ?? '',
        facility_id: resultData.facility_id ?? '',
        user_id: resultData.user_id ?? '',
        recommended_content: (resultData.recommended_content as string[]) ?? [],
        recommendation_reasoning: parseRecommendationReasoning(
          resultData.recommendation_reasoning as unknown as string
        ),
        confidence_scores: (resultData.confidence_scores as number[]) ?? [],
        learning_path_suggestions:
          (resultData.learning_path_suggestions as string[]) ?? [],
        skill_development_areas:
          (resultData.skill_development_areas as string[]) ?? [],
        estimated_completion_time: resultData.estimated_completion_time ?? 0,
        difficulty_progression:
          (resultData.difficulty_progression as string[]) ?? [],
        alternative_recommendations:
          (resultData.alternative_recommendations as string[]) ?? [],
        confidence_score: resultData.confidence_score ?? 0,
        processing_time_ms: resultData.processing_time_ms ?? 0,
        created_at: resultData.created_at ?? '',
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return null;
    }
  }
}
