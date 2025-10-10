import { supabase } from '../../../lib/supabaseClient';
import { LearningAIModelProvider } from '../../learningAI/LearningAIModelProvider';
import type { SkillGapAnalysisResult } from '../../../types/learningAITypes';
import type { SkillGapAnalysisRow } from '../../../types/learningAITypes';
import {
  calculateProcessingTime,
  getCurrentTimestamp,
} from '../../learningAI/learningAIUtils';

export class KnowledgeGapService {
  private facilityId: string;
  private providerService: LearningAIModelProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.providerService = new LearningAIModelProvider(facilityId);
  }

  // Skill gap analysis
  async analyzeSkillGaps(
    userId: string
  ): Promise<SkillGapAnalysisResult | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processSkillGapAnalysisWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result: Partial<SkillGapAnalysisResult> = {
        facility_id: this.facilityId,
        user_id: userId,
        current_skills: aiResult.current_skills,
        required_skills: aiResult.required_skills,
        skill_gaps: aiResult.skill_gaps,
        gap_priorities: aiResult.gap_priorities,
        learning_recommendations: aiResult.learning_recommendations,
        skill_development_plan: aiResult.skill_development_plan,
        estimated_learning_time: aiResult.estimated_learning_time,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData: Partial<SkillGapAnalysisRow> = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        current_skills: result.current_skills as unknown as Record<
          string,
          number
        >,
        required_skills: result.required_skills as unknown as Record<
          string,
          number
        >,
        skill_gaps: result.skill_gaps as unknown as Record<string, number>,
        gap_priorities: result.gap_priorities as unknown as string[],
        learning_recommendations:
          result.learning_recommendations as unknown as string[],
        skill_development_plan:
          result.skill_development_plan as unknown as string[],
        estimated_learning_time: result.estimated_learning_time,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_skill_gap_analysis')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving skill gap analysis result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as SkillGapAnalysisRow;
      return {
        id: resultData.id ?? '',
        facility_id: resultData.facility_id ?? '',
        user_id: resultData.user_id ?? '',
        current_skills:
          (resultData.current_skills as Record<string, number>) ?? {},
        required_skills:
          (resultData.required_skills as Record<string, number>) ?? {},
        skill_gaps: (resultData.skill_gaps as Record<string, number>) ?? {},
        gap_priorities: (resultData.gap_priorities as string[]) ?? [],
        learning_recommendations:
          (resultData.learning_recommendations as string[]) ?? [],
        skill_development_plan:
          (resultData.skill_development_plan as string[]) ?? [],
        estimated_learning_time: resultData.estimated_learning_time ?? 0,
        confidence_score: resultData.confidence_score ?? 0,
        processing_time_ms: resultData.processing_time_ms ?? 0,
        created_at: resultData.created_at ?? '',
      };
    } catch (err) {
      console.error(err);
      console.error('Error analyzing skill gaps');
      return null;
    }
  }
}
