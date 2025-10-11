import { supabase } from '@/lib/supabaseClient';

export interface AILearningInsight {
  id: string;
  user_id: string;
  content_interaction_patterns: Record<string, unknown>;
  learning_preferences: Record<string, unknown>;
  study_patterns: Record<string, unknown>;
  skill_gaps: string[];
  learning_recommendations: Array<Record<string, unknown>>;
  difficulty_progression: Record<string, unknown>;
  content_affinity_scores: Record<string, unknown>;
  learning_efficiency_score: number;
  knowledge_retention_rate: number;
  optimal_study_duration: number;
  next_learning_milestone: string;
  preferred_content_categories: string[];
  avoided_content_types: string[];
  completion_rate_by_category: Record<string, unknown>;
  last_ai_analysis: string;
  ai_confidence_score: number;
  model_version: string;
}

export interface AIContentRecommendation {
  id: string;
  user_id: string;
  content_id: string;
  recommendation_score: number;
  recommendation_reason: string;
  confidence_level: number;
  user_context: Record<string, unknown>;
  content_context: Record<string, unknown>;
  recommendation_timing: string;
  is_displayed: boolean;
  is_clicked: boolean;
  is_completed: boolean;
  display_count: number;
  click_through_rate: number;
  completion_rate: number;
  user_feedback_rating: number;
  model_version: string;
  feature_vector: Array<Record<string, unknown>>;
  algorithm_used: string;
  created_at: string;
  expires_at: string;
}

export interface LearningProgressData {
  id: string;
  user_id: string;
  content_id: string;
  progress_status: 'completed' | 'in_progress' | 'not_started' | 'failed';
  content_type?: string;
  time_spent_minutes?: number;
  score?: number;
  completed_at?: string;
}

export interface SessionAnalyticsData {
  session_start: string;
  content_items_accessed: string[];
  learning_path_progress: Record<string, unknown>;
  learning_patterns?: Record<string, unknown>;
}

export class AILearningService {
  /**
   * Get AI learning insights for the current user
   */
  async getLearningInsights(): Promise<AILearningInsight | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's facility_id to satisfy RLS policy
      const { data: userData } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('ai_learning_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('facility_id', userData?.facility_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data as AILearningInsight | null;
    } catch (error) {
      console.error('Error fetching AI learning insights:', error);
      return null;
    }
  }

  /**
   * Get AI content recommendations for the current user
   */
  async getContentRecommendations(
    limit: number = 5
  ): Promise<AIContentRecommendation[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_content_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gte('recommendation_score', 70)
        .order('recommendation_score', { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === '42P01') {
          console.warn(
            'ai_content_recommendations table does not exist, returning empty recommendations'
          );
          return [];
        }
        throw error;
      }

      return (
        ((data as Record<string, unknown>[]).map((item) => ({
          id: item.id as string,
          user_id: item.user_id as string,
          content_id: item.content_id as string,
          recommendation_score: item.recommendation_score as number,
          recommendation_type: item.recommendation_type as string,
          reasoning: item.reasoning as string,
          created_at: item.created_at as string,
          updated_at: item.updated_at as string,
          is_displayed: item.is_displayed as boolean,
          is_clicked: item.is_clicked as boolean,
          is_completed: item.is_completed as boolean,
          display_count: item.display_count as number,
          click_count: item.click_count as number,
          completion_count: item.completion_count as number,
          user_feedback: item.user_feedback as string,
          ai_model_version: item.ai_model_version as string,
          learning_context: item.learning_context as string,
          content_metadata: item.content_metadata as Record<string, unknown>,
          tags: (item as { data?: { tags?: string[] } }).data?.tags as string[],
          recommendation_reason:
            (item.recommendation_reason as string) ||
            (item.reasoning as string),
          confidence_level: (item.confidence_level as number) || 0.8,
          user_context: (item.user_context as Record<string, unknown>) || {},
          content_context:
            (item.content_context as Record<string, unknown>) || {},
          click_through_rate: (item.click_through_rate as number) || 0,
          completion_rate: (item.completion_rate as number) || 0,
          user_feedback_rating: (item.user_feedback_rating as number) || 0,
          ai_confidence_score: (item.ai_confidence_score as number) || 0.8,
          recommendation_algorithm:
            (item.recommendation_algorithm as string) || 'default',
          last_ai_analysis:
            (item.last_ai_analysis as string) || new Date().toISOString(),
          model_version: (item.model_version as string) || '1.0.0',
          feature_vector:
            (item.feature_vector as Record<string, unknown>[]) || [],
          algorithm_used: (item.algorithm_used as string) || 'default',
          expires_at: (item.expires_at as string) || null,
          recommendation_timing:
            (item.recommendation_timing as string) || 'immediate',
        })) as AIContentRecommendation[]) || []
      );
    } catch (error) {
      console.error('Error fetching AI content recommendations:', error);
      return [];
    }
  }

  /**
   * Track user interaction with AI recommendations
   */
  async trackRecommendationInteraction(
    recommendationId: string,
    action: 'displayed' | 'clicked' | 'completed'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: Record<string, unknown> = {};

      switch (action) {
        case 'displayed':
          updateData.is_displayed = true;
          updateData.display_count =
            ((updateData.display_count as number) || 0) + 1;
          break;
        case 'clicked':
          updateData.is_clicked = true;
          break;
        case 'completed':
          updateData.is_completed = true;
          break;
      }

      const { error } = await supabase
        .from('ai_content_recommendations')
        .update(updateData)
        .eq('id', recommendationId)
        .eq('user_id', user.id);

      if (error) {
        // If table doesn't exist, return false instead of throwing
        if (error.code === '42P01') {
          console.warn(
            'ai_content_recommendations table does not exist, skipping interaction tracking'
          );
          return false;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error);
      return false;
    }
  }

  /**
   * Store AI learning insights
   */
  async storeLearningInsights(
    insights: Partial<AILearningInsight>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('ai_learning_insights').upsert({
        user_id: user.id,
        ...insights,
        last_ai_analysis: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error storing AI learning insights:', error);
      return false;
    }
  }

  /**
   * Store AI content recommendation
   */
  async storeContentRecommendation(
    contentId: string,
    recommendation: Partial<AIContentRecommendation>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('ai_content_recommendations')
        .insert({
          user_id: user.id,
          content_id: contentId,
          ...recommendation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        // If table doesn't exist, return false instead of throwing
        if (error.code === '42P01') {
          console.warn(
            'ai_content_recommendations table does not exist, skipping recommendation storage'
          );
          return false;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error storing AI content recommendation:', error);
      return false;
    }
  }

  /**
   * Get learning analytics for the current user
   */
  async getLearningAnalytics(): Promise<LearningProgressData[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_learning_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('session_start', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (
        (data as Record<string, unknown>[]).map((item) => ({
          id: item.id as string,
          user_id: item.user_id as string,
          content_id: item.content_id as string,
          progress_status: item.progress_status as
            | 'failed'
            | 'in_progress'
            | 'completed'
            | 'not_started',
        })) || []
      );
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      return [];
    }
  }

  /**
   * Store learning session analytics
   */
  async storeSessionAnalytics(
    sessionData: SessionAnalyticsData
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Get facility_id from user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile?.facility_id) {
        console.error('Missing facility_id in user profile');
        return false;
      }

      const { error } = await supabase.from('ai_learning_analytics').insert({
        user_id: user.id,
        facility_id: userProfile.facility_id,
        session_start: new Date(sessionData.session_start).toISOString(),
        content_items_accessed: sessionData.content_items_accessed,
        learning_path_progress: sessionData.learning_path_progress,
        learning_patterns: sessionData.learning_patterns,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error storing learning session analytics:', error);
      return false;
    }
  }

  /**
   * Generate AI-powered learning insights based on user data
   */
  async generateLearningInsights(): Promise<Partial<AILearningInsight> | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's learning progress
      const { data: progressData } = await supabase
        .from('knowledge_hub_user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!progressData || progressData.length === 0) return null;

      // Analyze learning patterns
      const insights = this.analyzeLearningPatterns(
        (progressData as Record<string, unknown>[]).map((item) => ({
          id: item.id as string,
          user_id: item.user_id as string,
          content_id: item.content_id as string,
          progress_status: item.progress_status as
            | 'failed'
            | 'in_progress'
            | 'completed'
            | 'not_started',
        }))
      );

      // Store insights
      await this.storeLearningInsights(insights);

      return insights;
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return null;
    }
  }

  /**
   * Analyze learning patterns from progress data
   */
  private analyzeLearningPatterns(
    progressData: LearningProgressData[]
  ): Partial<AILearningInsight> {
    const completed = progressData.filter(
      (p) => p.progress_status === 'completed'
    );

    // Calculate efficiency score
    const totalAttempted = progressData.length;
    const totalCompleted = completed.length;
    const efficiencyScore =
      totalAttempted > 0 ? (totalCompleted / totalAttempted) * 100 : 0;

    // Analyze categories
    const categoryCounts = progressData.reduce(
      (acc, item) => {
        const category = item.content_type || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Calculate optimal study duration (average of completed sessions)
    const completedSessions = completed.filter((p) => p.time_spent_minutes);
    const avgStudyDuration =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce(
              (sum, p) => sum + (p.time_spent_minutes || 0),
              0
            ) / completedSessions.length
          )
        : 30;

    return {
      learning_efficiency_score: Math.round(efficiencyScore),
      preferred_content_categories: preferredCategories,
      optimal_study_duration: avgStudyDuration,
      next_learning_milestone: this.predictNextMilestone(progressData),
      skill_gaps: this.identifySkillGaps(progressData),
      ai_confidence_score: 0.8,
      model_version: 'v1.0',
    };
  }

  /**
   * Predict next learning milestone
   */
  private predictNextMilestone(progressData: LearningProgressData[]): string {
    const completed = progressData.filter(
      (p) => p.progress_status === 'completed'
    );

    if (completed.length === 0) return 'Complete your first course';
    if (completed.length < 3) return 'Complete 3 courses to build foundation';
    if (completed.length < 10)
      return 'Complete 10 courses for intermediate level';

    return 'Achieve advanced certification';
  }

  /**
   * Identify potential skill gaps
   */
  private identifySkillGaps(progressData: LearningProgressData[]): string[] {
    const gaps: string[] = [];
    const completedTypes = new Set(
      progressData
        .filter((p) => p.progress_status === 'completed')
        .map((p) => p.content_type)
    );

    if (!completedTypes.has('procedure')) gaps.push('Clinical Procedures');
    if (!completedTypes.has('policy')) gaps.push('Healthcare Policies');
    if (!completedTypes.has('learning_pathway'))
      gaps.push('Structured Learning Paths');

    return gaps;
  }
}
