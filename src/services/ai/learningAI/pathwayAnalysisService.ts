import { supabase } from '../../../lib/supabaseClient';
import { LearningAIModelProvider } from '../../learningAI/LearningAIModelProvider';
import type { LearningPathOptimizationResult } from '../../../types/learningAITypes';
import type { Json } from '../../../types/database.types';
import type { LearningPathOptimizationRow } from '../../../types/learningAITypes';
import { calculateProcessingTime, getCurrentTimestamp } from '../../learningAI/learningAIUtils';

export class PathwayAnalysisService {
  private facilityId: string;
  private providerService: LearningAIModelProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.providerService = new LearningAIModelProvider(facilityId);
  }

  // Learning path optimization
  async optimizeLearningPath(
    userId: string
  ): Promise<LearningPathOptimizationResult | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processLearningPathOptimizationWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result: Partial<LearningPathOptimizationResult> = {
        facility_id: this.facilityId,
        user_id: userId,
        optimized_learning_path: aiResult.optimized_learning_path,
        path_efficiency_score: aiResult.path_efficiency_score,
        estimated_total_time: aiResult.estimated_total_time,
        difficulty_progression: aiResult.difficulty_progression,
        prerequisite_mapping: aiResult.prerequisite_mapping,
        alternative_paths: aiResult.alternative_paths,
        optimization_factors: aiResult.optimization_factors,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData: Partial<LearningPathOptimizationRow> = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        optimized_learning_path: result.optimized_learning_path as Json,
        path_efficiency_score: result.path_efficiency_score,
        estimated_total_time: result.estimated_total_time,
        difficulty_progression: result.difficulty_progression as Json,
        prerequisite_mapping: result.prerequisite_mapping as Json,
        alternative_paths: result.alternative_paths as Json,
        optimization_factors: result.optimization_factors as Json,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_path_optimization')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving learning path optimization result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as LearningPathOptimizationRow;
      return {
        id: resultData.id ?? '',
        facility_id: resultData.facility_id ?? '',
        user_id: resultData.user_id ?? '',
        optimized_learning_path:
          (resultData.optimized_learning_path as string[]) ?? [],
        path_efficiency_score: resultData.path_efficiency_score ?? 0,
        estimated_total_time: resultData.estimated_total_time ?? 0,
        difficulty_progression:
          (resultData.difficulty_progression as string[]) ?? [],
        prerequisite_mapping:
          (resultData.prerequisite_mapping as Record<string, string[]>) ?? {},
        alternative_paths: (resultData.alternative_paths as string[][]) ?? [],
        optimization_factors:
          (resultData.optimization_factors as string[]) ?? [],
        confidence_score: resultData.confidence_score ?? 0,
        processing_time_ms: resultData.processing_time_ms ?? 0,
        created_at: resultData.created_at ?? '',
      };
    } catch (error) {
      console.error('Error optimizing learning path:', error);
      return null;
    }
  }
}
