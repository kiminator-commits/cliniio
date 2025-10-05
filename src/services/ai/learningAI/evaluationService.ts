import { supabase } from '../../../lib/supabaseClient';
import { LearningAIModelProvider } from '../../learningAI/LearningAIModelProvider';
import type { PerformancePredictionResult } from '../../../types/learningAITypes';
import type { Json } from '../../../types/database.types';
import type { PerformancePredictionRow } from '../../../types/learningAITypes';
import {
  calculateProcessingTime,
  getCurrentTimestamp,
} from '../../learningAI/learningAIUtils';
import { DEFAULT_VALUES } from './learningAIConfig';

export class EvaluationService {
  private facilityId: string;
  private providerService: LearningAIModelProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.providerService = new LearningAIModelProvider(facilityId);
  }

  // Performance prediction
  async predictPerformance(
    userId: string,
    contentId: string
  ): Promise<PerformancePredictionResult | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processPerformancePredictionWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result: Partial<PerformancePredictionResult> = {
        facility_id: this.facilityId,
        user_id: userId,
        content_id: contentId,
        predicted_performance: aiResult.predicted_performance,
        predicted_completion_time: aiResult.predicted_completion_time,
        success_probability: aiResult.success_probability,
        risk_factors: aiResult.risk_factors,
        improvement_suggestions: aiResult.improvement_suggestions,
        study_recommendations: aiResult.study_recommendations,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData: Partial<PerformancePredictionRow> = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        content_id: result.content_id,
        predicted_performance: result.predicted_performance,
        confidence_score: result.confidence_score,
        performance_factors: result.risk_factors as Json,
        improvement_suggestions: result.improvement_suggestions as Json,
        estimated_completion_time: result.predicted_completion_time,
        difficulty_assessment: result.study_recommendations as Json,
        prerequisite_requirements: {} as Json, // Not available in this interface
        alternative_approaches: {} as Json, // Not available in this interface
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_performance_prediction')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving performance prediction result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as PerformancePredictionRow;
      return {
        id: resultData.id ?? '',
        facility_id: resultData.facility_id ?? '',
        user_id: resultData.user_id ?? '',
        content_id: resultData.content_id ?? '',
        predicted_performance: resultData.predicted_performance ?? 0,
        predicted_completion_time: resultData.estimated_completion_time ?? 0,
        success_probability: 0, // Not available in database
        risk_factors: [], // Not available in database
        improvement_suggestions:
          (resultData.improvement_suggestions as string[]) ?? [],
        study_recommendations: [], // Not available in database
        confidence_score: resultData.confidence_score ?? 0,
        processing_time_ms: resultData.processing_time_ms ?? 0,
        created_at: resultData.created_at ?? '',
      };
    } catch (error) {
      console.error('Error predicting performance:', error);
      return null;
    }
  }

  // Adaptive difficulty
  async adjustDifficulty(
    userId: string,
    contentId: string
  ): Promise<{
    recommended_difficulty: 'beginner' | 'intermediate' | 'advanced';
    difficulty_adjustment: number;
    learning_curve_analysis: string;
    adaptation_reasoning: string[];
    performance_indicators: Record<string, number>;
    next_difficulty_target: string;
    confidence_score: number;
  } | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processAdaptiveDifficultyWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result = {
        facility_id: this.facilityId,
        user_id: userId,
        content_id: contentId,
        recommended_difficulty: aiResult.recommended_difficulty,
        difficulty_adjustment: aiResult.difficulty_adjustment,
        learning_curve_analysis: aiResult.learning_curve_analysis,
        adaptation_reasoning: aiResult.adaptation_reasoning,
        performance_indicators: aiResult.performance_indicators,
        next_difficulty_target: aiResult.next_difficulty_target,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        content_id: result.content_id,
        recommended_difficulty: result.recommended_difficulty,
        difficulty_adjustment: result.difficulty_adjustment,
        learning_curve_analysis: result.learning_curve_analysis,
        adaptation_reasoning: result.adaptation_reasoning as Json,
        performance_indicators: result.performance_indicators as Json,
        next_difficulty_target: result.next_difficulty_target,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_adaptive_difficulty')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving adaptive difficulty result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as {
        recommended_difficulty: string;
        difficulty_adjustment: number;
        learning_curve_analysis: string;
        adaptation_reasoning: Json;
        performance_indicators: Json;
        next_difficulty_target: string;
        confidence_score: number;
      };

      return {
        recommended_difficulty: (resultData.recommended_difficulty ??
          DEFAULT_VALUES.DIFFICULTY_LEVEL) as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
        difficulty_adjustment: resultData.difficulty_adjustment ?? 0,
        learning_curve_analysis: resultData.learning_curve_analysis ?? '',
        adaptation_reasoning:
          (resultData.adaptation_reasoning as string[]) ?? [],
        performance_indicators:
          (resultData.performance_indicators as Record<string, number>) ?? {},
        next_difficulty_target: resultData.next_difficulty_target ?? '',
        confidence_score: resultData.confidence_score ?? 0,
      };
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
      return null;
    }
  }

  // Engagement analysis
  async analyzeEngagement(userId: string): Promise<{
    engagement_score: number;
    engagement_trends: Record<string, unknown>;
    engagement_factors: string[];
    disengagement_triggers: string[];
    improvement_suggestions: string[];
    optimal_learning_times: string[];
    content_preferences: string[];
    confidence_score: number;
  } | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processEngagementAnalysisWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result = {
        facility_id: this.facilityId,
        user_id: userId,
        engagement_score: aiResult.engagement_score,
        engagement_trends: aiResult.engagement_trends,
        engagement_factors: aiResult.engagement_factors,
        disengagement_triggers: aiResult.disengagement_triggers,
        improvement_suggestions: aiResult.improvement_suggestions,
        optimal_learning_times: aiResult.optimal_learning_times,
        content_preferences: aiResult.content_preferences,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        engagement_score: result.engagement_score,
        engagement_trends: result.engagement_trends as Json,
        engagement_factors: result.engagement_factors as Json,
        disengagement_triggers: result.disengagement_triggers as Json,
        improvement_suggestions: result.improvement_suggestions as Json,
        optimal_learning_times: result.optimal_learning_times as Json,
        content_preferences: result.content_preferences as Json,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_engagement_analysis')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving engagement analysis result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as {
        engagement_score: number;
        engagement_trends: Json;
        engagement_factors: Json;
        disengagement_triggers: Json;
        improvement_suggestions: Json;
        optimal_learning_times: Json;
        content_preferences: Json;
        confidence_score: number;
      };

      return {
        engagement_score: resultData.engagement_score ?? 0,
        engagement_trends:
          (resultData.engagement_trends as Record<string, unknown>) ?? {},
        engagement_factors: (resultData.engagement_factors as string[]) ?? [],
        disengagement_triggers:
          (resultData.disengagement_triggers as string[]) ?? [],
        improvement_suggestions:
          (resultData.improvement_suggestions as string[]) ?? [],
        optimal_learning_times:
          (resultData.optimal_learning_times as string[]) ?? [],
        content_preferences: (resultData.content_preferences as string[]) ?? [],
        confidence_score: resultData.confidence_score ?? 0,
      };
    } catch (error) {
      console.error('Error analyzing engagement:', error);
      return null;
    }
  }

  // Retention prediction
  async predictRetention(userId: string): Promise<{
    retention_probability: number;
    knowledge_decay_rate: number;
    review_recommendations: string[];
    reinforcement_schedule: string[];
    retention_factors: string[];
    forgetting_risk_areas: string[];
    confidence_score: number;
  } | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processRetentionPredictionWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result = {
        facility_id: this.facilityId,
        user_id: userId,
        retention_probability: aiResult.retention_probability,
        knowledge_decay_rate: aiResult.knowledge_decay_rate,
        review_recommendations: aiResult.review_recommendations,
        reinforcement_schedule: aiResult.reinforcement_schedule,
        retention_factors: aiResult.retention_factors,
        forgetting_risk_areas: aiResult.forgetting_risk_areas,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        retention_probability: result.retention_probability,
        knowledge_decay_rate: result.knowledge_decay_rate,
        review_recommendations: result.review_recommendations as Json,
        reinforcement_schedule: result.reinforcement_schedule as Json,
        retention_factors: result.retention_factors as Json,
        forgetting_risk_areas: result.forgetting_risk_areas as Json,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_retention_prediction')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving retention prediction result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as {
        retention_probability: number;
        knowledge_decay_rate: number;
        review_recommendations: Json;
        reinforcement_schedule: Json;
        retention_factors: Json;
        forgetting_risk_areas: Json;
        confidence_score: number;
      };

      return {
        retention_probability: resultData.retention_probability ?? 0,
        knowledge_decay_rate: resultData.knowledge_decay_rate ?? 0,
        review_recommendations:
          (resultData.review_recommendations as string[]) ?? [],
        reinforcement_schedule:
          (resultData.reinforcement_schedule as string[]) ?? [],
        retention_factors: (resultData.retention_factors as string[]) ?? [],
        forgetting_risk_areas:
          (resultData.forgetting_risk_areas as string[]) ?? [],
        confidence_score: resultData.confidence_score ?? 0,
      };
    } catch (error) {
      console.error('Error predicting retention:', error);
      return null;
    }
  }

  // Learning analytics
  async generateLearningAnalytics(userId: string): Promise<{
    learning_efficiency_score: number;
    preferred_content_categories: string[];
    optimal_study_duration: number;
    learning_patterns: Record<string, unknown>;
    progress_trends: Record<string, unknown>;
    performance_metrics: Record<string, number>;
    insights: string[];
    recommendations: string[];
    confidence_score: number;
  } | null> {
    try {
      const startTime = Date.now();

      // Process with AI using provider service
      const aiResult =
        await this.providerService.processLearningAnalyticsWithAI();

      const processingTime = calculateProcessingTime(startTime);

      // Create result object
      const result = {
        facility_id: this.facilityId,
        user_id: userId,
        learning_efficiency_score: aiResult.learning_efficiency_score,
        preferred_content_categories: aiResult.preferred_content_categories,
        optimal_study_duration: aiResult.optimal_study_duration,
        learning_patterns: aiResult.learning_patterns,
        progress_trends: aiResult.progress_trends,
        performance_metrics: aiResult.performance_metrics,
        insights: aiResult.insights,
        recommendations: aiResult.recommendations,
        confidence_score: aiResult.confidence_score,
        processing_time_ms: processingTime,
        created_at: getCurrentTimestamp(),
      };

      // Save to database
      const insertData = {
        facility_id: result.facility_id,
        user_id: result.user_id,
        learning_efficiency_score: result.learning_efficiency_score,
        preferred_content_categories:
          result.preferred_content_categories as Json,
        optimal_study_duration: result.optimal_study_duration,
        learning_patterns: result.learning_patterns as Json,
        progress_trends: result.progress_trends as Json,
        performance_metrics: result.performance_metrics as Json,
        insights: result.insights as Json,
        recommendations: result.recommendations as Json,
        confidence_score: result.confidence_score,
        processing_time_ms: result.processing_time_ms,
        created_at: result.created_at,
      };

      const { data, error } = await supabase
        .from('learning_ai_analytics')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving learning analytics result:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resultData = data as unknown as {
        learning_efficiency_score: number;
        preferred_content_categories: Json;
        optimal_study_duration: number;
        learning_patterns: Json;
        progress_trends: Json;
        performance_metrics: Json;
        insights: Json;
        recommendations: Json;
        confidence_score: number;
      };

      return {
        learning_efficiency_score: resultData.learning_efficiency_score ?? 0,
        preferred_content_categories:
          (resultData.preferred_content_categories as string[]) ?? [],
        optimal_study_duration: resultData.optimal_study_duration ?? 0,
        learning_patterns:
          (resultData.learning_patterns as Record<string, unknown>) ?? {},
        progress_trends:
          (resultData.progress_trends as Record<string, unknown>) ?? {},
        performance_metrics:
          (resultData.performance_metrics as Record<string, number>) ?? {},
        insights: (resultData.insights as string[]) ?? [],
        recommendations: (resultData.recommendations as string[]) ?? [],
        confidence_score: resultData.confidence_score ?? 0,
      };
    } catch (error) {
      console.error('Error generating learning analytics:', error);
      return null;
    }
  }
}
